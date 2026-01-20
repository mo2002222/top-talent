const jwt = require('jsonwebtoken');
require("dotenv").config();
const User = require('../modules/User');

const authCheck =  async(req, res, next) => {

    const token = req.cookies.token;  
    
    if (!token) {
        return res.status(401).json({ authenticated: false, message: "No token provided" });
    }

    try {
        // Verify token synchronously
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user asynchronously
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ 
                authenticated: false, 
                message: "User not found" 
            });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ 
            authenticated: false, 
            message: "Invalid token" 
        });
    }
}


module.exports = authCheck; 