import Resume from "../model/resume.js";
import imagekit from '../config/imagekit.js';
import fs from 'fs';

// POST: /api/resumes/create
export const createResumes = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;
        const newResume = await Resume.create({ userId, title });
        return res.status(201).json({ message: "Resume created successfully", resume: newResume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// DELETE: /api/resumes/delete/:resumeId 
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ _id: resumeId, userId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" }); 
        }

        await Resume.deleteOne({ _id: resumeId, userId });
        return res.status(200).json({ message: "Resume deleted successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/resumes/get/:resumeId 
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ _id: resumeId, userId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        
        const resumeObj = resume.toObject();
        delete resumeObj.__v;
        delete resumeObj.createdAt;
        delete resumeObj.updatedAt;

        return res.status(200).json({ resume: resumeObj });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/resumes/public/:resumeId
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ _id: resumeId, public: true });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or is private" });
        }
        return res.status(200).json({ resume });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, removeBackground } = req.body;
        const image = req.file;

        // 1. ISOLATION CHECK: If this is purely a visibility toggle
        if (Object.keys(req.body).length === 2 && req.body.public !== undefined) {
            const isPublicValue = req.body.public === "true" || req.body.public === true;
            
            const updatedResume = await Resume.findOneAndUpdate(
                { _id: resumeId, userId },
                { $set: { public: isPublicValue } },
                { new: true }
            );

            if (!updatedResume) {
                return res.status(404).json({ message: "Resume not found or unauthorized" });
            }
            return res.status(200).json({ message: "Visibility updated successfully", resume: updatedResume });
        }

        // 2. STANDARD RUN: Full resume field updating
        let resumeDataCopy = {};
        
        Object.keys(req.body).forEach((key) => {
            if (key === "resumeId" || key === "removeBackground") return;
            
            try {
                resumeDataCopy[key] = JSON.parse(req.body[key]);
            } catch {
                if (req.body[key] === "true") resumeDataCopy[key] = true;
                else if (req.body[key] === "false") resumeDataCopy[key] = false;
                else resumeDataCopy[key] = req.body[key];
            }
        });

        // Bridge project/projects schema mismatch defensively
        if (resumeDataCopy.project && !resumeDataCopy.projects) {
            resumeDataCopy.projects = resumeDataCopy.project;
        }

        const subArrays = ['experience', 'education', 'projects', 'project', 'skills'];
        subArrays.forEach(arrayKey => {
            if (Array.isArray(resumeDataCopy[arrayKey])) {
                resumeDataCopy[arrayKey] = resumeDataCopy[arrayKey].map(item => {
                    if (item && item._id === "") {
                        const clone = { ...item };
                        delete clone._id;
                        return clone;
                    }
                    return item;
                });
            }
        });

        if (image) {
            const imageBufferData = fs.createReadStream(image.path);
            const isBgRemoveTrue = removeBackground === "yes" || removeBackground === "true" || removeBackground === true;

            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: `resume_${resumeId || Date.now()}.jpg`,
                folder: 'user-resumes',
                transformation: {
                    pre: `w-300,h-300,fo-face,z-0.75${isBgRemoveTrue ? ',e-bgremove' : ''}`
                }
            });

            if (!resumeDataCopy.personal_info) {
                resumeDataCopy.personal_info = {};
            }
            resumeDataCopy.personal_info.image = response.url;
            
            if (fs.existsSync(image.path)) {
                fs.unlinkSync(image.path);
            }
        }

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId }, 
            { $set: resumeDataCopy }, 
            { new: true, runValidators: true }
        );

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or unauthorized to update" });
        }

        return res.status(200).json({ message: "Saved successfully", resume });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Update controller error:", error);
        return res.status(400).json({ message: error.message });
    }
};
// PUT: /api/resumes/update-visibility
export const toggleResumeVisibility = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, public: isPublic } = req.body;

        // Force convert incoming value to real boolean
        const visibilityValue = isPublic === "true" || isPublic === true;

        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId },
            { $set: { public: visibilityValue } },
            { returnDocument: 'after' } // Clean Mongoose update syntax
        );

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or unauthorized" });
        }

        return res.status(200).json({ 
            message: `Resume status set to ${resume.public ? 'Public' : 'Private'}`, 
            resume 
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};