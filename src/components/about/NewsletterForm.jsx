'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Subscription failed. Please try again.');
    }
  };

  return (
    <form className="cf-input-box" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter Your Email .."
        className={`cf-email-input ${status === 'error' ? 'error' : ''}`}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        required
        disabled={status === 'loading' || status === 'success'}
        aria-label="Email for newsletter"
      />
      <button 
        type="submit" 
        className="cf-submit-btn" 
        aria-label="Subscribe"
        disabled={status === 'loading' || status === 'success'}
      >
        <ArrowRight />
      </button>
      {message && <p className={`cf-message ${status}`}>{message}</p>}
    </form>
  );
};

export default NewsletterForm;
