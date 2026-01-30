import "@fontsource/fira-sans";
import Register from "./components/loginAndregister/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/loginAndregister/Login";
import Home from "./components/Home/Home";
import RecomendedUs from "./components/Recomended/RecomendedUs";
import RecomendedUsers from "./components/Recomended/RecomendedUsers";
import SinglePost from "./components/singlePost/SinglePost";
import TopRated from "./components/TopRated/TopRated";
import SavedPosts from "./components/savedPosts/SavedPosts";
import MostLiked from "./components/mostLiked&viewed/MostLiked";
import MostViews from "./components/mostLiked&viewed/MostViews";
import AdminPage from "./components/admin/AdminPage";
import Profile from "./components/userprofile/Profile";
import { useEffect, useContext, useState } from "react";
import socket from "./socket";
import useNotificationStore from "./components/zustand"; // Import the Zustand store
import UserContext from "./components/authContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Zoom } from "react-toastify";
import ChatingCir from "./components/other/ChatingCir";
import { useSpring } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import Messenger from "./components/other/Messenger";
import ReportContent from "./components/report/report";
import DMCA from "./components/report/DMCA";
import History from "./components/other/History";
function App() {
  const { user } = useContext(UserContext);
  const [isChatCirOpen, setIsChatCirOpen] = useState(false);

  const setOnlineUsers = useNotificationStore((state) => state.setOnlineUsers);
  const notifications = useNotificationStore((state) => state.notifications);
  const setNotifications = useNotificationStore(
    (state) => state.setNotifications,
  );
  const setHasUnreadMessages = useNotificationStore(
    (state) => state.setHasUnreadMessages,
  );
  const setNewMessagesArr = useNotificationStore(
    (state) => state.setNewMessagesArr,
  );
  
  useEffect(() => {
  if (user) {
    socket.emit("addUser", user._id);
  }

  socket.on("getUsers", (users) => {
    setOnlineUsers(users);
  });

  socket.on("recive-notification", (data) => {
    if (data.senderId === user?._id) return;

    if (data.type === "message") {
      setHasUnreadMessages(true);
    }

    toast.info(data.content);
    setNotifications(data);
  });

  return () => {
    socket.off("getUsers");
    socket.off("recive-notification");
  };
}, [user?._id]);


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/RecomendedUs" element={<RecomendedUs />} />
          <Route path="/RecomendedUsers" element={<RecomendedUsers />} />
          <Route path="/posts/:postid" element={<SinglePost />} />
          <Route path="/user-posts" element={<Profile />} />
          <Route path="/posts/hightest-rated" element={<TopRated />} />
          <Route path="/saved-posts" element={<SavedPosts />} />
          <Route path="/posts/most-liked" element={<MostLiked />} />
          <Route path="/history" element={<History />} />
          <Route path="/posts/most-views" element={<MostViews />} />
          <Route path="/admin-page" element={<AdminPage />} />
          <Route path="/dmca" element={<DMCA />} />
          {/* <Route path="/report/:postid" element={<ReportContent/>}/> */}
        </Routes>
      </Router>
      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar={true}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        transition={Zoom}
      />
      <div
        className="fixed right-2 z-50 bottom-1  "
        onClick={() => {
          setIsChatCirOpen(!isChatCirOpen);
          setHasUnreadMessages(false);
        }}
      >
        <ChatingCir />
      </div>
      <AnimatePresence>
        {isChatCirOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black backdrop-blur-sm flex justify-center items-center z-50"
          >
            <Messenger
              isOpen={isChatCirOpen}
              onClose={() => setIsChatCirOpen(false)}
              username={user.username}
              userId={user._id}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
