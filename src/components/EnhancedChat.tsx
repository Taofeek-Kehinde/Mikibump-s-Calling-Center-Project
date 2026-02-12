import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/useAppContext';

const EnhancedChat: React.FC = () => {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([{ text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }]);
  const [input, setInput] = useState('');
  const { isLive, lastSeen } = useAppContext();

  const formatLastSeen = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { text: "Thank you for your message. I'm processing your request...", isUser: false };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <motion.div
      className="enhanced-chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="chat-header">
        <h2>Enhanced AI Chat</h2>
        <div className={`status-indicator ${isLive ? 'live' : 'offline'}`}>
          {isLive ? '🟢 Live' : lastSeen ? `🔴 Last seen ${formatLastSeen(lastSeen)}` : '🔴 Offline'}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            className={`message ${msg.isUser ? 'user' : 'ai'}`}
            initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={!isLive}
        />
        <button onClick={handleSend} disabled={!isLive || !input.trim()}>
          Send
        </button>
      </div>
    </motion.div>
  );
};

export default EnhancedChat;
