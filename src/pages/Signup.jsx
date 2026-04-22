'use client';

export const dynamic = "force-dynamic";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { userAuth } from '@/services/api';
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

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.contactNumber.trim()) {
      e.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      e.contactNumber = 'Please enter a valid 10-digit phone number';
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (errors.submit) setErrors((prev) => ({ ...prev, submit: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
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
        window.dispatchEvent(new Event('userAuthChanged'));
        const redirect = searchParams.get('from') || '/';
        router.push(redirect);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      // Show duplicate errors on the relevant field
      if (msg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (msg.toLowerCase().includes('phone')) {
        setErrors((prev) => ({ ...prev, contactNumber: msg }));
      } else {
        setErrors((prev) => ({ ...prev, submit: msg }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

            <h2 className="title">REGISTRATION</h2>

            {errors.submit && (
              <div className="auth-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i> {errors.submit}
              </div>
            )}

            <form className="reg-form" onSubmit={handleSubmit}>
              {/* First Name */}
              <div className="input-icon-container">
                <i className="fa-regular fa-user"></i>
                <input type="text" name="firstName" placeholder="First Name"
                  className={`input-field-s ${errors.firstName ? 'error' : ''}`}
                  value={formData.firstName} onChange={handleChange} disabled={isLoading} />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              {/* Last Name */}
              <div className="input-icon-container">
                <i className="fa-regular fa-user"></i>
                <input type="text" name="lastName" placeholder="Last Name"
                  className={`input-field-s ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName} onChange={handleChange} disabled={isLoading} />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>

              {/* Phone */}
              <div className="input-icon-container">
                <i className="fa-solid fa-phone-flip"></i>
                <input type="tel" name="contactNumber" placeholder="Contact Number (10 digits)"
                  className={`input-field-s ${errors.contactNumber ? 'error' : ''}`}
                  value={formData.contactNumber} onChange={handleChange}
                  disabled={isLoading} maxLength={10} />
                {errors.contactNumber && <span className="field-error">{errors.contactNumber}</span>}
              </div>

              {/* Email */}
              <div className="input-icon-container">
                <i className="fa-regular fa-envelope"></i>
                <input type="email" name="email" placeholder="Email Address"
                  className={`input-field-s ${errors.email ? 'error' : ''}`}
                  value={formData.email} onChange={handleChange} disabled={isLoading} />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="input-icon-container">
                <i className="fa-solid fa-key"></i>
                <input type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="Password (min 6 characters)"
                  className={`input-field-s ${errors.password ? 'error' : ''}`}
                  value={formData.password} onChange={handleChange} disabled={isLoading} />
                <button type="button" className="eye-toggle" onClick={() => setShowPassword(p => !p)} disabled={isLoading}>
                  <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                </button>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="input-icon-container">
                <i className="fa-solid fa-key"></i>
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword"
                  placeholder="Confirm Password"
                  className={`input-field-s ${errors.confirmPassword ? 'error' : ''}`}
                  value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} />
                <button type="button" className="eye-toggle" onClick={() => setShowConfirmPassword(p => !p)} disabled={isLoading}>
                  <i className={showConfirmPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                </button>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>

              <p className="terms-text">
                By signing below, you agree to the{' '}
                <a href="/terms" className="cyan-link underline">terms of use</a> and{' '}
                <a href="/privacy" className="cyan-link underline">privacy notice</a>
              </p>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading
                  ? <><i className="fa-solid fa-spinner fa-spin"></i> Registering…</>
                  : 'Register'
                }
              </button>

              <p className="footer-text">
                Already have an account?{' '}
                <Link href="/login" className="cyan-link bold-link">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;