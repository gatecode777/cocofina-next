'use client';

import React, { useState } from 'react';

const ShareButtons = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
  const text = encodeURIComponent(title);

  return (
    <div className="sblg-share">
      <span className="sblg-share-label">Share</span>
      <a
        href={`https://wa.me/?text=${text}%20${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="sblg-share-btn sblg-share-wa"
      >
        <i className="fab fa-whatsapp"></i> WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="sblg-share-btn sblg-share-fb"
      >
        <i className="fab fa-facebook-f"></i> Facebook
      </a>
      <button className="sblg-share-btn sblg-share-copy" onClick={handleCopy}>
        <i className="fas fa-link"></i> {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
};

export default ShareButtons;
