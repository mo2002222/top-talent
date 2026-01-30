const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const User = require("./modules/User");
const Post = require("./modules/Post");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "https://top-talent-six.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://top-talent-six.vercel.app",
  },
});

// Online users (userId → socketId)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // ======================
  // USER ONLINE
  // ======================
  socket.on("addUser", (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    io.emit("getUsers", Array.from(onlineUsers.keys()));
  });

  // ======================
  // ACTIVE CHAT (per socket)
  // ======================
  socket.on("activeChat", ({ chattingWith }) => {
    socket.chattingWith = chattingWith;
  });

  socket.on("closeChat", () => {
    socket.chattingWith = null;
  });

  // ======================
  // SEND MESSAGE
  // ======================
  socket.on(
    "sendMessage",
    async ({ senderId, receiverId, content, imageUrl }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      const username = await User.findById(senderId).select("username");

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("getMessage", {
          senderId,
          content,
          imageUrl,
          timestamp: new Date(),
          isReaded: false,
        });

        const receiverSocket =
          io.sockets.sockets.get(receiverSocketId);

        if (receiverSocket?.chattingWith !== senderId) {
          io.to(receiverSocketId).emit("recive-notification", {
            senderId,
            type: "message",
            content: `${username.username} sent you a message`,
          });
        }
      }
    }
  );

  // ======================
  // TYPING
  // ======================
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  // ======================
  // LIKE NOTIFICATION
  // ======================
  socket.on(
    "sendNotification-like",
    async ({ senderId, receiverId, postId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      const username = await User.findById(senderId).select("username");
      const post = await Post.findById(postId).select("title");

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("recive-notification", {
          senderId,
          type: "like",
          content: `${username.username} liked your post "${post.title}"`,
        });
      }
    }
  );

  // ======================
  // COMMENT NOTIFICATION
  // ======================
  socket.on(
    "sendNotification-comment",
    async ({ senderId, receiverId, postId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      const username = await User.findById(senderId).select("username");
      const post = await Post.findById(postId).select("title");

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("recive-notification", {
          senderId,
          type: "comment",
          content: `${username.username} commented on your post "${post.title}"`,
          postId,
        });
      }
    }
  );

  // ======================
  // DISCONNECT
  // ======================
  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit("getUsers", Array.from(onlineUsers.keys()));
    }
  });
});

// ======================
// DATABASE
// ======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// ======================
// ROUTES
// ======================
app.use(require("./routes/upload"));
app.use(require("./routes/cloudinary"));
app.use(require("./routes/postAPIs"));
app.use(require("./routes/Comment"));
app.use(require("./routes/user"));
app.use(require("./routes/admin"));
app.use(require("./routes/history"));
app.use(require("./routes/message"));

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
