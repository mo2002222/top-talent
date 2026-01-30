// socket.js
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
});

// 🔥 DEBUG + SAFETY
socket.on("connect", () => {
  console.log("✅ socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ socket disconnected");
});

export default socket;
