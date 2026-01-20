import React from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DeleteCommentPopup = ({
  isOpen,
  onClose,
  onDelete,
  commentId,
  postId,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(
        `${BACKEND_URL}/delete-comment/${postId}/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          onDelete(); // Call the onDelete callback after successful deletion
          onClose(); // Close the popup
          setIsDeleting(false);
        }, 1000); // Delay closure to show "Deleted" state
      } else {
        console.error("Failed to delete comment");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      setIsDeleting(false);
    }
  };
  React.useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 2000); // stop animation / hide success after 2s
    return () => clearTimeout(timer);
  }, [showSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className=" rounded-lg p-6 max-w-sm w-full mx-4 bg-[#1e2a44]">
        <h3 className="text-xl font-semibold mb-4">Delete Comment</h3>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete your comment?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 text-white rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <div className="relative">
            <button
              className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleted" : "Delete"}
            </button>
            {showSuccess && (
              <div className="absolute -right-6 top-1/2 -translate-y-1/2 animate-fade-in ">
                <svg
                  className="w-5 h-5 text-green-500 animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCommentPopup;
