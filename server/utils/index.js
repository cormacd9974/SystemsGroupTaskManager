import jwt from "jsonwebtoken";

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