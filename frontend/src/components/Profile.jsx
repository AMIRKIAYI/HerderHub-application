// src/Profile.js
import { Link, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faCog, faSignOutAlt, faComments } from '@fortawesome/free-solid-svg-icons';
import './Profile.css'; // Create this CSS file for custom styles

const Profile = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-white shadow-lg p-6 relative">
        <h2 className="text-2xl font-bold text-brown mb-4">My Account</h2>

        {/* Profile Sidebar Links */}
        <ul className="space-y-2">
          <li>
            <Link to="/profile/messages" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faComments} className="mr-2" />
              Messages
            </Link>
          </li>
          <li>
            <Link to="/profile/listings" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faList} className="mr-2" />
              Listings
            </Link>
          </li>
          <li>
            <Link to="/profile/settings" className="block text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faCog} className="mr-2" />
              Settings
            </Link>
          </li>
          <li>
            <button onClick={() => console.log('Log Out')} className="w-full text-left text-black hover:bg-[#ff5100] hover:text-white p-2 rounded transition duration-200">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Log Out
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8">
        <h1 className="text-4xl font-bold text-brown">My Account</h1>
        <p className="mt-2 text-lg text-gray-700">Select an option from the sidebar to view details.</p>

        {/* Outlet for nested routes content */}
        <Outlet />
      </div>
    </div>
  );
};

export default Profile;
