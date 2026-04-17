'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { passwordResetAPI } from '@/services/api';
import '@/styles/verifyotp.css';

const RESEND_COOLDOWN = 60; // seconds

const VerifyOTPPage = () => {
  const router = useRouter();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  const inputRefs = useRef([]);

  // Redirect away if no email in session
  useEffect(() => {
    document.title = 'Verify OTP - Cocofina';
    window.scrollTo(0, 0);
    if (!sessionStorage.getItem('resetEmail')) {
      router.push('/forgot-password');
    }
    // Auto-focus first box
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) { 
      setCanResend(true); 
      return; 
    }
    const t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ── OTP input handlers ────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return; // digits only
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;
    const next = ['', '', '', '', '', ''];
    digits.split('').forEach((d, i) => { next[i] = d; });
    setOtp(next);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend) return;
    const email = sessionStorage.getItem('resetEmail');
    setResending(true);
    setResendMsg('');
    setError('');
    try {
      const res = await passwordResetAPI.resendOTP(email);
      if (res.data.success) {
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(RESEND_COOLDOWN);
        setCanResend(false);
        setResendMsg('New OTP sent to your email!');
        inputRefs.current[0]?.focus();
        setTimeout(() => setResendMsg(''), 4000);
      } else {
        setError(res.data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ── Verify OTP ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    const email = sessionStorage.getItem('resetEmail');
    if (!email) { 
      router.push('/forgot-password'); 
      return; 
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await passwordResetAPI.verifyOTP(email, otpValue);
      if (res.data.success) {
        setSuccess(true);
        // Store reset token returned by server
        if (res.data.resetToken) {
          sessionStorage.setItem('resetToken', res.data.resetToken);
        }
        setTimeout(() => router.push('/reset-password'), 1500);
      } else {
        setError(res.data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  const email = sessionStorage.getItem('resetEmail') || '';

  return (
    <div className="verify-otp-wrapper">
      <div className="main-wrapper">
        <div className="otp-card">
          <div className="left-bg-image"></div>

          <div className="form-section">
            <div className="logo-wrapper">
              <Link href="/">
                <img src="/cocofina.png" alt="Cocofina" className="logo" />
              </Link>
            </div>

            <h2 className="title">VERIFY OTP</h2>
            <p className="subtitle">
              Enter the 6-digit code sent to<br />
              <strong>{email}</strong>
            </p>

            {success && (
              <div className="otp-success">
                <i className="fas fa-check-circle"></i> OTP verified! Redirecting…
              </div>
            )}
            {error && (
              <div className="otp-error">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}
            {resendMsg && (
              <div className="otp-resend-msg">
                <i className="fas fa-paper-plane"></i> {resendMsg}
              </div>
            )}

            {!success && (
              <form className="otp-form" onSubmit={handleSubmit}>
                <div className="otp-inputs-container" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className={`otp-input ${error ? 'otp-input--error' : ''} ${digit ? 'otp-input--filled' : ''}`}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      ref={(el) => (inputRefs.current[i] = el)}
                      disabled={submitting}
                      autoComplete="off"
                    />
                  ))}
                </div>

                <div className="timer-container">
                  {canResend ? (
                    <button
                      type="button"
                      className="resend-btn"
                      onClick={handleResend}
                      disabled={resending}
                    >
                      {resending
                        ? <><i className="fas fa-spinner fa-spin"></i> Sending…</>
                        : 'Resend OTP'
                      }
                    </button>
                  ) : (
                    <p className="timer-text">
                      Resend OTP in <span className="timer-count">{formatTime(timeLeft)}</span>
                    </p>
                  )}
                </div>

                <button type="submit" className="verify-btn" disabled={submitting || otp.join('').length < 6}>
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin"></i> Verifying…</>
                    : 'Verify & Continue'
                  }
                </button>

                <p className="fp-back-link" style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px' }}>
                  Wrong email? <Link href="/forgot-password">Go back</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;