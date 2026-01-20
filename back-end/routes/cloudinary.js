const express = require('express');
const router = express.Router();
const cloudinary = require('../cloudinaryConfig');
const authCheck = require('./authCheck');
router.get('/get-cloudinary-videos', authCheck, async (req,res)=>{
    //fetch all videos from cloudinary 
    try {
        const result = await cloudinary.api.resources({
            resource_type: 'video',
            max_results: 30,
            type: 'upload',
            prefix: 'uploads/'
        });
        const videoUrls = result.resources.map(video => video.secure_url);

        res.status(200).json([{videosMetadata: result.resources, videosUrl: videoUrls}]); 
    } catch (error) {
        res.status(500).json({error:'fetch failed', detailes: error.message});
    } 
});


module.exports = router;