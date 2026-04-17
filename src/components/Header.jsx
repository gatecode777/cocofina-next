'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBasket, UserRound, Menu, X, LogOut, User, Package } from 'lucide-react';
import { userAuth } from '@/services/api';
import { useCart } from '@/context/CartContext';
import '@/styles/header.css';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const { count: cartCount } = useCart();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const loadUser = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) setUser(JSON.parse(userData));
      else setUser(null);
    } catch { 
      setUser(null); 
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('userAuthChanged', loadUser);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('userAuthChanged', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // ── Close dropdown on outside click ────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await userAuth.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsUserDropdownOpen(false);
    window.dispatchEvent(new Event('userAuthChanged'));
    router.push('/');
  };

  const handleUserIconClick = () => {
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    } else {
      setIsUserDropdownOpen((p) => !p);
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const getAvatarContent = () => {
    if (user?.profile) {
      return (
        <img
          src={`/uploads/profiles/${user.profile}`}
          alt={user.firstName}
          className="header-avatar-img"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }
    const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    return <span className="header-avatar-initials">{initials}</span>;
  };

  const isLoggedIn = Boolean(user);

  // Helper to check if link is active
  const isActive = (href) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header className="cf-main-site-header">
      <div className="cf-header-inner">

        {/* Logo */}
        <div className="cf-logo">
          <Link href="/" onClick={closeMobileMenu}>
            <img src="/cocofina.png" alt="Cocofina Logo" style={{ height: '100px', width: 'auto' }} />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="cf-nav">
          <ul className="cf-menu">
            <li>
              <Link href="/" className={isActive('/') ? 'active' : ''}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/our-products" className={isActive('/our-products') ? 'active' : ''}>
                Our Product
              </Link>
            </li>
            <li>
              <Link href="/benefits" className={isActive('/benefits') ? 'active' : ''}>
                Benefits
              </Link>
            </li>
            <li>
              <Link href="/about-us" className={isActive('/about-us') ? 'active' : ''}>
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact-us" className={isActive('/contact-us') ? 'active' : ''}>
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        {/* Action icons */}
        <div className="cf-actions">
          <button className="icon-btn" aria-label="Search">
            <Search size={20} />
          </button>

          {/* Cart icon — only when logged in, with live count badge */}
          {isLoggedIn && (
            <button
              className="icon-btn cart-icon-btn"
              aria-label="Cart"
              onClick={() => router.push('/cart')}
            >
              <ShoppingBasket size={20} />
              {cartCount > 0 && (
                <span className="cart-count-badge">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {/* User icon / avatar */}
          <div className="header-user-wrap" ref={dropdownRef}>
            <button
              className={`icon-btn header-user-btn ${isLoggedIn ? 'logged-in' : ''}`}
              aria-label={isLoggedIn ? 'Account menu' : 'Login'}
              onClick={handleUserIconClick}
              title={isLoggedIn ? `${user.firstName} ${user.lastName}` : 'Login'}
            >
              {isLoggedIn ? (
                <div className="header-avatar">{getAvatarContent()}</div>
              ) : (
                <UserRound size={20} />
              )}
            </button>

            {isLoggedIn && isUserDropdownOpen && (
              <div className="header-user-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-avatar">{getAvatarContent()}</div>
                  <div>
                    <p className="dropdown-name">{user.firstName} {user.lastName}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link href="/my-profile" className="dropdown-link" onClick={() => setIsUserDropdownOpen(false)}>
                  <User size={15} /> My Profile
                </Link>
                <Link href="/my-orders" className="dropdown-link" onClick={() => setIsUserDropdownOpen(false)}>
                  <Package size={15} /> My Orders
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-link dropdown-logout" onClick={handleLogout}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button className="mobile-toggle" aria-label="Toggle Menu" onClick={() => setIsMobileMenuOpen((p) => !p)}>
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Mobile menu */}
        <div className={`cf-mobile-menu-box ${isMobileMenuOpen ? 'active' : ''}`}>
          <Link href="/" className={isActive('/') ? 'active' : ''} onClick={closeMobileMenu}>
            Home
          </Link>
          <Link href="/our-products" className={isActive('/our-products') ? 'active' : ''} onClick={closeMobileMenu}>
            Our Product
          </Link>
          <Link href="/benefits" className={isActive('/benefits') ? 'active' : ''} onClick={closeMobileMenu}>
            Benefits
          </Link>
          <Link href="/about-us" className={isActive('/about-us') ? 'active' : ''} onClick={closeMobileMenu}>
            About Us
          </Link>
          <Link href="/contact-us" className={isActive('/contact-us') ? 'active' : ''} onClick={closeMobileMenu}>
            Contact Us
          </Link>
          <div className="mobile-menu-divider"></div>
          {isLoggedIn ? (
            <>
              <Link href="/my-profile" className="mobile-menu-user-link" onClick={closeMobileMenu}>
                <User size={14} /> My Profile
              </Link>
              <Link href="/my-orders" className="mobile-menu-user-link" onClick={closeMobileMenu}>
                <Package size={14} /> My Orders
              </Link>
              <Link href="/cart" className="mobile-menu-user-link" onClick={closeMobileMenu}>
                <ShoppingBasket size={14} /> Cart
                {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </Link>
              <button className="mobile-menu-logout" onClick={() => { closeMobileMenu(); handleLogout(); }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="mobile-menu-login-btn" onClick={closeMobileMenu}>
              Login / Sign Up
            </Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;