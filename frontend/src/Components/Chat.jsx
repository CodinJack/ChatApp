import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Sidebar from './Sidebar';
import axios from 'axios';

const socket = io('http://localhost:3000', {
  query: { token: localStorage.getItem('token') }
});

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/messages', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessages(response.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };

    fetchMessages();

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('sendMessage', { user: user.username, text: newMessage });
      setMessages((prevMessages) => [...prevMessages, { user: user.username, text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-2">
              <strong>{message.user}:</strong> {message.text}
            </div>
          ))}
        </div>
        <div className="flex p-4 border-t">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded mr-2"
          />
          <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
