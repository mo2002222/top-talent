import { useState } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setStatus("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await fetch(`${BACKEND_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || "Failed to send message.");
      } else {
        setStatus("Message sent successfully. We will contact you soon.");
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Contact Us</h2>

        {status && <p className="mb-3 text-sm text-yellow-400">{status}</p>}

        <label className="block mb-2 text-sm">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
        />

        <label className="block mb-2 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
        />

        <label className="block mb-2 text-sm">Message</label>
        <textarea
          rows="5"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-gray-700 border border-gray-600"
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
