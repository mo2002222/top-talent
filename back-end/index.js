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
      origin: 'https://top-talent-six.vercel.app',
      credentials: true,
    }, 
  }); 
 
  // Map of online users
let onlineUsers = new Map(); 
let userActiveChats = new Map();
let userRooms = new Map(); // Track which rooms users are in

// Handle socket connection
io.on('connection', (socket) => {

    // When user logs in, save their userId
    socket.on('addUser', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("getUsers", Array.from(onlineUsers.keys()));
    }); 

    // Join room for specific chat
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      userRooms.set(socket.id, roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Leave room
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      userRooms.delete(socket.id);
      console.log(`User ${socket.id} left room: ${roomId}`);
    });

   // Handle sending message 
    socket.on('sendMessage', async({ senderId, receiverId, content, imageUrl, roomId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      const username = await User.findById(senderId).select("username");
      
      // Use the room ID or create one
      const targetRoom = roomId || [senderId, receiverId].sort().join('_');
      
      // Send to the room (both users will receive it)
      io.to(targetRoom).emit('getMessage', { 
        senderId, 
        receiverId,
        content, 
        imageUrl, 
        createdAt: new Date(), 
        isReaded: false 
      });
      
      // Also send directly to receiver if online (fallback)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('getMessage', { 
          senderId, 
          receiverId,
          content, 
          imageUrl, 
          createdAt: new Date(), 
          isReaded: false 
        });
      }

      // Notification logic remains the same
      const chattingWith = userActiveChats.get(receiverId);

      if (chattingWith !== senderId) {
        const notificationTarget = receiverSocketId || onlineUsers.get(receiverId);
        if (notificationTarget) {
          io.to(notificationTarget).emit('recive-notification', {
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
  socket.on("activeChat", ({ userId, chattingWith, roomId }) => {
    userActiveChats.set(userId, chattingWith);
    
    // Join the specific chat room
    const targetRoom = roomId || [userId, chattingWith].sort().join('_');
    socket.join(targetRoom);
    console.log(`User ${userId} active in chat with ${chattingWith}, room: ${targetRoom}`);
  });
  
  socket.on("closeChat", ({ userId }) => {
    userActiveChats.delete(userId);
    
    // Leave all rooms for this user
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      socket.leave(roomId);
      userRooms.delete(socket.id);
    }
  });

  //handle typing
  socket.on("typing", ({ senderId, receiverId, isTyping = true, roomId }) => {
    const targetRoom = roomId || [senderId, receiverId].sort().join('_');
    const receiverSocketId = onlineUsers.get(receiverId);
    
    // Emit to the room
    socket.to(targetRoom).emit("typing", { 
      senderId, 
      receiverId, 
      isTyping 
    });
    
    // Fallback: direct emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { 
        senderId, 
        receiverId, 
        isTyping 
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    // Remove from rooms
    userRooms.delete(socket.id);
    
    // Remove from online users
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
});
