import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
const PORT = process.env.port || 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req,res)=>{
    res.send("Server is Running");
});

app.listen(PORT,()=>{
    console.log(`Server is Running on Port http/localhost:${PORT}`);
})