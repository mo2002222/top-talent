import { useState, useContext } from "react";
import UserContext from "../authContext";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const Login = () => {
  const { setRefreshMainApi, refreshMainApi } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/login-user`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (response.status === 200 || data.token) {
        setRefreshMainApi(!refreshMainApi);
        setIsLoading(false);
        setErrorMessage("");
        setSuccessMessage("Login successful!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else if (data.message === "Invalid credentials") {
        setErrorMessage("Please check your email and password.");
        setSuccessMessage("");
        setIsLoading(false);
      } else {
        setErrorMessage("Login failed. Please try again.");
        setSuccessMessage("");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error while logging in:", error);
      setErrorMessage("Something went wrong. Try again later.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // send the token to backend
        const res = await fetch(`${BACKEND_URL}/auth/google/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
          credentials: "include", // so cookie is saved
        });

        const data = await res.json();
        if (res.ok || data.message === "Google authentication successful") {
          console.log("✅ Google login success:", data);
          setRefreshMainApi(!refreshMainApi);
          setIsLoading(false);
          setErrorMessage("");
          setSuccessMessage("Login successful!");
          setTimeout(() => {
            navigate("/");
          }, 3000);
        } else {
          alert(data.message || "Google login failed");
        }
      } catch (err) {
        console.error("Error in Google login:", err);
      }
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-[#1e2a44] border border-slate-700 rounded-2xl shadow-2xl p-8 text-white">
        {/* HEADER */}
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>

        {/* Success / Error Alerts */}
        {successMessage && (
          <div
            className="mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2
                        bg-green-900/30 text-green-400 border border-green-700"
          >
            ✅ {successMessage}
          </div>
        )}
        {errorMessage && (
          <div
            className="mb-4 px-4 py-2 rounded-lg text-sm flex items-center gap-2
                        bg-red-900/30 text-red-400 border border-red-700"
          >
            ❌ {errorMessage}
          </div>
        )}

        {/* Form Inputs */}
        <div className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                     px-4 py-2 text-white placeholder-gray-400
                     focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                     px-4 py-2 text-white placeholder-gray-400
                     focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700
                   text-white font-medium py-2 rounded-lg transition"
        >
          {isLoading ? (
            <div className="flex space-x-1 items-center justify-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          ) : (
            "Login"
          )}
        </button>

        {/* OR Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-600"></div>
          <span className="px-3 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-slate-600"></div>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3
                   bg-slate-800 border border-slate-600 rounded-lg py-2
                   hover:bg-slate-700 transition"
        >
          <FcGoogle className="text-xl" />
          <span className="text-gray-200 font-medium">
            Continue with Google
          </span>
        </button>

        {/* Register Redirect */}
        <p className="text-center text-sm mt-6 text-gray-400">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
