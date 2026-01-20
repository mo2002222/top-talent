import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import FollowButton from "../other/FollowButton";
import UserContext from "../authContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProfilePopup = ({
  isopen,
  userId,
  onClose,
  isFollowing,
  setIsFollowing,
  showFollowButton,
}) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { profileImage, username, followers, country } = profileData || {};
  const [followersCount, setFollowersCount] = useState(followers);

  const { user } = useContext(UserContext);

  useEffect(() => {
    handleUserClick(userId);
  }, [userId]);

  // const { profileImage, username, followers, country } = userData;
  const handleUserClick = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}`);
      const data = await res.json();
      setProfileData(data);
      setFollowersCount(data.followers);
      console.log(data);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
      return;
    }
  };

  if (!isopen) return null;

  if (!profileData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-lg p-6 w-80"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <img
            src={profileImage || "/default-avatar.png"}
            alt={username}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
          />
          <h2 className="text-lg font-semibold">{username}</h2>
          <p className="text-sm text-gray-500">{country || "Unknown"}</p>
          <div className="flex items-center space-x-2 pb-3">
            <p className="text-sm text-gray-400">
              Followers: <span className="font-medium">{followersCount}</span>
            </p>
            {!showFollowButton && user._id !== userId && (
              <FollowButton
                setFollowersCount={setFollowersCount}
                isFollowing={isFollowing}
                setIsFollowing={setIsFollowing}
                userId={userId}
                currentUserId={user._id}
              />
            )}
          </div>
          <button
            onClick={onClose}
            className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePopup;
