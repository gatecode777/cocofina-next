'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatSection = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, type: 'user' }]);
    
    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thanks for your message! Our team will get back to you soon.", 
        type: 'bot' 
      }]);
      setIsTyping(false);
    }, 1500);

    setMessage('');
  };

  return (
    <div className="cf-chat-side">
      <div className="cf-circle-top"></div>
      <div className="cf-circle-bottom"></div>

      <div className="cf-chat-card">
        <div className="cf-chat-body">
          <div className="cf-bubble cf-bubble-small">Hey, There</div>
          <div className="cf-bubble cf-bubble-large">
            Get updates on new harvests, seasonal editions, and exclusive offers.
          </div>
          
          {/* Display chat messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`cf-bubble cf-bubble-${msg.type}`}>
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="cf-bubble cf-bubble-bot typing">
              <span className="cf-typing-dot"></span>
              <span className="cf-typing-dot"></span>
              <span className="cf-typing-dot"></span>
            </div>
          )}
        </div>

        <div className="cf-chat-footer">
          <form className="cf-chat-input-wrapper" onSubmit={handleSubmit}>
            <span className="cf-cursor">|</span>
            <input
              type="text"
              placeholder="Write message .."
              className="cf-chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label="Chat message"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="cf-send-btn" 
              aria-label="Send message"
              disabled={isTyping || !message.trim()}
              style={{border:'none', background:'transparent'}}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatSection;
