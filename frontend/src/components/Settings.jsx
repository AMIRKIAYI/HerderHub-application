import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChangePassword from './ChangePassword';

const Settings = () => {
  const { user, updateUserDetails } = useOutletContext();
  const [username, setUsername] = useState(user.username || '');
  const [profilePic, setProfilePic] = useState(user.profile_picture || '/default-avatar.png');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);



  
  // Handle token retrieval
  const getToken = () => {
    const jwtToken = localStorage.getItem('accessToken');
    if (!jwtToken || jwtToken === 'null') {
      alert('You are not logged in. Please sign in again.');
      return null;
    }
    return jwtToken;
  };

  // Update user settings
  const handleSaveChanges = async () => {
    if (username.trim().length < 3) {
      alert('Username must be at least 3 characters long.');
      return;
    }

    setLoading(true);

    try {
      const jwtToken = getToken();
      if (!jwtToken) return;

      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('userId', user.id);

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        formData.append('profilePicture', fileInput.files[0]);
      }

      const profileResponse = await fetch('https://herderhub-application-production.up.railway.app/api/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${jwtToken}`, // Add token in headers
        },
        body: formData,
      });

      if (!profileResponse.ok) {
        throw new Error(`HTTP error! Status: ${profileResponse.status}`);
      }

      const profileResult = await profileResponse.json();
      alert('Profile updated successfully!');

      // Update user details in the parent component
      updateUserDetails({
        username: profileResult.username,
        email: profileResult.email,
        profile_picture: profileResult.profilePicture || profilePic, // Ensure consistent field names
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`An error occurred. Please try again later. Details: ${error.message}`);
    } finally {
      setLoading(false); // Ensure loading state is reset
    }
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2 MB.');
        return;
      }
      setProfilePic(URL.createObjectURL(file));
    }
  };

 

  const toggleChangePassword = () => {
    setShowChangePassword((prev) => !prev);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Account Settings</h1>
      <p className="text-gray-600 mb-8 text-center">Update your account details and preferences below.</p>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <img
                src={profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-sm"
              />
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Upload New Picture</label>
                <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-200">
                  Select File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </label>
        
              </div>
            </div>
          </section>

          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Username</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </section>

          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Email</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </section>

          <button
            onClick={handleSaveChanges}
            className={`w-full py-3 bg-[#ff5100] text-white text-lg rounded-lg ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="flex-1">
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <button
              onClick={toggleChangePassword}
              className="w-full py-2 bg-[#ff5100] text-white rounded-lg"
            >
              {showChangePassword ? 'Hide Change Password' : 'Show Change Password'}
            </button>
            {showChangePassword && <ChangePassword onSuccess={() => alert('Password changed successfully!')} />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
