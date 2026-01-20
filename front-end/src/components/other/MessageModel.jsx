import React, { useState } from "react";
import socket from "../../socket";
import axios from "axios";

const MessageModal = ({
  isOpen,
  onClose,
  receiverId,
  senderId,
  recieverMessage,
}) => {
  const [content, setContent] = useState("");

  const handleSend = async () => {
    if (!content) return;

    // Send to backend database
    await axios.post("/api/messages", {
      senderId,
      receiverId,
      content,
    });

    // Send via WebSocket
    socket.emit("sendMessage", {
      senderId,
      receiverId,
      content,
    });

    setContent("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-blue-600 p-6 rounded-xl w-96">
        <h2 className="text-2xl font-bold mb-4">Message {recieverMessage}</h2>
        <textarea
          className="w-full border p-2 rounded mb-4 text-white bg-blue-600 outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your message..."
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
