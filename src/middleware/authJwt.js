import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";


const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken||req.headers("authorization").replace("Bearer ", "");
        if (!token) {
            return res.status(403).json({message: "Token is required"});
        }

        const decodedtoken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedtoken._id);
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }
        req.user = user;
        next(); 

    } catch (error) {
        throw new ApiError(401, "Invalid token"); 
    }
}
 
export default verifyToken;