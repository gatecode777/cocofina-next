'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Youtube, Instagram, X } from 'lucide-react';
import '../styles/footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Newsletter subscription email:', email);

    setIsSubscribed(true);

    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-col footer-brand">
          <h2>COCOFINA</h2>
          <p>
            Home delivery allows you to receive Cocofina Sugar conveniently at your
            home, carefully packed and delivered to preserve its natural quality.
          </p>

          <div className="social-links">
            <a href="https://www.facebook.com/cocofinasugar" target='_blank' className="social-icon"><Facebook size={18} /></a>
            <a href="https://www.youtube.com" target='_blank' className="social-icon"><Youtube size={18} /></a>
            <a href="https://www.instagram.com/cocofina_sugar/" target='_blank' className="social-icon"><Instagram size={18} /></a>
            <a href="https://x.com" target='_blank' className="social-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.901 1.153h3.68l-8.042 9.193 9.462 12.501H16.73l-6.18-8.073-7.07 8.073H-.2l8.6-9.83L-.6 1.153h7.48l5.64 7.442 6.38-7.442zm-1.29 19.385h2.04L6.64 2.36H4.46l13.15 18.178z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Company */}
        <div className="footer-col">
          <h3>Company</h3>
          <ul className="footer-links">
            <li><Link href="/terms-and-conditions">Terms and Conditions</Link></li>
            <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            <li><Link href="/shipping-policy">Shipping Policy</Link></li>
            <li><Link href="/refund-policy">Refund Policy</Link></li>
            <li><Link href="/contact-us">Contact Us</Link></li>
          </ul>
        </div>

        {/* Products */}
        <div className="footer-col">
          <h3>Our Product</h3>
          <ul className="footer-links">
            <li><Link href="/about-us">About Us</Link></li>
            <li><Link href="/benefits">Benefits</Link></li>
            <li><Link href="/how-its-made">How It's Made</Link></li>
            <li><Link href="/our-blogs">Our Blogs</Link></li>
            <li><Link href="/faqs">FAQs</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-col newsletter-col">
          <h3>Stay Naturally Sweet</h3>
          <p>
            Subscribe for delicious recipes, new launches, and exclusive offers.
          </p>

          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button className="subscribe-btn" type="submit" disabled={isSubscribed}>
              {isSubscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>

          {isSubscribed && (
            <p className="success-message">Thank you for subscribing!</p>
          )}
        </div>

      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} All rights reserved by Gatecode Pvt. Ltd.
        </p>
      </div>
    </footer>
  );
};

export default Footer;