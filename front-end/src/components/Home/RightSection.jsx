import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../authContext";
import countries from "../other/countries.json";
import Inbox from "../other/Inbox";
import { AnimatePresence, motion } from "framer-motion";
import useNotificationStore from "../zustand";
import AboutPopup from "../other/About";
import FAQs from "../other/FAQs";
import FullSnippetModal from "../other/FullSnippet";

const RightSection = ({
  isPostsLoading,
  isLoading,
  topRatedTalents,
  snippets,
}) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [faqsOpen, setFaqsOpen] = useState(false);
  const [openFullSnippet, setOpenFullSnippet] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const { user } = useContext(UserContext);
  const setActiveId = useNotificationStore((state) => state.setActiveId);
  const [activeSnippet, setAciveSnippet] = useState(null);

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

  return (
    <div
      className="right-sec ps-2 text-gray-100 
    w-full  
    hidden lg:block        /* Hide completely below lg */ 
    overflow-y-auto h-[calc(100vh-70px)] 
    border-l border-gray-800 
    px-2 pt-4 
    no-scrollbar
  "
    >
      {/* Trending Talents */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold mb-3 text-blue-400 tracking-wide">
          Trending Talents
        </h2>

        {isPostsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-full h-24 bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          topRatedTalents.slice(-4).map((val, index) => {
            const mediaUrl = Array.isArray(val.videoUrl)
              ? val.videoUrl[0]
              : val.videoUrl;

            return (
              <Link
                to={`/posts/${val._id}`}
                key={index}
                className="flex justify-between items-center p-3 mb-2 rounded-lg 
                bg-gray-800/70 hover:bg-gray-700 
                border border-gray-700 hover:border-blue-600 
                transition-all duration-300"
              >
                <div>
                  <div className="flex lg:gap-[5px] xl:gap-[10px] gap-2 items-center text-sm font-medium text-gray-200 ">
                    <span className="whitespace-nowrap">{val.playerName}</span>
                    <span className="text-gray-400 whitespace-nowrap ">
                      {val.playerAge} yrs
                    </span>
                    <span className="text-gray-400">
                      {val.playerNationality}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Rating:</span>
                    <span className="px-2 py-[1px] rounded-md bg-green-700 text-gray-100 text-xs">
                      {val.avgRating ?? "N/A"}
                    </span>
                    <img
                      src={getFlag(val.playerNationality)}
                      className="w-6 h-6 object-contain rounded-md"
                      alt={val.playerNationality}
                    />
                  </div>
                </div>

                <div>
                  {mediaUrl ? (
                    isVideo(mediaUrl) ? (
                      <video
                        src={mediaUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <img
                        src={mediaUrl}
                        className="w-12 h-12 object-cover rounded-md"
                        alt="player"
                      />
                    )
                  ) : (
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/035/602/859/non_2x/ai-generated-3d-character-of-young-football-player-png.png"
                      alt="player"
                      className="w-12 h-12 object-cover rounded-md"
                    />
                  )}
                </div>
              </Link>
            );
          })
        )}
        <div className="text-center">
          <Link
            to={"/posts/hightest-rated"}
            className="text-sm text-blue-400 mt-1 inline-block p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition no-underline "
          >
            show more
          </Link>
        </div>
      </div>

      {/* Snippets */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-blue-400">Snippets</h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-full h-24 bg-gray-700 rounded-xl animate-pulse"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {snippets.slice(-4).map((val, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 bg-gray-800/70  
                border border-gray-700 hover:border-blue-600 
                transition-all duration-300 rounded-lg p-2"
              >
                <div className="flex items-start gap-3">
                  <img
                    className="w-12 h-12 rounded-md object-cover"
                    src={val.img}
                    alt="snippet"
                  />
                  <p className="text-sm text-gray-200 leading-snug">
                    {val.snippets.length >= 50
                      ? val.snippets.slice(0, 50) + "..."
                      : val.snippets}
                  </p>
                </div>
                <button
                  className="text-xs text-blue-400 p-1 rounded-sm whitespace-nowrap  bg-blue-500/20  hover:bg-blue-500/30 transition no-underline "
                  onClick={() => {
                    setOpenFullSnippet(true);
                    setAciveSnippet(val);
                    setActiveId("rightsection");
                  }}
                >
                  read more
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Links */}
      <div className="flex justify-center mt-4 pb-3 lg:space-x-3 xl:space-x-6 text-gray-400 text-sm">
        <button
          onClick={() => {
            setAboutOpen(true);
            setActiveId("rightsection");
          }}
          className="hover:text-gray-100 transition-colors"
        >
          About
        </button>
        <button
          onClick={() => {
            setIsMessageOpen(true);
            setActiveId("rightsection");
          }}
          className="hover:text-gray-100 transition-colors"
        >
          contact us
        </button>
        <button
          onClick={() => {
            setFaqsOpen(true);
            setActiveId("rightsection");
          }}
          className="hover:text-gray-100 transition-colors"
        >
          FAQs
        </button>
        <Link to="/dmca" className="text-gray-400 hover:text-white text-sm">
          DMCA
        </Link>
      </div>

      {/* Modals remain same */}
      {/* ... */}

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
    </div>
  );
};

export default RightSection;
