import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Home/Header";
import Sidebar from "../Home/Sidebar";
import MidSecotion from "../Home/MidSecotion";
import UserContext from "../authContext";
import RightSection from "../Home/RightSection";
import useNotificationStore from "../zustand";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const TopRated = () => {
  const { user, loading } = useContext(UserContext);
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topRatedTalents, setTopRatedTalents] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const navigate = useNavigate();
  const activeId = useNotificationStore((state) => state.activeId);

  // Example: Fetch your snippets and top-rated talents (same logic you use in RightSection)
  useEffect(() => {
    const fetchPosts = async () => {
      setIsPostsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/get-posts`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        setTopRatedTalents(data.topRatedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsPostsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const getSnippets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/get-snippets`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        setSnippets(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching snippets:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getSnippets();
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex items-center justify-center w-[70vh]">
          <div className="w-3/4 h-3/4 bg-gray-700 rounded-2xl shadow-lg p-6 animate-pulse flex flex-col">
            <div className="h-2/3 bg-gray-600 rounded-xl mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-[70px] bg-black border-b border-gray-800 z-50 flex items-center my-4">
        <Header userInfo={user} />
      </header>

      {/* Sidebar */}
      <aside
        className={`
        fixed top-[75px] left-0 bottom-0 
        w-16 md:w-16 lg:w-64
        border-r border-gray-800 
        overflow-y-auto scrollbar-hide ${activeId === "sidebar" ? "z-[410]" : "z-[0]"}
        no-scrollbar
      `}
      >
        <Sidebar username={user.username} />
      </aside>

      {/* Middle Section */}
      <main
        className="
        pt-[100px] [@media(min-width:1350px)]:px-1 lg:px-1 min-h-screen
        ml-16 md:ml-16 lg:ml-64
        mr-0 lg:mr-[320px] [@media(min-width:1350px)]:mr-[380px]
      "
      >
        {/* 👇 Pass right section data here */}
        <MidSecotion
          componentPlace="top-rate"
          showCompactRight
          snippets={snippets}
          topRatedTalents={topRatedTalents}
          isLoading={isLoading}
          isPostsLoading={isPostsLoading}
        />
      </main>

      {/* Right Section (visible only lg+) */}
      <aside
        className={`
        fixed top-[70px] right-0 bottom-0 
        [@media(min-width:1350px)]:w-[380px] lg:w-[320px]
        border-l border-gray-800 
        overflow-y-auto scrollbar-hide ${activeId === "rightsection" ? "z-[1000]" : "z-[0]"} pt-[25px] 
        hidden lg:block
        no-scrollbar
      `}
      >
        <RightSection
          snippets={snippets}
          topRatedTalents={topRatedTalents}
          isLoading={isLoading}
          isPostsLoading={isPostsLoading}
        />
      </aside>
    </div>
  );
};

export default TopRated;
