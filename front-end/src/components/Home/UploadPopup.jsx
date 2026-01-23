import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faInfo, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fileContext } from "./MidSecotion";
import UserContext from "../authContext";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UploadPopup = ({ onClose, refreshPosts, setRefreshPosts }) => {
  const [files, setFiles] = useState(null); // FileList or null
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successState, setSuccessState] = useState("");
  const [failState, setFailState] = useState("");
  const [url, setUrl] = useState([]); // uploaded urls
  const [playerName, setPlayerName] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [playerNationality, setPlayerNationality] = useState("");
  const [playerLeague, setPlayerLeague] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { setUploadPopupState } = useContext(fileContext);
  const { user } = useContext(UserContext);

  const closeAll = () => {
    setUploadPopupState(false);
    onClose && onClose();
  };

  // file input change
  const handleChange = (e) => {
    setFiles(e.target.files);
    setFailState("");
    setSuccessState("");
    setUploadProgress(0);
  };

  // helper: check at least one video exists
  const hasVideoFile = (fileList) => {
    if (!fileList) return false;
    return Array.from(fileList).some((f) => f.type.startsWith("video/"));
  };

  // helper: validate durations for video files (< 600s)
  const validateVideoDurations = async (fileList) => {
    const filesArr = Array.from(fileList);
    for (const file of filesArr) {
      if (!file.type.startsWith("video/")) continue;

      // create a temporary video element to get duration
      const video = document.createElement("video");
      video.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      await new Promise((resolve, reject) => {
        const onLoaded = () => {
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        const onError = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load video metadata"));
        };
        video.onloadedmetadata = onLoaded;
        video.onerror = onError;
      });

      if (video.duration > 600) {
        return {
          ok: false,
          message:
            "A video exceeded 10 minutes (600s). Please choose a shorter video.",
        };
      }
    }
    return { ok: true };
  };

  // Combined upload and post function
  const handleUploadAndPost = async (e) => {
    e && e.preventDefault();
    setSuccessState("");
    setFailState("");
    setUploadProgress(0);

    // Validation
    if (!files || files.length === 0) {
      setFailState("Please select media files to upload.");
      return;
    }
    if (files.length < 2) {
      setFailState("You must choose at least 2 media files.");
      return;
    }
    if (files.length > 5) {
      setFailState("You can upload up to 5 media files only.");
      return;
    }
    if (!hasVideoFile(files)) {
      setFailState("You must include at least one video file.");
      return;
    }

    if (
      !title ||
      !playerName ||
      !playerAge ||
      !playerNationality ||
      !playerLeague ||
      !description
    ) {
      setFailState("Please fill all inputs before posting.");
      return;
    }

    // Validate video durations
    try {
      setSuccessState("Validating video durations...");
      setUploadProgress(10);
      const durResult = await validateVideoDurations(files);
      if (!durResult.ok) {
        setFailState(durResult.message);
        setUploadProgress(0);
        return;
      }
    } catch (err) {
      console.error("Video metadata error:", err);
      setFailState("Could not validate video durations. Try different files.");
      setUploadProgress(0);
      return;
    }

    // Start combined upload and post process
    setIsUploading(true);
    setSuccessState("Starting upload...");
    setUploadProgress(20);

    try {
      // Upload media files
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("file", f));

      // Simulate progress (in real app, you'd use XMLHttpRequest or fetch with progress tracking)
      // For demonstration, we'll simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 70) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      const response = await fetch(`${BACKEND_URL}/uploadVideo`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const data = await response.json();
        setIsUploading(false);
        setUploadProgress(0);
        setFailState(data?.message || "Upload failed. Please try again.");
        return;
      }

      const data = await response.json();
      const urls = Array.isArray(data)
        ? data.map((it) => it.url || it)
        : data.url
        ? [data.url]
        : [];
      
      setUrl(urls);
      setUploadProgress(80);
      setSuccessState("Files uploaded! Creating post...");

      // Prepare post data
      const newPost = {
        title,
        playerName,
        playerAge,
        playerNationality,
        playerLeague,
        videoUrl: urls,
        userId: user?._id,
        description,
      };

      // Post metadata
      const postResponse = await fetch(`${BACKEND_URL}/uploadPost`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      setUploadProgress(90);

      if (!postResponse.ok) {
        const postData = await postResponse.json();
        setIsUploading(false);
        setUploadProgress(0);
        setFailState(postData?.message || "Post creation failed.");
        return;
      }

      // Success
      setUploadProgress(100);
      setSuccessState("Post created successfully!");
      toast.success("Posted successfully!");

      // Reset and close
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setRefreshPosts && setRefreshPosts(!refreshPosts);
        setUploadPopupState(false);
      }, 1500);

    } catch (error) {
      console.error("Upload/Post error:", error);
      setIsUploading(false);
      setUploadProgress(0);
      setSuccessState("");
      setFailState("Upload failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm h-full z-50 flex items-center justify-center md:m-0 m-2"
      onClick={closeAll}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gradient-to-b from-gray-900 to-gray-800 border border-white/10 text-white rounded-2xl shadow-2xl w-[420px] p-6"
      >
        {/* close */}
        <button
          onClick={closeAll}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
          aria-label="Close upload popup"
          disabled={isUploading}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* header info bullets (animated) */}
        <div className="flex flex-col gap-2 text-xs text-gray-300 mb-4">
          {[
            "Choose your media files (2-5 files)",
            "Include at least one video (max 10 minutes)",
            "Fill all information below",
            "Click Upload & Post when ready",
          ].map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.18 }}
              className="flex items-center gap-2 bg-gray-800/40 px-3 py-1 rounded-lg"
            >
              <FontAwesomeIcon icon={faInfo} className="text-gray-300" />
              <span>{msg}</span>
            </motion.div>
          ))}
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
                className="bg-blue-500 h-2 rounded-full"
              />
            </div>
          </div>
        )}

        {/* animated success / fail messages */}
        <AnimatePresence>
          {successState && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="text-green-400 text-center border border-green-500/40 py-1 rounded-md mb-2 text-sm"
            >
              {successState}
            </motion.div>
          )}
          {failState && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="text-red-400 text-center border border-red-500/40 py-1 rounded-md mb-2 text-sm"
            >
              {failState}
            </motion.div>
          )}
        </AnimatePresence>

        {/* form */}
        <form
          className="flex flex-col gap-3"
          onSubmit={handleUploadAndPost}
          encType="multipart/form-data"
        >
          <input
            type="text"
            placeholder="Video title"
            className="bg-gray-800/70 p-2 rounded-md text-sm text-center placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={180}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            required
          />

          <label
            htmlFor="fileInput"
            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition text-sm ${
              isUploading
                ? "bg-gray-700/70"
                : "bg-gray-800/70 hover:bg-gray-700/70"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>Select media (2-5 files)</span>
              <FontAwesomeIcon icon={faCloudArrowUp} className="text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleChange}
                disabled={isUploading}
                required
              />
              <span className="text-xs text-gray-400">
                {files ? `${files.length} file(s) selected` : "No files"}
              </span>
            </div>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Player name"
              maxLength={17}
              className="bg-gray-800/70 p-2 rounded-md text-center placeholder-gray-400 text-sm"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              disabled={isUploading}
              required
            />
            <input
              type="number"
              placeholder="Player age"
              className="bg-gray-800/70 p-2 rounded-md text-center placeholder-gray-400 text-sm"
              value={playerAge}
              onChange={(e) => setPlayerAge(e.target.value)}
              disabled={isUploading}
              required
            />
          </div>

          <select
            value={playerNationality}
            onChange={(e) => setPlayerNationality(e.target.value)}
            className="bg-gray-800/70 p-2 rounded-md text-sm"
            disabled={isUploading}
            required
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
              <option value="bosnia and herzegovina">Bosnia and Herzegovina</option>
              <option value="bulgaria">Bulgaria</option>
              <option value="croatia">Croatia</option>
              <option value="cyprus">Cyprus</option>
              <option value="czech republic">Czech Republic</option>
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
              <option value="north macedonia">North Macedonia</option>
              <option value="norway">Norway</option>
              <option value="poland">Poland</option>
              <option value="portugal">Portugal</option>
              <option value="romania">Romania</option>
              <option value="russia">Russia</option>
              <option value="san marino">San Marino</option>
              <option value="serbia">Serbia</option>
              <option value="slovakia">Slovakia</option>
              <option value="slovenia">Slovenia</option>
              <option value="spain">Spain</option>
              <option value="sweden">Sweden</option>
              <option value="switzerland">Switzerland</option>
              <option value="turkey">Turkey</option>
              <option value="ukraine">Ukraine</option>
              <option value="united kingdom">United Kingdom</option>
              <option value="vatican-city">Vatican City</option>
            </optgroup>
            <optgroup label="Africa">
              <option value="algeria">Algeria</option>
              <option value="angola">Angola</option>
              <option value="benin">Benin</option>
              <option value="botswana">Botswana</option>
              <option value="burkina-faso">Burkina Faso</option>
              <option value="burundi">Burundi</option>
              <option value="cabo verde">Cabo Verde</option>
              <option value="cameroon">Cameroon</option>
              <option value="central-african-republic">Central African Republic</option>
              <option value="chad">Chad</option>
              <option value="comoros">Comoros</option>
              <option value="congo">Congo</option>
              <option value="democratic republic of congo">DR Congo</option>
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
              <option value="ivory coast">Ivory Coast</option>
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
              <option value="south africa">South Africa</option>
              <option value="south sudan">South Sudan</option>
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
              <option value="united arab emirates">United Arab Emirates</option>
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
              <option value="el salvador">El Salvador</option>
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
              <option value="united states">United States</option>
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
              <option value="newzealand">New Zealand</option>
              <option value="palau">Palau</option>
              <option value="papua-new-guinea">Papua New Guinea</option>
              <option value="samoa">Samoa</option>
              <option value="solomon-islands">Solomon Islands</option>
              <option value="tonga">Tonga</option>
              <option value="tuvalu">Tuvalu</option>
              <option value="vanuatu">Vanuatu</option>
            </optgroup>
          </select>

          <select
            value={playerLeague}
            onChange={(e) => setPlayerLeague(e.target.value)}
            className="bg-gray-800/70 p-2 rounded-md text-sm"
            disabled={isUploading}
            required
          >
            <option value="">Select a league</option>
            {/* INTERNATIONAL */}
            <optgroup label="International">
              <option value="world-cup">FIFA World Cup</option>
              <option value="uefachampions-league">UEFA Champions League</option>
              <option value="uefa-europa-league">UEFA Europa League</option>
              <option value="uefa-europa-conference-league">
                UEFA Europa Conference League
              </option>
            </optgroup>
            {/* EUROPE */}
            <optgroup label="Europe">
              <option value="premier-league">Premier League</option>
              <option value="championship">EFL Championship</option>
              <option value="league-one">League One</option>
              <option value="league-two">League Two</option>
              <option value="la-liga">La Liga</option>
              <option value="la-liga-2">La Liga 2</option>
              <option value="bundesliga">Bundesliga</option>
              <option value="bundesliga-2">2. Bundesliga</option>
              <option value="3-liga">3. Liga</option>
              <option value="serie-a">Serie A</option>
              <option value="serie-b">Serie B</option>
              <option value="ligue-1">Ligue 1</option>
              <option value="ligue-2">Ligue 2</option>
              <option value="eredivisie">Eredivisie</option>
              <option value="eerste-divisie">Eerste Divisie</option>
              <option value="primeira-liga">Primeira Liga</option>
              <option value="segunda-liga-portugal">Segunda Liga</option>
              <option value="scottish-premiership">Scottish Premiership</option>
              <option value="scottish-championship">Scottish Championship</option>
              <option value="belgian-pro-league">Belgian Pro League</option>
              <option value="turkish-super-lig">Turkish Süper Lig</option>
              <option value="greek-super-league">Greek Super League</option>
              <option value="russian-premier-league">Russian Premier League</option>
              <option value="ukrainian-premier-league">Ukrainian Premier League</option>
              <option value="swiss-super-league">Swiss Super League</option>
              <option value="austrian-bundesliga">Austrian Bundesliga</option>
              <option value="danish-superliga">Danish Superliga</option>
              <option value="norwegian-eliteserien">Norwegian Eliteserien</option>
              <option value="swedish-allsvenskan">Swedish Allsvenskan</option>
              <option value="superettan">Superettan (Sweden)</option>
              <option value="polish-ekstraklasa">Polish Ekstraklasa</option>
              <option value="czech-first-league">Czech First League</option>
              <option value="serbian-superliga">Serbian SuperLiga</option>
              <option value="croatian-first-football-league">
                Croatian First League
              </option>
              <option value="slovenia-prva-liga">Slovenia Prva Liga</option>
              <option value="slovak-super-liga">Slovak Super Liga</option>
              <option value="hungary-nb1">Hungarian NB I</option>
              <option value="romania-liga-1">Romanian Liga I</option>
              <option value="bulgaria-first-league">Bulgarian First League</option>
              <option value="cyprus-first-division">Cyprus First Division</option>
              <option value="israel-premier-league">Israel Premier League</option>
            </optgroup>
            {/* ASIA */}
            <optgroup label="Asia">
              <option value="saudi-pro-league">Saudi Pro League</option>
              <option value="saudi-division-1">Saudi Division 1</option>
              <option value="qatar-stars-league">Qatar Stars League</option>
              <option value="uae-pro-league">UAE Pro League</option>
              <option value="iran-pro-league">Iran Pro League</option>
              <option value="indian-super-league">Indian Super League</option>
              <option value="j1-league">Japan J1 League</option>
              <option value="j2-league">Japan J2 League</option>
              <option value="k-league-1">K-League 1</option>
              <option value="k-league-2">K-League 2</option>
              <option value="chinese-super-league">Chinese Super League</option>
              <option value="thai-league-1">Thai League 1</option>
              <option value="malaysia-super-league">Malaysia Super League</option>
              <option value="australia-a-league">A-League (Australia)</option>
            </optgroup>
            {/* AFRICA */}
            <optgroup label="Africa">
              <option value="egypt-premier-league">Egyptian Premier League</option>
              <option value="morocco-botola">Morocco Botola Pro</option>
              <option value="tunisia-ligue-1">Tunisia Ligue 1</option>
              <option value="algeria-ligue-1">Algeria Ligue 1</option>
              <option value="south-africa-psl">South Africa PSL</option>
              <option value="ghana-premier-league">Ghana Premier League</option>
              <option value="nigeria-npfl">Nigeria NPFL</option>
            </optgroup>
            {/* NORTH & CENTRAL AMERICA */}
            <optgroup label="North & Central America">
              <option value="mls">Major League Soccer (USA/Canada)</option>
              <option value="usl-championship">USL Championship</option>
              <option value="liga-mx">Liga MX (Mexico)</option>
              <option value="canadian-premier-league">Canadian Premier League</option>
              <option value="costa-rica-primera-division">
                Costa Rica Primera División
              </option>
              <option value="honduras-liga-nacional">Honduras Liga Nacional</option>
              <option value="jamaica-premier-league">Jamaica Premier League</option>
            </optgroup>
            {/* SOUTH AMERICA */}
            <optgroup label="South America">
              <option value="argentina-primera-division">
                Argentina Primera División
              </option>
              <option value="brasileirao-serie-a">Brazil Serie A</option>
              <option value="brasileirao-serie-b">Brazil Serie B</option>
              <option value="chile-primera-division">Chile Primera División</option>
              <option value="uruguay-primera-division">
                Uruguay Primera División
              </option>
              <option value="colombia-categoria-primera-a">
                Colombia Primera A
              </option>
              <option value="peru-liga-1">Peru Liga 1</option>
              <option value="ecuador-serie-a">Ecuador Serie A</option>
              <option value="paraguay-primera-division">
                Paraguay Primera División
              </option>
              <option value="bolivia-division-profesional">
                Bolivia División Profesional
              </option>
              <option value="venezuela-primera-division">
                Venezuela Primera División
              </option>
            </optgroup>
          </select>

          <textarea
            placeholder="Description"
            maxLength={250}
            className="bg-gray-800/70 p-2 rounded-md text-left h-20 placeholder:text-sm placeholder-gray-400 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            required
          />

          <div className="flex justify-center gap-3 mt-1">
            <button
              type="button"
              onClick={closeAll}
              className="px-4 py-2 bg-gray-600/70 hover:bg-gray-700 rounded-md text-sm"
              disabled={isUploading}
            >
              Close
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-sm flex items-center justify-center min-w-[120px] ${
                isUploading
                  ? "bg-gray-600 text-gray-200"
                  : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              }`}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex gap-2 items-center">
                  <span className="w-2 h-2 bg-gray-200 rounded-full animate-pulse" />
                  <span>{uploadProgress}%</span>
                </div>
              ) : (
                "Upload & Post"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

UploadPopup.propTypes = {
  onClose: PropTypes.func,
  refreshPosts: PropTypes.bool,
  setRefreshPosts: PropTypes.func,
};

export default UploadPopup;
