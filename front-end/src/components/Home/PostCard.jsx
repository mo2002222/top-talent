import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import leagueLogos from "../other/leaguesLogo.json";
const defaultLeague = "/defaultLeague.png";
import countries from "../other/countries.json";

const PostCard = ({ post, rating, compPlace }) => {
  const videoSrc = Array.isArray(post.videoUrl)
    ? post.videoUrl.find((url) =>
        ["mp4", "webm", "mov"].includes(url.split(".").pop().toLowerCase()),
      )
    : post.videoUrl;

  const fallbackImg =
    "https://static.vecteezy.com/system/resources/thumbnails/035/602/861/small_2x/ai-generated-young-male-football-player-in-style-of-3d-png.png";

  const getFlag = (country) => {
    const code = countries[country.toLowerCase()];
    return code
      ? `https://flagsapi.com/${code}/flat/64.png`
      : "/defaultLeague.png"; // default flag
  };

  return (
    <Link
      to={`/posts/${post._id}`}
      className="  w-full  flex flex-col bg-[#111] border border-gray-800 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-transform duration-200 overflow-hidden"
    >
      {/* Media */}
      <div className="relative h-[140px] w-full overflow-hidden rounded-t-2xl">
        {videoSrc ? (
          <video
            src={videoSrc}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={fallbackImg}
            alt={post.playerName}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition">
          <FontAwesomeIcon icon={faPlay} className="text-white text-3xl" />
        </div>
      </div>

      {/* Player Info */}
      <div className="flex flex-col gap-1 p-3 text-gray-300 text-sm">
        <p className="truncate">
          <span className="text-gray-400">Name:</span> {post.playerName}
        </p>
        <p>
          <span className="text-gray-400">Age:</span> {post.playerAge}
        </p>
        <p className="flex items-center gap-1">
        <span className="text-gray-400 ">Nat:</span> {post.playerNationality.length > 10 ? post.playerNationality.slice(0, 10) + ".." : post.playerNationality || "N/A"}

          {
            <img
              src={getFlag(post.playerNationality)}
              className="w-5 h-5 object-contain rounded-sm"
              alt={post.playerNationality}
            />
          }
        </p>
        <p className="truncate">
          <span className="text-gray-400 ">Lg:</span>{" "}
          {post.playerLeague.length > 11 ? post.playerLeague.slice(0, 11) + ".." : post.playerLeague || "N/A"}

          {
            <img
              src={leagueLogos[post.playerLeague] || defaultLeague}
              alt={post.playerLeague}
              className="inline-block w-5 h-5 ml-1 object-contain rounded-sm"
            />
          }
        </p>

        {compPlace === "topRated" && (
          <div className="mt-2 bg-blue-900/40 text-blue-200 py-1 px-2 rounded-lg text-xs w-fit self-start">
            ⭐ Rating: {rating}
          </div>
        )}
      </div>
    </Link>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    videoUrl: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    playerName: PropTypes.string,
    playerAge: PropTypes.number,
    playerNationality: PropTypes.string,
    playerLeague: PropTypes.string,
  }).isRequired,
  rating: PropTypes.number,
  compPlace: PropTypes.string,
};

export default PostCard;
