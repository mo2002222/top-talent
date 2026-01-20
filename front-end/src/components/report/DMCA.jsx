import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
const DMCA = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto bg-slate-800 p-6 rounded-md">
        <h1 className="text-3xl font-bold mb-6">
          DMCA Notice & Takedown Policy
        </h1>

        <p className="mb-4 text-gray-300">
          We respect the intellectual property rights of others and expect users
          of our platform to do the same.
        </p>

        <p className="mb-4 text-gray-300">
          If you believe that any content available on this website infringes
          upon your copyright, you may submit a DMCA takedown notice by
          providing the information listed below.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Information Required
        </h2>

        <ul className="list-disc list-inside text-gray-300 space-y-2">
          <li>
            Identification of the copyrighted work claimed to have been
            infringed.
          </li>
          <li>
            Identification of the material that is claimed to be infringing (URL
            to the content).
          </li>
          <li>Your full name, address, and contact information.</li>
          <li>
            A statement that you have a good faith belief that use of the
            material is not authorized by the copyright owner.
          </li>
          <li>
            A statement that the information in the notification is accurate,
            and under penalty of perjury, that you are the copyright owner or
            authorized to act on their behalf.
          </li>
          <li>Your physical or electronic signature.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-3">Submit DMCA Notice</h2>

        <p className="text-gray-300 mb-4">
          Please send your DMCA takedown request to the following email address:
        </p>

        <p className="bg-gray-700 p-3 rounded-md inline-block text-yellow-400">
          maboabdallah@gmail.com
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          Counter-Notification
        </h2>

        <p className="text-gray-300">
          If you believe that your content was removed or disabled by mistake or
          misidentification, you may submit a counter-notification containing
          the required information as permitted under the DMCA.
        </p>

        <p className="text-gray-400 mt-6 text-sm">
          This DMCA policy is provided for informational purposes only and does
          not constitute legal advice.
        </p>
      </div>
      <button
        onClick={() => navigate("/")}
        className="fixed md:bottom-14 bottom-1 flex items-center justify-center md:right-3  md:left-auto left-2 md:bg-gray-700/70 bg-gray-700/30 hover:bg-gray-800 text-white p-[13px]  rounded-full shadow-2xl transition-all duration-300 hover:scale-105 md:w-12 md:h-12 h-9 w-9 z-40"
        aria-label="Go to home"
      >
        <FontAwesomeIcon icon={faHome} className="" />
      </button>
    </div>
  );
};

export default DMCA;
