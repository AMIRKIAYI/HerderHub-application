import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChangePassword from './ChangePassword';

const Settings = () => {
  const { user, updateUserDetails } = useOutletContext();
  const [username, setUsername] = useState(user.username || '');
  const [profilePic, setProfilePic] = useState(user.profilePic || '/default-avatar.png');
  const [email, setEmail] = useState(user.email || '');
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Function to handle input changes for username
  const handleUsernameChange = (e) => setUsername(e.target.value);

  // Function to handle input changes for email
  const handleEmailChange = (e) => setEmail(e.target.value);

  // Function to handle token retrieval and sending with requests
  const getToken = () => {
    const jwtToken = localStorage.getItem('accessToken');
    if (!jwtToken || jwtToken === 'null') {
      alert('You are not logged in. Please sign in again.');
      return null;
    }
    return jwtToken;
  };

  // Function to update user settings
  const updateUserSettings = async (settings) => {
    const jwtToken = getToken();
    if (!jwtToken) return;

    console.log('Authorization Header (before request):', `Bearer ${jwtToken}`);

    const response = await fetch('http://localhost:5000/api/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(settings),
    });

    const result = await response.json();
    console.log('Response from backend:', result);
    return result;
  };

  // Function to handle profile picture changes
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

  const handleSaveChanges = async () => {
    if (username.trim().length < 3) {
      alert('Username must be at least 3 characters long.');
      return;
    }

    if (!user.id) {
      alert('User ID is missing. Please log in again.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('userId', user.id);

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput && fileInput.files[0]) {
      formData.append('profilePicture', fileInput.files[0]);
    }

    try {
      const jwtToken = getToken();
      if (!jwtToken) return;

      console.log('Authorization Header (before request):', `Bearer ${jwtToken}`);

      const profileResponse = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${jwtToken}`, // Include token in headers
        },
        body: formData,
      });

      if (!profileResponse.ok) {
        throw new Error(`HTTP error! status: ${profileResponse.status}`);
      }

      const profileResult = await profileResponse.json();
      console.log('Response from backend:', profileResult);

      alert('Profile updated successfully!');
      updateUserDetails({
        username: profileResult.username,
        email: profileResult.email,
        profilePic: profileResult.profilePicture || profilePic, // Ensure default picture handling
      });

      // Use the updateUserSettings function to update other user details
      await updateUserSettings({ username, email });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`An error occurred. Please try again later. Details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPicture = () => {
    setProfilePic(user.profilePic || '/default-avatar.png');
  };

  const toggleChangePassword = () => {
    setShowChangePassword((prev) => !prev);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Account Settings</h1>
      <p className="text-gray-600 mb-8 text-center">Update your account details and preferences below.</p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1">
          {/* Profile Picture */}
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
                <button
                  onClick={handleResetPicture}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </section>

          {/* Username */}
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Username</h2>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}  // Ensure this handler is used
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </section>

          {/* Email */}
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Email</h2>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}  // Ensure this handler is used
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

        {/* Right Column */}
        <div className="flex-1">
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <button
              onClick={toggleChangePassword}
              className="w-full py-2 bg-[#ff5100] text-white rounded-lg"
            >
              {showChangePassword ? 'Hide Change Password' : 'Show Change Password'}
            </button>
            {showChangePassword && (
              <ChangePassword onSuccess={() => alert('Password changed successfully!')} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
