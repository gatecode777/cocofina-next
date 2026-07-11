'use client';

import React, { useState } from 'react';

const BlogAskForm = () => {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', location: '' });
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSending(true);
    // Simulate API callback request
    await new Promise(r => setTimeout(r, 900));
    setFormSent(true);
    setFormSending(false);
  };

  return (
    <div className="blg-form-box">
      <h2 className="blg-form-title">Ask Your Question</h2>
      <p className="blg-form-sub">Fill the form Below</p>
      {formSent ? (
        <div className="blg-form-success">
          <i className="fas fa-check-circle"></i>
          <p>Thank you! We'll get back to you soon.</p>
        </div>
      ) : (
        <form className="blg-form" onSubmit={handleFormSubmit}>
          <input 
            type="text" 
            placeholder="Full Name" 
            required
            value={form.fullName} 
            onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} 
          />
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={form.email} 
            onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} 
          />
          <input 
            type="tel" 
            placeholder="Phone Number" 
            required
            value={form.phone} 
            onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} 
          />
          <input 
            type="text" 
            placeholder="Your Location"
            value={form.location} 
            onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} 
          />
          <button type="submit" className="blg-submit-btn" disabled={formSending}>
            {formSending ? 'Sending…' : 'Request a Call Back'}
          </button>
        </form>
      )}
    </div>
  );
};

export default BlogAskForm;
