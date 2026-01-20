import { useState } from "react";
import { useParams } from "react-router-dom";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ReportContent = ({postId, onClose, isOpen}) => {
  const { postid } = useParams();

  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      setStatusMsg("Please select a reason for reporting.");
      return;
    }

    try {
      setLoading(true);
      setStatusMsg("");

      const res = await fetch(`${BACKEND_URL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          reason,
          message,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg(data.error || "Failed to submit report.");
      } else {
        setStatusMsg("Report submitted successfully. Thank you.");
        setReason("");
        setMessage("");
        setEmail("");
      }
    } catch (error) {
      setStatusMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!postId) return null;
  return (
    <div>
    <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm bg-opacity-50 z-50 "
        onClick={onClose}
      >
        </div> 
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      bg-[#1e2a44] sm-p-6 p-2 rounded-lg w-[350px] z-50 shadow-lg text-white m-1 sm:m-0 ">

      <div className="flex justify-between items-center border-b border-[#3b4a6b] pb-3 mb-5">
          <h3 className="text-lg font-semibold">Report Content</h3>
          <button onClick={onClose} className="text-2xl font-bold">×</button>
        </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-md w-full max-w-md"
      >
        {/* <h2 className="text-xl font-bold mb-4">Report Content</h2> */}

        {statusMsg && (
          <p className="mb-3 text-sm text-yellow-400">{statusMsg}</p>
        )}

        {/* Reason */}
        <label className="block mb-2 text-sm">Reason *</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
        >
          <option value="">Select reason</option>
          <option value="Non-football content">Non-football content</option>
          <option value="Copyright infringement">
            Copyright infringement
          </option>
          <option value="Inappropriate content">
            Inappropriate content
          </option>
          <option value="Harassment or abuse">
            Harassment or abuse
          </option>
          <option value="Other">Other</option>
        </select>

        {/* Message */}
        <label className="block mb-2 text-sm">Additional details</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows="4"
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="Optional"
        ></textarea>

        {/* Email */}
        <label className="block mb-2 text-sm">
          Your email (optional)
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
          placeholder="example@email.com"
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-md"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
    </div>
  );
};

export default ReportContent;
