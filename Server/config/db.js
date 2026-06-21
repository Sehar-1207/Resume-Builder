import mongoose from 'mongoose';

const connectDb = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully");
        });

        mongoose.connection.on("error", (err) => {
            console.log("Mongoose connection error: " + err);
        });

        // Use the variable from your .env file
        const mongodbUri = process.env.Mongoodb_URI;

        if (!mongodbUri) {
            throw new Error("MongoDb_URI is not defined in .env file");
        }

        await mongoose.connect(mongodbUri);

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1); // Exit process with failure
    }
}

export default connectDb;