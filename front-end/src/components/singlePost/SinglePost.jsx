import { useEffect, useState, useContext, useRef } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UserContext from "../authContext";
import ShareModal from "./ShareModel";
import FollowButton from "../other/FollowButton";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

import {
  faThumbsUp,
  faThumbsDown,
  faStar,
  faChartSimple,
  faInfoCircle,
  faComment,
  faPaperPlane,
  faBookmark,
  faShare,
  faEllipsisVertical,
  faEye,
  faMessage,
  faHome,
  faXmark,
  faEdit,
  faTrash,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import EditPost from "./EditPost";
import EditComment from "./EditComment";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import Inbox from "../other/Inbox";
import socket from "../../socket";
import { motion, AnimatePresence } from "framer-motion";
import { TimeAgo } from "../other/timeAgo";
import PlayerInfoPopup from "../other/PlayerInfoPopup";
import ProfilePopup from "../other/ProfilePopup";
import DeleteCommentPopup from "../other/DeletCommentpopup";
import ReportContent from "../report/report";
import { toast } from "react-toastify";

const SinglePost = () => {
  const { postid } = useParams();
  const [numberOfPostLikes, setNumberOfPostLikes] = useState(0);
  const [numberOfPostDisLikes, setNumberOfPostDisLikes] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [post, setPost] = useState();
  const [postId, setPostId] = useState();
  const [userId, setUserId] = useState();
  const [comments, setComments] = useState([]);
  const [refreshComments, setRefreshComments] = useState(false);
  const { user, loading } = useContext(UserContext);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisLike, setIsDisLike] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});
  const [commentDisLikes, setCommentDisLikes] = useState({});
  const [isRecomended, setIsRecomended] = useState();
  const [numOfRecomends, setNumOfRecomends] = useState();
  const [evaluateVal, setEvaluateVal] = useState();
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [postAuther, setPostAuther] = useState();
  const [views, setViews] = useState(0);
  const [openEditPost, setOpenEditPost] = useState(false);
  const [openEditComment, setOpenEditComment] = useState(false);
  const [refreshPost, setRefreshPost] = useState(false);
  const [refreshCmtEdit, setRefreshCmtEdit] = useState(false);
  const [isCreatedByUser, setIsCreatedByUser] = useState(false);
  const [commentContent, setCommentContent] = useState();
  const [commentId, setCommentId] = useState();
  const [videos, setVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [currentVideo, setCurrentVideo] = useState();
  const [currentImage, setCurrentImage] = useState();
  const [isImgPopupOpen, setIsImgPopupOpen] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [fetchRelated, setFetchRelated] = useState(false);
  const navigate = useNavigate();
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [userIdToShow, setUserIdToShow] = useState(null);
  const [commentIdToDelete, setCommentIdToDelete] = useState(null);
  const [openDeleteComment, setOpenDeleteComment] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const likedSoundRef = useRef(
    new Audio("/sounds/dislike (online-audio-converter.com).mp3"),
  );
  const dislikedSoundRef = useRef(
    new Audio("/sounds/dislike (online-audio-converter.com).mp3"),
  );
  const recomendSoundRef = useRef(
    new Audio("/sounds/rating (online-audio-converter.com).mp3"),
  );

  const shuffleArray = () => {
    if (allPosts && setAllPosts) {
      const shuffled = [...allPosts].sort(() => Math.random() - 0.5);
      setAllPosts(shuffled);
    }
  };

  // All your existing useEffects and handler functions remain exactly the same
  //get related post based on id
  useEffect(() => {
    const fetchinPost = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/send-post/${postid}`,
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        if (data.post) {
          setPostId(data.post._id);
          setComments(data.post.comments || []);
          setPost(data.post);
          setPostAuther(data.auther);
          setIsFollowed(data.auther.followers.includes(user?._id));
          setViews(data.views);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    fetchinPost();
    shuffleArray();
  }, [postid, refreshPost]);

  //fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get-posts`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setAllPosts(data.allPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);
  //get comments from db
  useEffect(() => {
    const fetchingComments = async () => {
      if (!postId) return;
      setCommentsLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/get-comments/${postId}`,
        );
        if (!response.ok) {
          setCommentsLoading(false);
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setComments(data || []);
        console.log(data);

        setCommentsLoading(false);
      } catch (error) {
        setCommentsLoading(false);
        console.log("error while getting comments", error);
      }
    };
    fetchingComments();
  }, [postId, refreshComments, refreshCmtEdit]);

  //show and hide comments
  useEffect(() => {
    if (!isExpanded) return;

    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;

      if (bottom && visibleCount < comments.length) {
        setVisibleCount((prev) => Math.min(prev + 5, comments.length));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isExpanded, visibleCount, comments.length]);

  //set user id
  useEffect(() => {
    if (!loading && user) {
      setUserId(user._id);
    }
  }, [loading, user]);

  //set like and dislike for colors
  useEffect(() => {
    if (post) {
      setIsLiked(post.likes.includes(userId));
      setIsDisLike(post.disLikes.includes(userId));
      setNumberOfPostLikes(post.likes.length);
      setNumberOfPostDisLikes(post.disLikes.length);
      setIsRecomended(post.Recomends.includes(userId));
      setNumOfRecomends(post.Recomends.length);
      setIsSaved(user?.saved?.includes(postId));
      setIsCreatedByUser(user?._id === postAuther._id);
      post.evaluates.forEach((val) => {
        if (val.userId === userId) {
          setEvaluateVal(val.evaluate);
        }
      });
    }
  }, [post, userId, postId, user]);

  // increas views
  useEffect(() => {
    const viewedKey = `viewed_${postid}`;
    const lastViewed = localStorage.getItem(viewedKey);

    if (!lastViewed || Date.now() - parseInt(lastViewed) > 30 * 60 * 1000) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(
            `${BACKEND_URL}/posts/${postid}/${userId}/view`,
            {
              method: "POST",
            },
          );
          const data = await res.json();
          console.log(data);
          setViews(data.views);
          localStorage.setItem(viewedKey, Date.now().toString());
        } catch (err) {
          console.log("Error recording view:", err);
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [postid, userId]);

  //get post urls
  useEffect(() => {
    const fetchVideos = async () => {
      setFetchRelated(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/get-urls/${postid}`,
        );
        if (!response.ok) {
          setFetchRelated(false);
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setVideos(
          data.filter((item) =>
            ["mp4", "webm", "mov"].includes(
              item.split(".").pop().toLowerCase(),
            ),
          ),
        );
        setImages(
          data.filter((item) =>
            ["jpg", "jpeg", "png", "gif", "webp"].includes(
              item.split(".").pop().toLowerCase(),
            ),
          ),
        );
        setFetchRelated(false);
      } catch (error) {
        setFetchRelated(false);
        console.log("error", error);
      }
    };
    fetchVideos();
  }, [postid]);

  //add watching video to history
  useEffect(() => {
    const addToHistory = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/history/add/${userId}/${postId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to add to history");
        }
      } catch (error) {
        console.log("Error adding to history:", error);
      }
    };
    addToHistory();
  }, [postId, userId]);

  if (loading || !post) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-3">
        <div className="w-full max-w-4xl bg-gray-800 rounded-xl shadow-2xl p-6 animate-pulse flex flex-col space-y-4">
          <div className="h-96 bg-gray-700 rounded-xl"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="h-20 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
        {videos.length > 0 && (
          <video
            src={videos[0]}
            controls
            className="w-full max-w-4xl h-auto object-cover rounded-xl shadow-lg mb-6"
          />
        )}
        <p className="mt-2 text-xl text-red-400 font-semibold">
          Please login or register to interact and see more content 👤
        </p>
        <div className="flex gap-4 justify-center items-center mt-4">
          <Link
            to={"/login"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition duration-300"
          >
            Login
          </Link>
          <p className="text-gray-400">or</p>
          <Link
            to={"/register"}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition duration-300"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // All your existing handler functions remain exactly the same
  //add comment to db
  const handleAddComment = async () => {
    if (
      !commentText.trim() ||
      commentText.trim() === "" ||
      commentText.length > 1000
    ) {
      return;
    }

    if (postAuther._id !== userId) {
      socket.emit("sendNotification-comment", {
        senderId: userId,
        receiverId: postAuther._id,
        postId: postId,
      });
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/add-comment/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: userId,
            text: commentText,
          }),
        },
      );
      const data = await response.json();
      setRefreshComments(!refreshComments);
      setCommentText("");
    } catch (error) {
      console.log("error while fetching to add comment", error);
    }
  };

  //add like to db
  const handleAddLike = async () => {
    setIsLiked(!isLiked);
    setIsDisLike(false);
    setNumberOfPostLikes((prev) => prev + (isLiked ? -1 : 1));
    setNumberOfPostDisLikes((prev) => prev - (isDisLike ? 1 : 0));
    likedSoundRef.current.currentTime = 0;
    likedSoundRef.current.play();

    if (!isLiked) {
      socket.emit("sendNotification-like", {
        senderId: userId,
        receiverId: postAuther._id,
        postId: postId,
      });
    }

    try {
      const response = await fetch(`${BACKEND_URL}/add-like/${postId}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        setIsLiked(!isLiked);
        setNumberOfPostLikes((prev) => prev - (isLiked ? 1 : 0));
        setNumberOfPostDisLikes((prev) => prev + (isDisLike ? 1 : 0));
        throw new Error("Faild to add like .. response was not ok");
      }
    } catch (error) {
      setIsLiked(!isLiked);
      setNumberOfPostLikes((prev) => prev - (isLiked ? 1 : 0));
      setNumberOfPostDisLikes((prev) => prev + (isDisLike ? 1 : 0));
      console.log("error catched while add like", error);
    }
  };

  //add dislike to db
  const handleAddDisLike = async () => {
    setIsDisLike(!isDisLike);
    setIsLiked(false);
    setNumberOfPostDisLikes((prev) => prev + (isDisLike ? -1 : 1));
    setNumberOfPostLikes((prev) => prev - (isLiked ? 1 : 0));
    dislikedSoundRef.current.currentTime = 0;
    dislikedSoundRef.current.play();
    try {
      const response = await fetch(
        `${BACKEND_URL}/add-dislike/${postId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );

      if (!response.ok) {
        setIsDisLike(!isDisLike);
        setNumberOfPostDisLikes((prev) => prev - (isDisLike ? 1 : 0));
        setNumberOfPostLikes((prev) => prev + (isLiked ? 1 : 0));
        throw new Error("Faild to add dislike .. response was not ok");
      }
      const data = await response.json();
    } catch (error) {
      setIsDisLike(!isDisLike);
      setNumberOfPostDisLikes((prev) => prev - (isDisLike ? 1 : 0));
      setNumberOfPostLikes((prev) => prev + (isLiked ? 1 : 0));
      console.log("error catched while add dislike", error);
    }
  };

  //add like to comment
  const handlAddLikeComment = async (val) => {
    likedSoundRef.current.currentTime = 0;
    likedSoundRef.current.play();
    const commentId = val._id;

    if (!val.likes.includes(userId) && !commentLikes[val._id]) {
      if (commentDisLikes[val._id] || val.disLikes.includes(userId)) {
        setCommentDisLikes((prev) => ({ ...prev, [val._id]: false }));
        setIsDisLike(false);
        val.disLikes.length--;
      }
      setCommentLikes((prev) => ({ ...prev, [val._id]: true }));
      val.likes.length++;
    } else {
      setCommentLikes((prev) => ({ ...prev, [val._id]: false }));
      val.likes.length--;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/add-like-to-comment/${postId}/${commentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );
      if (!response.ok) {
        if (val.likes.includes(userId) && commentLikes[val._id]) {
          setCommentLikes((prev) => ({ ...prev, [val._id]: false }));
          val.likes.length--;
        }
        throw new Error("Faild to add like to comment .. response was not ok");
      }
      const data = await response.json();
    } catch (error) {
      console.log("error catched while add like comment", error);
    }
  };

  //add dislike to comment
  const handleDislikeComment = async (val) => {
    likedSoundRef.current.currentTime = 0;
    likedSoundRef.current.play();
    setCommentDisLikes((prev) => ({ ...prev, [val._id]: true }));
    setCommentLikes((prev) => ({ ...prev, [val._id]: false }));
    if (!val.disLikes.includes(userId) && !commentDisLikes[val._id]) {
      if (val.likes.includes(userId) || commentLikes[val._id]) {
        setCommentLikes((prev) => ({ ...prev, [val._id]: false }));
        setIsLiked(false);
        val.likes.length--;
      }
      setCommentDisLikes((prev) => ({ ...prev, [val._id]: true }));
      val.disLikes.length++;
    } else {
      setCommentDisLikes((prev) => ({ ...prev, [val._id]: false }));
      val.disLikes.length--;
    }
    const commentId = val._id;
    try {
      const response = await fetch(
        `${BACKEND_URL}/add-dislike-to-comment/${postId}/${commentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );
      if (!response.ok) {
        setCommentDisLikes((prev) => ({ ...prev, [val._id]: false }));
        setCommentLikes((prev) => ({ ...prev, [val._id]: true }));
        val.disLikes.length--;
        val.likes.length++;
        throw new Error(
          "Faild to add dislike to comment .. response was not ok",
        );
      }
      const data = await response.json();
    } catch (error) {
      console.log("error catched while add dislike comment&&&&&&", error);
    }
  };

  //handle recomend post
  const handleRecomend = async () => {
    recomendSoundRef.current.currentTime = 0;
    recomendSoundRef.current.play();
    setIsRecomended(!isRecomended);
    isRecomended && numOfRecomends > 0
      ? setNumOfRecomends((prev) => prev - 1)
      : setNumOfRecomends((prev) => prev + 1);
    try {
      const response = await fetch(
        `${BACKEND_URL}/add-recomend/${postId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );
      if (!response.ok) {
        setIsRecomended(!isRecomended);
        isRecomended && numOfRecomends > 0
          ? setNumOfRecomends((prev) => prev + 1)
          : setNumOfRecomends((prev) => prev - 1);
        throw new Error("Faild to add recomend .. response was not ok");
      }
    } catch (error) {
      setIsRecomended(!isRecomended);
      isRecomended && numOfRecomends > 0
        ? setNumOfRecomends((prev) => prev + 1)
        : setNumOfRecomends((prev) => prev - 1);
      recomendSoundRef.current.currentTime = 0;
      console.log("error catched while add recomend", error);
    }
  };

  //add evaluate
  const handleEvaluate = async (e) => {
    const value = e.target.value;
    setEvaluateVal(value === "no-evaluation" ? null : value);
    try {
      const response = await fetch(
        `${BACKEND_URL}/add-evaluate/${postId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, evaluate: value }),
        },
      );
      const data = await response.json();
    } catch (error) {
      console.log("error catched while add evaluate", error);
    }
  };

  //save handeling
  const handleSave = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/save-post/${postId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );
      const data = await response.json();
      setIsSaved(!isSaved);
    } catch (error) {
      console.log("error catched while add save", error);
    }
  };

  // show popup contain when click this image
  const handleToggelImages = (e) => {
    setCurrentImage(e.target.currentSrc);
    setIsImgPopupOpen(true);
  };

  // handle video toggle
  const handleToggelVideosIcon = (e) => {
    e.stopPropagation();
    const videoElement = e.target
      .closest(".video-thumbnail")
      ?.querySelector("video");
    const imageElement = e.target
      .closest(".video-thumbnail")
      ?.querySelector("img");

    if (videoElement) {
      setCurrentVideo(videoElement.src);
    } else if (imageElement) {
      const sourceElement = e.target
        .closest(".video-thumbnail")
        ?.querySelector("source");
      if (sourceElement && sourceElement.src) {
        setCurrentVideo(sourceElement.src);
      } else {
        !e.target.parentElement.parentElement.parentElement.childNodes[0].src
          ? setCurrentVideo(e.target.parentElement.childNodes[0].src)
          : setCurrentVideo(
              e.target.parentElement.parentElement.parentElement.childNodes[0]
                .src,
            );
      }
    }
  };

  const handleDeletePost = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/delete-post/${postId}/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      // Redirect or update UI after successful deletion
      toast.success("post deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      response.ok &&
        setTimeout(() => {
          navigate("/");
        }, 3000);
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  };

  const postUrl = `http://localhost:5173/posts/${postId}`;
  const postTitle = `${post.title}`;
  const postDescription = `${post.description}`;
  const postThumbnail =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlh3wipCu-uObrCytr50Cejb19uT1q4TcRmw&s";

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-1 sm:p-2 p-1 lg:pe-0 lg:ps-1">
      <Helmet>
        <title>{postTitle}</title>
        <meta property="og:title" content={postTitle} />
        <meta property="og:description" content={postDescription} />
        <meta property="og:image" content={postThumbnail} />
        <meta property="og:url" content={postUrl} />
        <meta property="og:type" content="video.other" />
      </Helmet>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-3 max-w-8xl lg:h-screen">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 col-span-12 md:space-y-4 space-y-2 lg:overflow-y-auto no-scrollbar ">
          {/* Video Player */}
          <div className="w-full aspect-video bg-black rounded-xl shadow-2xl overflow-hidden  min-h-[40vh] max-h-[60vh] sm:max-h-full  sm:h-auto ">
            <video
              controls
              src={currentVideo || videos[0]}
              type="video/*"
              className="w-full h-full object-cover"
              poster={images.length > 0 ? images[0] : ""}
            ></video>
          </div>

          {/* Post Title and Description */}
          <div className=" pb-3 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h1 className="text-lg sm:text-2xl font-bold break-words mb-1">
                {post.title}
              </h1>
              <div className="flex sm:flex-row flex-col sm:space-y-0 space-y-1 items-center justify-center space-x-4 ">
                <button
                  onClick={() => setShowInfoPopup(true)}
                  className="flex items-center space-x-1 text-blue-200 hover:text-blue-300 transition duration-200 pb-1"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span className="text-xs">Info</span>
                </button>
                {/* creat report icon*/}
                <button
                  // to={`/report/${postId}`}
                  onClick={() => setShowReportPopup(true)}
                  className="flex items-center space-x-1 text-blue-200 hover:text-blue-300 transition duration-200 pb-1"
                >
                  <FontAwesomeIcon icon={faFlag} />
                  <span className="text-xs">report</span>
                </button>
              </div>
            </div>
            <p className="sm:tex-sm text-xs text-gray-400 break-words">
              {post.description}
            </p>
            <div className="flex items-center text-gray-500 text-sm mt-3">
              <FontAwesomeIcon icon={faEye} className="mr-1" />
              <span className="text-[12px] sm:text-sm">{views} views</span>
              <span className="mx-2">•</span>
              <span className="text-[12px] sm:text-sm">
                posted {TimeAgo(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Author and Interaction Buttons */}
          <div className="flex justify-between items-start [@media(min-width:1190px)]:flex-row flex-col [@media(min-width:1190px)]:space-y-0 space-y-2 [@media(min-width:1190px)]:items-center border-b border-gray-700 pb-3">
            {/* Author Profile */}
            <div className="flex items-start space-x-1">
              <button
                onClick={() => {
                  setUserIdToShow(postAuther._id);
                  setOpenProfile(true);
                }}
              >
                <img
                  className="rounded-full md:w-10 md:h-10 w-7 h-7 object-cover cursor-pointer"
                  src={
                    postAuther.avatar ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFf0GdyhsQWijW5afaTsbMt_k2WLsgLLyBdQ&s"
                  }
                  alt={`${postAuther.username}'s avatar`}
                />
              </button>
              <div className="">
                <button
                  onClick={() => {
                    setUserIdToShow(postAuther._id);
                    setOpenProfile(true);
                  }}
                  className="font-semibold hover:text-gray-300 ps-1"
                >
                  {postAuther.username}
                </button>
                <small className="block text-xs text-gray-500 ps-1">
                  {user.role}
                </small>
              </div>
              {userId !== postAuther._id && (
                <div className="flex justify-center items-start rounded-lg">
                  <button
                    className="ps-[2px] text-blue-400 hover:text-blue-300 transition duration-150"
                    onClick={() => setIsMessageOpen(true)}
                    aria-label="Send message"
                  >
                    <FontAwesomeIcon
                      icon={faMessage}
                      className="md:text-lg text-base"
                    />
                  </button>
                  <FollowButton
                    isFollowing={isFollowed}
                    setIsFollowing={setIsFollowed}
                    userId={postAuther._id}
                    currentUserId={user?._id}
                  />
                </div>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-baseline xl:space-x-3 lg:space-x-1 space-x-2 overflow-x-auto scroll-smooth snap-x snap-mandatory w-full lg:w-auto no-scrollbar">
              <div className="flex bg-gray-800 rounded-full divide-x divide-gray-700">
                <button
                  className={`flex items-center lg:px-4 px-3  py-2  text-xs font-medium rounded-l-full transition duration-200 ${
                    isLiked
                      ? "text-blue-500 hover:bg-gray-700"
                      : "text-white hover:bg-gray-700"
                  }`}
                  onClick={handleAddLike}
                >
                  <FontAwesomeIcon icon={faThumbsUp} className="mr-1" />
                  {numberOfPostLikes}
                </button>
                <button
                  className={`flex items-center lg:px-4 px-3  py-2  text-xs font-medium rounded-r-full transition duration-200 ${
                    isDisLike
                      ? "text-blue-500 hover:bg-gray-700"
                      : "text-white hover:bg-gray-700"
                  }`}
                  onClick={handleAddDisLike}
                >
                  <FontAwesomeIcon icon={faThumbsDown} />
                </button>
              </div>

              <button
                className={`flex items-center lg:px-4 px-3  py-2  text-xs font-medium rounded-full transition duration-200 ${
                  isSaved
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-800 hover:bg-gray-700"
                } text-white`}
                onClick={handleSave}
              >
                <FontAwesomeIcon icon={faBookmark} className="mr-2" />
                {isSaved ? "Saved" : "Save"}
              </button>

              <button
                className="flex items-center bg-gray-800 hover:bg-gray-700 text-white lg:px-4 px-3  py-2  text-xs font-medium rounded-full transition duration-200"
                onClick={() => setIsShareModalOpen(true)}
              >
                <FontAwesomeIcon icon={faShare} className="mr-2" />
                Share
              </button>

              <button
                className={`flex items-center whitespace-nowrap me-3 px-3  py-1.5  text-xs font-medium rounded-full transition duration-200 ${
                  isRecomended
                    ? "bg-yellow-600 hover:bg-yellow-700 text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
                onClick={handleRecomend}
              >
                <FontAwesomeIcon icon={faStar} className="mr-1" />
                Recommend ({numOfRecomends})
              </button>

              <div className="flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-gray-800 text-white border border-gray-700">
                <FontAwesomeIcon icon={faChartSimple} className="mr-1.5" />
                <select
                  className="bg-transparent outline-none text-white text-xs cursor-pointer"
                  onChange={handleEvaluate}
                  value={evaluateVal || "no-evaluation"}
                >
                  <option
                    className="text-gray-900"
                    value="no-evaluation"
                    disabled
                  >
                    {evaluateVal ? `Score: ${evaluateVal}` : "Evaluate (1-10)"}
                  </option>
                  {[...Array(11).keys()].map((i) => (
                    <option key={i} className="text-gray-900" value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              {/* EDIT POST BUTTON - Added here */}
              {isCreatedByUser && (
                <div className="flex gap-1 items-center">
                  <button
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white md:px-2 ms-1 sm:px-1 px-1 py-1 text-xs whitespace-nowrap rounded-md transition duration-200"
                    onClick={() => setOpenEditPost(true)}
                  >
                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    Edit Post
                  </button>
                  <button
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white md:px-2 ms-1 sm:px-1 px-1 py-1 text-xs whitespace-nowrap rounded-md transition duration-200"
                    onClick={handleDeletePost}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Delet Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div className="md:pt-2 pt-1">
            <h2 className="md:text-xl text-base font-bold md:mb-4 mb-2">
              Comments ({comments.length})
            </h2>

            {/* Add Comment Input */}
            <div className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg md:mb-6 mb-3">
              <img
                className="rounded-full md:w-8 md:h-8 w-6 h-6 object-cover flex-shrink-0"
                src={
                  user?.avatar ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFf0GdyhsQWijW5afaTsbMt_k2WLsgLLyBdQ&s"
                }
                alt="Your avatar"
              />
              <div className="flex-grow">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  maxLength={200}
                  className="w-full h-16 p-2 bg-gray-700 text-white rounded-lg resize-none placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition duration-200"
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {commentText.length}/200
                  </span>
                  <button
                    className={`lg:px-4 px-2 py-1.5 md:text-sm text-xs font-semibold rounded-full transition duration-200 ${
                      commentText.trim().length > 0
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleAddComment}
                    disabled={commentText.trim().length === 0}
                  >
                    <FontAwesomeIcon icon={faPaperPlane} className="mr-1.5" />
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {commentsLoading ? (
              <p className="text-gray-400 text-center">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {comments.slice(0, visibleCount).map((comment) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex space-x-3 md:p-3 p-1 hover:bg-gray-800 rounded-lg group"
                    >
                      <img
                        onClick={() => {
                          setUserIdToShow(comment.user._id);
                          setOpenProfile(true);
                        }}
                        className="rounded-full md:w-8 md:h-8 h-6 w-6 object-cover flex-shrink-0"
                        src={comment.profileImage}
                        alt={`${comment.username}'s avatar`}
                      />
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setUserIdToShow(comment.user._id);
                              setOpenProfile(true);
                            }}
                            className="mg:font-semibold font-medium hover:text-gray-300 md:text-sm text-xs"
                          >
                            {comment.username}
                          </button>
                          <span className="md:text-xs text-[11px] text-gray-500 mb-[1px]">
                            {TimeAgo(comment.createdAt)}
                          </span>
                          {/* EDIT COMMENT BUTTON - Added next to timestamp */}
                          {user?._id === comment.user._id && (
                            <div className="flex items-center">
                              <button
                                className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition duration-200 ml-2"
                                onClick={() => {
                                  setCommentContent(comment.text);
                                  setCommentId(comment._id);
                                  setOpenEditComment(true);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faEdit}
                                  className="md:text-xs text-[10px]"
                                />
                                <span className="md:text-xs text-[10px]">
                                  Edit
                                </span>
                              </button>
                              {/* creatin delet comment button */}
                              <button
                                onClick={() => {
                                  setCommentIdToDelete(comment._id);
                                  setOpenDeleteComment(true);
                                }}
                                className="flex items-center text-red-500 space-x-[2px] hover:text-red-400 transition duration-200 ml-2"
                              >
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className="md:text-xs text-[10px]"
                                />
                                <span
                                  className="md:text-xs text-[10px]"
                                  //   onClick={() => {
                                  //     setCommentId(comment._id);
                                  //     setOpenDeleteComment(true);
                                  //   }}
                                >
                                  Delete
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 md:text-sm text-xs break-words text-gray-100">
                          {comment.text}
                        </p>
                        {/* Comment Interactions */}
                        <div className="flex space-x-4 md:mt-2 mt-1 text-xs text-gray-400 items-center">
                          <div className="flex items-center space-x-1">
                            <button
                              className={`p-1 rounded-full hover:bg-gray-700 transition ${
                                comment.likes.includes(userId) ||
                                commentLikes[comment._id]
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }`}
                              onClick={() => handlAddLikeComment(comment)}
                            >
                              <FontAwesomeIcon icon={faThumbsUp} />
                            </button>
                            <span>{comment.likes.length}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              className={`p-1 rounded-full hover:bg-gray-700 transition ${
                                comment.disLikes.includes(userId) ||
                                commentDisLikes[comment._id]
                                  ? "text-blue-500"
                                  : "text-gray-400"
                              }`}
                              onClick={() => handleDislikeComment(comment)}
                            >
                              <FontAwesomeIcon icon={faThumbsDown} />
                            </button>
                            <span>{comment.disLikes.length}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {comments.length > 5 && (
                  <div className="text-center md:mt-4 mt-2">
                    {!isExpanded ? (
                      <button
                        className="md:px-4 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                        onClick={() => {
                          setVisibleCount(comments.length); // Show all
                          setIsExpanded(true);
                        }}
                      >
                        Show More Comments
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                        onClick={() => {
                          setVisibleCount(5); // Collapse back to 5
                          setIsExpanded(false);
                        }}
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center md:text-base text-sm md:py-4 py-2">
                No comments yet. Be the first!
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Related Content with Independent Scroll */}
        <div className="lg:col-span-4 col-span-12 lg:overflow-y-auto no-scrollbar ">
          <div className="sticky top-2">
            <h2 className="md:text-xl text-base font-bold mb-3">
              Related Content
            </h2>

            {/* Scrollable Related Content Area */}
            <div className="pr-2 space-y-1 overflow-y-auto no-scrollbar">
              {/* Video Thumbnails/Gallery */}
              {(videos.length > 0 || images.length > 0) && (
                <div className="md:p-3 p-2 bg-gray-800 rounded-xl shadow-lg">
                  <h3 className="md:text-xl text-base font-semibold mb-3">
                    Media Gallery
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {videos.map((url, index) => (
                      <div
                        key={`v-${index}`}
                        className="relative cursor-pointer video-thumbnail group"
                        onClick={() => setCurrentVideo(url)}
                      >
                        <video
                          src={url}
                          className="w-full lg:h-24 h-32 object-cover rounded-lg transition duration-300 group-hover:scale-[1.02]"
                          controls={false}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg group-hover:bg-opacity-10 transition">
                          <FontAwesomeIcon
                            icon={faPlay}
                            className="text-white text-3xl opacity-80 group-hover:opacity-100 transition"
                          />
                        </div>
                      </div>
                    ))}
                    {images.map((url, index) => (
                      <img
                        key={`i-${index}`}
                        src={url}
                        alt={`Media ${index}`}
                        className="w-full lg:h-24 h-32 object-cover rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.05]"
                        onClick={handleToggelImages}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Related Posts List */}
              <p className="md:text-xl text-base pt-2 font-bold">more videos</p>
              <div className="mt-0">
                {fetchRelated ? (
                  <div className="flex justify-center items-start h-screen">
                    <div className="flex items-center justify-center w-[70vh]">
                      <div className="w-3/4 h-3/4 bg-gray-700 rounded-2xl shadow-lg p-6 animate-pulse flex flex-col">
                        <div className="h-2/3 bg-gray-600 rounded-xl mb-6"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : allPosts.length > 0 ? (
                  //return posts without currunt post and shuffling them in every time user click post
                  allPosts
                    .filter((p) => p._id !== postId)
                    .map((p, index) => (
                      <Link
                        key={index}
                        to={`/posts/${p._id}`}
                        className="flex space-x-3 p-2 ps-1 rounded-lg hover:bg-gray-800 transition duration-200"
                        onClick={() => {
                          // setAllPosts((prevPosts => {prevPosts}));
                          navigate(`/posts/${p._id}`);
                          // setRefreshPost(!refreshPost);
                        }}
                      >
                        <div className="flex-shrink-0 w-24 h-16 bg-gray-700 rounded-md overflow-hidden relative video-thumbnail">
                          <video
                            src={
                              Object.values(p.videoUrl).filter((item) =>
                                ["mp4", "webm", "mov"].includes(
                                  item.split(".").pop().toLowerCase(),
                                ),
                              )[0]
                            }
                            className=" object-cover h-full w-full"
                          ></video>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FontAwesomeIcon
                              icon={faPlay}
                              className="text-white text-xl"
                            />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-semibold line-clamp-2">
                            {p.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {p.authorUsername}
                          </p>
                          <p className="md:text-[13px] text-xs text-gray-500">
                            {p.viewCount || 0} views • {TimeAgo(p.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No related posts found.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOME BUTTON - Added to bottom right */}
      <button
        onClick={() => navigate("/")}
        className="fixed md:bottom-14 bottom-1 flex items-center justify-center md:right-3  md:left-auto left-2 md:bg-gray-700/70 bg-gray-700/30 hover:bg-gray-800 text-white p-[13px]  rounded-full shadow-2xl transition-all duration-300 hover:scale-105 md:w-12 md:h-12 h-9 w-9 z-40"
        aria-label="Go to home"
      >
        <FontAwesomeIcon icon={faHome} className="" />
      </button>

      {/* Modals/Popups */}
      {isShareModalOpen && (
        <ShareModal
          postId={postId}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {showReportPopup && (
        <ReportContent
          postId={postId}
          onClose={() => setShowReportPopup(false)}
          isOpen={showReportPopup}
        />
      )}

      {openEditPost && (
        <EditPost
          isOpen={openEditPost}
          postid={postId}
          copmPlace={"post"}
          isCreatedByUser={isCreatedByUser}
          onClose={() => setOpenEditPost(false)}
          setRefreshPost={setRefreshPost}
          refreshPost={refreshPost}
          setRefreshCmtEdit={setRefreshCmtEdit}
          postAuther={postAuther}
          postDetails={post}
        />
      )}

      {showInfoPopup && (
        <PlayerInfoPopup
          isOpen={showInfoPopup}
          onClose={() => setShowInfoPopup(false)}
          player={post}
        />
      )}

      {openEditComment && (
        <EditComment
          isOpen={openEditComment}
          onClose={() => setOpenEditComment(false)}
          commentContent={commentContent}
          commentId={commentId}
          postId={postId}
          // setRefreshComment={setRefreshComments}
          setRefreshCmtEdit={setRefreshCmtEdit}
          refreshCmtEdit={refreshCmtEdit}
        />
      )}

      {openProfile && (
        <ProfilePopup
          isFollowing={isFollowed}
          setIsFollowing={setIsFollowed}
          isopen={openProfile}
          userId={userIdToShow}
          onClose={() => setOpenProfile(false)}
        />
      )}

      {
        <DeleteCommentPopup
          postId={postId}
          commentId={commentIdToDelete}
          isOpen={openDeleteComment}
          onClose={() => setOpenDeleteComment(false)}
          onDelete={() => setRefreshCmtEdit((prev) => !prev)}
        />
      }

      <AnimatePresence>
        {isImgPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsImgPopupOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-1 right-1 text-white lg:text-3xl md:text-2xl sm:text-xl text-base p-2 rounded-full hover:bg-gray-700 z-10"
                onClick={() => setIsImgPopupOpen(false)}
                aria-label="Close image popup"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
              <img
                src={currentImage}
                alt="Full size media"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {
        <Inbox
          isOpen={isMessageOpen}
          onColse={() => setIsMessageOpen(false)}
          receiverId={postAuther._id}
          senderId={userId}
        />
      }
    </div>
  );
};

export default SinglePost;
