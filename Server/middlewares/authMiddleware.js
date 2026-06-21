import jwt from 'jsonwebtoken';

const protect = async (req,res,next)=>{
    const token = req.headers.authorization;
    if(!token){
         return res.status(401).json({ message: "Unauthoried" });
    }
    try {
        const decoded = jwt.verify(token, process.env.Jwt_Secret);
        req.userId = decoded.userId;
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthoried" });
    }
}

export default protect;