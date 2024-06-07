import React from 'react';

const Message = ({ message }) => (
  <div>
    <strong>{message.user}:</strong> {message.text}
  </div>
);

export default Message;
