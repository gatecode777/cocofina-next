'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import { userAuth } from '@/services/api';
import '@/styles/login.css';

// Create a separate component that uses useSearchParams
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check if already logged in
  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem('token');
    if (token) {
      const from = searchParams.get('redirectAfterLogin') || searchParams.get('from') || sessionStorage.getItem('redirectAfterLogin') || '/';
      sessionStorage.removeItem('redirectAfterLogin');
      router.push(from);
    }
  }, [router, searchParams]);

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
        // Store user data & set cookie for middleware
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        document.cookie = `token=${res.data.token}; path=/; max-age=604800; SameSite=Lax`;
        
        // Trigger events for Header to update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('userAuthChanged'));

        // Instant smooth redirect
        const from = searchParams.get('redirectAfterLogin') || searchParams.get('from') || sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
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
      
      const response = await fetch('/api/auth/google-login', {
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
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        
        console.log('Stored user data:', userData);
        console.log('Stored token:', data.token);
        
        // Trigger events for Header to update
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('userAuthChanged'));
        
        // Instant smooth redirect
        const from = searchParams.get('redirectAfterLogin') || searchParams.get('from') || sessionStorage.getItem('redirectAfterLogin') || '/';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(from);
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

  if (!isMounted) {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-card">
            <div className="form-section">
              <div className="logo-wrapper">
                <Link href="/">
                  <img src="/cocofina.png" alt="Cocofina Logo" className="logo-img" />
                </Link>
              </div>
              <div className="loading-spinner">Loading...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 flex items-center justify-center">
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
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  theme="filled_blue"
                  shape="pill"
                  width="300"
                  text="signin_with"
                  locale="en"
                />
              ) : (
                <div style={{ fontSize: '13px', color: '#b91c1c', textAlign: 'center', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                  Google Sign-In requires <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in <code>.env.local</code>.
                </div>
              )}
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
    </main>
  );
};

// Main component with Suspense boundary
const Login = () => {
  return (
    <Suspense fallback={
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-card">
            <div className="form-section">
              <div className="loading-spinner">Loading login page...</div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
};

export default Login;