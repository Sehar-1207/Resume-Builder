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

// DELETE: /api/resumes/delete/:resumeId  <-- Notice the explicit path parameter
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ _id: resumeId, userId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" }); // Changed 400 to 404
        }

        await Resume.deleteOne({ _id: resumeId, userId });
        return res.status(200).json({ message: "Resume deleted successfully" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/resumes/get/:resumeId  <-- Notice the explicit path parameter
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ _id: resumeId, userId });

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        
        // Converting to object to safely strip out internal Mongoose properties
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
        // Fixed: Ensure it searches for both the explicit ID AND confirms it is public
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
        const { resumeId, resumeData, removeBackground } = req.body;
        
        let resumeDataCopy = resumeData ? JSON.parse(resumeData) : {};
        const image = req.file;

        if (image) {
            const imageBufferData = fs.createReadStream(image.path);
            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: `resume_${resumeId || Date.now()}.jpg`,
                folder: 'user-resumes',
                transformation: {
                    pre: `w-300,h-300,fo-face,z-0.75${removeBackground === 'true' || removeBackground === true ? ',e-bgremove' : ''}`
                }
            });

            // Fixed: Safely ensuring personal_info structural path exists
            if (!resumeDataCopy.personal_info) {
                resumeDataCopy.personal_info = {};
            }
            resumeDataCopy.personal_info.image = response.url;

            // Cleanup local temp file storage after upload completes successfully
            if (fs.existsSync(image.path)) {
                fs.unlinkSync(image.path);
            }
        }

        // Fixed: Changed findByIdAndUpdate to findOneAndUpdate to securely query multi-field constraints (userId + resumeId)
        const resume = await Resume.findOneAndUpdate(
            { _id: resumeId, userId }, 
            resumeDataCopy, 
            { new: true }
        );

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or unauthorized to update" });
        }

        return res.status(200).json({ message: "Saved successfully", resume });
    } catch (error) {
        // Cleanup local temp file if processing crashed mid-flight
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: error.message });
    }
};