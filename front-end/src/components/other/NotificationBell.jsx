import { useContext, useState } from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faBell } from '@fortawesome/free-solid-svg-icons';
import useNotificationStore from "../zustand";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Messenger from "./Messenger";
import UserContext from "../authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const NotificationBell = ({ isOpen, setIsOpen }) => {
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const clearNotifications = useNotificationStore(
    (state) => state.clearNotifications,
  );
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const { user } = useContext(UserContext);

  const handleClear = (e) => {
    e.stopPropagation();
    clearNotifications(); // Clear all notifications from the store
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72
                     bg-[#022f52]/90 backdrop-blur-xl
                     border border-blue-900/40
                     rounded-2xl shadow-2xl z-50"
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-900/40">
            <p className="text-sm font-semibold text-gray-200">Notifications</p>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white transition"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* LIST */}
          <div className="max-h-72 overflow-y-auto scrollbar-hide">
            {notifications.length > 0 ? (
              notifications.map((notif, index) => {
                const icon =
                  notif.type === "message"
                    ? "📩"
                    : notif.type === "like"
                      ? "❤️"
                      : "💬";

                const Row = (
                  <div
                    className="flex items-start gap-3 px-4 py-3
                               text-sm text-gray-200
                               hover:bg-[#064371]/70
                               transition cursor-pointer"
                  >
                    <span className="text-base mt-0.5">{icon}</span>
                    <p className="leading-snug">{notif.content}</p>
                  </div>
                );

                return notif.type !== "message" ? (
                  <Link
                    key={index}
                    to={`/posts/${notif.postId}`}
                    className="block"
                  >
                    {Row}
                  </Link>
                ) : (
                  <div
                    key={index}
                    onClick={() => {
                      setIsMessengerOpen(true);
                    }}
                  >
                    {Row}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No notifications yet
              </div>
            )}
          </div>

          {/* FOOTER */}
          <button
            onClick={handleClear}
            className="w-full py-3 text-sm font-medium
                       text-blue-300
                       hover:bg-[#064371]/70
                       transition rounded-b-2xl"
          >
            Clear all notifications
          </button>

          {/* MESSENGER */}
          <AnimatePresence>
            {isMessengerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Messenger
                  isOpen={isMessengerOpen}
                  onClose={() => setIsMessengerOpen(false)}
                  username={user?.username}
                  userId={user?._id}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
