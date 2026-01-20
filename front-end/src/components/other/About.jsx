const AboutPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">
      {/* Modal */}
      <div className="mt-16 m-3 w-full max-w-3xl bg-slate-800 text-white rounded-lg shadow-lg p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h1 className="text-3xl font-bold mb-6">About Us</h1>

        <p className="text-gray-300 mb-4">
          Our platform is dedicated to discovering and showcasing football
          talents from all around the world. We believe that great players can
          be found anywhere — from well-known leagues to local and amateur
          competitions.
        </p>

        <p className="text-gray-300 mb-4">
          Users can share football-related videos and images that highlight
          player skills, match moments, and individual performances. Our goal is
          to give talented players the visibility they deserve.
        </p>

        <p className="text-gray-300 mb-4">
          We do not host or stream full matches. All content is uploaded by
          users and is subject to moderation to ensure it aligns with our
          community guidelines and respects intellectual property rights.
        </p>

        <p className="text-gray-300 mb-4">
          Automated tools and human review are used to help identify and remove
          content that violates our policies, including non-football or
          inappropriate material.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">Our Mission</h2>

        <p className="text-gray-300">
          Our mission is to create a trusted platform where football talent can
          be discovered, promoted, and appreciated — regardless of geography or
          exposure.
        </p>
      </div>
    </div>
  );
};

export default AboutPopup;
