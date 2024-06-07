import jwt from "jsonwebtoken"

const generateTokenAndSetCookie = (userID, res) => {
    const token = jwt.sign({ userID }, process.env.JWT_SECRET_KEY, {
        expiresIn: '15d'
    });

    res.cookie("jwt", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, //milliseconds in 15 days
        httpOnly: true, //prevents XXS attacks
        samesite: "strict",
        secure: process.env.NODE_ENV !== "development"
    });
}

export default generateTokenAndSetCookie;