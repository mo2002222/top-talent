const express = require('express');
const router = express.Router();
const User = require('../modules/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authCheck = require('./authCheck');
const { OAuth2Client } = require("google-auth-library"); 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


//creat an account
router.post('/register-new-user', async(req, res) => {
    const {username, Email: email , Password: password, role, country} = req.body;
    
    try {
        const existingUser = await User.findOne({email});
        
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        } 

        // ✅ Backend password validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters include uppercase, lowercase, number, and special character",
      });
    }

        const response = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.API_KEY}&email=${email}`
        );
        const data = await response.json();
        const isValid = data.deliverability === "DELIVERABLE";

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassWord = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassWord, 
            role,
            country
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});  


// ✅ Google Register
router.post("/auth/google/register", async (req, res) => {
  try {
    const { access_token, role, country} = req.body;
    if (!access_token) {
      return res.status(400).json({ error: "No ID token provided" });
    }
      

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: access_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ error: "Email not verified by Google" });
    } 

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user (no password needed)
      const safeUsername = name.replace(/[^a-zA-Z0-9_]/g, "_");
      user = new User({
        username: safeUsername,
        email,
        password: null,
        googleId,
        role: role || 'user', // default role
        country: country || '',  // you can fill this later if needed
        // avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz5_xiKm1loVjY0NFyFHOP841eUkq2hwWJlw&s", 
      });
      await user.save();
    }
    // Create your app's own JWT for session
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username, email: user.email, saved: user.saved, avatar: user.avatar},
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie('token', token, {
            httpOnly: true,
            secure: true, 
            sameSite: 'none', 
            // made max age 7 days
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

    res.status(200).json({
      message: "Google authentication successful",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role},
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
}); 

router.post("/auth/google/login", async (req, res) => {
  console.log("Google auth request received");
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ error: "No access token provided" });
    }

    // ✅ Use access_token to fetch user info from Google
    const googleUserInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!googleUserInfoResponse.ok) {
      return res.status(400).json({ error: "Failed to verify access token" });
    }

    const payload = await googleUserInfoResponse.json();
    const { sub: googleId, email, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ error: "Email not verified by Google" });
    }

    // ✅ Check if user exists
    let user = await User.findOne({ email });
    const safeUsername = name.replace(/[^a-zA-Z0-9_]/g, " ");
    if (!user) {
      // Create new user if not found
      user = new User({
        username: safeUsername,
        email,
        password: null,
        googleId,
        role: "user",
        country: "",
        // avatar: picture || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSz5_xiKm1loVjY0NFyFHOP841eUkq2hwWJlw&s",
      });
      await user.save();
    }
    

    // ✅ Create your own app token
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username, email: user.email, saved: user.saved, avatar: user.avatar, isAdmin: user.isAdmin},
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true in production
      sameSite: "none",
       maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Google authentication successful",
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role},
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

//login 
router.post('/login-user', async(req, res)=>{
    const {email, password} = req.body;
    
    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({message: "Invalid credentials"});
        }  

        //check password
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch) { 
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        //gen GWT token
        const token = jwt.sign({ id: user._id, role: user.role, username: user.username, email: user.email, saved: user.saved, avatar: user.avatar, isAdmin: user.isAdmin }, process.env.JWT_SECRET, {expiresIn: '1h',});

        //save token in cookie   
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', 
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role} });
 

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});   

//logout
router.post('/log-out-user', (req, res)=>{
    console.log('User logged out');
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.status(200).json({message: 'User logged out successfully'});
})

router.put("/follow/:id", authCheck, async (req, res) => {
  try {
    const userId = req.user.id; // current user
    const targetUserId = req.params.id;
    console.log(userId, targetUserId);
    

    if (userId === targetUserId) return res.status(400).json({ message: "Cannot follow yourself" });
 
    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(userId);

    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (!targetUser.followers.includes(userId)) {
      targetUser.followers.push(userId);
      currentUser.following.push(targetUserId); // optional
      await targetUser.save();
      await currentUser.save();
      return res.json({ message: "Followed successfully", followersCount: targetUser.followers.length });
    } else {
      // Already following, so unfollow
      targetUser.followers = targetUser.followers.filter(f => f.toString() !== userId);
      currentUser.following = currentUser.following.filter(f => f.toString() !== targetUserId);
      await targetUser.save();
      await currentUser.save();
      return res.json({ message: "Unfollowed successfully", followersCount: targetUser.followers.length });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});  
 
//send user info based on id    
router.get('/api/users/:id', async(req, res) =>{ 
  const userId = req.params.id;   
  const currentUser = await User.findById(userId);  
  if (!currentUser) return res.status(404).json({ message: "User not found" });

  return res.json({ message: "user info", profileImage: currentUser.avatar, followers: currentUser.followers.length, username: currentUser.username, country: currentUser.country });

})  
 
//check if user authenticated
router.get('/is-user-authenticated', authCheck, async(req, res)=>{
    res.status(200).json({message: 'User authenticated', user: req.user, authentecated: true});
})



module.exports = router
