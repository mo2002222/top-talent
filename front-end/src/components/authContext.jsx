import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [userImg, setUserImg] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshMainApi, setRefreshMainApi] = useState(false);
  const [userState, setUserState] = useState(false);

  const checkUser = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/is-user-authenticated`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (response.status === 401) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setUser(data.user);
      setUserImg(data.user.avatar);
    } catch (error) {
      console.error("Error checking user:", error);
    } finally {
      setLoading(false); // Ensure loading is set to false after fetch
    }
  };

  useEffect(() => {
    checkUser();
  }, [refreshMainApi]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setLoading,
        checkUser,
        setRefreshMainApi,
        refreshMainApi,
        userState,
        setUserState,
        userImg,
        setUserImg,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
