import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch } from "@fortawesome/free-solid-svg-icons";
import PropTypes from "prop-types";
import SettingsPopup from "../setting/SettingPopUp";
import { useEffect, useState, useRef } from "react";
import debounce from "lodash.debounce";
import NotificationBell from "../other/NotificationBell";
import useNotificationStore from "../zustand";
import { Link } from "react-router-dom";
import SearchResultsPopup from "../other/SearchResultPopup";
import ProfilePopup from "../other/ProfilePopup";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Header = ({ userInfo }) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const [notiLength, setNotiLength] = useState(0);
  const isMounted = useRef(false);
  const setSearchedPosts = useNotificationStore(
    (state) => state.setSearchedPosts,
  );
  const searchedPosts = useNotificationStore((state) => state.searchedPosts);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchResPopup, setShowSearchResPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const inputRef = useRef();
  const setActiveId = useNotificationStore((state) => state.setActiveId);

  const fetchSuggestions = debounce(async (q) => {
    if (q.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchedPosts([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/search-suggestions?q=${q}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await response.json();
      data.results && setIsLoading(false);
      setSearchedPosts(data.results || []);
      setSuggestions(data.results || []);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  }, 300);

  useEffect(() => {
    fetchSuggestions(searchQuery);
    return () => fetchSuggestions.cancel();
  }, [searchQuery]);

  const handleOnKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setActiveId("header");
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const selected = suggestions[activeIndex];
        setSearchQuery(selected.title);
        setShowSuggestions(false);
        inputRef.current.blur();
      }
      setShowSearchResPopup(true);
      setShowSuggestions(false);
    } else {
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    inputRef.current.blur();
    if (searchQuery.trim() !== "") {
      const result = await fetch(
        `${BACKEND_URL}/search-posts?q=${searchQuery}`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      const data = await result.json();
      setSearchedPosts(data.results);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("notiLength");
    if (saved !== null) setNotiLength(parseInt(saved, 10));
    else setNotiLength(notifications.length);
  }, [notifications.length]);

  useEffect(() => {
    localStorage.setItem("notiLength", notiLength);
  }, [notiLength]);

  useEffect(() => {
    if (isMounted.current && notifications.length > 0) {
      setNotiLength((prev) => prev + 1);
    } else {
      isMounted.current = true;
    }
  }, [notifications.length]);

  return (
    <div className="w-full flex flex-col justify-normal">
      {/* ✅ Top Row: Logo + User Info Always in One Line */}
      <div className="w-full flex justify-between items-center px-2 pt-7">
        {/* LOGO */}
        <div className="flex items-center space-x-1 select-none">
          <h3 className="md:text-xl text-[18px] lg:text-2xl font-bold text-blue-500">
            Talent
          </h3>
          <h3 className="md:text-xl text-[18px] lg:text-2xl font-bold text-yellow-400 mt-1 lg:mt-3">
            Club
          </h3>
        </div>

        {/* USER INFO + NOTIFICATION */}
        <div className="relative flex items-center gap-0 sm:gap-2 cursor-pointer select-none">
          {/* Notification */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveId("header");
              setIsNotificationOpen((prev) => !prev);
              setNotiLength(0);
            }}
            className="relative border-none pt-1 outline-none flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-800/70 transition-all text-gray-300 hover:text-white"
          >
            <FontAwesomeIcon icon={faBell} className="md:text-lg text-md" />
            {notiLength > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[9px] lg:text-[10px] font-bold text-white bg-red-600 rounded-full min-w-[16px] min-h-[16px] px-1">
                {notiLength}
              </span>
            )}
          </button>

          {/* Profile */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setActiveId("header");
              setOpenProfile(true);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-800/70 transition-all"
          >
            <p className="text-gray-200 sm:text-sm text-1 font-medium whitespace-nowrap pt-1">
              <small className="bg-blue-600/30 text-blue-400 rounded-md px-1.5 py-[1px] mr-1 ">
                {userInfo.role}
              </small>
              {userInfo.username}
            </p>
            <img
              className="rounded-full w-6 h-6 sm:w-7 sm:h-7 object-cover ring-2 ring-gray-700"
              src={userInfo.avatar || "/default-avatar.png"}
              alt="user avatar"
            />
          </div>

          {/* Notification Dropdown */}
          <div
            className={`absolute top-12 right-0 z-50 transform transition-all duration-300 origin-top-right ${
              isNotificationOpen
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none"
            }`}
          >
            <NotificationBell
              isOpen={isNotificationOpen}
              setIsOpen={setIsNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* ✅ Search Bar (Below Logo + User Info) */}
      <div className="flex justify-center px-3 md:px-5 mb-12 md:me-24">
        <div className="relative w-full max-w-xl">
          <div className="flex items-center rounded-2xl border border-white/10 bg-gray-900/70 backdrop-blur-md shadow-lg focus-within:ring-2 focus-within:ring-blue-700">
            <input
              type="text"
              ref={inputRef}
              maxLength={120}
              placeholder="Search..."
              className="flex-1 bg-transparent border-none outline-none text-gray-100 placeholder-gray-400 text-sm px-3 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleOnKeyDown}
            />
            <FontAwesomeIcon
              icon={faSearch}
              onClick={() => {
                setActiveId("header");
                if (searchQuery.trim() !== "") {
                  setActiveId("header");
                  setShowSearchResPopup(true);
                  setShowSuggestions(false);
                }
              }}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/60 rounded-xl cursor-pointer"
            />
          </div>

          {/* Suggestions Dropdown */}
          {isLoading ? (
            <ul className="absolute top-full left-0 mt-2 w-full bg-gray-800 text-gray-100 rounded-xl shadow-xl py-4 z-50">
              <div className="flex justify-center items-center">Loading...</div>
            </ul>
          ) : (
            showSuggestions &&
            suggestions.length > 0 && (
              <ul
                className="absolute top-full left-0 mt-2 w-full
                           bg-[#1e2a44]/95 backdrop-blur-xl
                           text-gray-100 rounded-2xl
                           shadow-2xl z-50
                           border border-slate-700
                           overflow-hidden"
              >
                {suggestions.slice(0, 30).map((suggestion, index) => (
                  <Link
                    key={index}
                    to={`/posts/${suggestion._id}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block"
                  >
                    <li
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                        ${
                          index === activeIndex
                            ? "bg-blue-900/30"
                            : "hover:bg-slate-800/70"
                        }`}
                    >
                      {/* VIDEO THUMB */}
                      <video
                        className="w-12 h-10 object-cover rounded-md border border-slate-600 flex-shrink-0"
                        src={
                          suggestion.videoUrl?.find((val) =>
                            ["mp4", "webm", "ogg"].some((ext) =>
                              val.endsWith(ext),
                            ),
                          ) || ""
                        }
                        muted
                      />

                      {/* TEXT */}
                      <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-semibold truncate text-gray-100">
                          {suggestion.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {suggestion.description}
                        </p>
                      </div>
                    </li>
                  </Link>
                ))}
              </ul>
            )
          )}
        </div>
      </div>

      {/* Popups */}
      {openProfile && (
        <ProfilePopup
          showFollowButton={false}
          isopen={openProfile}
          userId={userInfo._id}
          onClose={() => setOpenProfile(false)}
        />
      )}

      <SearchResultsPopup
        isOpen={showSearchResPopup}
        onClose={() => setShowSearchResPopup(false)}
        results={searchedPosts}
      />

      {isSettingOpen && (
        <SettingsPopup
          isOpen={isSettingOpen}
          onClose={() => setIsSettingOpen(false)}
          username={userInfo.username}
        />
      )}
    </div>
  );
};

Header.propTypes = {
  userInfo: PropTypes.object.isRequired,
};

export default Header;
