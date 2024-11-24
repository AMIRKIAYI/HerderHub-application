import { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Ensure the user is logged in

      const response = await axios.post(
        '/api/change-password',
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message);
      setMessageType('success');
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside 2xx
        setMessage(error.response.data.error || 'Server error occurred.');
      } else if (error.request) {
        // No response received
        setMessage('No response from the server. Please try again later.');
      } else {
        // Error setting up the request
        setMessage('Error setting up the request. Please try again.');
      }
      setMessageType('error');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-brown mb-6 text-center">Change Password</h2>
      <form className="space-y-6" onSubmit={handlePasswordChange}>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md shadow-sm focus:ring-[#ff5100] focus:border-[#ff5100] text-gray-700"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md shadow-sm focus:ring-[#ff5100] focus:border-[#ff5100] text-gray-700"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md shadow-sm focus:ring-[#ff5100] focus:border-[#ff5100] text-gray-700"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#ff5100] text-white py-3 px-4 rounded-md hover:bg-[#e04a00] transition duration-200 font-bold"
        >
          Change Password
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 text-center text-sm font-medium ${
            messageType === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default ChangePassword;
