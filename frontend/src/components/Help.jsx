import { Link, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faQuestionCircle, faInfoCircle, faFileContract,faUserShield } from '@fortawesome/free-solid-svg-icons';
import './Help.css';

const Help = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-white shadow-lg p-6 relative">
        <h2 className="text-2xl font-bold text-brown mb-4">Help Center</h2>

        {/* Support Section */}
        <div className="mb-6 p-4 bg-brown text-white rounded shadow-md">
          <h3 className="font-bold text-lg">Support</h3>
          <p className="text-gray-200">For any further assistance contact us:</p>
          <p className="flex items-center">
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            <span>support@herderhub.co.uk</span>
          </p>
          <p className="flex items-center">
            <FontAwesomeIcon icon={faPhone} className="mr-2" />
            <span>+44 330 828 5766</span>
          </p>
        </div>

        {/* Sidebar Links */}
        <ul className="space-y-2">
          <li>
            <Link to="/help/how-it-works" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
              How it Works
            </Link>
          </li>
          <li>
            <Link to="/help/faq" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
              Frequently Asked Questions
            </Link>
          </li>
          <li>
            <Link to="/help/terms" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faFileContract} className="mr-2" />
              Terms and Conditions
            </Link>
          </li>

          <li>
            <Link to="/help/privacypolicy" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faUserShield} className="mr-2" />
              Privacy Policy
            </Link>
          </li>



        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8">
      <div>
            <h1 className="text-4xl font-bold text-brown">Help Center</h1>
            <p className="mt-2 text-lg text-gray-700">Select an option from the sidebar to view help content.</p>
          </div>

        {/* This Outlet will render the content based on the selected link */}
        <Outlet />
      </div>
    </div>
  );
};

export default Help;
