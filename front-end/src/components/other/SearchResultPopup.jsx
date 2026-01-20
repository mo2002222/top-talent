import { faArrowCircleUp, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const SearchResultsPopup = ({ isOpen, onClose, results }) => {
  const popupRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const orignal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orignal;
    };
  }, []);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    const handleScroll = () => {
      if (popup.scrollTop > 50) {
        setShowScrollTop(true);
        console.log("true");
      } else {
        setShowScrollTop(false);
        console.log("false");
      }
    };

    popup.addEventListener("scroll", handleScroll);
    return () => popup.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    popupRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/60 backdrop-blur-md px-2"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        ref={popupRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh]
                   bg-[#1e2a44]/95
                   border border-blue-900/40
                   rounded-2xl shadow-2xl
                   p-5 overflow-y-auto
                   no-scrollbar"
      >
        {/* HEADER */}
        <h2 className="text-lg font-semibold text-white mb-4">
          Search Results
        </h2>

        {/* RESULTS */}
        {results && results.length > 0 ? (
          <ul className="space-y-4">
            {results.map((post) => {
              const videoSrc = post.videoUrl.find(
                (val) =>
                  val.endsWith("mp4") ||
                  val.endsWith("webm") ||
                  val.endsWith("ogg"),
              );

              return (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="block"
                >
                  <li
                    className="group relative overflow-hidden
                               rounded-xl bg-[#253559]
                               hover:bg-[#2b395a]
                               transition shadow"
                  >
                    {/* VIDEO PREVIEW */}
                    <div className="relative h-52 w-full overflow-hidden">
                      <video
                        src={videoSrc}
                        className="h-full w-full object-cover
                                   group-hover:scale-105 transition"
                        muted
                      />

                      {/* PLAY ICON */}
                      <div
                        className="absolute inset-0 flex items-center justify-center
                                   bg-black/30 opacity-0
                                   group-hover:opacity-100 transition"
                      >
                        <FontAwesomeIcon
                          icon={faPlay}
                          className="text-white text-4xl drop-shadow-lg"
                        />
                      </div>
                    </div>

                    {/* INFO */}
                    <div className="p-4 text-white">
                      <p className="font-semibold truncate">{post.title}</p>
                      <p className="text-sm text-gray-300">{post.playerName}</p>
                      <p className="text-xs text-gray-400">
                        {post.playerLeague}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Posted on{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                </Link>
              );
            })}
          </ul>
        ) : (
          <div className="text-center text-gray-400 py-10">
            No results found
          </div>
        )}

        {/* FOOTER HINT */}
        <p className="text-xs text-gray-400 mt-6 text-center">
          Tap a result to open the post
        </p>
      </div>
    </div>
  );
};

export default SearchResultsPopup;
