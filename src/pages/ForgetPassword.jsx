'use client';

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
      // passwordResetAPI.forgotPassword returns an axios response
      const res = await passwordResetAPI.forgotPassword(trimmed);

      if (res.data.success) {
        setSuccess(true);
        // Store email for the OTP step
        sessionStorage.setItem('resetEmail', trimmed);
        // Navigate after a brief success flash
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
    <div className="forgot-password-wrapper">
      <div className="auth-container">
        <div className="auth-image-side"></div>

        <div className="auth-form-side">
          <div className="logo-container">
            <Link href="/">
              <img src="/cocofina.png" alt="Cocofina" className="auth-logo" />
            </Link>
          </div>

          <h2 className="auth-title">FORGOT PASSWORD</h2>
          <p className="auth-description">
            Enter your registered email address and we'll send you a 6-digit OTP.
          </p>

          {success && (
            <div className="fp-success">
              <i className="fas fa-check-circle"></i> OTP sent to <strong>{email}</strong>!
              <span> Redirecting…</span>
            </div>
          )}

          {error && (
            <div className="fp-error">
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {!success && (
            <form className="forgot-form" onSubmit={handleSubmit}>
              <div className="input-group-f">
                <i className="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Email Address"
                  className={`form-input-f ${error ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={submitting}
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting
                  ? <><i className="fas fa-spinner fa-spin"></i> Sending OTP…</>
                  : 'Send OTP'
                }
              </button>

              <p className="fp-back-link">
                Remember your password? <Link href="/login">Back to Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;