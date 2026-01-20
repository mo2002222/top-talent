const FullSnippetModal = ({ isOpen, snippet, onClose }) => {
  if (!snippet || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center
               bg-black/60 backdrop-blur-md px-3"
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mt-14 w-full max-w-3xl
                 bg-slate-900/95 text-white
                 border border-slate-700
                 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-gray-100">Preview</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl transition"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto space-y-5 no-scrollbar">
          {/* TEXT */}
          <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">
            {snippet.snippets}
          </p>

          {/* IMAGE */}
          {snippet.img && (
            <div className="rounded-xl overflow-hidden bg-slate-800">
              <img
                src={snippet.img}
                alt="snippet"
                className="w-full max-h-[360px] object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullSnippetModal;
