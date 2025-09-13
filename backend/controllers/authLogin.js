import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        // Check if the user was found
        if (!user) {
            console.log(`DEBUG: No user found with email: ${email}`);
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        console.log("DEBUG: User found:", user.email); 

        // Check the password comparison
        const isMatch = await user.comparePassword(password);
        console.log("DEBUG: Password match result:", isMatch); 

        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid credentials" });
        }

        
        const payload = {
            id: user._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        return res.status(200).json({
            success: true,
            token: token,
        });
    } catch (error) {
        console.error("Login Error : ", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
