const express = require('express');
const router = express.Router();
const Post = require('../modules/Post'); 
const User = require('../modules/User');
const View = require('../modules/Views');
const { default: mongoose } = require('mongoose');
const ContentReport = require('../modules/ContentReport');

//send post based on posIid 
router.get('/send-post/:postid', async (req, res)=>{
    const {postid} = req.params;
    try { 
        if (!postid || !mongoose.Types.ObjectId.isValid(postid)) {
            return res.status(404).json({error: 'No post found'})
        }
        const post = await Post.findById(postid);
        const viewsCount = await View.countDocuments({ postId: postid });
        const autherId =  post.auther;
        const userAuthor = await User.findById(autherId);
        if (!userAuthor) {
            return res.status(404).json({ error: 'Author not found' });
        }

        res.status(200).json({post: post, auther : userAuthor, views : viewsCount});
    }catch (error) {
        res.status(500).json({error: 'Server error', details: error.message});
    }
}); 

//send all posts
router.get('/get-posts', async (req, res)=>{
    
    let filter = {};
    let filteredPosts = [];
    try {
        const {country, league, ageRange, mostLiked, topRated} = req.query;
        
        if(ageRange || country || league || mostLiked || topRated){

            if (country) filter.playerNationality = country.toLowerCase();

            if (league) filter.playerLeague = league.toLowerCase();

            if (ageRange) {
                const [minAgeStr, maxAgeStr] = ageRange.split('-');
                const minAge = Number(minAgeStr);
                const maxAge = Number(maxAgeStr);
                if(!isNaN(minAge) && !isNaN(maxAge)) {
                    filter.playerAge = { $gte: minAge, $lte: maxAge }; // Filter by age range
                }else{ 
                        filter.playerAge = { $gte: minAge }; // Filter by min age and above
                }
            } 
            if (mostLiked === true || mostLiked === 'true') {
                filter['likes.0'] = { $exists: true }
            }
        }        

        const allPosts = await Post.find().lean(); 
         // Fetch all view counts grouped by postId
        const viewCounts = await View.aggregate([
        { $group: { _id: "$postId", count: { $sum: 1 } } }
        ]);
        // Convert to map for easy lookup
        const viewCountMap = {};
        viewCounts.forEach(vc => {
        viewCountMap[vc._id.toString()] = vc.count;
        });

        // Merge counts into posts
        const postsWithViews = allPosts.map(post => ({
        ...post,
        viewCount: viewCountMap[post._id.toString()] || 0
        }));

        const RecFromUsPosts = await Post.find({isRecomendedFromUs : 'true'});
        const RecFromUserPosts = await Post.find({
            $expr: { $gt: [{ $size: "$Recomends" }, 2] } // Check array length > 2
        }); 
        
        const topRatedPosts = await Post.aggregate([
            {
                $addFields: {
                    avgRating: { $avg: "$evaluates.evaluate" } // Compute the average rating
                }
            },
            {  
                $match: {
                    avgRating: { $gt: 5 } // Filter posts with avg rating > 5
                }
            },
            {
                $sort: { avgRating: -1 } // Sort by average rating in descending order
            },
            {
                $addFields: { _id: "$_id" } // Keep _id for reference
            }
        ]);

        if(topRated === 'true' || topRated === true) {
            filteredPosts.push(...topRatedPosts);
        }

        if (Object.keys(filter).length > 0)  {
            const posts = await Post.find(filter)
            filteredPosts.push(...posts);
        }

        // If no filters are applied, return filterposts as ''no post for filter aplied''
        if (filteredPosts.length === 0 && Object.keys(filter).length > 0) {
            filteredPosts.push({message: 'no post for filter aplied'});
        }

        res.status(200).json({allPosts: postsWithViews, RFUs : RecFromUsPosts, RFUser: RecFromUserPosts, topRatedPosts, filteredPosts});
    } catch (error) {
        res.status(500).json({error: 'Server error', details: error.message});
        console.log(error);
        
    }
}); 


