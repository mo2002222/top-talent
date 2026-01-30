// socket.js
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(BACKEND_URL, {
  transports: ["websocket"],   // 🔥 FORCE real-time
  withCredentials: true,       // 🔥 keep auth/cookies
  autoConnect: true,
});

export default socket;
