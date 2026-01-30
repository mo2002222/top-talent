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

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://top-talent-six.vercel.app",
    credentials: true,
  },
});

// userId -> Set(socketId)
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // ======================
  // ADD USER
  // ======================
  socket.on("addUser", (userId) => {
    socket.userId = userId;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    io.emit("getUsers", Array.from(onlineUsers.keys()));
  });

  // ======================
  // ACTIVE CHAT (PER SOCKET)
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
      const sockets = onlineUsers.get(receiverId);
      if (!sockets) return;

      const username = await User.findById(senderId).select("username");

      sockets.forEach((socketId) => {
        io.to(socketId).emit("getMessage", {
          senderId,
          content,
          imageUrl,
          timestamp: new Date(),
          isReaded: false,
        });

        const receiverSocket = io.sockets.sockets.get(socketId);

        if (receiverSocket?.chattingWith !== senderId) {
          io.to(socketId).emit("recive-notification", {
            senderId,
            type: "message",
            content: `${username.username} sent you a message`,
          });
        }
      });
    }
  );

  // ======================
  // TYPING
  // ======================
  socket.on("typing", ({ senderId, receiverId }) => {
    const sockets = onlineUsers.get(receiverId);
    if (!sockets) return;

    sockets.forEach((socketId) => {
      io.to(socketId).emit("typing", { senderId });
    });
  });

  // ======================
  // DISCONNECT
  // ======================
  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (!userId) return;

    const sockets = onlineUsers.get(userId);
    if (!sockets) return;

    sockets.delete(socket.id);

    if (sockets.size === 0) {
      onlineUsers.delete(userId);
    }

    io.emit("getUsers", Array.from(onlineUsers.keys()));
  });
});

// ======================
// DATABASE
// ======================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);

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
