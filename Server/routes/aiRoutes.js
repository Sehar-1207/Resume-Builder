import express from 'express';
import { enhanceProfessionalSummary,enhanceJobDescription, UploadResume } from '../controller/aiController';
import protect from '../middlewares/authMiddleware.js';

const aiRouter= express.Router();
aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription);
aiRouter.post('/upload-resume', protect, UploadResume);

export default aiRouter;