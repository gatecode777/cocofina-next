'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingBasket, UserRound, Menu, X, LogOut, User, Package } from 'lucide-react';
import { userAuth } from '@/services/api';
import { useCart } from '@/context/CartContext';
import '@/styles/header.css';

const Header = () => {
  const router   = useRouter();
  const pathname = usePathname();
  const dropdownRef    = useRef(null);
  const searchRef      = useRef(null);     // wraps the whole search UI
  const searchInputRef = useRef(null);     // the <input> itself
  const debounceRef    = useRef(null);
  const { count: cartCount } = useCart();

  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [user,               setUser]               = useState(null);

  // ── Search state ────────────────────────────────────────────────────────────
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const loadUser = () => {
    try {
      const token    = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) setUser(JSON.parse(userData));
      else setUser(null);
    } catch { setUser(null); }
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

  // ── Close search on outside click ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Close search on route change ───────────────────────────────────────────
  useEffect(() => {
    setSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  }, [pathname]);

  // ── Search API call ─────────────────────────────────────────────────────────
  const fetchResults = useCallback(async (q) => {
    if (!q.trim() || q.trim().length < 2) { setSearchResults([]); setSearchLoading(false); return; }
    try {
      setSearchLoading(true);
      const res = await fetch(`/api/products?search=${encodeURIComponent(q.trim())}&limit=6`);
      const data = await res.json();
      if (data.success) setSearchResults(data.products || []);
      else setSearchResults([]);
    } catch { setSearchResults([]); }
    finally { setSearchLoading(false); }
  }, []);

  // ── Debounce search input ───────────────────────────────────────────────────
  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(() => fetchResults(val), 350);
  };

  // ── Open search bar ─────────────────────────────────────────────────────────
  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  // ── Go to full results page ─────────────────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/our-products?search=${encodeURIComponent(searchTerm.trim())}`);
    setSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  // ── Click a result ──────────────────────────────────────────────────────────
  const handleResultClick = (product) => {
    router.push(`/products/${product.slug || product._id}`);
    setSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

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

  const isActive = (href) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  const getProductImage = (product) => {
    const img = product.images?.[0] || product.thumbnail;
    return img ? `/uploads/products/${img}` : '/cocofinaproduct.png';
  };

  return (
    <header className="cf-main-site-header">
      <div className="cf-header-inner">

        {/* Logo */}
        <div className="cf-logo">
          <Link href="/" onClick={closeMobileMenu}>
            <img src="/cocofina.png" alt="Cocofina Logo" style={{ height: '75px', width: 'auto' }} />
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="cf-nav">
          <ul className="cf-menu">
            <li><Link href="/"            className={isActive('/')             ? 'active' : ''}>Home</Link></li>
            <li><Link href="/our-products" className={isActive('/our-products') ? 'active' : ''}>Our Product</Link></li>
            <li><Link href="/benefits"    className={isActive('/benefits')     ? 'active' : ''}>Benefits</Link></li>
            <li><Link href="/about-us"    className={isActive('/about-us')     ? 'active' : ''}>About Us</Link></li>
            <li><Link href="/contact-us"  className={isActive('/contact-us')   ? 'active' : ''}>Contact Us</Link></li>
          </ul>
        </nav>

        {/* Action icons */}
        <div className="cf-actions">

          {/* ── Search ────────────────────────────────────────────────────── */}
          <div className={`header-search-wrap ${searchOpen ? 'search-open' : ''}`} ref={searchRef}>

            {/* Icon button (collapsed state) */}
            {!searchOpen && (
              <button className="icon-btn" aria-label="Search" onClick={openSearch}>
                <Search size={20} />
              </button>
            )}

            {/* Expanded search bar */}
            {searchOpen && (
              <form className="header-search-form" onSubmit={handleSearchSubmit}>
                <Search size={16} className="header-search-icon-inner" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="header-search-input"
                  placeholder="Search products…"
                  value={searchTerm}
                  onChange={handleSearchInput}
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="header-search-clear"
                    onClick={() => { setSearchTerm(''); setSearchResults([]); searchInputRef.current?.focus(); }}
                  >
                    <X size={14} />
                  </button>
                )}
                <button type="button" className="header-search-close" onClick={() => { setSearchOpen(false); setSearchTerm(''); setSearchResults([]); }}>
                  <X size={18} />
                </button>
              </form>
            )}

            {/* Results dropdown */}
            {searchOpen && (searchTerm.length >= 2) && (
              <div className="header-search-dropdown">
                {searchLoading ? (
                  <div className="hsd-loading">
                    <i className="fas fa-spinner fa-spin"></i> Searching…
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="hsd-empty">
                    No products found for "<strong>{searchTerm}</strong>"
                  </div>
                ) : (
                  <>
                    {searchResults.map((product) => {
                      const lowestPrice = product.variants?.length
                        ? Math.min(...product.variants.map(v => v.price))
                        : null;
                      return (
                        <button
                          key={product._id}
                          className="hsd-item"
                          onClick={() => handleResultClick(product)}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="hsd-item-img"
                            onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                          />
                          <div className="hsd-item-info">
                            <span className="hsd-item-name">{product.name}</span>
                            {product.category?.name && (
                              <span className="hsd-item-cat">{product.category.name}</span>
                            )}
                          </div>
                          {lowestPrice !== null && (
                            <span className="hsd-item-price">₹{lowestPrice}</span>
                          )}
                        </button>
                      );
                    })}
                    {/* View all results */}
                    <button
                      className="hsd-view-all"
                      onClick={handleSearchSubmit}
                    >
                      <Search size={14} />
                      View all results for "<strong>{searchTerm}</strong>"
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart icon */}
          {isLoggedIn && (
            <button className="icon-btn cart-icon-btn" aria-label="Cart" onClick={() => router.push('/cart')}>
              <ShoppingBasket size={20} />
              {cartCount > 0 && (
                <span className="cart-count-badge">{cartCount > 99 ? '99+' : cartCount}</span>
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
          {/* Mobile search */}
          <form className="mobile-search-form" onSubmit={handleSearchSubmit}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products…"
              value={searchTerm}
              onChange={handleSearchInput}
              autoComplete="off"
            />
            {searchTerm && (
              <button type="submit" className="mobile-search-go">Go</button>
            )}
          </form>

          <Link href="/"            className={isActive('/')             ? 'active' : ''} onClick={closeMobileMenu}>Home</Link>
          <Link href="/our-products" className={isActive('/our-products') ? 'active' : ''} onClick={closeMobileMenu}>Our Product</Link>
          <Link href="/benefits"    className={isActive('/benefits')     ? 'active' : ''} onClick={closeMobileMenu}>Benefits</Link>
          <Link href="/about-us"    className={isActive('/about-us')     ? 'active' : ''} onClick={closeMobileMenu}>About Us</Link>
          <Link href="/contact-us"  className={isActive('/contact-us')   ? 'active' : ''} onClick={closeMobileMenu}>Contact Us</Link>
          <div className="mobile-menu-divider"></div>
          {isLoggedIn ? (
            <>
              <Link href="/my-profile"   className="mobile-menu-user-link" onClick={closeMobileMenu}><User size={14} /> My Profile</Link>
              <Link href="/my-orders" className="mobile-menu-user-link" onClick={closeMobileMenu}><Package size={14} /> My Orders</Link>
              <Link href="/cart"      className="mobile-menu-user-link" onClick={closeMobileMenu}>
                <ShoppingBasket size={14} /> Cart
                {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
              </Link>
              <button className="mobile-menu-logout" onClick={() => { closeMobileMenu(); handleLogout(); }}>
                <LogOut size={14} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="mobile-menu-login-btn" onClick={closeMobileMenu}>Login / Sign Up</Link>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;