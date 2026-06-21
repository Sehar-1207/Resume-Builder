import User from "../model/userModel.js";
import Resume from "../model/resume.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    // Note: Ensure process.env.Jwt_Secret matches your actual .env casing (usually JWT_SECRET)
    const token = jwt.sign({ userId }, process.env.Jwt_Secret, {
        expiresIn: "7d",
    });
    return token;
};

// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        const token = generateToken(newUser._id);
        newUser.password = undefined;
        
        return res
            .status(201) // Changed to 201 since a resource is created here
            .json({ message: "User created successfully", token, user: newUser });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// POST: /api/users/login
export const logInUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Missing email or password" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        
        // Fixed: Added 'await' because password comparison is asynchronous
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Fixed: Changed newUser._id to user._id
        const token = generateToken(user._id);
        user.password = undefined;
        
        return res
            .status(200) // Changed from 201 to 200 OK
            .json({ message: "User logged in successfully", token, user });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/users/data
export const getUserById = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // Changed to 404
        }

        user.password = undefined;
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
    try {
        const userId = req.userId;
        const resumes = await Resume.find({ userId });
        return res.status(200).json({ resumes });
    } catch (error) {
         return res.status(400).json({ message: error.message });
    }
};