//add like and unlike to post
router.post('/add-like/:postId', async(req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid postId or userId" });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        let update = {};
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            // إذا عمل أنلايك
            update = {
                $pull: { likes: userId }
            };
        } else {
            // إذا عمل لايك
            update = {
                $addToSet: { likes: userId },
                $pull: { disLikes: userId } // إزالة من الديسلايك لو موجود
            };
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });

        return res.status(200).json({
            message: hasLiked ? "Like removed successfully" : "Like added successfully",
            likes: updatedPost.likes.length,
            dislikes: updatedPost.disLikes.length
        });
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//add dislike and remove like to post
router.post('/add-dislike/:postId', async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid postId or userId" });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const hasDisliked = post.disLikes.includes(userId);

        let update = {};

        if (hasDisliked) {
            // إزالة الديسلايك
            update = {
                $pull: { disLikes: userId }
            };
        } else {
            // إضافة ديسلايك + إزالة من اللايك لو موجود
            update = {
                $addToSet: { disLikes: userId },
                $pull: { likes: userId }
            };
        }

        const updatedPost = await Post.findByIdAndUpdate(postId, update, { new: true });

        return res.status(200).json({
            message: hasDisliked ? "Dislike removed successfully" : "Dislike added successfully",
            likes: updatedPost.likes.length,
            dislikes: updatedPost.disLikes.length
        });

    } catch (error) {
        console.error("Error disliking post:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//add like and unlike to comment
router.post('/add-like-to-comment/:postId/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) ||
        !mongoose.Types.ObjectId.isValid(commentId) ||
        !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid IDs" });
    }

    try {
        const post = await Post.findOne(
            { _id: postId, "comments._id": commentId },
            { "comments.$": 1 }
        );

        if (!post || !post.comments.length) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const comment = post.comments[0];
        const hasLiked = comment.likes.includes(userId);

        let updateQuery = {};

        if (hasLiked) {
            updateQuery = {
                $pull: { "comments.$.likes": userId }
            };
        } else {
            updateQuery = {
                $addToSet: { "comments.$.likes": userId },
                $pull: { "comments.$.disLikes": userId }
            };
        }

        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            updateQuery,
            { new: true }
        );

        const updatedComment = updatedPost.comments.find(c => c._id.toString() === commentId);

        return res.status(200).json({
            message: hasLiked ? "Like removed from comment" : "Like added to comment",
            likes: updatedComment.likes.length,
            dislikes: updatedComment.disLikes.length
        });

    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//ad dislike and remove like to comment
router.post('/add-dislike-to-comment/:postId/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) ||
        !mongoose.Types.ObjectId.isValid(commentId) ||
        !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid IDs" });
    }

    try {
        // جلب التعليق للتحقق من حالته الحالية
        const post = await Post.findOne(
            { _id: postId, "comments._id": commentId },
            { "comments.$": 1 }
        );

        if (!post || !post.comments.length) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const comment = post.comments[0];
        const hasDisliked = comment.disLikes.includes(userId);

        let updateQuery = {};

        if (hasDisliked) {
            // إزالة الديسلايك
            updateQuery = {
                $pull: { "comments.$.disLikes": userId }
            };
        } else {
            // إضافة ديسلايك وإزالة اللايك لو موجود
            updateQuery = {
                $addToSet: { "comments.$.disLikes": userId },
                $pull: { "comments.$.likes": userId }
            };
        }

        const updatedPost = await Post.findOneAndUpdate(
            { _id: postId, "comments._id": commentId },
            updateQuery,
            { new: true }
        );

        const updatedComment = updatedPost.comments.find(c => c._id.toString() === commentId);

        return res.status(200).json({
            message: hasDisliked ? "Dislike removed from comment" : "Dislike added to comment",
            likes: updatedComment.likes.length,
            dislikes: updatedComment.disLikes.length
        });

    } catch (error) {
        console.error("Error disliking comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//add recomend
router.post('/add-recomend/:postId', async(req, res)=>{
    const {postId} = req.params;
    const {userId} = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({message: "Invalid postId or userId"})
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({message: "post not found"});
        }
        const indexOf = post.Recomends.indexOf(userId);
        if (indexOf !== -1) {
            post.Recomends.splice(indexOf, 1);            
        }else{
            post.Recomends.push(userId)
        }

        await post.save()
        return res.status(200).json({message: "recomend added successfully",  Recomends: post.Recomends.length});
    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// add evaluate
router.post('/add-evaluate/:postId', async (req, res)=>{
    const {postId} = req.params;
    const {userId, evaluate} = req.body;    
    
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({message: "Invalid posyId or userId"})
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({message: "post not found"});
        }

        const indexOf = post.evaluates.findIndex(e => e.userId == userId);
        if (indexOf !== -1) {
            post.evaluates[indexOf].evaluate = evaluate;            
        }else{
            post.evaluates.push({userId, evaluate})
        }

        await post.save()
        return res.status(200).json({message: "evaluate added successfully",  evaluates: post.evaluates});
    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//saved array
router.post('/save-post/:postId', async (req, res)=>{
    const {postId} = req.params;
    const {userId} = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({message: "Invalid posyId or userId"})
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "user not found"});
        }

        const indexOf = user.saved.indexOf(postId);
        if (indexOf !== -1) {
            user.saved.splice(indexOf, 1);         
        }else{
            user.saved.push(postId)
        }
        
        await user.save()
        return res.status(200).json({message: "saved added successfully"});
    } catch (error) {
        console.error("Error liking comment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}); 

//increment views

router.post('/posts/:postid/:userId/view', async (req, res) => {
    try {
    const { postid, userId } = req.params;
    // const userId = req.user ? req.user.id : null; 
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const existingView = await View.findOne({
        postId: postid,
        ...(userId
        ? { userId }
        : { ip }),
        viewedAt: { $gt: new Date(Date.now() - 30 * 60 * 1000)} 
    });

    if (!existingView) {
        await View.create({
        postId: postid,
        userId: userId || null,
        ip: userId ? null : ip,
        });

        await Post.findByIdAndUpdate(postid, { $inc: { views: 1 } });
        }     
        const count = await View.countDocuments({ postId: postid });
        res.status(200).json({ message: 'View recorded (if not already counted)', views: count });
        } catch (error) {
            console.error('View error:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
});

//send saved posts
router.get('/fetching-saved-posts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const saved = await User.findById(userId).populate('saved');

    if (!saved) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ savedPosts: saved.saved || [] });
  } catch (error) {
    console.error('Error fetching saved posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


//send mostliked and most viewed posts
router.get('/most-viewed-liked-posts', async(req, res) => {
    const topViewed = await Post.find({
        views: {$gt: 1000},
    })
    .sort({ views: -1 });

    const topLiked = await Post.aggregate([
        {
            $addFields: {
                likesCount: {$size: '$likes' }
            }
        },
        {
            $match: {
                likesCount: {$gt: 2}
            }
        }
    ])
    res.status(200).json({mostLiked: topLiked, mostViewed: topViewed})
})



//edit post details
router.put('/edit-post/:postId', async (req, res) => {
    const { postId } = req.params;
    const { title, playerName, playerLeague, playerAge,playerNationality, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(404).json({ message: 'Post not found' });
    }

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            postId,
            { title, description, playerName, playerLeague, playerAge, playerNationality},
            { new: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json({ message: 'Post updated successfully', updatedPost });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
 

//edit comment
router.put('/edit-comment/:postId/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;
    const { updatedComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(404).json({ message: 'Post or comment not found' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.text = updatedComment;
        await post.save({ validateModifiedOnly: true });

        res.status(200).json({ message: 'Comment updated successfully', updatedComment: comment });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}); 
 
//send urls  
router.get('/get-urls/:postId', async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(404).json({ message: 'Post not found' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json( post.videoUrl );
    } catch (error) {
        console.error('Error fetching URLs:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//send post based on search query
router.get('/search-posts', async (req, res) => {
    const query = req.query.q;
    
    if (!query) {
        return res.status(400).json({message: 'Query parameter is required'});
    }

    const words = query.trim().split(/\s+/);
    const orConditions = words.flatMap(word => [
        { title: { $regex: word, $options: 'i' } }, // Case-insensitive search in title
        { description: { $regex: word, $options: 'i' } }, // Case-insensitive search in description
        { playerName: { $regex: word, $options: 'i' } }, // Case-insensitive search in playerName
        { playerLeague: { $regex: word, $options: 'i' } }, // Case-insensitive search in playerLeague
        { playerNationality: { $regex: word, $options: 'i' } } // Case-insensitive search in playerNationality
    ])

    const results = await Post.find({
        $or: orConditions
    }).sort({ views: -1 }); 

    if (results.length === 0) {
        return res.status(404).json({ message: 'No posts found' });
    }
    res.status(200).json({ results });
})  

//suggestions
router.get('/search-suggestions', async (req, res) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }

    const words = query.trim().split(/\s+/);
    const orConditions = words.flatMap(word => [
        { title: { $regex: word, $options: 'i' } }, // Case-insensitive search in title
        { description: { $regex: word, $options: 'i' } }, // Case-insensitive search in description
        { playerName: { $regex: word, $options: 'i' } }, // Case-insensitive search in playerName
        { playerLeague: { $regex: word, $options: 'i' } }, // Case-insensitive search in playerLeague
        { playerNationality: { $regex: word, $options: 'i' } } // Case-insensitive search in playerNationality
    ]);

    try {
        const results = await Post.find({
            $or: orConditions
        }).limit(5); // Limit to 5 suggestions

        if (results.length === 0) {
            return res.status(404).json({ message: 'No suggestions found' });
        }

        res.status(200).json({ results });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// report content
// POST /report
router.post("/report", async (req, res) => {
  try {
    const { postId, reason, message, email } = req.body;

    await ContentReport.create({
      postId,
      reason,
      message,
      email,
    });

    res.json({ message: "Report submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit report" });
  }
});

// delet post by user
router.delete('/delete-post/:postId/:userId', async (req, res) => {
    const { postId, userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid postId or userId' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.auther.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts' });
        }
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
})
module.exports = router;