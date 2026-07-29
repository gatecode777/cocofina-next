'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { passwordResetAPI } from '@/services/api';
import '@/styles/forgetpassword.css';

const ForgotPasswordPage = () => {
  const router = useRouter();
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
      const res = await passwordResetAPI.forgotPassword(trimmed);

      if (res.data.success) {
        setSuccess(true);
        sessionStorage.setItem('resetEmail', trimmed);
        setTimeout(() => router.push('/verify-otp'), 1800);
      } else {
        setError(res.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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
              Enter your registered email address and we'll send you a 6-digit OTP code.
            </p>

            {success && (
              <div className="auth-success-msg">
                <i className="fa-solid fa-circle-check"></i>
                <span>OTP sent to <strong>{email}</strong>! Redirecting…</span>
              </div>
            )}

            {error && (
              <div className="auth-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <form className="forgot-form" onSubmit={handleSubmit}>
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
                    <><i className="fa-solid fa-spinner fa-spin"></i> Sending OTP…</>
                  ) : (
                    'Send OTP'
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