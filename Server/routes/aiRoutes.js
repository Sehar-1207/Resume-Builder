import express from 'express';
import { enhanceProfessionalSummary,enhanceJobDescription, UploadResume } from '../controller/aiController.js';
import protect from '../middlewares/authMiddleware.js';

const aiRouter= express.Router();
aiRouter.post('/enhance-pro-sum', protect, enhanceProfessionalSummary);
aiRouter.post('/enhance-job-desc', protect, enhanceJobDescription);
aiRouter.post('/uploadResume', protect, UploadResume);

export default aiRouter;