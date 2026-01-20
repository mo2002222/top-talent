import { useState, useEffect } from "react";
import PropTypes from "prop-types";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const EditPost = ({ isOpen, onClose, postDetails,setRefreshCmtEdit, setRefreshPost, copmPlace }) => {
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [updatedData, setUpdatedData] = useState({
    playerNationality: postDetails.playerNationality || '',
    playerName: postDetails.playerName || '',
    playerLeague: postDetails.playerLeague || '',
    playerAge: postDetails.playerAge || '',
    title: postDetails.title || '',
    description: postDetails.description || '',
  });

  useEffect(() => {
    if (!isOpen) return;

    const preventScroll = (e) => e.preventDefault();

    const overlay = document.querySelector('.overlay');
    const popup = document.querySelector('.popup');

    overlay?.addEventListener('wheel', preventScroll, { passive: false });
    popup?.addEventListener('wheel', preventScroll, { passive: false });

    return () => {
      overlay?.removeEventListener('wheel', preventScroll, { passive: false });
      popup?.removeEventListener('wheel', preventScroll, { passive: false });
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMessage('');
    setUpdatedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const noChanges = Object.keys(updatedData).every(
      (key) => updatedData[key] === postDetails[key]
    );

    if (noChanges) {
      setMessage('No changes made.');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${BACKEND_URL}/edit-post/${postDetails._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        setMessage('Edit failed, please try again.');
      } else {
        setRefreshPost(prev => !prev);
        setTimeout(() =>{
          setRefreshCmtEdit(prev => !prev)
        },1000)
        onClose();
      }
    } catch (error) {
      console.error(error);
      setMessage('Edit failed, please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputFields = [
    { label: 'Title', name: 'title', type: 'text' },
    { label: 'Player Name', name: 'playerName', type: 'text' },
    { label: 'Player Nationality', name: 'playerNationality', type: 'text' },
    { label: 'Player League', name: 'playerLeague', type: 'text' },
    { label: 'Player Age', name: 'playerAge', type: 'text' },
    { label: 'Description', name: 'description', type: 'textarea' },
  ];

  return (
    <>
      {/* Overlay */}
      <div className="overlay fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-50" onClick={onClose}></div>

      {/* Popup */}
      <div className="popup fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[#1f2c46] to-[#162038] p-4 rounded-2xl w-[340px] sm:w-[420px] z-50 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#3b4a6b] pb-3 mb-5">
          <h3 className="text-xl font-bold tracking-wide">
            {copmPlace === 'post' ? 'Edit Post' : 'Edit Profile Settings'}
          </h3>
          <button
            onClick={onClose}
            className="text-3xl font-bold text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>

        {/* Message */}
        {message && <div className="text-center text-red-400 mb-4 font-medium">{message}</div>}

        {/* Body */}
        <div className="space-y-4">
          {inputFields.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className="block text-sm font-semibold mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={updatedData[field.name]}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#2c3b5d] border border-[#3b4a6b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  value={updatedData[field.name]}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl bg-[#2c3b5d] border border-[#3b4a6b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  placeholder={`Enter ${field.label.toLowerCase()}...`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-xl text-white font-semibold transition-colors shadow-md"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold flex items-center justify-center shadow-md transition-all"
          >
            {isSaving ? (
              <div className="flex space-x-[2px] items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2.5 h-2.5 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            ) : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

EditPost.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  postDetails: PropTypes.object.isRequired,
  setRefreshPost: PropTypes.func.isRequired,
  copmPlace: PropTypes.string,
};

export default EditPost;
