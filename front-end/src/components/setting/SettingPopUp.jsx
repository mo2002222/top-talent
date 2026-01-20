import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import UserContext from "../authContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SettingsPopup = ({ isOpen, onClose, username }) => {
  const [isSaving, setIsSaving] = useState(false);
  const { userImg, setUserImg, setRefreshMainApi, refreshMainApi } =
    useContext(UserContext);
  const [newUsername, setNewUsername] = useState(username);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    setMessage("");
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => setUserImg(event.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleSave = async () => {
    if (!file && newUsername.trim() === username.trim()) {
      return setMessage("No changes detected");
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (newUsername && newUsername.trim() !== username.trim()) {
      formData.append("newUsername", newUsername);
    }
    formData.append("oldUsername", username);

    try {
      setIsSaving(true);
      setMessage("");
      const res = await fetch(
        `${BACKEND_URL}/update-setting/username-profileimg`,
        { method: "PATCH", body: formData },
      );

      if (!res.ok) throw new Error("Failed to save changes");
      await res.json();
      setRefreshMainApi(!refreshMainApi);
      setMessage("✅ Profile updated successfully!");
      setTimeout(onClose, 800);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile, please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />

          {/* Centered Popup */}
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="pointer-events-auto w-[340px] sm:w-[420px]
                     bg-gradient-to-b from-slate-800 to-slate-900
                     p-6 rounded-2xl shadow-2xl text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-600 pb-3 mb-5">
                <h3 className="text-lg font-semibold tracking-wide">
                  Edit Profile
                </h3>
                <button
                  onClick={onClose}
                  className="text-xl hover:text-red-400 transition"
                >
                  ×
                </button>
              </div>

              {/* Message */}
              {message && (
                <p
                  className={`text-sm mb-4 text-center ${
                    message.includes("✅")
                      ? "text-green-400"
                      : message.includes("❌")
                        ? "text-red-400"
                        : "text-yellow-400"
                  }`}
                >
                  {message}
                </p>
              )}

              {/* Body */}
              <div className="space-y-6">
                {/* PROFILE IMAGE */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative group">
                    <img
                      src={userImg}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover
                             border-2 border-slate-500 shadow-md
                             transition group-hover:opacity-80"
                    />

                    {/* EDIT BADGE (always visible on mobile) */}
                    <label
                      htmlFor="profileImgInput"
                      className="absolute bottom-1 right-1
                             bg-blue-600 text-white
                             p-2 rounded-full text-xs cursor-pointer
                             shadow-md
                             sm:opacity-0 sm:group-hover:opacity-100
                             transition"
                    >
                      ✎
                    </label>
                  </div>

                  {/* MOBILE HINT */}
                  <span className="text-xs text-slate-400 sm:hidden">
                    Tap photo to change
                  </span>

                  <input
                    type="file"
                    id="profileImgInput"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {/* USERNAME */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm text-slate-300 mb-2"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={newUsername}
                    onChange={(e) => {
                      setMessage("");
                      setNewUsername(e.target.value);
                    }}
                    className="w-full rounded-md bg-slate-700 border border-slate-600
                           px-3 py-2 text-white
                           focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter new username"
                  />
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-700 transition"
                >
                  Close
                </button>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition
                         flex items-center justify-center"
                >
                  {isSaving ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

SettingsPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
};

export default SettingsPopup;
