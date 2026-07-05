import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import upload from '../config/multer.js';
import {
  updateResume,
  getPublicResumeById,
  getResumeById,
  deleteResume,
  createResumes,
  toggleResumeVisibility
} from '../controller/resumeController.js';

const resumeRouter = express.Router();

// Secure Actions
resumeRouter.post('/create', protect, createResumes);
resumeRouter.put('/update', upload.single('image'), protect, updateResume);
resumeRouter.put('/update-visibility', protect, toggleResumeVisibility);
resumeRouter.delete('/delete/:resumeId', protect, deleteResume);

// Private Fetch (Requires Login)
resumeRouter.get('/get/:resumeId', protect, getResumeById); // Added protect back here!

// Public Fetch (Accessible to Anyone)
resumeRouter.get('/public/:resumeId', getPublicResumeById); // Removed protect from here!

export default resumeRouter;