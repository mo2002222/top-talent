// socket.js
import { io } from "socket.io-client";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL 
const socket = io(BACKEND_URL); // backend server address

export default socket;
