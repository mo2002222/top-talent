import PropTypes from "prop-types";
import leagueLogos from "../other/leaguesLogo.json";
const defaultLeague = "/defaultLeague.png";
import countries from "../other/countries.json";
const PlayerInfoPopup = ({ isOpen, onClose, player }) => {
  if (!isOpen) return null;

  const getFlag = (country) => {
    const code = countries[country.toLowerCase()];
    return code
      ? `https://flagsapi.com/${code}/flat/64.png`
      : "/defaultLeague.png"; // default flag
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 z-50 "
        onClick={onClose}
      ></div>

      {/* Popup */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-[#1e2a44] sm-p-6 p-4 rounded-lg w-[350px] z-50 shadow-lg text-white m-1 sm:m-0 "
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#3b4a6b] pb-3 mb-5">
          <h3 className="text-lg font-semibold">Player Info</h3>
          <button onClick={onClose} className="text-2xl font-bold">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Name: </span>
            <span>{player.playerName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">Nationality: </span>
            <span className="flex gap-1 items-center">
              {player.playerNationality}{" "}
              {
                <img
                  src={getFlag(player.playerNationality)}
                  className="w-6 h-6 object-contain rounded-sm"
                  alt={player.playerNationality}
                />
              }
            </span>
          </div>
          <div>
            <span className="font-semibold">League: </span>
            <span>{player.playerLeague}</span>{" "}
            {leagueLogos[player.playerLeague] && (
              <img
                src={leagueLogos[player.playerLeague] || defaultLeague}
                alt={player.playerLeague}
                className="inline-block w-6 h-6 ml-1 object-contain bg-slate-50 rounded-sm"
              />
            )}
          </div>
          <div>
            <span className="font-semibold">Age: </span>
            <span>{player.playerAge}</span>
          </div>
          {player.description && (
            <div>
              <span className="font-semibold">Description: </span>
              <p>{player.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md "
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default PlayerInfoPopup;

PlayerInfoPopup.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  player: PropTypes.object.isRequired,
};
