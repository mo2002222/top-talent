import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const FilteringPopup = ({ isOpen, onClose, filtringData, setFiltringData, onApply }) => {
  useEffect(() => {
    // Reset the filter data when the popup opens
    if (isOpen) {
      setFiltringData({
        country: "",
        league: "",
        ageRange: "",
        mostLiked: false,
        topRated: false,
      });
    }
  }, [isOpen, setFiltringData]);

  if (!isOpen) return null;

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const handleCompClick = (e) => e.stopPropagation();

  const handleApply = (e) => {
    e.preventDefault();
    if (onApply) onApply(filtringData);
  };

  return (
    <AnimatePresence>
      <motion.div
      initial={{ opacity: 0}}
          animate={{ opacity: 1}}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
      >
        <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-2xl rounded-2xl w-[90%] max-w-md p-6 text-white"
        onClick={handleCompClick}
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white/90">Filter Options</h2>

        <form className="space-y-5">
          {/* COUNTRY */}
          <div>
            <label htmlFor="country" className="block mb-2 text-sm font-semibold text-gray-300">
              Country
            </label>
            <select
              id="country"
              value={filtringData.country || ""}
              onChange={(e) => setFiltringData((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full p-2.5 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select a country</option>
              <optgroup label="🇪🇺 Europe">
                <option value="England">England</option>
                <option value="Spain">Spain</option>
                <option value="Germany">Germany</option>
                <option value="Italy">Italy</option>
                <option value="France">France</option>
                <option value="Portugal">Portugal</option>
                <option value="Netherlands">Netherlands</option>
              </optgroup>
              <optgroup label="🇳🇦 North America">
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
                <option value="Mexico">Mexico</option>
              </optgroup>
              <optgroup label="🌍 Africa">
                <option value="Egypt">Egypt</option>
                <option value="Morocco">Morocco</option>
                <option value="Nigeria">Nigeria</option>
              </optgroup>
            </select>
          </div>

          {/* LEAGUE */}
          <div>
            <label htmlFor="league" className="block mb-2 text-sm font-semibold text-gray-300">
              League
            </label>
            <select
              id="league"
              value={filtringData.league || ""}
              onChange={(e) => setFiltringData((prev) => ({ ...prev, league: e.target.value }))}
              className="w-full p-2.5 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select a league</option>
              <option value="premier-league">Premier League</option>
              <option value="la-liga">La Liga</option>
              <option value="serie-a">Serie A</option>
              <option value="ligue-1">Ligue 1</option>
              <option value="bundesliga">Bundesliga</option>
            </select>
          </div>

          {/* AGE RANGE */}
          <div>
            <label htmlFor="ageRange" className="block mb-2 text-sm font-semibold text-gray-300">
              Age Range
            </label>
            <select
              id="ageRange"
              value={filtringData.ageRange || ""}
              onChange={(e) => setFiltringData((prev) => ({ ...prev, ageRange: e.target.value }))}
              className="w-full p-2.5 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select age</option>
              <option value="0-15">To 15</option>
              <option value="15-20">15–20</option>
              <option value="21+">Above 20</option>
            </select>
          </div>

          {/* CHECKBOXES */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtringData.mostLiked}
                onChange={(e) =>
                  setFiltringData((prev) => ({ ...prev, mostLiked: e.target.checked }))
                }
                className="accent-green-500 h-4 w-4"
              />
              <span>Most liked</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtringData.topRated}
                onChange={(e) =>
                  setFiltringData((prev) => ({ ...prev, topRated: e.target.checked }))
                }
                className="accent-blue-500 h-4 w-4"
              />
              <span>Top rated</span>
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleApply}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition-all duration-200"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FilteringPopup;
