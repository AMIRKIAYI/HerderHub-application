import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          toast.error('You must be logged in to view messages');
          return;
        }

        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token here
          },
        });

        const data = await response.json();

        if (response.ok) {
          setMessages(data.messages); // Set messages received from the backend
        } else {
          toast.error(data.error || 'Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Error fetching messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-brown mb-4">Messages</h1>
      <p className="text-gray-700">View your recent messages and conversations.</p>

      {/* Message List */}
      <div className="mt-6 space-y-4">
        {messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              <h2 className="text-lg font-semibold">{msg.senderEmail}</h2>
              <p className="text-gray-800 font-medium">{msg.messageText}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;
