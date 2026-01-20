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
  const onlineUsers = useNotificationStore((state) => state.onlineUsers);
  const { user } = useContext(UserContext);
  const setIsMessageRead = useNotificationStore(
    (state) => state.setIsMessageRead,
  );

  useEffect(() => {
    socket.emit("activeChat", { userId: senderId, chattingWith: receiverId });

    socket.on("getMessage", (data) => {
      setIsMessageRead(false);
      setMessages((prev) => [...prev, { ...data, fromSelf: false }]);
    });

    socket.on("typing", ({ senderId: typingUser }) => {
      if (typingUser === receiverId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socket.off("getMessage");
      socket.off("typing");
      socket.emit("closeChat", { userId: senderId });
      setIsTyping(false);
    };
  }, [senderId, receiverId]);

  const sendMessage = async () => {
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append("senderId", senderId);
    formData.append("receiverId", receiverId);
    if (content) formData.append("content", content);
    if (image) formData.append("image", image);

    // Save in database
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      // headers: { "Content-Type": "application/json" },
      body: formData,
    });

    const data = await res.json();

    // Send live via websocket
    socket.emit("sendMessage", {
      senderId,
      receiverId,
      content: data.content,
      imageUrl: data.imageUrl,
    });

    // Update local chat
    setMessages((prev) => [
      ...prev,
      { content, fromSelf: true, imageUrl: data.imageUrl },
    ]);
    setContent("");
    setImage(null);

    return () => {
      socket.off("recive-notification");
    };
  };

  const handleTyping = () => {
    socket.emit("typing", { senderId, receiverId });
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    const res = await fetch(`${BACKEND_URL}/${senderId}/${receiverId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    res.ok && setIsLoading(false);
    !res.ok && setIsLoading(false);
    const data = await res.json();

    const formatted = data.map((msg) => ({
      content: msg.content,
      imageUrl: msg.imageUrl,
      fromSelf: msg.senderId === senderId,
    }));
    setMessages(formatted);
    // console.log(messages);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
  }, [receiverId]);

  const isReceiverOnline = onlineUsers.includes(receiverId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="w-full max-w-md sm:m-0 m-3 bg-slate-900/90 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-[530px]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <div className="flex items-center gap-3">
            {callPlace === "messenger" && (
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="cursor-pointer text-lg text-slate-300 hover:text-white"
                onClick={() => {
                  dMood("allmessages");
                  setRefreshMessages((prev) => !prev);
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
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-3/4 bg-slate-800 rounded-2xl p-6 animate-pulse space-y-4">
                <div className="h-28 bg-slate-700 rounded-xl" />
                <div className="h-4 bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-700 rounded w-1/2" />
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                ref={messagesEndRef}
                className={`flex ${msg.fromSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow ${
                    msg.fromSelf
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-slate-700 text-slate-100 rounded-bl-md"
                  }`}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="attachment"
                      className="w-32 rounded-lg mb-2"
                    />
                  )}
                  {msg.content && <p>{msg.content}</p>}
                </div>
              </div>
            ))
          )}

          {isTyping && senderId !== user._id && (
            <p className="text-xs text-slate-400">Typing…</p>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="border-t border-slate-700 p-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message…"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            className="flex-1 bg-slate-800 text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="file"
            id="upload-image"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />

          <label
            htmlFor="upload-image"
            className="cursor-pointer text-xl text-slate-300 hover:text-white"
          >
            📎
          </label>

          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition"
          >
            Send
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center pb-3">
          <button
            onClick={() => {
              if (dMood === undefined) return onColse();
              dMood("allmessages");
              setRefreshMessages((prev) => !prev);
            }}
            className="text-slate-400 hover:text-white text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
