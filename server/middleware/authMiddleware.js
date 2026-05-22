import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

// Middleware to protect routes by verifying a valid JWT token
const protectRoute = async(req, res, next) => {
    try{
        let token;

        // Read the Bearer token from the Authorization header
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If token exists, verify it and attach user data to req.user
        if(token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select("isAdmin email");
            req.user = {
                email: user.email,
                isAdmin: user.isAdmin,
                userId: decoded.userId
            };
            next();
        } else {
            return res.status(401).json({status: false, message: "Not authorised. Try again."});
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({status: false, message: "Not authorised. Try again."});
    }
};

// Middleware to restrict access to admin users only
const isAdminRoute = (req, res, next) => {
    if(req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(401).json({status: false, message: "Not authorised. Try again."});
    }
};

export { isAdminRoute, protectRoute };