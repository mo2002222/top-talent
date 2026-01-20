import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext } from "react";
import userContext from "../authContext.jsx";

const ChatingCir = () => {
  const { user, loading } = useContext(userContext);

  const path = window.location.pathname;
  if (path === "/login" || path === "/register") {
    return null;
  }

  if (!loading && !user) {
    return;
  }

  return (
    <div className="p-2 rounded-full cursor-pointer flex items-center justify-center bg-lime-800/80 hover:bg-lime-900 text-white shadow-2xl transition-all duration-300 hover:scale-105 md:w-12 md:h-12 h-9 w-9">
      <FontAwesomeIcon icon={faMessage} />
    </div>
  );
};

export default ChatingCir;
