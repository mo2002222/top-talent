// src/components/FollowButton.jsx
import { useState, useEffect } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const FollowButton = ({
  isFollowing,
  setIsFollowing,
  userId,
  currentUserId,
  setFollowersCount,
}) => {
  // const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`);
        const data = await res.json();
        setIsFollowing(data.followers.includes(currentUserId));
      } catch (err) {
        console.error(err);
      }
    };
    fetchFollowStatus();
  }, [userId, currentUserId]);

  const handleFollow = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/follow/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      setIsFollowing((prev) => !prev);
      if (!res.ok) {
        setIsFollowing((prev) => prev); // revert state on error
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const data = await res.json();
      // setRefreshFloNum(prev => !prev);
    } catch (err) {
      setIsFollowing((prev) => prev); // revert state on error
      console.error(err);
    }
    setLoading(false);
    if (isFollowing) {
      setFollowersCount((prev) => prev - 1);
    } else {
      setFollowersCount((prev) => prev + 1);
    }
  };

  if (userId === currentUserId) return null; // Don't show button for self

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`ml-2 px-1 py-[2px] rounded ${
        isFollowing
          ? "bg-gray-300 text-gray-800"
          : "bg-blue-500 text-white md:text-sm text-xs"
      } hover:opacity-80 transition`}
    >
      {/* {isFollowed || !isFollowing ? "Following" : loading ? "..." : !isFollowing || !isFollowed ? "Follow" : "Following"} */}
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowButton;
