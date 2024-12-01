import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import ChangePassword from './ChangePassword';

const Settings = () => {
  const { user, updateUserDetails } = useOutletContext();
  const [username, setUsername] = useState(user.name);
  const [profilePic, setProfilePic] = useState(user.profilePic);
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false); // State to control ChangePassword visibility

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    if (username.trim().length < 3) {
      alert('Username must be at least 3 characters long.');
      return;
    }

    setLoading(true);
    try {
      await updateUserDetails({ name: username, profilePic });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPicture = () => {
    setProfilePic(user.profilePic);
  };

  // Toggle visibility of Change Password section
  const toggleChangePassword = () => {
    setShowChangePassword(!showChangePassword);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Account Settings</h1>
      <p className="text-gray-600 mb-8 text-center">
        Update your account details and preferences below.
      </p>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1">
          {/* Profile Picture Section */}
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <img
                src={profilePic}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-sm"
              />
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Upload New Picture
                </label>
                <label className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-200 focus:ring focus:ring-gray-300">
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
                  className="mt-2 text-sm text-red-600 hover:underline focus:ring focus:ring-red-300"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </section>

          {/* Username Section */}
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Username</h2>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary-300 focus:border-primary-500"
              placeholder="Enter your username"
            />
          </section>

          {/* Save Changes Button */}
          <div className="mb-8">
            <button
              onClick={handleSaveChanges}
              className={`w-full py-3 bg-[#ff5100] text-white text-lg font-medium rounded-lg shadow hover:bg-[#e54900] focus:ring focus:ring-orange-300 transition-all ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          {/* Change Password Section */}
          <section className="mb-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <button
              onClick={toggleChangePassword}
              className="w-full py-2 px-4 bg-[#ff5100] text-white text-lg font-medium rounded-lg shadow hover:bg-[#ff5160]  transition-all mb-4"
            >
              {showChangePassword ? 'Hide Change Password' : 'Show Change Password'}
            </button>

            {showChangePassword && (
              <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                <ChangePassword onSuccess={() => alert('Password changed successfully!')} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
