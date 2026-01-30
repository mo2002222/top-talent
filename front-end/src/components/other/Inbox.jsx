import { useState, useEffect, useRef, useContext } from "react";
import socket from "../../socket";
import useNotificationStore from "../zustand";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import UserContext from "../authContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Inbox = ({
  isOpen,
  senderId,
  receiverId,
  onColse,
  dMood,
  callPlace,
  setRefreshMessages,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  const onlineUsers = useNotificationStore((state) => state.onlineUsers);
  const setIsMessageRead = useNotificationStore(
    (state) => state.setIsMessageRead
  );

  const { user } = useContext(UserContext);

  /* =========================
     SOCKET INITIALIZATION
  ========================= */
  useEffect(() => {
    if (!isOpen || !senderId || !receiverId) return;

    const onConnect = () => {
      // ✅ guaranteed to reach backend
      socket.emit("addUser", senderId);
      socket.emit("activeChat", { chattingWith: receiverId });
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.once("connect", onConnect);
    }

    const handleMessage = (data) => {
      setIsMessageRead(false);
      setMessages((prev) => [...prev, { ...data, fromSelf: false }]);
    };

    const handleTyping = ({ senderId: typingUser }) => {
      if (typingUser === receiverId) {
        setIsTyping(true);
        clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(
          () => setIsTyping(false),
          2000
        );
      }
    };

    socket.on("getMessage", handleMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.emit("closeChat");
      socket.off("getMessage", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("connect", onConnect);
      clearTimeout(typingTimeout.current);
    };
  }, [isOpen, senderId, receiverId, setIsMessageRead]);

  /* =========================
     FETCH CHAT HISTORY
  ========================= */
  useEffect(() => {
  if (!senderId || !receiverId) return;

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/${senderId}/${receiverId}`);
      const data = await res.json();

      const formatted = data.map((msg) => ({
        content: msg.content,
        imageUrl: msg.imageUrl,
        fromSelf: msg.senderId === senderId,
      }));

      // ✅ DO NOT overwrite realtime messages
      setMessages((prev) => (prev.length ? prev : formatted));
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchMessages();
}, [senderId, receiverId]);


  /* =========================
     SEND MESSAGE
  ========================= */
  const sendMessage = async () => {
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("senderId", senderId);
    formData.append("receiverId", receiverId);
    if (content) formData.append("content", content);
    if (image) formData.append("image", image);

    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    socket.emit("sendMessage", {
      senderId,
      receiverId,
      content: data.content,
      imageUrl: data.imageUrl,
    });

    setMessages((prev) => [
      ...prev,
      { content: data.content, imageUrl: data.imageUrl, fromSelf: true },
    ]);

    setContent("");
    setImage(null);
  };

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isReceiverOnline = onlineUsers.includes(receiverId);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-md m-3 bg-slate-900 border border-slate-700 rounded-2xl flex flex-col h-[530px]">

        {/* HEADER */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          {callPlace === "messenger" && (
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="cursor-pointer text-slate-300"
              onClick={() => {
                dMood("allmessages");
                setRefreshMessages((p) => !p);
                onColse();
              }}
            />
          )}
          <div>
            <h2 className="text-white font-semibold">Chat</h2>
            <p
              className={`text-xs ${
                isReceiverOnline ? "text-green-400" : "text-red-400"
              }`}
            >
              {isReceiverOnline ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.fromSelf ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    msg.fromSelf
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-100"
                  }`}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt=""
                      className="w-32 rounded-lg mb-2"
                    />
                  )}
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <p className="text-xs text-slate-400">Typing…</p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        <div className="border-t border-slate-700 p-3 flex gap-2">
          <input
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              socket.emit("typing", { senderId, receiverId });
            }}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-full"
          />

          <input
            type="file"
            id="upload-image"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />

          <label htmlFor="upload-image" className="cursor-pointer">
            📎
          </label>

          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded-full text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
