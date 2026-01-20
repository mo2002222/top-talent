const express = require("express");
const router = express.Router();
const Post = require("../modules/Post"); 
const { default: mongoose } = require("mongoose");
const User = require("../modules/User");

//add comment to certain post
router.post('/add-comment/:postId', async(req, res)=>{
    const {postId} = req.params;
    const {userid, text} = req.body;
    
    if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userid)){
        res.status(400).json({message: "invalid poat id or user id"});
    }

    const post = await Post.findById(postId); 

    if (!post) { 
        res.status(404).json({message: "post not found"});
    }
    const user = await User.findById(userid);

    const newComment = {
        user : userid,
        text,
        username: user.username,
        profileImage: user.avatar,
    }
    
    post.comments.push(newComment)

    await post.save();
    res.status(201).json(post)
}); 

//send coments 
router.get('/get-comments/:postId', async(req, res)=>{
    const {postId} = req.params; 
    
    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({message: "invalid post id"});
    }
 
    const post = await Post.findById(postId).populate('comments.user', 'role', )

    if (!post) {
        return res.status(404).json({message: "post not found"});
    }

    const comments = post.comments;
    res.status(200).json(comments)
});

//delet comment route
router.delete('/delete-comment/:postId/:commentId', async (req, res) => {
    const { postId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        return res.status(400).json({ message: "Invalid post id" });
    }

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
        return res.status(404).json({ message: "Comment not found" });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
});




module.exports = router;