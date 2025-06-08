import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faList, faCommentDots, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const jwtToken = localStorage.getItem('accessToken');
      if (!jwtToken) {
        alert('You are not logged in. Please sign in again.');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('https://herderhub-application-production.up.railway.app/api/settings', {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const fetchedUser = response.data;
        setUser(fetchedUser);
        localStorage.setItem('user', JSON.stringify(fetchedUser));
      } catch (error) {
        console.error('Failed to fetch user details:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Enhanced Logout Function

const handleLogout = async () => {
  try {
    const jwtToken = localStorage.getItem('accessToken');
    
    // Call backend logout endpoint if token exists
    if (jwtToken) {
      await axios.post('https://herderhub-application-production.up.railway.app/logout', {}, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    }

    // Clear all user-related data from local storage
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    
    // Reset user state
    setUser(null);
    
    // Emit a custom event to notify other components
    window.dispatchEvent(new Event('logout'));
    
    // Redirect to home page with success message
    navigate('/', { state: { message: 'You have been successfully logged out' } });
    
  } catch (error) {
    console.error('Logout failed:', error);
    
    // Fallback cleanup if API call fails
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    window.dispatchEvent(new Event('logout'));
    navigate('/', { state: { message: 'You have been logged out' } });
  }
};

  // If user is not found, show loading spinner
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-1/4 bg-white shadow-lg relative">
        <div className="bg-brown-700 text-white p-4 flex items-center space-x-4">
          <img
            src={user.profile_picture || 'https://herderhub-application-production.up.railway.app/uploads/default-avatar.png'}
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover"
            loading="lazy"
          />
          <div>
            <h3 className="text-lg font-bold text-brown">{user.username || 'User'}</h3>
            <p className="text-sm text-brown">{user.email}</p>
          </div>
        </div>

        <div className="p-6 flex-grow">
          <h2 className="text-2xl font-bold text-brown mb-4">Account</h2>
          <ul className="space-y-2">
            {['/account', '/account/messages', '/account/mylistings', '/account/settings'].map((path, index) => (
              <li key={index}>
                <Link
                  to={path}
                  className={`block p-2 rounded ${location.pathname === path ? 'bg-[#ff5100] text-white' : 'text-black hover:bg-[#ff5100] hover:text-white'}`}
                >
                  <FontAwesomeIcon icon={[faUser, faCommentDots, faList, faCog][index]} className="mr-2" />
                  {['My Account', 'Messages', 'Listings', 'Settings'][index]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* LogOut Button */}
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
        <h1 className="text-4xl font-bold text-brown">Account Overview</h1>
        <p className="mt-2 text-lg text-gray-700">Manage your account settings and details.</p>

        <div className="mt-6 bg-white shadow-md p-6 rounded-lg">
          <div className="flex items-center">
            <img
              src={user.profile_picture || 'https://herderhub-application-production.up.railway.app/uploads/default-avatar.png'}
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

        <Outlet context={{ user, updateUserDetails: setUser }} />
      </div>
    </div>
  );
};

export default Account;