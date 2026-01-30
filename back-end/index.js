const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv'); 
const bodyParser = require('body-parser');   
const Post = require('./modules/Post'); 
const cookiePArser = require("cookie-parser"); 
const app = express();
const port = process.env.PORT || 3000;
dotenv.config();  
app.use(cors({  
    origin: 'https://top-talent-six.vercel.app',
    credentials: true,   
})); 
app.use(express.json()); 
app.use(bodyParser.json());
app.use(cookiePArser()); 
const User = require('./modules/User');

// creat http server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
    cors: {
      origin: 'https://top-talent-six.vercel.app', // Allow frontend to connect

    }, 
  }); 
 
  // Map of online users
let onlineUsers = new Map(); 
let userActiveChats = new Map();
// Handle socket connection
io.on('connection', (socket) => {

    // When user logs in, save their userId
    socket.on('addUser', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("getUsers", Array.from(onlineUsers.keys()));
    }); 
   // Handle sending message 
    socket.on('sendMessage', async({ senderId, receiverId, content, imageUrl }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    const username = await User.findById(senderId).select("username");
    
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('getMessage', { senderId, content, timestamp: new Date(), imageUrl, isReaded: false });

      const chattingWith = userActiveChats.get(receiverId);

      if (chattingWith !== senderId) {
        io.to(receiverSocketId).emit('recive-notification', {
          senderId,
          type: 'message',
          content: `${username.username} sent you a message`,
        }); 
      } 
    } 
  }); 

  //handle send noti when liked post 
  socket.on("sendNotification-like", async ({ senderId, receiverId, postId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    const username = await User.findById(senderId).select("username");
    const post = await Post.findById(postId).select("title");

    if (receiverSocketId) {  
      io.to(receiverSocketId).emit('recive-notification', {
        senderId, 
        type: 'like', 
        content: `${username.username} liked your post "${post.title}"`,
      });  
    }   
  }); 
 
  //handle send noti when comment on post
  socket.on("sendNotification-comment", async ({ senderId, receiverId, postId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    const username = await User.findById(senderId).select("username");
    const post = await Post.findById(postId).select("title");
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('recive-notification', {
        senderId,
        type: 'comment',
        content: `${username.username} commented on your post "${post.title}"`,
        postId: postId,
      });
    }
  });
  

  // Handle active chat
  socket.on("activeChat", ({ userId, chattingWith }) => {
    userActiveChats.set(userId, chattingWith);
  });
  
  socket.on("closeChat", ({ userId }) => {
    userActiveChats.delete(userId);
  });

  

  //handle typing
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });



  

  
  // Handle disconnect
  socket.on('disconnect', () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("getUsers", Array.from(onlineUsers.keys()));
  });
});







// Connect to MongoDB
mongoose
.connect(
    `mongodb+srv://maboabdallah:${process.env.MONGODB_URI}@cluster0.wsebe.mongodb.net/topTalentDB?retryWrites=true&w=majority&ssl=true&appName=Cluster0`,
)
.then(() => console.log("Connected to MongoDB"))
.catch((err) => {
    console.error("***************", err);
});



app.use(require('./routes/upload')); 
app.use(require('./routes/cloudinary')); 
app.use(require('./routes/postAPIs'));
app.use(require('./routes/Comment'));
app.use(require("./routes/user")) 
app.use(require('./routes/admin'));  
app.use(require('./routes/history'));
app.use(require('./routes/message'));   




server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
