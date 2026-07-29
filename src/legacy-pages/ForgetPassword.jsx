'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/styles/forgetpassword.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Forgot Password - Cocofina';
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/firebase-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to send password reset email. Please try again.');
      }
    } catch (err) {
      console.error('Password Reset Error:', err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 flex items-center justify-center">
      <div className="forgot-password-wrapper">
        <div className="auth-container">
          <div className="auth-card">
            <div className="logo-wrapper">
              <Link href="/">
                <img src="/cocofina.png" alt="Cocofina Logo" className="logo-img" />
              </Link>
            </div>

            <h2 className="welcome-text">Forgot Password?</h2>
            <p className="auth-description">
              Enter your registered email address and we'll send you a password reset link.
            </p>

            {success ? (
              <div className="auth-success-msg flex-col text-center py-2">
                <i className="fa-solid fa-circle-check text-2xl mb-2 text-emerald-500"></i>
                <span className="font-semibold text-sm">Password Reset Link Sent!</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1">
                  We've sent a password reset email to <strong>{email}</strong>. Please check your inbox and spam folder.
                </p>
              </div>
            ) : (
              <form className="forgot-form" onSubmit={handleSubmit}>
                {error && (
                  <div className="auth-error-msg mb-4">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                  </div>
                )}

                <div className="input-icon-container-l">
                  <i className="fa-regular fa-envelope"></i>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="input-field-s"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    disabled={submitting}
                    autoFocus
                    required
                  />
                </div>

                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Sending Reset Link…</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}

            <p className="fp-back-link">
              Remember your password?{' '}
              <Link href="/login" className="maroon-text">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;