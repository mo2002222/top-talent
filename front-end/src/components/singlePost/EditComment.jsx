import { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const EditComment = ({
  isOpen,
  onClose,
  setRefreshCmtEdit,
  commentContent,
  commentId,
  postId,
}) => {
  // const {setRefreshMainApi, refreshMainApi} = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [updatedComment, setUpdatedComment] = useState(commentContent);
  const [isSaving, setIsSaving] = useState(false);

  // console.log(postDetails);

  //   Handle image upload and preview
  const handleChange = (e) => {
    setMessage("");
    const { value } = e.target;
    setUpdatedComment(value);
    // console.log(updatedData);
  };

  // Handle save changes
  const handleSave = async () => {
    if (updatedComment === commentContent) {
      setMessage("Please fill the fields");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/edit-comment/${postId}/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updatedComment }),
        },
      );
      const data = await response.json();
      response.ok && setIsSaving(false);
      if (!response.ok) {
        setIsSaving(false);
        setMessage("failed to update comment, please try again");
        return;
      }
    } catch (error) {
      setIsSaving(false);
      setMessage("failed to update comment, please try again");
      console.error("error", error);
    }
    setRefreshCmtEdit((prev) => !prev);
    onClose();
  };

  // If the popup is not open, return null
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      ></div>

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1e2a44] p-4 rounded-lg sm:w-[400px] w-[320px] z-50 shadow-lg text-white">
        {/* Header */}
        {/* <p>{message}</p> */}
        <div className="message text-center text-red-500">{message}</div>
        <div className="flex justify-between items-center border-b border-[#3b4a6b] pb-3 mb-5">
          <h3 className="text-lg font-semibold">Edit your comment</h3>
          <button onClick={onClose} className="text-2xl font-bold">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm mb-2">
              Edit
            </label>
            <input
              type="text"
              id="content"
              name="content"
              value={updatedComment}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-[#2a3b5b] border border-[#3b4a6b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(commentContent);
              setMessage("copied to clipboard");
              setTimeout(() => {
                setMessage("");
              }, 1000);
            }}
          >
            <label htmlFor="copy" className="block text-sm">
              copy
            </label>
            <FontAwesomeIcon icon={faCopy} className="text-[15px]" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md "
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            // disabled={!file && true}
          >
            {isSaving ? (
              <div className="flex space-x-[2px] items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`w-[8px] h-[8px] bg-gray-200 rounded-full animate-bounce`}
                    style={{ animationDelay: `${i * 0.2}s` }}
                  ></span>
                ))}
              </div>
            ) : (
              "save"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditComment;

EditComment.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  username: PropTypes.string,
};
