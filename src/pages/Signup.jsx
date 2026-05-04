'use client';

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

  // Indian phone number validation function
  const validateIndianPhoneNumber = (phone) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if empty
    if (!cleaned) {
      return { isValid: false, message: 'Phone number is required' };
    }
    
    // Check length (Indian numbers are 10 digits)
    if (cleaned.length !== 10) {
      return { isValid: false, message: 'Please enter a valid 10-digit phone number' };
    }
    
    // Check if starts with valid Indian mobile prefixes
    // Valid prefixes: 6,7,8,9 (mobile numbers in India start with these)
    const firstDigit = cleaned[0];
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return { isValid: false, message: 'Phone number must start with 6, 7, 8, or 9' };
    }
    
    // Check if all digits are numbers (already done by regex)
    if (!/^\d{10}$/.test(cleaned)) {
      return { isValid: false, message: 'Please enter a valid 10-digit phone number' };
    }
    
    // Optional: Check for repetitive patterns (1111111111, 1234567890, etc.)
    const repetitivePatterns = [
      /^(\d)\1{9}$/, // Same digit repeated 10 times
      /^1234567890$/, // Sequential increasing
      /^9876543210$/, // Sequential decreasing
      /^0123456789$/, // Sequential with zero
    ];
    
    for (const pattern of repetitivePatterns) {
      if (pattern.test(cleaned)) {
        return { isValid: false, message: 'Please enter a valid phone number' };
      }
    }
    
    return { isValid: true, message: '' };
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    
    // Enhanced phone number validation
    if (!formData.contactNumber.trim()) {
      e.contactNumber = 'Contact number is required';
    } else {
      const phoneValidation = validateIndianPhoneNumber(formData.contactNumber);
      if (!phoneValidation.isValid) {
        e.contactNumber = phoneValidation.message;
      }
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

  // Format phone number as user types (optional)
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    return cleaned.slice(0, 10);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number to format it
    if (name === 'contactNumber') {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
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
        phone: formData.contactNumber.replace(/\D/g, ''), // Send only digits
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
              </div>
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}

              {/* Last Name */}
              <div className="input-icon-container">
                <i className="fa-regular fa-user"></i>
                <input type="text" name="lastName" placeholder="Last Name"
                  className={`input-field-s ${errors.lastName ? 'error' : ''}`}
                  value={formData.lastName} onChange={handleChange} disabled={isLoading} />
              </div>
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}

              {/* Phone */}
              <div className="input-icon-container">
                <i className="fa-solid fa-phone-flip"></i>
                <input type="tel" name="contactNumber" placeholder="Contact Number (10 digits)"
                  className={`input-field-s ${errors.contactNumber ? 'error' : ''}`}
                  value={formData.contactNumber} onChange={handleChange}
                  disabled={isLoading} maxLength={10} />
              </div>
                {errors.contactNumber && <span className="field-error">{errors.contactNumber}</span>}

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
              </div>
                {errors.password && <span className="field-error">{errors.password}</span>}

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
              </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

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