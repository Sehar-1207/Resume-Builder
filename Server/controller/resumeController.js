import Resume from "../model/resume.js";
import imagekit from '../config/imagekit.js';
import fs from 'fs';
import { structuredClone } from "worker_threads";

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
        const { resumeId, resumeData, removeBackground } = req.body;
        
        let resumeDataCopy = resumeData ? JSON.parse(JSON.stringify(resumeData)) : {};
        const image = req.file;

        let resumeDataCopy;
        if(typeof resumeData === 'string'){
            resumeDataCopy= await JSON.parse(resumeData)
        }else{
            resumeDataCopy = structuredClone(resumeData)
        }

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
            resumeDataCopy, 
            { new: true }
        );

        if (!resume) {
            return res.status(404).json({ message: "Resume not found or unauthorized to update" });
        }

        return res.status(200).json({ message: "Saved successfully", resume });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ message: error.message });
    }
};