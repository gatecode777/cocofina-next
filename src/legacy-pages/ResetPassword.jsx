'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { passwordResetAPI } from '@/services/api';
import '@/styles/resetpassword.css';

const ResetPasswordPage = () => {
  const router = useRouter();

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverErr, setServerErr] = useState('');

  useEffect(() => {
    document.title = 'Reset Password - Cocofina';
    window.scrollTo(0, 0);
    // Guard: must have gone through OTP step
    if (typeof window !== "undefined") {
      const email = sessionStorage.getItem('resetEmail');
      const resetToken = sessionStorage.getItem('resetToken');
      if (!email && !resetToken) router.push('/forgot-password');
    }
  }, [router]);

  const validateField = (name, value) => {
    if (name === 'newPassword') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'At least 6 characters required';
      if (!/[A-Z]/.test(value)) return 'Must include one uppercase letter';
      if (!/[0-9]/.test(value)) return 'Must include one number';
    }
    if (name === 'confirmPassword') {
      if (!value) return 'Please confirm your password';
      if (value !== form.newPassword) return 'Passwords do not match';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setServerErr('');
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    if (name === 'confirmPassword' || name === 'newPassword') {
      setErrors(p => ({ ...p, confirmPassword: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setErrors(p => ({ ...p, [name]: err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErr('');

    const newErr = {
      newPassword: validateField('newPassword', form.newPassword),
      confirmPassword: validateField('confirmPassword', form.confirmPassword),
    };

    if (!newErr.confirmPassword && form.newPassword !== form.confirmPassword) {
      newErr.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErr);
    if (Object.values(newErr).some(Boolean)) return;

    setSubmitting(true);
    try {
      const email = sessionStorage.getItem('resetEmail');
      const resetToken = sessionStorage.getItem('resetToken');

      const res = await passwordResetAPI.resetPassword(
        email,
        null,
        form.newPassword,
        resetToken
      );

      if (res.data.success) {
        setSuccess(true);
        sessionStorage.removeItem('resetEmail');
        sessionStorage.removeItem('resetToken');
        setTimeout(() => router.push('/login'), 2200);
      } else {
        setServerErr(res.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const strength = (() => {
    const p = form.newPassword;
    if (!p) return { level: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { level: 1, label: 'Weak', color: '#ef4444' };
    if (s <= 3) return { level: 2, label: 'Fair', color: '#f59e0b' };
    if (s <= 4) return { level: 3, label: 'Good', color: '#3b82f6' };
    return { level: 4, label: 'Strong', color: '#10b981' };
  })();

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 flex items-center justify-center">
      <div className="reset-password-wrapper">
        <div className="reset-container">
          <div className="reset-card">
            <div className="logo-wrapper">
              <Link href="/">
                <img src="/cocofina.png" alt="Cocofina Logo" className="logo-img" />
              </Link>
            </div>

            <h2 className="welcome-text">Reset Password</h2>
            <p className="auth-description">
              Choose a strong new password for your account.
            </p>

            {success && (
              <div className="auth-success-msg">
                <i className="fa-solid fa-circle-check"></i>
                <span>Password reset successfully! Redirecting to login…</span>
              </div>
            )}

            {serverErr && (
              <div className="auth-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{serverErr}</span>
              </div>
            )}

            {!success && (
              <form className="reset-form" onSubmit={handleSubmit}>

                {/* New Password */}
                <div className="input-icon-container-l">
                  <i className="fa-solid fa-key left-icon"></i>
                  <input
                    type={showNew ? 'text' : 'password'}
                    name="newPassword"
                    placeholder="New Password"
                    value={form.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={submitting}
                    className={`input-field-s ${errors.newPassword ? 'input-error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowNew(p => !p)}
                    disabled={submitting}
                  >
                    <i className={showNew ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                  </button>
                </div>
                {errors.newPassword && <span className="field-error-text">{errors.newPassword}</span>}

                {/* Strength bar */}
                {form.newPassword && (
                  <div className="rp-strength">
                    <div className="rp-strength-bar">
                      {[1, 2, 3, 4].map(l => (
                        <div key={l} className="rp-strength-seg"
                          style={{ background: l <= strength.level ? strength.color : '#e2e8f0' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="input-icon-container-l">
                  <i className="fa-solid fa-lock left-icon"></i>
                  <input
                    type={showConf ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={submitting}
                    className={`input-field-s ${errors.confirmPassword ? 'input-error' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConf(p => !p)}
                    disabled={submitting}
                  >
                    <i className={showConf ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                  </button>
                </div>
                {errors.confirmPassword && <span className="field-error-text">{errors.confirmPassword}</span>}
                {!errors.confirmPassword && form.confirmPassword && form.confirmPassword === form.newPassword && (
                  <span className="field-success-text"><i className="fa-solid fa-check"></i> Passwords match</span>
                )}

                <button type="submit" className="reset-btn" disabled={submitting}>
                  {submitting ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i> Resetting…</>
                  ) : (
                    'Reset Password'
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

export default ResetPasswordPage;