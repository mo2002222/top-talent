import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faInfo,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { fileContext } from "./MidSecotion";
import UserContext from "../authContext";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const UploadPopup = ({ onClose, refreshPosts, setRefreshPosts }) => {
  const { setUploadPopupState } = useContext(fileContext);
  const { user } = useContext(UserContext);

  const [files, setFiles] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successState, setSuccessState] = useState("");
  const [failState, setFailState] = useState("");

  const [title, setTitle] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerAge, setPlayerAge] = useState("");
  const [playerNationality, setPlayerNationality] = useState("");
  const [playerLeague, setPlayerLeague] = useState("");
  const [description, setDescription] = useState("");

  const closeAll = () => {
    setUploadPopupState(false);
    onClose && onClose();
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
    setFailState("");
    setSuccessState("");
  };

  // 🔹 upload media with progress
  const uploadMediaWithProgress = () => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("file", f));

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BACKEND_URL}/uploadVideo`, true);

      // track upload progress (client → server)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      // when SERVER finishes and responds
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);

            // 🔐 normalize backend response
            let urls = [];
            if (Array.isArray(response)) {
              urls = response.map((i) => i.url);
            } else if (response?.urls) {
              urls = response.urls;
            } else if (response?.url) {
              urls = [response.url];
            }

            if (!urls.length) {
              reject("No media URLs returned from server");
              return;
            }

            resolve(urls);
          } else {
            reject(`Upload failed with status ${xhr.status}`);
          }
        } catch (err) {
          reject("Invalid server response");
        }
      };

      xhr.onerror = () => reject("Network error during upload");

      xhr.send(formData);
    });
  };

  // 🔹 MAIN BUTTON HANDLER (UPLOAD + POST)
  const handleUploadAndPost = async (e) => {
    e.preventDefault();
    setFailState("");
    setSuccessState("");

    // validations
    if (!files || files.length < 2 || files.length > 5) {
      setFailState("Select 2–5 media files.");
      return;
    }

    const hasVideo = Array.from(files).some((f) => f.type.startsWith("video/"));
    if (!hasVideo) {
      setFailState("At least one video is required.");
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
      setFailState("Fill all fields before posting.");
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      // 1️⃣ upload

      const uploadPromise = uploadMediaWithProgress();

      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject("Upload timeout"), 120000), // 2 minutes
      );

      const uploadedUrls = await Promise.race([uploadPromise, timeoutPromise]);

      // 2️⃣ post
      const postPayload = {
        title,
        playerName,
        playerAge,
        playerNationality,
        playerLeague,
        description,
        videoUrl: uploadedUrls,
        userId: user._id,
      };

      const res = await fetch(`${BACKEND_URL}/uploadPost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postPayload),
      });

      if (!res.ok) throw new Error("Post failed");

      toast.success("Posted successfully!");
      setSuccessState("Post uploaded successfully");

      setTimeout(() => {
        setRefreshPosts(!refreshPosts);
        setUploadPopupState(false);
      }, 800);
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      if (err.message === "UPLOAD_TIMEOUT") {
        setFailState("Upload took too long. Please try again.");
      } else {
        setFailState("Upload or post failed. Try again.");
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={closeAll}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#1e2a44] border border-slate-700 text-white rounded-2xl shadow-2xl w-[420px] p-6 m-2"
      >
        {/* Close */}
        <button
          onClick={closeAll}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        {/* Info */}
        <div className="text-xs text-gray-300 space-y-1 mb-4">
          {[
            "Select 2–5 media files",
            "At least one video required",
            "Upload & post with one click",
          ].map((msg, i) => (
            <div
              key={i}
              className="flex gap-2 items-center bg-slate-800/60 px-3 py-1 rounded-lg"
            >
              <FontAwesomeIcon icon={faInfo} />
              <span>{msg}</span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {successState && (
          <div className="text-green-400 text-sm border border-green-500/40 rounded-md py-1 text-center mb-2">
            {successState}
          </div>
        )}
        {failState && (
          <div className="text-red-400 text-sm border border-red-500/40 rounded-md py-1 text-center mb-2">
            {failState}
          </div>
        )}

        {/* FORM */}
        <form className="space-y-3">
          <input
            placeholder="Video title"
            className="w-full bg-slate-800 rounded-md p-2 text-sm"
            onChange={(e) => setTitle(e.target.value)}
          />

          <label className="flex justify-between items-center bg-slate-800 rounded-md px-3 py-2 cursor-pointer">
            <span>Select media</span>
            <FontAwesomeIcon icon={faCloudArrowUp} className="text-blue-400" />
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Player name"
              className="bg-slate-800 p-2 rounded-md text-sm"
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <input
              placeholder="Age"
              type="number"
              className="bg-slate-800 p-2 rounded-md text-sm"
              onChange={(e) => setPlayerAge(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={playerNationality}
              onChange={(e) => setPlayerNationality(e.target.value)}
              className="bg-gray-800/70 p-2 rounded-md text-sm"
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
                <option value="united-arab-emirates">
                  United Arab Emirates
                </option>
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

            <select
              value={playerLeague}
              onChange={(e) => setPlayerLeague(e.target.value)}
              className="bg-gray-800/70 p-2 rounded-md text-sm"
            >
              <option value="">Select a league</option>

              {/* INTERNATIONAL */}
              <optgroup label="International">
                <option value="world-cup">FIFA World Cup</option>
                <option value="uefa-champions-league">
                  UEFA Champions League
                </option>
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

                <option value="scottish-premiership">
                  Scottish Premiership
                </option>
                <option value="scottish-championship">
                  Scottish Championship
                </option>

                <option value="belgian-pro-league">Belgian Pro League</option>
                <option value="turkish-super-lig">Turkish Süper Lig</option>
                <option value="greek-super-league">Greek Super League</option>
                <option value="russian-premier-league">
                  Russian Premier League
                </option>
                <option value="ukrainian-premier-league">
                  Ukrainian Premier League
                </option>

                <option value="swiss-super-league">Swiss Super League</option>
                <option value="austrian-bundesliga">Austrian Bundesliga</option>

                <option value="danish-superliga">Danish Superliga</option>
                <option value="norwegian-eliteserien">
                  Norwegian Eliteserien
                </option>
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
                <option value="bulgaria-first-league">
                  Bulgarian First League
                </option>
                <option value="cyprus-first-division">
                  Cyprus First Division
                </option>
                <option value="israel-premier-league">
                  Israel Premier League
                </option>
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

                <option value="chinese-super-league">
                  Chinese Super League
                </option>

                <option value="thai-league-1">Thai League 1</option>
                <option value="malaysia-super-league">
                  Malaysia Super League
                </option>

                <option value="australia-a-league">A-League (Australia)</option>
              </optgroup>

              {/* AFRICA */}
              <optgroup label="Africa">
                <option value="egypt-premier-league">
                  Egyptian Premier League
                </option>
                <option value="morocco-botola">Morocco Botola Pro</option>
                <option value="tunisia-ligue-1">Tunisia Ligue 1</option>
                <option value="algeria-ligue-1">Algeria Ligue 1</option>
                <option value="south-africa-psl">South Africa PSL</option>
                <option value="ghana-premier-league">
                  Ghana Premier League
                </option>
                <option value="nigeria-npfl">Nigeria NPFL</option>
              </optgroup>

              {/* NORTH & CENTRAL AMERICA */}
              <optgroup label="North & Central America">
                <option value="mls">Major League Soccer (USA/Canada)</option>
                <option value="usl-championship">USL Championship</option>

                <option value="liga-mx">Liga MX (Mexico)</option>
                <option value="canadian-premier-league">
                  Canadian Premier League
                </option>

                <option value="costa-rica-primera-division">
                  Costa Rica Primera División
                </option>
                <option value="honduras-liga-nacional">
                  Honduras Liga Nacional
                </option>
                <option value="jamaica-premier-league">
                  Jamaica Premier League
                </option>
              </optgroup>

              {/* SOUTH AMERICA */}
              <optgroup label="South America">
                <option value="argentina-primera-division">
                  Argentina Primera División
                </option>
                <option value="brasileirao-serie-a">Brazil Serie A</option>
                <option value="brasileirao-serie-b">Brazil Serie B</option>

                <option value="chile-primera-division">
                  Chile Primera División
                </option>
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
          </div>

          <textarea
            placeholder="Description"
            className="bg-slate-800 p-2 rounded-md text-sm h-20 w-full"
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Progress bar */}
          {isProcessing && (
            <>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-center text-gray-300">{progress}%</p>
            </>
          )}

          {/* BUTTON */}
          <button
            onClick={handleUploadAndPost}
            disabled={isProcessing}
            className={`w-full py-2 rounded-md transition font-medium ${
              isProcessing
                ? "bg-gray-600 text-gray-300"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isProcessing
              ? progress < 100
                ? `Uploading ${progress}%`
                : "Finalizing..."
              : "Upload & Post"}
          </button>
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
