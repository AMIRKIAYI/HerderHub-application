

const Messages = () => {
  const messages = [
    { id: 1, sender: 'Alice', subject: 'Welcome!', preview: 'Hi, welcome to the platform!' },
    { id: 2, sender: 'Bob', subject: 'Question about your listing', preview: 'Could you clarify...' },
    { id: 3, sender: 'System', subject: 'Update Notice', preview: 'Your account has been updated.' },
  ];

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-brown mb-4">Messages</h1>
      <p className="text-gray-700">View your recent messages and conversations.</p>

      {/* Message List */}
      <div className="mt-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            <h2 className="text-lg font-semibold">{msg.sender}</h2>
            <p className="text-gray-800 font-medium">{msg.subject}</p>
            <p className="text-gray-600 text-sm">{msg.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Messages;
