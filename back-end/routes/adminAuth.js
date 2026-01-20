const jwt = require("jsonwebtoken");
const User = require("../modules/User");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Admin auth failed:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = adminAuth;