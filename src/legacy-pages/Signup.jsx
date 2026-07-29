'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { userAuth } from '@/services/api';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword } from 'firebase/auth';
import '@/styles/signup.css';

const Signup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', contactNumber: '',
    email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ── Firebase OTP State ──────────────────────────────────────────────────
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (otpResendCooldown > 0) {
      timer = setInterval(() => setOtpResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpResendCooldown]);

  const resetRecaptcha = () => {
    if (typeof window === 'undefined') return;
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch {}
      window.recaptchaVerifier = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }
  };

  const setupRecaptcha = () => {
    if (typeof window === 'undefined') return null;

    resetRecaptcha();

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          resetRecaptcha();
        },
      });
      return window.recaptchaVerifier;
    } catch (err) {
      console.warn('Error creating RecaptchaVerifier:', err);
      return null;
    }
  };

  const validateIndianPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return { isValid: false, message: 'Phone number is required' };
    if (cleaned.length !== 10) return { isValid: false, message: 'Please enter a valid 10-digit phone number' };
    if (!['6', '7', '8', '9'].includes(cleaned[0])) return { isValid: false, message: 'Phone number must start with 6, 7, 8, or 9' };
    return { isValid: true, message: '' };
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    
    if (!formData.contactNumber.trim()) {
      e.contactNumber = 'Contact number is required';
    } else {
      const phoneValidation = validateIndianPhoneNumber(formData.contactNumber);
      if (!phoneValidation.isValid) e.contactNumber = phoneValidation.message;
    }
    
    if (!formData.email.trim()) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      e.password = 'Password is required';
    } else if (formData.password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      e.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contactNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errors.submit) setErrors((prev) => ({ ...prev, submit: '' }));
  };

  // ── Step 1: Pre-check User & Send SMS OTP ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});

    // 1. Pre-check if email/phone already exist in DB BEFORE calling Firebase SMS
    try {
      const checkRes = await userAuth.checkUser({
        email: formData.email.trim(),
        phone: formData.contactNumber.replace(/\D/g, ''),
      });
      if (!checkRes.data.success) {
        setErrors({ submit: checkRes.data.message || 'Email or phone number already registered.' });
        setIsLoading(false);
        return;
      }
    } catch (checkErr) {
      if (checkErr.response?.status === 409) {
        setErrors({ submit: checkErr.response.data.message || 'This email or phone number is already registered.' });
        setIsLoading(false);
        return;
      }
    }

    // 2. If available, proceed with Firebase Phone Auth SMS OTP
    const fullPhone = `+91${formData.contactNumber.replace(/\D/g, '')}`;

    try {
      let appVerifier = setupRecaptcha();
      let confirmation;

      try {
        confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      } catch (firstErr) {
        console.warn('First SMS attempt warning:', firstErr);
        resetRecaptcha();
        appVerifier = setupRecaptcha();
        confirmation = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      }

      setConfirmationResult(confirmation);
      setStep('otp');
      setOtpResendCooldown(30);
    } catch (err) {
      console.error('Firebase SMS Error:', err);
      resetRecaptcha();

      if (err.code === 'auth/captcha-check-failed' || err.message?.includes('captcha-check-failed') || err.message?.includes('Hostname match not found')) {
        setErrors({
          submit: 'Domain authorization error: Please add your live website domain (e.g. cocofinasugar.com) to Firebase Console -> Authentication -> Settings -> Authorized Domains.',
        });
      } else if (err.code === 'auth/invalid-app-credential' || err.message?.includes('invalid-app-credential')) {
        setErrors({
          submit: 'Domain authorization error: Please add your website domain to Firebase Console -> Authentication -> Settings -> Authorized Domains.',
        });
      } else if (err.code === 'auth/billing-not-enabled' || err.message?.includes('billing-not-enabled')) {
        setErrors({
          submit: 'Firebase Phone Auth requires setting up a Test Phone Number in Firebase Console, or switching your Firebase project to the Blaze Plan.',
        });
      } else if (err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed')) {
        setErrors({
          submit: 'Network error: Please ensure your domain is added to Firebase Console -> Authentication -> Settings -> Authorized Domains.',
        });
      } else {
        setErrors({ submit: err.message || 'Failed to send SMS OTP. Please check your phone number.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Complete Registration ──────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP code' });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      // 1. Verify OTP with Firebase Auth
      await confirmationResult.confirm(otp);

      // 2. Register/Sync in Firebase Auth
      try {
        await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      } catch (fbErr) {
        console.warn('Firebase Auth user sync info:', fbErr.message);
      }

      // 3. Complete User Registration in MongoDB Backend
      const res = await userAuth.register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.contactNumber.replace(/\D/g, ''),
      });

      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        document.cookie = `token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
        window.dispatchEvent(new Event('userAuthChanged'));
        const redirect = searchParams.get('from') || '/';
        router.push(redirect);
      }
    } catch (err) {
      console.error('Verification Error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setErrors({ otp: 'Invalid OTP code. Please check and try again.' });
      } else {
        const msg = err.response?.data?.message || err.message || 'OTP verification failed.';
        setErrors({ otp: msg });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 flex items-center justify-center">
      {/* Firebase Invisible Recaptcha Element */}
      <div id="recaptcha-container"></div>

      <div className="registration-wrapper">
        <div className="main-wrapper">
          <div className="reg-card">
            <div className="left-bg-image-s"></div>
            <div className="form-side">
              <div className="logo-container">
                <Link href="/">
                  <img src="/cocofina.png" alt="Logo" className="logo" />
                </Link>
              </div>

              <h2 className="title">{step === 'otp' ? 'VERIFY MOBILE OTP' : 'REGISTRATION'}</h2>

              {step === 'form' ? (
                <>
                  {errors.submit && (
                    <div className="auth-error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.submit}
                    </div>
                  )}

                  <form className="reg-form" onSubmit={handleSubmit}>
                    {/* First Name */}
                    <div className="input-icon-container">
                      <i className="fa-regular fa-user"></i>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        className={`input-field-s ${errors.firstName ? 'error' : ''}`}
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.firstName && <span className="field-error">{errors.firstName}</span>}

                    {/* Last Name */}
                    <div className="input-icon-container">
                      <i className="fa-regular fa-user"></i>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        className={`input-field-s ${errors.lastName ? 'error' : ''}`}
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.lastName && <span className="field-error">{errors.lastName}</span>}

                    {/* Phone */}
                    <div className="input-icon-container">
                      <i className="fa-solid fa-phone-flip"></i>
                      <input
                        type="tel"
                        name="contactNumber"
                        placeholder="Contact Number (10 digits)"
                        className={`input-field-s ${errors.contactNumber ? 'error' : ''}`}
                        value={formData.contactNumber}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={10}
                      />
                    </div>
                    {errors.contactNumber && <span className="field-error">{errors.contactNumber}</span>}

                    {/* Email */}
                    <div className="input-icon-container">
                      <i className="fa-regular fa-envelope"></i>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        className={`input-field-s ${errors.email ? 'error' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <span className="field-error">{errors.email}</span>}

                    {/* Password */}
                    <div className="input-icon-container">
                      <i className="fa-solid fa-key"></i>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password (min 6 characters)"
                        className={`input-field-s ${errors.password ? 'error' : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => setShowPassword((p) => !p)}
                        disabled={isLoading}
                      >
                        <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                      </button>
                    </div>
                    {errors.password && <span className="field-error">{errors.password}</span>}

                    {/* Confirm Password */}
                    <div className="input-icon-container">
                      <i className="fa-solid fa-key"></i>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        className={`input-field-s ${errors.confirmPassword ? 'error' : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="eye-toggle"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        disabled={isLoading}
                      >
                        <i className={showConfirmPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

                    <p className="terms-text">
                      By signing below, you agree to the{' '}
                      <a href="/terms-and-conditions" className="cyan-link underline">terms of use</a> and{' '}
                      <a href="/privacy-policy" className="cyan-link underline">privacy notice</a>
                    </p>

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                      {isLoading ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Sending SMS OTP…</>
                      ) : (
                        'Send OTP & Register'
                      )}
                    </button>

                    <p className="footer-text">
                      Already have an account?{' '}
                      <Link href="/login" className="cyan-link bold-link">Login</Link>
                    </p>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      We sent a 6-digit SMS verification code to:
                    </p>
                    <strong className="text-base text-amber-600 dark:text-amber-400 font-mono">
                      +91 {formData.contactNumber}
                    </strong>
                  </div>

                  {errors.otp && (
                    <div className="auth-error-msg">
                      <i className="fa-solid fa-circle-exclamation"></i> {errors.otp}
                    </div>
                  )}

                  <form className="reg-form" onSubmit={handleVerifyOTP}>
                    <div className="input-icon-container">
                      <i className="fa-solid fa-shield-halved"></i>
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter 6-digit OTP"
                        className={`input-field-s text-center tracking-widest font-mono text-lg ${errors.otp ? 'error' : ''}`}
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                          if (errors.otp) setErrors({});
                        }}
                        maxLength={6}
                        disabled={isVerifying}
                        autoFocus
                      />
                    </div>

                    <button type="submit" className="submit-btn" disabled={isVerifying}>
                      {isVerifying ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Verifying OTP…</>
                      ) : (
                        'Verify OTP & Complete Registration'
                      )}
                    </button>

                    <div className="flex items-center justify-between mt-4 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          resetRecaptcha();
                          setStep('form');
                          setOtp('');
                          setErrors({});
                        }}
                        className="text-neutral-500 hover:text-neutral-800 dark:hover:text-white font-medium cursor-pointer"
                      >
                        ← Edit Phone Number
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={otpResendCooldown > 0 || isLoading}
                        className="text-amber-600 dark:text-amber-400 font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        {otpResendCooldown > 0 ? `Resend OTP in ${otpResendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Signup;