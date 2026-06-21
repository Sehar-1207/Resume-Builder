

import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import { getUserById, logInUser, registerUser, getUserResumes } from '../controller/userController.js';

const userRouter = express.Router();
userRouter.post('/register' , registerUser);
userRouter.post('/login' , logInUser);
userRouter.get('/data' ,protect, getUserById);
userRouter.get('/resumes',protect,getUserResumes)

export default userRouter;