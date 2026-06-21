import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js'
import {updateResume,getPublicResumeById,getResumeById,deleteResume,createResumes  } from '../controller/resumeController';

const resumeRouter= express.Router();

resumeRouter.post('/create', protect, createResumes);

resumeRouter.put('/update',upload.single('image'), protect, updateResume);

resumeRouter.deletet('/delete/:resumeId', protect, deleteResume);

resumeRouter.get('/get/:resumeId', protect, getResumeById);

resumeRouter.get('/public/:resumeId', protect, getPublicResumeById);

export default resumeRouter;



