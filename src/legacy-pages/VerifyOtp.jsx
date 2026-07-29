'use client';

export const dynamic = "force-dynamic";
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
  const [email, setEmail] = useState('');

  const inputRefs = useRef([]);

  // Redirect away if no email in session
  useEffect(() => {
    document.title = 'Verify OTP - Cocofina';
    window.scrollTo(0, 0);

    if (typeof window !== "undefined") {
      const storedEmail = sessionStorage.getItem('resetEmail');

      if (!storedEmail) {
        router.push('/forgot-password');
      } else {
        setEmail(storedEmail);
      }
    }

    inputRefs.current[0]?.focus();
  }, [router]);

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
    const email = typeof window !== "undefined"
      ? sessionStorage.getItem('resetEmail')
      : null;
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

    const email = typeof window !== "undefined"
      ? sessionStorage.getItem('resetEmail')
      : null;
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

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 flex items-center justify-center">
      <div className="verify-otp-wrapper">
        <div className="main-wrapper">
          <div className="otp-card">
            <div className="logo-wrapper">
              <Link href="/">
                <img src="/cocofina.png" alt="Cocofina Logo" className="logo-img" />
              </Link>
            </div>

            <h2 className="welcome-text">Verify OTP</h2>
            <p className="auth-description">
              Enter the 6-digit verification code sent to<br />
              <strong>{email}</strong>
            </p>

            {success && (
              <div className="auth-success-msg">
                <i className="fa-solid fa-circle-check"></i>
                <span>OTP verified! Redirecting to password reset…</span>
              </div>
            )}

            {error && (
              <div className="auth-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            {resendMsg && (
              <div className="auth-info-msg">
                <i className="fa-solid fa-paper-plane"></i>
                <span>{resendMsg}</span>
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
                      {resending ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Resending…</>
                      ) : (
                        'Resend OTP'
                      )}
                    </button>
                  ) : (
                    <p className="timer-text">
                      Resend OTP in <span className="timer-count">{formatTime(timeLeft)}</span>
                    </p>
                  )}
                </div>

                <button type="submit" className="verify-btn" disabled={submitting || otp.join('').length < 6}>
                  {submitting ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Verifying…</>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                <p className="fp-back-link">
                  Entered wrong email?{' '}
                  <Link href="/forgot-password" className="maroon-text">
                    Change Email
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyOTPPage;