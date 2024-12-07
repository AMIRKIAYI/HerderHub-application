import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; // Import PropTypes

const ChangePassword = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const jwtToken = localStorage.getItem('accessToken');
      if (!jwtToken || jwtToken === 'null') {
        alert('You are not logged in. Please sign in again.');
        return;
      }

      const response = await axios.put(
        'http://localhost:5000/api/settings/change-password',
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (response.status === 200) {
        onSuccess();
      } else {
        setError('Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('An error occurred while changing the password. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-semibold text-gray-700">Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <button
        onClick={handleChangePassword}
        className={`w-full py-3 bg-[#ff5100] text-white rounded-lg ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </div>
  );
};

// PropTypes validation
ChangePassword.propTypes = {
  onSuccess: PropTypes.func.isRequired, // Ensure onSuccess is passed as a function
};

export default ChangePassword;
