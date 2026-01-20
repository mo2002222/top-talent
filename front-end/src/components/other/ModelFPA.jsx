// components/Modal.jsx

const ModelFPA = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => onClose()}
    >
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-black text-center">
          {title}
        </h2>
        <div className="text-gray-700 mb-6">{children}</div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ModelFPA;
