import mongoose from 'mongoose';
const connectDb = async()=>{
    try {
        mongoose.connection.on("Connected", ()=>{
            console.log("Database connected successfull")
        });
        let mongoodbUri = process.env.MongoDb_URI
        
    } catch (error) {
        
    }
}