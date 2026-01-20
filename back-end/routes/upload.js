const express = require('express');
const router = express.Router();
const multer = require('multer');
const {v2 : cloudinary} = require('cloudinary');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const Post = require('../modules/Post');
const User = require('../modules/User');
const { default: mongoose } = require('mongoose');
const { runModerationCheck } = require("../services/moderationService");
require('dotenv').config(); 
// app.use(express.urlencoded({ extended: true }));


//configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//configure multer-storage-cloudinary for videos
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder: 'uploads/videos',
        resource_type: "auto",
        // allowed_formats: ['mp4','avi','mkv','mov'],  
    },
});
//configure multer-storage-cloudinary for imgs
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads/postImages',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});


//make cloudinary the multer storage
const uploadVideo  = multer({storage: videoStorage});
const uploadImage = multer({storage: imageStorage });


//upload video to cloudinary 
router.post('/uploadVideo', uploadVideo.array('file'), async(req,res)=>{
    // console.log("Request Body:", req.body);
    if (!req.files || req.files.length === 0) { 
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
        const uploadFiles = req.files.map(file => ({
            url: file.path,
            type: file.mimetype
        }))
        res.status(200).json(uploadFiles);
    } catch (error) {
        res.status(500).json({error:'upload failed', detailes: error.message});
    }

});

//upload post 
router.post('/uploadPost', async(req, res)=>{
    try { 
        const {title, playerName, playerAge, playerNationality, playerLeague, videoUrl, userId, description} = req.body;
        const newPost = new Post({ 
            title,
            playerName, 
            playerAge,
            playerNationality,
            playerLeague,
            videoUrl,
            auther: userId,
            description 
        });

        const savedPost = await newPost.save();  
        await User.findByIdAndUpdate(userId,{
            $push : {posts : savedPost._id}
        });
        runModerationCheck(savedPost._id);
        
        res.status(200).json({message: 'post uploaded'});

    } catch (error) {
        console.log('post failed', error);
        res.status(500).json({error: 'post failed', detailes: error.message});
    }
});

//edit profile image ..............and user name
router.patch('/update-setting/username-profileimg', uploadImage.single('file'), async(req, res)=>{
    const {oldUsername, newUsername} = req.body;
    
    try {
            const existingUser = await User.findOne({username: oldUsername});
            if (!existingUser || !mongoose.Types.ObjectId.isValid(existingUser._id)) {
                return res.status(400).json({ message: 'User not found' });
            }
            const updateData = {};      

        if (newUsername && newUsername !== existingUser.username) {
            updateData.username = newUsername;
        }

        // Update avatar if file exists
        if (req.file) {
            updateData.avatar = req.file.path;
        } else {
            // Keep existing avatar if no new file
            updateData.avatar = existingUser.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz5_xiKm1loVjY0NFyFHOP841eUkq2hwWJlw&s';
        }

        const updatedUser = await User.findByIdAndUpdate(existingUser._id, {$set: updateData}, {new: true, runValidators: true }).select('-password');

        res.status(200).json(updatedUser)
    } catch (error) {  
        res.status(500).json({message: error.message});  
        console.log(error);
    }
})




module.exports = router;