const Chat = require("../modules/Chat");
const express = require("express");
const router = express.Router();
const multer = require('multer');
const {v2 : cloudinary} = require('cloudinary');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const User = require('../modules/User'); 
const mongoose = require("mongoose");

//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//configure multer-storage-cloudinary for imgs
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: 'uploads/chatimgs',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
  }
});

const uploadImage = multer({storage: imageStorage });


// Send a message (Save to database)
router.post("/api/chat", uploadImage.single("image"), async (req, res) => {  
  
    // console.log("Received message:", req.body, req.file);
    
  try {
    const { senderId, receiverId, content } = req.body;
    let imageUrl = '';

    if (req.file) {
      imageUrl = req.file.path; // Get the URL of the uploaded image
    } 
    
    const message = new Chat({ senderId, receiverId, content, imageUrl });
    await message.save(); 
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
    
  }  
});

// Get all messages between two users
router.get("/:userId/:receiverId", async (req, res) => {
  
  try {
    const messages = await Chat.find({
      $or: [
        { senderId: req.params.userId, receiverId: req.params.receiverId },
        { senderId: req.params.receiverId, receiverId: req.params.userId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: userObjectId },
            { receiverId: userObjectId },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            userPair: {
              $cond: [
                { $lt: ["$senderId", "$receiverId"] },
                ["$senderId", "$receiverId"], 
                ["$receiverId", "$senderId"],
              ],
            },
          }, 
          lastMessage: { $first: "$$ROOT" },
        },
      },
      { $replaceRoot: { newRoot: "$lastMessage" } },
      { $sort: { createdAt: -1 } },
    ]);

    const results = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId =
          conversation.senderId.toString() === userId
            ? conversation.receiverId
            : conversation.senderId;

        const otherUser = await User.findById(otherUserId)
          .select("username avatar role");

        return {
          ...conversation,
          otherUser,
        };
      })
    ); 

    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

module.exports = router;