const express = require("express");
const router = express.Router();
const AdminNotification = require("../modules/AdminNotifications");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const dotenv = require("dotenv");
dotenv.config();
const ContentReport = require("../modules/ContentReport");
const AdminSchema = require("../modules/Admin");
const multer = require("multer");
const isAdmin = require("./isAdmin");
const User = require("../modules/User");
const Post = require("../modules/Post");
const adminAuth = require('./adminAuth')

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage
const imageSptsStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "uploads/images-snippets",
        allowed_formats: ["jpg", "png", "jpeg", "gif"],
    },
});

// Make Cloudinary the multer storage
const uploadImagespts = multer({ storage: imageSptsStorage });

// POST route for adding snippets
router.post("/admin/add-snippet", adminAuth, uploadImagespts.single("file"), async (req, res) => {
    const { snippet } = req.body;

    if (!snippet || !req.file) {
        console.log("Snippet or image is missing");
        return res.status(400).json({ error: "Snippet and image are required" });
    }

    try {
        const newSnippet = new AdminSchema({
            snippets: snippet,
            img: req.file.path,
        });

        await newSnippet.save();

        const snippets = await AdminSchema.find();

        res.status(201).json({
            message: "Snippet added successfully",
            snippets,
        });
    } catch (error) {
        res.status(500).json({
            error: "Failed to add snippet",
            details: error.message,
        });
    }
});

// GET all snippets
router.get("/get-snippets", async (req, res) => {
    try {
        const snippets = await AdminSchema.find();
        res.status(200).json(snippets);
    } catch (error) {
        res.status(500).json({
            error: "Failed to fetch snippets",
            details: error.message,
        });
    }
});

// Example: Admin-protected route
router.get("/get-num-of-users&posts", adminAuth, isAdmin, async (req, res) => {
    try {
        const numberOfUsers = await User.countDocuments();
        
        const numberOfPosts = await Post.countDocuments();
        res.status(200).json({nuberOfUsers: numberOfUsers , numberOfPosts:numberOfPosts });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/notifications", adminAuth, async (req, res) => {
  try {
    const notifications = await AdminNotification.find({status: "pending"})
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/posts/:id/approve", adminAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    await Post.findByIdAndUpdate(postId, {
      moderationStatus: "approved",
    });

    await AdminNotification.deleteMany({ postId });

    res.json({ message: "Post approved" });
  } catch (err) {
    console.error("Approve post error:", err);
    res.status(500).json({ error: "Approve failed" });
  }
});

router.post("/posts/:id/delete", adminAuth, async (req, res) => {
  try {
    const postId = req.params.id;

    await Post.findByIdAndDelete(postId);
    await AdminNotification.deleteMany({ postId });

    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

//conatct us route
router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "All fields are required" });
    }

    await ContactMessage.create({ name, email, message });

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Contact message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}); 

router.get("/reports", adminAuth, async (req, res) => {
  try {
    const reports = await ContentReport.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .populate("postId");

    res.json(reports);
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * ============================
 * POST /admin/reports/:id/mark-reviewed
 * ============================
 */
router.post("/reports/:id/mark-reviewed", async (req, res) => {
  try {
    const reportId = req.params.id;

    await ContentReport.findByIdAndUpdate(reportId, {
      status: "reviewed",
    });

    res.json({ message: "Report marked as reviewed" });
  } catch (err) {
    console.error("Mark report reviewed error:", err);
    res.status(500).json({ error: "Failed to update report" });
  }
});


// Export router using CommonJS
module.exports = router;
