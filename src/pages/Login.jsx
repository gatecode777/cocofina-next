'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { userAuth } from '@/services/api';
import '@/styles/login.css';

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const from = searchParams.get('from') || '/';
      router.push(from);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await userAuth.loginUser({ email, password });

      if (res.data.success) {
        // Store user data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Trigger events for Header to update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('userAuthChanged'));

        // Redirect
        const from = searchParams.get('from') || '/';
        router.push(from);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      console.log('Sending Google token to backend...');
      
      const response = await fetch('/api/users/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          credential: credentialResponse.credential 
        }),
      });

      const data = await response.json();
      console.log('Google login response:', data);

      if (data.success) {
        // Store user data - Use the same format as regular login
        const userData = {
          id: data.user.id,
          _id: data.user.id, // Ensure both id and _id exist
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          phone: data.user.phone || '',
          profile: data.user.profile || ''
        };
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Stored user data:', userData);
        console.log('Stored token:', data.token);
        
        // Trigger events for Header to update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('userAuthChanged'));
        
        // Small delay to ensure events are processed
        setTimeout(() => {
          const from = searchParams.get('from') || '/';
          router.push(from);
        }, 100);
      } else {
        setError(data.message || 'Google login failed. Please try again.');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google login error occurred');
    setError('Google login failed. Please try again.');
    setGoogleLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="left-bg-image"></div>

          <div className="form-section">
            <div className="logo-wrapper">
              <Link href="/">
                <img src="/cocofina.png" alt="Cocofina Logo" className="logo-img" />
              </Link>
            </div>

            <h2 className="welcome-text">Welcome Back!</h2>

            {error && (
              <div className="auth-error-msg">
                <i className="fa-solid fa-circle-exclamation"></i> {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-icon-container-l">
                <i className="fa-regular fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="input-field-s"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  disabled={isLoading || googleLoading}
                  required
                />
              </div>

              <div className="input-icon-container-l">
                <i className="fa-solid fa-key"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="input-field-s"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  disabled={isLoading || googleLoading}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                  disabled={isLoading || googleLoading}
                >
                  <i className={showPassword ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash'}></i>
                </button>
              </div>

              <div className="forgot-link-container">
                <Link href="/forgot-password" className="maroon-text">
                  Forget Password?
                </Link>
              </div>

              <button type="submit" className="login-btn" disabled={isLoading || googleLoading}>
                {isLoading ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Logging in...</>
                ) : 'Log in'}
              </button>
            </form>

            <div className="divider" style={{margin:"10px"}}>
              <span>OR</span>
            </div>

            {/* Google Login Button */}
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="filled_blue"
                shape="rectangular"
                width="100%"
                text="signin_with"
                locale="en"
              />
              {googleLoading && (
                <div className="google-loading">
                  <i className="fa-solid fa-spinner fa-spin"></i> Connecting to Google...
                </div>
              )}
            </div>

            <p className="signup-text">
              Don't have an account?{' '}
              <Link href="/signup" className="cyan-link">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;