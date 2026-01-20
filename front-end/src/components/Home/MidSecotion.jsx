import {
  faArrowCircleUp,
  faUpload,
  faFilterCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createContext, useState, useEffect, useContext, useRef } from "react";
import UploadPopup from "./UploadPopup";
import { Link } from "react-router-dom";
import PostCard from "./PostCard";
export const fileContext = createContext();
import UserContext from "../authContext";
import PropTypes from "prop-types";
import FilteringPopup from "../other/FilteringPopup";
import { BookmarkMinus } from "lucide-react";
import countries from "../other/countries.json";
import Inbox from "../other/Inbox";
import useNotificationStore from "../zustand";
import { AnimatePresence, motion } from "framer-motion";
import AboutPopup from "../other/About";
import FAQs from "../other/FAQs";
import FullSnippetModal from "../other/FullSnippet";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const MidSection = ({
  componentPlace,
  showCompactRight,
  snippets,
  topRatedTalents,
}) => {
  const [isCustumLoading, setIsCustumLoading] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(false);
  const [uploadPopupState, setUploadPopupState] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [postsToShow, setPostsToShow] = useState([]);
  const [postFUs, setPostFUs] = useState([]);
  const [postFUsers, setPostFUsers] = useState([]);
  const [topRatedPosts, setTopRatedPosts] = useState([]);
  const { checkUser, user, loading } = useContext(UserContext);
  const [savedPosts, setSavedPosts] = useState([]);
  const [mostLiked, setMostLiked] = useState([]);
  const [mostViews, setMostViews] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userId, setUserId] = useState(user._id);
  const [visibleCount, setVisibleCount] = useState(20);
  const [historyVideos, setHistoryVideos] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [openFullSnippet, setOpenFullSnippet] = useState(false);

  const [filtringData, setFiltringData] = useState({
    country: "",
    league: "",
    ageRange: "",
    mostLiked: false,
    topRated: false,
  });
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const params = new URLSearchParams(filtringData).toString();
  const containerRef = useRef();
  const setActiveId = useNotificationStore((state) => state.setActiveId);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsCustumLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/get-posts?${params}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await response.json();

        setAllPosts(data.allPosts);
        setPostFUs(data.RFUs);
        setPostFUsers(data.RFUser);
        setTopRatedPosts(data.topRatedPosts);
        setFilteredPosts(data.filteredPosts);

        if (data.filteredPosts.length > 0) setPostsToShow(data.filteredPosts);
        else setPostsToShow(data.allPosts);

        setIsCustumLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setIsCustumLoading(false);
      }
    };
    fetchPosts();
    checkUser();
  }, [refreshPosts]);

  useEffect(() => {
    if (!user?._id) return;
    const getSavedPosts = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/fetching-saved-posts/${user._id}`,
        );
        const data = await response.json();
        setSavedPosts(data.savedPosts);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      }
    };
    getSavedPosts();
  }, [user?._id]);

  useEffect(() => {
    const fetchingStats = async () => {
      const res = await fetch(`${BACKEND_URL}/most-viewed-liked-posts`);
      const data = await res.json();
      setMostLiked(data.mostLiked);
      setMostViews(data.mostViewed);
    };
    fetchingStats();
  }, []);

  useEffect(() => {
    setUserPosts(allPosts.filter((p) => p.auther[0] === user?._id));
  }, [allPosts, user?._id]);

  const handleApplyFilter = (data) => {
    setFiltringData(data);
    setShowFilterPopup(false);
    setRefreshPosts(!refreshPosts);
  };

  const isVideo = (url) => {
    if (!url) return false;
    const ext = url.split(".").pop().toLowerCase();
    return ["mp4", "webm", "mov", "ogg"].includes(ext);
  };

  const getFlag = (country) => {
    const code = countries[country.toLowerCase()];
    return code
      ? `https://flagsapi.com/${code}/flat/64.png`
      : "/defaultLeague.png"; // default flag
  };

  //get history videos
  useEffect(() => {
    if (!userId) return;

    const getHistVideos = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/watch-history/${userId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        console.log(data);
        setHistoryVideos(data.map((item) => item.postId));
      } catch (error) {
        console.error("Error fetching history videos:", error);
      }
    };

    getHistVideos();
  }, [userId]);

  const clearHistory = async () => {
    await fetch(`${BACKEND_URL}/local/watch-history/${user._id}/clear`, {
      method: "DELETE",
      credentials: "include",
    });

    setHistoryVideos([]);
    setShowConfirm(false);
  };

  if (loading || !user)
    return <p className="text-center text-gray-400 mt-10">Loading...</p>;

  return (
    <div className="relative w-full flex flex-1">
      {isCustumLoading ? (
        <div className="flex items-center justify-center w-full h-[70vh]">
          <div className="xl:w-3/4 lg:w-[80%] w-3/4 h-3/4 bg-gray-800 rounded-2xl shadow-lg xl:p-6 lg:p-2 p-4 animate-pulse flex flex-col">
            <div className="h-2/3 bg-gray-700 rounded-xl mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4 "></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="sm:px-1 overflow-y-auto h-[calc(100vh-90px)] pt-2 pb-40 scrollbar-hide w-full no-scrollbar "
        >
          {/* Header Actions */}
          {componentPlace === "home" && (
            <div className="flex justify-between items-center mb-4 sm:px-2 px-2">
              <button
                onClick={() => setUploadPopupState(true)}
                className="flex text-sm Md:text:base items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white md:px-4 px-2 md:py-2 py-1 rounded-lg transition-all shadow-md"
              >
                <FontAwesomeIcon icon={faUpload} />
                <span>Upload</span>
              </button>

              <button
                onClick={() => {
                  setShowFilterPopup(true);
                  setActiveId("midsection");
                }}
                className="flex items-center gap-2 text-sm Md:text:base bg-blue-600 hover:bg-blue-700 text-white md:px-4 px-2 md:py-2 py-1 rounded-lg transition-all shadow-md"
              >
                <FontAwesomeIcon icon={faFilterCircleXmark} />
                <span>Filter Videos</span>
              </button>
            </div>
          )}

          {/* 👇 Compact Right Section (shown only when main right sidebar is hidden) */}
          {showCompactRight && (
            <div className="block lg:hidden px-3 mb-3 space-y-2">
              {/* 🌟 Trending Talents */}
              <div className="relative ">
                <h2 className="text-base md:text-lg font-semibold mb-1 text-blue-400 text-start tracking-wide">
                  Trending Talents
                </h2>

                {/* Scroll container */}

                <div className="relative">
                  <div
                    className="absolute -top-2 right-0 h-full w-10 
  bg-gradient-to-l from-blue-700/50 via-blue-500/20 to-transparent 
  pointer-events-none rounded-l-2xl blur-sm animate-scroll-hint"
                  />
                  <div
                    id="trending-scroll"
                    className="flex flex-row gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-center"
                  >
                    {topRatedTalents.slice(-4).map((val, index) => {
                      const mediaUrl = Array.isArray(val.videoUrl)
                        ? val.videoUrl[0]
                        : val.videoUrl;

                      return (
                        <Link
                          to={`/posts/${val._id}`}
                          key={index}
                          className="flex items-center justify-between flex-shrink-0 w-[260px] md:p-2 p-1 rounded-lg 
                bg-gray-800/70 hover:bg-gray-700 border border-gray-700 hover:border-blue-600 
                transition-all duration-300 snap-start"
                        >
                          {/* Left text */}
                          <div className="flex-1 pr-2">
                            <p className="md:text-[13px] text-sm font-semibold text-gray-200 truncate">
                              {val.playerName}
                            </p>
                            <p className="text-gray-400 md:text-[13px] text-sm truncate">
                              {val.playerAge} yrs • {val.playerNationality}
                            </p>
                            <div className="md:mt-1 mt-0 flex items-center gap-2">
                              <span className="px-1.5 py-[1px] rounded-md bg-green-700 text-gray-100 text-[12px]">
                                ⭐ {val.avgRating ?? "N/A"}
                              </span>
                              <img
                                src={getFlag(val.playerNationality)}
                                className="w-5 h-5 object-contain rounded-md"
                                alt={val.playerNationality}
                              />
                            </div>
                          </div>

                          {/* Right media */}
                          <div className="flex-shrink-0">
                            {mediaUrl ? (
                              isVideo(mediaUrl) ? (
                                <video
                                  src={mediaUrl}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  className="md:w-14 md:h-14 w-12 h-12 object-cover rounded-md"
                                />
                              ) : (
                                <img
                                  src={mediaUrl}
                                  className="md:w-14 md:h-14 w-12 h-12 object-cover rounded-md"
                                  alt="player"
                                />
                              )
                            ) : (
                              <img
                                src="https://static.vecteezy.com/system/resources/previews/035/602/859/non_2x/ai-generated-3d-character-of-young-football-player-png.png"
                                alt="player"
                                className="w-14 h-14 object-cover rounded-md"
                              />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                    <div className="">
                      <Link
                        to={"/posts/hightest-rated"}
                        className="md:text-sm text-[12px] text-blue-400 mt-1 inline-block md:p-2 p-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition no-underline whitespace-nowrap"
                      >
                        show more
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🧩 Snippets */}
              <div className="relative">
                <h2 className="text-base md:text-lg font-semibold mb-1 text-blue-400 text-start tracking-wide">
                  Snippets
                </h2>

                <div className="relative">
                  <div
                    className="absolute -top-2 right-0 h-full w-10 
    bg-gradient-to-l from-blue-700/50 via-blue-500/20 to-transparent 
    pointer-events-none rounded-l-2xl blur-sm animate-scroll-hint"
                  />

                  <div
                    id="snippets-scroll"
                    className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory scroll-smooth"
                  >
                    {snippets.slice(-4).map((val, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-2 bg-gray-800/70
                border border-gray-700 hover:border-blue-600 
                transition-all duration-300 rounded-lg p-2 flex-shrink-0 w-[260px] snap-start"
                      >
                        <img
                          className="md:w-14 md:h-14 w-12 h-full rounded-md object-cover flex-shrink-0"
                          src={val.img}
                          alt="snippet"
                        />
                        <div className="flex items-start gap-1 justify-between flex-col  flex-1">
                          <p className="text-gray-200 leading-snug text-sm line-clamp-2">
                            {val.snippets.length >= 50
                              ? val.snippets.slice(0, 50) + "...."
                              : val.snippets}
                          </p>
                          <button
                            className="text-xs text-center text-blue-400 p-1 rounded-sm whitespace-nowrap  bg-blue-500/20  hover:bg-blue-500/30 transition no-underline "
                            onClick={() => {
                              setOpenFullSnippet(true);
                              setActiveSnippet(val);
                              setActiveId("midsection");
                            }}
                          >
                            read more
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer Links */}
                  <div className="flex justify-center mt-2 pb-1 space-x-6 text-gray-400 text-sm">
                    <button
                      onClick={() => {
                        setAboutOpen(true);
                        setActiveId("midsection");
                      }}
                      className="hover:text-gray-100 transition-colors"
                    >
                      About
                    </button>
                    <button
                      onClick={() => setIsMessageOpen(true)}
                      className="hover:text-gray-100 transition-colors"
                    >
                      contact us
                    </button>
                    <button
                      onClick={() => {
                        setFaqsOpen(true);
                        setActiveId("midsection");
                      }}
                      className="hover:text-gray-100 transition-colors"
                    >
                      FAQs
                    </button>
                    <Link
                      to="/dmca"
                      className="text-gray-400 hover:text-white text-sm"
                    >
                      DMCA
                    </Link>
                  </div>
                </div>
              </div>
              <h2 className="text-base md:text-lg font-semibold mb-0 text-blue-400 text-start tracking-wide">
                videos
              </h2>
            </div>
          )}

          {/* Titles */}
          {componentPlace === "Rec-from-us" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              Recommended Talents from Us
            </h3>
          )}
          {componentPlace === "Rec-from-users" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              Recommended Talents from Users
            </h3>
          )}
          {componentPlace === "top-rate" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              Highest Rated Talents
            </h3>
          )}
          {componentPlace === "most-views" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              Most Viewed Talents
            </h3>
          )}
          {componentPlace === "profile" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              your Posts
            </h3>
          )}
          {componentPlace === "saved-posts" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              your saved Posts
            </h3>
          )}
          {componentPlace === "history" && (
            <h3 className="text-center text-lg font-semibold mb-5 text-gray-200">
              your watch History
            </h3>
          )}

          {/* ✅ Posts Grid (fixed layout & gap) */}
          <div className="grid grid-cols-2 [@media(max-width:480px)]:grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3  [@media(max-width:400px)]:grid-cols-1 xl:grid-cols-4 [@media(min-width:1350px)]:grid-cols-5 gap-3 sm:px-2 px-2">
            {/* Home */}
            {componentPlace === "home" &&
              filteredPosts[0]?.message !== "no post for filter aplied" &&
              postsToShow.map((post, i) => (
                <div className="w-full" key={i}>
                  <PostCard post={post} />
                </div>
              ))}

            {/* Recommended by Users */}
            {componentPlace === "Rec-from-users" &&
              postFUsers.map((post, i) => <PostCard key={i} post={post} />)}

            {/* Recommended from Us */}
            {componentPlace === "Rec-from-us" &&
              postFUs.map((post, i) => <PostCard key={i} post={post} />)}

            {/* Top Rated */}
            {componentPlace === "top-rate" &&
              topRatedPosts.map((post, i) => (
                <PostCard
                  key={i}
                  post={post}
                  rating={post.avgRating}
                  compPlace="top-rate"
                />
              ))}

            {/* Saved Posts */}
            {componentPlace === "saved-posts" &&
              (savedPosts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-300 mt-10">
                  <BookmarkMinus className="w-14 h-14 text-gray-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    No Saved Posts Yet
                  </h2>
                  <p className="text-gray-400 mb-4">
                    Start exploring and bookmark posts you like!
                  </p>
                  <Link
                    to="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg"
                  >
                    Explore Posts
                  </Link>
                </div>
              ) : (
                savedPosts.map((post, i) => (
                  <PostCard key={i} post={post} compPlace="saved-posts" />
                ))
              ))}

            {/* Most Liked */}
            {componentPlace === "most-liked" &&
              mostLiked.map((post, i) => (
                <PostCard key={i} post={post} compPlace="most-liked" />
              ))}

            {/* Most Viewed */}
            {componentPlace === "most-views" &&
              mostViews.map((post, i) => (
                <PostCard key={i} post={post} compPlace="most-views" />
              ))}

            {/* Profile */}
            {componentPlace === "profile" &&
              (userPosts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-300 mt-10">
                  <BookmarkMinus className="w-14 h-14 text-gray-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
                  <p className="text-gray-400 mb-4">
                    Upload your first post to get started!
                  </p>
                  <Link
                    to="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg"
                  >
                    Explore Posts
                  </Link>
                </div>
              ) : (
                userPosts.map((post, i) => (
                  <div className="w-full" key={i}>
                    <PostCard post={post} />
                  </div>
                ))
              ))}

            {componentPlace === "history" &&
              (historyVideos.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center text-gray-300 mt-10">
                  <BookmarkMinus className="w-14 h-14 text-gray-500 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">
                    History is empty!
                  </h2>
                  <p className="text-gray-400 mb-4">
                    explor videos and sharing!
                  </p>
                  <Link
                    to="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg"
                  >
                    Explore Posts
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="flex-1 col-span-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm h-fit w-fit align-middle"
                  >
                    Clear History
                  </button>
                  {historyVideos.slice(0, visibleCount).map((post, i) => (
                    <div className="w-full" key={i}>
                      <PostCard post={post} />
                    </div>
                  ))}
                  {historyVideos.length > 20 && (
                    <div className="mt-2">
                      {visibleCount < historyVideos.length ? (
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 20)}
                          className="text-blue-400 text-sm"
                        >
                          Show More
                        </button>
                      ) : (
                        <button
                          onClick={() => setVisibleCount(20)}
                          className="text-blue-400 text-sm"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  )}
                </>
              ))}

            <button
              onClick={() =>
                containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="relative md:top-28 [@media(max-width:480px)]:fixed [@media(max-width:480px)]:left-1/2  [@media(max-width:480px)]:bottom-2 left-3 h-5 w-5 bg-gray-800 [@media(max-width:480px)]:opacity-25  hover:bg-gray-700 text-white rounded-full shadow-lg transition-all"
            >
              <FontAwesomeIcon icon={faArrowCircleUp} className="text-2xl" />
            </button>
          </div>
        </div>
      )}

      {isMessageOpen && (
        <AnimatePresence>
          {isMessageOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            >
              <Inbox
                isOpen={isMessageOpen}
                onColse={() => setIsMessageOpen(false)}
                senderId={user._id}
                receiverId={"68ebe6cf926e8e144b2f9a44"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ✅ Popups (unchanged) */}
      {uploadPopupState && (
        <fileContext.Provider
          value={{
            uploadPopupState,
            setUploadPopupState,
            setRefreshPosts,
            refreshPosts,
          }}
        >
          <UploadPopup
            onClose={() => setUploadPopupState(false)}
            refreshPosts={refreshPosts}
            setRefreshPosts={setRefreshPosts}
          />
        </fileContext.Provider>
      )}

      {aboutOpen && (
        <AnimatePresence>
          {aboutOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            >
              {/* <Inbox isOpen={isMessageOpen} onColse={() => setIsMessageOpen(false)} senderId={user._id} receiverId={'68ebe6cf926e8e144b2f9a44'} /> */}
              <AboutPopup
                isOpen={aboutOpen}
                onClose={() => setAboutOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {openFullSnippet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          >
            {/* <Inbox isOpen={isMessageOpen} onColse={() => setIsMessageOpen(false)} senderId={user._id} receiverId={'68ebe6cf926e8e144b2f9a44'} /> */}
            <FullSnippetModal
              isOpen={openFullSnippet}
              snippet={activeSnippet}
              onClose={() => setOpenFullSnippet(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {faqsOpen && (
        <AnimatePresence>
          {faqsOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            >
              <FAQs isOpen={faqsOpen} onClose={() => setFaqsOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {showFilterPopup && (
        <FilteringPopup
          filtringData={filtringData}
          setFiltringData={setFiltringData}
          isOpen={showFilterPopup}
          onApply={handleApplyFilter}
          onClose={() => setShowFilterPopup(false)}
        />
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 🔴 Background overlay */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowConfirm(false)}
          />

          {/* 🟦 Modal box */}
          <div className="relative bg-gray-900 rounded-xl p-6 w-[90%] max-w-md text-center shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-3">
              Delete History?
            </h2>

            <p className="text-gray-400 mb-6">
              Are you sure you want to delete your history? This action cannot
              be undone.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>

              <button
                onClick={clearHistory}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredPosts[0]?.message === "no post for filter aplied" && (
        <div className="text-center text-lg text-gray-300 mt-10">
          No posts found for the applied filters.
        </div>
      )}
    </div>
  );
};

MidSection.propTypes = {
  componentPlace: PropTypes.string.isRequired,
};

export default MidSection;
