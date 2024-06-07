import User from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateToken.js";
export const signup = async (req, res) => {
    try {
        //get the data entered
        const { fullname, username, password, confirmpassword, gender } = req.body;

        //check if password and confirmpassword are the same
        if (password !== confirmpassword) {
            return res.status(400).json({ error: "Passwords do not match!" });
        }
        
        //check if the entered username already exists
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: "Username already exists!" });
        }

        //hash password here
        const salt = await bcryptjs.genSalt(10);
        const hashedpass = await bcryptjs.hash(password, salt);

        //profile pics
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`

        //make a new user based on the data provided
        const newUser = new User({
            fullname,
            username,
            password: hashedpass,
            gender,
            profilepic: (gender === "male") ? boyProfilePic : girlProfilePic,
        })

        //if a valid object vould be created, then save it to database
        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                profilepic: newUser.profilepic
            });
        }
        else {
            res.status(400).json({ error: "Invalid user data!" });
        }
    } catch (error) {
        console.log("Error in signup controller : ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcryptjs.compare(password, user?.password || "");

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid username or password!"});
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(201).json({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            profilepic: user.profilepic
        });

    } catch (error) {
        console.log("Error in login controller : ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({error:"Logged out succesfully!"});
    } catch (error) {
        console.log("Error in logout controller :", error.message);
        res.status(500).json({error:"Internal Server error"});
    }
};
