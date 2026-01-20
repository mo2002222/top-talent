import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { faLink, faTimes } from "@fortawesome/free-solid-svg-icons";

const ShareModal = ({
  postId,
  onClose,
  postTitle = "Check out this video!",
}) => {
  const postUrl = `${window.location.origin}/posts/${postId}`;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedText = encodeURIComponent(postTitle);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    alert("Link copied to clipboard!");
  };

  const handleSocialShare = (platform) => {
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "whatsapp":
        url = `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 "
      onClick={onClose}
    >
      <div
        className="bg-[#1e2a44] text-white p-6 rounded-xl w-96 shadow-2xl space-y-4 transform transition-all scale-100 hover:scale-105"
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <h2 className="text-2xl font-bold">Share Video</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex flex-col space-y-3 mt-4">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faLink} />
            Copy Link
          </button>
          <button
            onClick={() => handleSocialShare("facebook")}
            className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faFacebookF} />
            Share on Facebook
          </button>
          <button
            onClick={() => handleSocialShare("twitter")}
            className="flex items-center justify-center gap-2 bg-blue-400 hover:bg-blue-500 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faTwitter} />
            Share on Twitter
          </button>
          <button
            onClick={() => handleSocialShare("whatsapp")}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 py-2 rounded-lg transition"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
            Share on Whatsapp
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

ShareModal.propTypes = {
  postId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  postTitle: PropTypes.string,
};

export default ShareModal;
