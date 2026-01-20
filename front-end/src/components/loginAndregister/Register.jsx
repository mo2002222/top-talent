import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import UserContext from "../authContext";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Register = () => {
  const navigate = useNavigate();
  const { setRefreshMainApi, refreshMainApi } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const GOOGLE_CLIENT_ID =
    "294640405059-77kd63i052t0kkjpp6476lp0sjdcpt0i.apps.googleusercontent.com";

  const [formData, setFormData] = useState({
    username: "",
    Email: "",
    Password: "",
    role: "",
    country: "",
  });

  const formRef = useRef(formData);

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value.trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    formRef.current = newData; // keep ref in sync
    setMessage("");
  };
  const handleConfirmPassword = (e) => {
    if (e.target.value !== formData.Password) {
      setMessage("Passwords don’t match");
      setIsSuccess(false);
    } else {
      setMessage("");
    }
  };

  const handleSubmit = async () => {
    if (!validateEmail(formData.Email)) {
      setMessage("Please enter a valid email address");
      setIsSuccess(false);
      return;
    }

    if (!formData.Password) {
      setMessage("Password is required");
      setIsSuccess(false);
      return;
    }

    // ✅ Password validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!strongPasswordRegex.test(formData.Password)) {
      setMessage(
        "Password must be at least 8 characters include uppercase, lowercase, number, and special character",
      );
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/register-new-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log(data);

      if (data.message === "User already exists") {
        setMessage("User already exists");
        setIsSuccess(false);
      } else if (
        data.message ===
        "Password must be at least 8 characters include uppercase, lowercase, number, and special character"
      ) {
        setMessage(
          "Password must be at least 8 characters include uppercase, lowercase, number, and special character",
        );
        setIsSuccess(false);
      } else if (data.message === "Invalid email address") {
        setMessage("Invalid email address");
        setIsSuccess(false);
      } else if (data.message && !data.error) {
        setMessage("User registered successfully!");
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error while fetching API", error);
      setMessage("Something went wrong. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        {
          theme: "outline",
          size: "large",
          text: "continue_with", // 👈 IMPORTANT
        },
      );
    } else {
      console.error("Google script not loaded");
    }
  }, []);

  const handleCredentialResponse = async (response) => {
    console.log("do");

    // 👇 this is where the id_token comes from
    const access_token = response.credential;
    const role = formRef.current?.role || "";
    const country = formRef.current?.country || "";

    try {
      const res = await fetch(`${BACKEND_URL}/auth/google/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        //send role and country in body
        body: JSON.stringify({ access_token, role, country }),
        credentials: "include", // so cookie is saved
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Google register success:", data);
        setIsLoading(false);
        setMessage("Registration successful! Redirecting to home...");
        setIsSuccess(true);
        setRefreshMainApi(!refreshMainApi);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else if (data.message === "User already registered, please log in.") {
        alert("You already have an account. Please log in.");
        navigate("/login");
      } else {
        console.error("Google register failed:", data);
      }
    } catch (error) {
      console.error("Error during Google register:", error);
    }
  };

  const handleGoogleRegister = () => {
    console.log("Google register clicked");
    // if (!window.google) return setMessage("Google API not loaded yet");
    // Add Google OAuth logic here
    // google.accounts.id.prompt();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md bg-[#1e2a44] border border-slate-700 rounded-2xl shadow-2xl p-8 text-white">
        {/* HEADER */}
        <h2 className="text-2xl font-bold text-center mb-2">
          Create an Account
        </h2>
        <p className="text-center text-sm text-gray-300 mb-6">
          Join the community
        </p>

        {/* ALERT */}
        {message && (
          <div
            className={`mb-5 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border
              ${
                isSuccess
                  ? "bg-green-900/30 text-green-400 border-green-700"
                  : "bg-red-900/30 text-red-400 border-red-700"
              }`}
          >
            <span>{isSuccess ? "✅" : "❌"}</span>
            <span>{message}</span>
          </div>
        )}

        {/* FORM */}
        <div className="space-y-4 mb-6">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                       px-4 py-2 text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="email"
            name="Email"
            placeholder="Email"
            value={formData.Email}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                       px-4 py-2 text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                       px-4 py-2 text-gray-300
                       focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select a country</option>
            <optgroup label="Europe">
              <option value="albania">Albania</option>
              <option value="andorra">Andorra</option>
              <option value="armenia">Armenia</option>
              <option value="austria">Austria</option>
              <option value="azerbaijan">Azerbaijan</option>
              <option value="belarus">Belarus</option>
              <option value="belgium">Belgium</option>
              <option value="bosnia-and-herzegovina">
                Bosnia and Herzegovina
              </option>
              <option value="bulgaria">Bulgaria</option>
              <option value="croatia">Croatia</option>
              <option value="cyprus">Cyprus</option>
              <option value="czech-republic">Czech Republic</option>
              <option value="denmark">Denmark</option>
              <option value="estonia">Estonia</option>
              <option value="finland">Finland</option>
              <option value="france">France</option>
              <option value="georgia">Georgia</option>
              <option value="germany">Germany</option>
              <option value="greece">Greece</option>
              <option value="hungary">Hungary</option>
              <option value="iceland">Iceland</option>
              <option value="ireland">Ireland</option>
              <option value="italy">Italy</option>
              <option value="kazakhstan">Kazakhstan</option>
              <option value="kosovo">Kosovo</option>
              <option value="latvia">Latvia</option>
              <option value="liechtenstein">Liechtenstein</option>
              <option value="lithuania">Lithuania</option>
              <option value="luxembourg">Luxembourg</option>
              <option value="malta">Malta</option>
              <option value="moldova">Moldova</option>
              <option value="monaco">Monaco</option>
              <option value="montenegro">Montenegro</option>
              <option value="netherlands">Netherlands</option>
              <option value="north-macedonia">North Macedonia</option>
              <option value="norway">Norway</option>
              <option value="poland">Poland</option>
              <option value="portugal">Portugal</option>
              <option value="romania">Romania</option>
              <option value="russia">Russia</option>
              <option value="san-marino">San Marino</option>
              <option value="serbia">Serbia</option>
              <option value="slovakia">Slovakia</option>
              <option value="slovenia">Slovenia</option>
              <option value="spain">Spain</option>
              <option value="sweden">Sweden</option>
              <option value="switzerland">Switzerland</option>
              <option value="turkey">Turkey</option>
              <option value="ukraine">Ukraine</option>
              <option value="united-kingdom">United Kingdom</option>
              <option value="vatican-city">Vatican City</option>
            </optgroup>

            <optgroup label="Africa">
              <option value="algeria">Algeria</option>
              <option value="angola">Angola</option>
              <option value="benin">Benin</option>
              <option value="botswana">Botswana</option>
              <option value="burkina-faso">Burkina Faso</option>
              <option value="burundi">Burundi</option>
              <option value="cabo-verde">Cabo Verde</option>
              <option value="cameroon">Cameroon</option>
              <option value="central-african-republic">
                Central African Republic
              </option>
              <option value="chad">Chad</option>
              <option value="comoros">Comoros</option>
              <option value="congo">Congo</option>
              <option value="democratic-republic-of-congo">DR Congo</option>
              <option value="djibouti">Djibouti</option>
              <option value="egypt">Egypt</option>
              <option value="equatorial-guinea">Equatorial Guinea</option>
              <option value="eritrea">Eritrea</option>
              <option value="eswatini">Eswatini</option>
              <option value="ethiopia">Ethiopia</option>
              <option value="gabon">Gabon</option>
              <option value="gambia">Gambia</option>
              <option value="ghana">Ghana</option>
              <option value="guinea">Guinea</option>
              <option value="guinea-bissau">Guinea-Bissau</option>
              <option value="ivory-coast">Ivory Coast</option>
              <option value="kenya">Kenya</option>
              <option value="lesotho">Lesotho</option>
              <option value="liberia">Liberia</option>
              <option value="libya">Libya</option>
              <option value="madagascar">Madagascar</option>
              <option value="malawi">Malawi</option>
              <option value="mali">Mali</option>
              <option value="mauritania">Mauritania</option>
              <option value="mauritius">Mauritius</option>
              <option value="morocco">Morocco</option>
              <option value="mozambique">Mozambique</option>
              <option value="namibia">Namibia</option>
              <option value="niger">Niger</option>
              <option value="nigeria">Nigeria</option>
              <option value="rwanda">Rwanda</option>
              <option value="senegal">Senegal</option>
              <option value="seychelles">Seychelles</option>
              <option value="sierra-leone">Sierra Leone</option>
              <option value="somalia">Somalia</option>
              <option value="south-africa">South Africa</option>
              <option value="south-sudan">South Sudan</option>
              <option value="sudan">Sudan</option>
              <option value="tanzania">Tanzania</option>
              <option value="togo">Togo</option>
              <option value="tunisia">Tunisia</option>
              <option value="uganda">Uganda</option>
              <option value="zambia">Zambia</option>
              <option value="zimbabwe">Zimbabwe</option>
            </optgroup>

            <optgroup label="Asia">
              <option value="afghanistan">Afghanistan</option>
              <option value="armenia">Armenia</option>
              <option value="azerbaijan">Azerbaijan</option>
              <option value="bahrain">Bahrain</option>
              <option value="bangladesh">Bangladesh</option>
              <option value="bhutan">Bhutan</option>
              <option value="brunei">Brunei</option>
              <option value="cambodia">Cambodia</option>
              <option value="china">China</option>
              <option value="georgia">Georgia</option>
              <option value="india">India</option>
              <option value="indonesia">Indonesia</option>
              <option value="iran">Iran</option>
              <option value="iraq">Iraq</option>
              <option value="israel">Israel</option>
              <option value="japan">Japan</option>
              <option value="jordan">Jordan</option>
              <option value="kazakhstan">Kazakhstan</option>
              <option value="kuwait">Kuwait</option>
              <option value="kyrgyzstan">Kyrgyzstan</option>
              <option value="laos">Laos</option>
              <option value="lebanon">Lebanon</option>
              <option value="malaysia">Malaysia</option>
              <option value="maldives">Maldives</option>
              <option value="mongolia">Mongolia</option>
              <option value="myanmar">Myanmar</option>
              <option value="nepal">Nepal</option>
              <option value="north-korea">North Korea</option>
              <option value="oman">Oman</option>
              <option value="pakistan">Pakistan</option>
              <option value="palestine">Palestine</option>
              <option value="philippines">Philippines</option>
              <option value="qatar">Qatar</option>
              <option value="saudi-arabia">Saudi Arabia</option>
              <option value="singapore">Singapore</option>
              <option value="south-korea">South Korea</option>
              <option value="sri-lanka">Sri Lanka</option>
              <option value="syria">Syria</option>
              <option value="tajikistan">Tajikistan</option>
              <option value="thailand">Thailand</option>
              <option value="timor-leste">Timor-Leste</option>
              <option value="turkmenistan">Turkmenistan</option>
              <option value="united-arab-emirates">United Arab Emirates</option>
              <option value="uzbekistan">Uzbekistan</option>
              <option value="vietnam">Vietnam</option>
              <option value="yemen">Yemen</option>
            </optgroup>

            <optgroup label="Americas">
              <option value="argentina">Argentina</option>
              <option value="bahamas">Bahamas</option>
              <option value="barbados">Barbados</option>
              <option value="belize">Belize</option>
              <option value="bolivia">Bolivia</option>
              <option value="brazil">Brazil</option>
              <option value="canada">Canada</option>
              <option value="chile">Chile</option>
              <option value="colombia">Colombia</option>
              <option value="costa-rica">Costa Rica</option>
              <option value="cuba">Cuba</option>
              <option value="dominican-republic">Dominican Republic</option>
              <option value="ecuador">Ecuador</option>
              <option value="el-salvador">El Salvador</option>
              <option value="guatemala">Guatemala</option>
              <option value="guyana">Guyana</option>
              <option value="haiti">Haiti</option>
              <option value="honduras">Honduras</option>
              <option value="jamaica">Jamaica</option>
              <option value="mexico">Mexico</option>
              <option value="nicaragua">Nicaragua</option>
              <option value="panama">Panama</option>
              <option value="paraguay">Paraguay</option>
              <option value="peru">Peru</option>
              <option value="suriname">Suriname</option>
              <option value="trinidad-and-tobago">Trinidad and Tobago</option>
              <option value="united-states">United States</option>
              <option value="uruguay">Uruguay</option>
              <option value="venezuela">Venezuela</option>
            </optgroup>

            <optgroup label="Oceania">
              <option value="australia">Australia</option>
              <option value="fiji">Fiji</option>
              <option value="kiribati">Kiribati</option>
              <option value="marshall-islands">Marshall Islands</option>
              <option value="micronesia">Micronesia</option>
              <option value="nauru">Nauru</option>
              <option value="new-zealand">New Zealand</option>
              <option value="palau">Palau</option>
              <option value="papua-new-guinea">Papua New Guinea</option>
              <option value="samoa">Samoa</option>
              <option value="solomon-islands">Solomon Islands</option>
              <option value="tonga">Tonga</option>
              <option value="tuvalu">Tuvalu</option>
              <option value="vanuatu">Vanuatu</option>
            </optgroup>
          </select>

          <input
            type="password"
            name="Password"
            placeholder="Password"
            value={formData.Password}
            onChange={handleChange}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                       px-4 py-2 text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            onChange={handleConfirmPassword}
            className="w-full rounded-lg bg-slate-800 border border-slate-600
                       px-4 py-2 text-white placeholder-gray-400
                       focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* ROLE */}
        <div className="mb-6">
          <p className="text-sm text-gray-300 mb-2 text-center">Account type</p>

          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="coach"
                onChange={handleChange}
                className="peer hidden"
              />
              <div
                className="border border-slate-600 rounded-lg px-3 py-2 text-center
                           peer-checked:border-blue-500
                           peer-checked:bg-blue-900/30"
              >
                Coach / Club
              </div>
            </label>

            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="user"
                onChange={handleChange}
                className="peer hidden"
              />
              <div
                className="border border-slate-600 rounded-lg px-3 py-2 text-center
                           peer-checked:border-blue-500
                           peer-checked:bg-blue-900/30"
              >
                Regular User
              </div>
            </label>
          </div>
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700
                     text-white font-medium py-2 rounded-lg transition"
        >
          {isLoading ? (
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          ) : (
            "Create Account"
          )}
        </button>

        {/* DIVIDER */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-600" />
          <span className="px-3 text-gray-400 text-xs">OR</span>
          <div className="flex-grow border-t border-slate-600" />
        </div>

        {/* GOOGLE */}
        <button
          id="googleBtn"
          onClick={handleGoogleRegister}
          className="w-full"
        >
          <FcGoogle className="text-xl text-center" />
          <span className="text-gray-200 font-medium">
            Continue with Google
          </span>
        </button>

        {/* FOOTER */}
        <p className="text-center text-sm mt-6 text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
