import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Inbox from "./Inbox";
import useNotificationStore from "../zustand";
import { TimeAgo } from "./timeAgo";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Messenger = ({ isOpen, onClose, username, userId }) => {
  const [viewMode, setViewMode] = useState("allmessages");
  const [allMessages, setAllMessages] = useState([]);
  const [senderId, setSenderId] = useState(userId);
  const [receiverId, setReceiverId] = useState(null);
  const [refreshMessages, setRefreshMessages] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const setHasUnreadMessages = useNotificationStore(
    (state) => state.setHasUnreadMessages,
  );
  const newMessagesArr = useNotificationStore((state) => state.newMessagesArr);
  const removeIDNewMessageArr = useNotificationStore(
    (state) => state.removeIDNewMessageArr,
  );
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  const getMessages = async () => {
    if (!userId) return; // 👈 prevents /undefined

    try {
      setFetchingMessages(true);
      const res = await fetch(`${BACKEND_URL}/${userId}`);
      const data = await res.json();
      setAllMessages(data);
      res.ok && setFetchingMessages(false);
    } catch (error) {
      setFetchingMessages(false);
      console.error("Failed to fetch messages:", error);
    }
  };

  useEffect(() => {
    if (isOpen) getMessages();
  }, [isOpen, refreshMessages, userId, newMessagesArr]);

  useEffect(() => {
    setHasUnreadMessages(false);
  }, [setHasUnreadMessages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md px-2">
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl
                   bg-slate-900/90 text-white border border-slate-700 shadow-2xl h-"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold tracking-wide">Messages</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* ALL MESSAGES VIEW */}
        {viewMode === "allmessages" && (
          <div className="p-4 flex flex-col h-full">
            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search conversations…"
              className="mb-4 w-full rounded-full bg-slate-800 border border-slate-600
                         px-4 py-2 text-sm text-white placeholder-slate-400
                         outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                if (value) {
                  setAllMessages(
                    allMessages.filter((msg) =>
                      msg.otherUser.username.toLowerCase().includes(value),
                    ),
                  );
                } else {
                  getMessages();
                }
              }}
            />

            {/* LIST */}
            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
              {fetchingMessages ? (
                <div className="flex justify-center mt-6">
                  <div className="w-3/4 bg-slate-800 rounded-xl p-4 animate-pulse space-y-3">
                    <div className="h-12 bg-slate-700 rounded" />
                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ) : allMessages.length > 0 ? (
                allMessages.map((val, index) => {
                  const isUnread = newMessagesArr.includes(val.otherUser._id);

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (isUnread) removeIDNewMessageArr(val.otherUser._id);
                        setIsInboxOpen(true);
                        setViewMode("singlemessage");
                        setReceiverId(
                          val.receiverId === userId
                            ? val.senderId
                            : val.receiverId,
                        );
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer
                        transition ${
                          isUnread ? "bg-blue-600/20" : "hover:bg-slate-800"
                        }`}
                    >
                      {/* Avatar */}
                      <img
                        src={val.otherUser.avatar}
                        alt="User"
                        className="w-10 h-10 rounded-full border border-slate-600 object-cover"
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm flex items-center gap-2">
                            {val.otherUser.username}
                            <span className="text-xs bg-slate-700 px-2 py-[1px] rounded-full">
                              {val.otherUser.role}
                            </span>
                          </p>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">
                              {TimeAgo(val.createdAt)}
                            </span>
                            {isUnread && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>

                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "text-white font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          {val.content.length > 40
                            ? `${val.content.slice(0, 40)}…`
                            : val.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-center mt-10">
                  No conversations yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* SINGLE MESSAGE VIEW */}
        <AnimatePresence>
          {viewMode === "singlemessage" && senderId && receiverId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="fixed inset-0 z-[120] flex items-center justify-center"
            >
              <Inbox
                isOpen={isInboxOpen}
                onColse={() => setIsInboxOpen(false)}
                dMood={setViewMode}
                callPlace="messenger"
                senderId={senderId}
                receiverId={receiverId}
                setRefreshMessages={setRefreshMessages}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Messenger;
