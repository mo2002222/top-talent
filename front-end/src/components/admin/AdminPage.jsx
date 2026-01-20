import { useState, useEffect } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminPage = () => {
  // ===== Existing states =====
  const [snippetText, setSnippetText] = useState("");
  const [img, setImg] = useState(null);
  const [messageFileChange, setMessageFileChange] = useState("");
  const [numOfUsers, setNumOfUsers] = useState(0);
  const [numOfPosts, setNumOfPosts] = useState(0);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // ===== Moderation states =====
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // ===== Handlers =====
  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    setImg(selectedFile);
  };

  const handleAddSnippet = async () => {
    if (!snippetText || !img) {
      setMessageFileChange("please add snippet text - and image");
      return;
    }

    const formData = new FormData();
    formData.append("file", img);
    formData.append("snippet", snippetText);

    try {
      const response = await fetch(`${BACKEND_URL}/local/admin/add-snippet`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setMessageFileChange("Error adding snippet");
      } else {
        setMessageFileChange("snippet added successfully");
        setSnippetText("");
        setImg(null);
      }
    } catch (error) {
      console.error("Error adding snippet:", error);
      setMessageFileChange("Error adding snippet");
    }
  };

  // ===== Fetch stats =====
  useEffect(() => {
    const fetchUsersAndPosts = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/local/get-num-of-users&posts`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await res.json();
        setNumOfUsers(data.nuberOfUsers);
        setNumOfPosts(data.numberOfPosts);
      } catch (error) {
        console.log(error.message);
      }
    };

    fetchUsersAndPosts();
  }, []);

  // ===== Fetch reported posts =====
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingReports(true);
        const res = await fetch(`${BACKEND_URL}/local/admin/reports`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        setReports(data || []);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, []);

  // ===== Fetch moderation notifications =====
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const res = await fetch(`${BACKEND_URL}/local/notifications`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        console.log(data);

        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  // ===== Moderation actions =====
  const handleApprovePost = async (postId) => {
    try {
      await fetch(`${BACKEND_URL}/local/admin/posts/${postId}/approve`, {
        method: "POST",
        credentials: "include",
      });

      setNotifications((prev) => prev.filter((n) => n.postId !== postId));
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await fetch(`${BACKEND_URL}/local/admin/posts/${postId}/delete`, {
        method: "POST",
        credentials: "include",
      });

      setNotifications((prev) => prev.filter((n) => n.postId !== postId));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleMarkReportReviewed = async (reportId) => {
    try {
      await fetch(
        `${BACKEND_URL}/local/admin/reports/${reportId}/mark-reviewed`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      setReports((prev) => prev.filter((r) => r._id !== reportId));
    } catch (err) {
      console.error("Failed to mark report reviewed", err);
    }
  };

  // ===== Render =====
  return (
    <div className="admin-page flex gap-6 flex-col items-start ps-4 pt-4 bg-gray-900 text-white min-h-screen w-full">
      {/* ===== Snippets ===== */}
      <div className="snipts flex flex-row gap-2 items-center px-4 py-3 bg-slate-700 rounded-md w-full">
        <p
          className={`${
            messageFileChange.includes("Error")
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {messageFileChange}
        </p>

        <label htmlFor="snippets">Add snippet:</label>

        <input
          type="text"
          id="snippets"
          value={snippetText}
          onChange={(e) => setSnippetText(e.target.value)}
          className="ms-2 border px-3 py-1 bg-transparent rounded-md"
        />

        <input type="file" onChange={handleInputChange} />

        <button
          className="bg-green-700 px-4 py-1 rounded-md"
          onClick={handleAddSnippet}
        >
          Add
        </button>
      </div>

      {/* ===== Stats ===== */}
      <div className="flex gap-4">
        <div className="bg-slate-700 px-4 py-2 rounded-md">
          <p>
            Number of users: <span className="text-red-400">{numOfUsers}</span>
          </p>
        </div>

        <div className="bg-slate-700 px-4 py-2 rounded-md">
          <p>
            Number of posts: <span className="text-red-400">{numOfPosts}</span>
          </p>
        </div>
      </div>

      {/* ===== Moderation Dashboard ===== */}
      <div className="notifications w-full mt-6">
        <h2 className="text-2xl font-bold mb-4">Moderation Notifications</h2>

        {loadingNotifications && <p className="text-gray-400">Loading...</p>}

        {!loadingNotifications && notifications.length === 0 && (
          <p className="text-gray-400">No notifications</p>
        )}

        <div className="flex flex-col gap-3 w-full">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-md w-full ${
                n.type === "flagged"
                  ? "bg-red-800"
                  : n.type === "approved"
                    ? "bg-green-800"
                    : "bg-yellow-700"
              }`}
            >
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-gray-200">
                {new Date(n.createdAt).toLocaleString()}
              </p>

              <div className="flex gap-3 mt-3">
                <a
                  href={n.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-black px-3 py-1 rounded-md text-sm"
                >
                  View Post
                </a>

                <button
                  className="bg-green-600 px-3 py-1 rounded-md text-sm"
                  onClick={() => handleApprovePost(n.postId)}
                >
                  Approve
                </button>

                <button
                  className="bg-red-600 px-3 py-1 rounded-md text-sm"
                  onClick={() => handleDeletePost(n.postId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Reported Posts ===== */}
      {/* ===== Content Reports ===== */}
      <div className="reports w-full mt-8">
        <h2 className="text-2xl font-bold mb-4">Content Reports</h2>

        {loadingReports && <p className="text-gray-400">Loading...</p>}

        {!loadingReports && reports.length === 0 && (
          <p className="text-gray-400">No reports</p>
        )}

        <div className="flex flex-col gap-3">
          {reports.length > 0
            ? reports.map((r) => (
                <div
                  key={r._id}
                  className="bg-slate-800 p-4 rounded-md border border-red-700"
                >
                  <p className="font-semibold text-red-400">
                    Reason: {r.reason}
                  </p>

                  {r.message && (
                    <p className="text-gray-300 mt-1">Message: {r.message}</p>
                  )}

                  {r.email && (
                    <p className="text-gray-400 text-sm mt-1">
                      Reporter Email: {r.email}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <a
                      href={`/post/${r.postId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-black px-3 py-1 rounded-md text-sm"
                    >
                      View Post
                    </a>

                    <button
                      className="bg-green-700 px-3 py-1 rounded-md text-sm"
                      onClick={() => handleMarkReportReviewed(r._id)}
                    >
                      Mark as Reviewed
                    </button>
                  </div>
                </div>
              ))
            : "No reports found."}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
