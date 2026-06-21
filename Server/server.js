import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './config/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.port || 5000;

await connectDb();

app.get('/', (req,res)=>{
    res.send("Server is Running");
});
app.use('/api/users', userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);

app.listen(PORT,()=>{
   console.log(`Server is Running on Port: http://localhost:${PORT}`);
})