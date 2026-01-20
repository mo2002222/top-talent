const jwt =  require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();
const User = require('../modules/User');
//check if user is admin 
const isAdmin = async(req, res, next)=>{
    const token = req.cookies.token;
    if (!token) { 
        return res.status(401).json({ authenticated: false, message: "No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        console.log(user);
        
        if(!user){
            return res.status(403).json({ authenticated: false, message: "Access denied" });
        }
        if(user.isAdmin === true){
            req.user = user;
            next();
        }
    } catch (error) {
        return res.status(403).json({ authenticated: false, message: "Invalid token" });
    }
}

module.exports = isAdmin;