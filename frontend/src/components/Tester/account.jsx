import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faList, faCommentDots, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // For navigation after logout
  const location = useLocation(); // For determining active link

  // Fetch user data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set the user details from localStorage
    } else {
      navigate('/login'); // If no user is found, redirect to login page
    }
  }, [navigate]);

  // Update user details (passed to children like Settings)
  const updateUserDetails = async (updatedData) => {
    try {
      const jwtToken = localStorage.getItem('accessToken'); // Ensure token is correctly retrieved
      if (!jwtToken || jwtToken === 'null') {
        alert('You are not logged in. Please sign in again.');
        return;
      }

      const response = await axios.put('http://localhost:5000/api/settings', updatedData, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist changes
    } catch (error) {
      console.error('Failed to update user details:', error);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    localStorage.removeItem('accessToken'); // Clear authentication token
    setUser(null); // Clear user state
    navigate('/login'); // Redirect to login page
  };

  // If user is not found, show loading spinner
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div> {/* Replace with a proper loading spinner component */}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-white shadow-lg relative">
        {/* Brown Top Section */}
        <div className="bg-brown-700 text-white p-4 flex items-center space-x-4">
          <img
            src={user.profile_picture || 'https://example.com/profile-pic.jpg'} // Default if profilePic doesn't exist
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <h3 className="text-lg font-bold text-brown">{user.username || 'User'}</h3>
            <p className="text-sm text-brown">{user.email}</p>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-brown mb-4">Account</h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/account"
                className={`block p-2 rounded ${location.pathname === '/account' ? 'bg-[#ff5100] text-white' : 'text-black hover:bg-[#ff5100] hover:text-white'}`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                My Account
              </Link>
            </li>
            <li>
              <Link
                to="/account/messages"
                className={`block p-2 rounded ${location.pathname === '/account/messages' ? 'bg-[#ff5100] text-white' : 'text-black hover:bg-[#ff5100] hover:text-white'}`}
              >
                <FontAwesomeIcon icon={faCommentDots} className="mr-2" />
                Messages
              </Link>
            </li>
            <li>
              <Link
                to="/account/mylistings"
                className={`block p-2 rounded ${location.pathname === '/account/mylistings' ? 'bg-[#ff5100] text-white' : 'text-black hover:bg-[#ff5100] hover:text-white'}`}
              >
                <FontAwesomeIcon icon={faList} className="mr-2" />
                Listings
              </Link>
            </li>
            <li>
              <Link
                to="/account/settings"
                className={`block p-2 rounded ${location.pathname === '/account/settings' ? 'bg-[#ff5100] text-white' : 'text-black hover:bg-[#ff5100] hover:text-white'}`}
              >
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Settings
              </Link>
            </li>
          </ul>
        </div>

        {/* Log Out Button */}
        <div className="absolute bottom-6 w-full px-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8">
        <div>
          <h1 className="text-4xl font-bold text-brown">Account Overview</h1>
          <p className="mt-2 text-lg text-gray-700">Manage your account settings and details.</p>
        </div>
        <div className="mt-6 bg-white shadow-md p-6 rounded-lg">
          <div className="flex items-center">
            <img
              src={user.profile_picture || 'https://example.com/profile-pic.jpg'} // Default image
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mr-6"
              loading="lazy"
            />
            <div>
              <h3 className="text-2xl font-semibold">{user.username || 'User'}</h3>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Pass updateUserDetails to child components */}
        <Outlet context={{ user, updateUserDetails }} />
      </div>
    </div>
  );
};

export default Account;
