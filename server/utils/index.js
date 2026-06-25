import jwt from "jsonwebtoken";

// Create a signed JWT for the given user ID
export const createJWT = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "12h",
    });

    /*res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });*/
    return token;
};

export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');