import {
  faHome,
  faFire,
  faBookmark,
  faStar,
  faChartSimple,
  faThumbsUp,
  faGear,
  faRightFromBracket,
  faUser,
  faMessage,
  faHistory
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useContext, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SettingsPopup from "../setting/SettingPopUp";
import UserContext from "../authContext";
import Messenger from "../other/Messenger";
import { AnimatePresence, motion } from "framer-motion";
import useNotificationStore from "../zustand";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Sidebar = ({ username }) => {
  const { user } = useContext(UserContext);
  const [isLoginOut, setIsLoginOut] = useState(false);
  const [activeSide, setIsActiveSide] = useState("");
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const setIsActiveId = useNotificationStore((state) => state.setActiveId);

  const hasUnreadMessages = useNotificationStore((state) => state.hasUnreadMessages);
  const setHasUnreadMessages = useNotificationStore((state) => state.setHasUnreadMessages);

  useEffect(() => {
    const path = location.pathname;
    setIsActiveSide(path === "/" ? "Home" : path.split("/").pop());
  }, [location.pathname]);

  const menuItems = [
    { icon: faHome, label: "Home", to: "/" , key: "Home" },
    { icon: faUser, label: "My Posts", to: "/user-posts", key: "user-posts" },
    { icon: faFire, label: "Recommended (Users)", to: "/RecomendedUsers", key: "RecomendedUsers", note: "from users" },
    { icon: faFire, label: "Recommended (Us)", to: "/RecomendedUs", key: "RecomendedUs", note: "from us" },
    { icon: faStar, label: "Highest Rated", to: "/posts/hightest-rated", key: "hightest-rated" },
    { icon: faChartSimple, label: "Most Viewed", to: "/posts/most-views", key: "most-views" },
    { icon: faThumbsUp, label: "Most Liked", to: "/posts/most-liked", key: "most-liked" },
    { icon: faBookmark, label: "Saved", to: "/saved-posts", key: "saved-posts" },
    { icon: faHistory, label: "History", to: "/history", key: "history" },
  ];

  const logoutHandler = async () => {
    setIsLoginOut(true);
    try {
      const res = await fetch(`${BACKEND_URL}/log-out-user`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // small delay to show state
        setTimeout(() => navigate("/login"), 900);
      } else {
        console.error("Logout failed");
        setIsLoginOut(false);
      }
    } catch (err) {
      console.error("Logout error:", err);
      setIsLoginOut(false);
    }
  };
  // console.log(user._id);
  

  return (
  <div className="h-full ">
    <aside
      className="
        h-[calc(100vh-70px)] 
        bg-[#0b0b0b] border-r border-gray-800 text-gray-300
        sticky top-[70px] 
        overflow-y-auto hover:overflow-y-auto 
        scrollbar-hide 
        no-scrollbar
        mt-5
        lg:mt-0
        transition-all duration-300
        w-16 lg:w-[240px]   /* ✅ Only icons on md & below, full width on lg+ */
      "
    >
      <div className="flex flex-col h-full p-3 ps-1">
        
        {/* ✅ User info - hide on md and below */}
        <div className="mb-4 px-2 pt-0 hidden lg:block">
          <p className="text-xs text-gray-400 mb-1">Signed in as</p>
          <p className="text-white font-semibold truncate">{username}</p>
        </div>

        {/* ✅ Nav items */}
        <nav className="flex flex-col lg:gap-[13px] gap-[25px] flex-1">
          {menuItems.map((item) => {
            const active = activeSide === item.key || location.pathname === item.to;
            return (
              <Link
                key={item.key}
                to={item.to}
                onClick={() => setIsActiveSide(item.key)}
                className={`
                  flex items-center px-[8px] py-[6px] rounded-xl text-sm transition-colors duration-200
                  ${active ? "bg-blue-600 text-white shadow-md" : "hover:bg-gray-800 hover:text-white"}
                  justify-center lg:justify-start gap-0 lg:gap-3  /* ✅ Center icon if no text */
                `}
              >
                {/* Icon always visible */}
                <FontAwesomeIcon icon={item.icon} className="text-base" />

                {/* ✅ Label visible only on large screens */}
                <div className="hidden lg:flex flex-1 flex-col text-left">
                  <div className="leading-tight whitespace-nowrap">{item.label}</div>
                  {item.note && (
                    <small className="text-xs text-gray-400 ">
                      {item.note}
                    </small>
                  )}
                </div>
              </Link>
            );
          })}

          {/* ✅ Messages */}
          <div
            onClick={() => {
              setIsMessengerOpen(true);
              setHasUnreadMessages(false);
              setIsActiveId('sidebar');
            }}
            className="
              flex items-center gap-3 px-[10px] py-[6px] rounded-xl text-sm cursor-pointer
              transition-colors duration-200 hover:bg-gray-800 hover:text-white
              justify-center lg:justify-start
            "
          >
            <FontAwesomeIcon icon={faMessage} />
            <div className="hidden lg:flex flex-1 text-left">Messages</div>
            {hasUnreadMessages && <span className="ml-auto bg-red-500 w-3 h-3 rounded-full animate-pulse" />}
          </div>

          {/* ✅ Settings */}
          <div
            onClick={() => {
              setIsSettingOpen(true);
              setIsActiveId('sidebar');
            }}
            className="
              flex items-center gap-3 px-[10px] py-[6px] rounded-xl text-sm cursor-pointer
              transition-colors duration-200 hover:bg-gray-800 hover:text-white 
              justify-center lg:justify-start
            "
          >
            <FontAwesomeIcon icon={faGear} />
            <div className="hidden lg:flex flex-1 text-left">Settings</div>
          </div>

          {/* ✅ Logout */}
          <div
            onClick={logoutHandler}
            className="
              flex items-center gap-3 px-[10px] py-[6px] rounded-xl text-sm cursor-pointer
              transition-colors duration-200 hover:bg-red-600 hover:text-white 
              justify-center lg:justify-start
            "
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <div className="hidden lg:flex flex-1 text-left">
              {isLoginOut ? "Logging out..." : "Log out"}
            </div>
          </div>
        </nav>

        {/* ✅ Footer only on lg+ */}
        <div className="mt-auto pt-5 text-center text-xs text-gray-500 border-t border-gray-800 hidden lg:block">
          © {new Date().getFullYear()} TalentClub
        </div>
      </div>
    </aside>

    {/* ✅ Settings popup */}
    {isSettingOpen && (
      <SettingsPopup
        isOpen={isSettingOpen}
        onClose={() => setIsSettingOpen(false)}
        username={username}
      />
    )}

    {/* ✅ Messenger modal */}
    <AnimatePresence>
      {isMessengerOpen && (
        <motion.div
          initial={{ opacity: 0}}
          animate={{ opacity: 1}}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
        >
          <Messenger
            isOpen={isMessengerOpen}
            onClose={() => setIsMessengerOpen(false)}
            username={username}
            userId={user?._id}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);


};

export default Sidebar;
