import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

export const protect = async(req, res, next) => {

    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{

            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.User = await User.findById(decoded.id).select('-password')

            next()

        }catch(error){
            console.error('Authentication error, token failed verification:', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
      }

} 
