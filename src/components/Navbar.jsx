"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCart } from "../context/CartContext";
import { Sun, Moon, Menu, X, ShoppingBag, User, Package, MapPin, LogOut, UserPlus } from "lucide-react";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // ── Auth state listener ──────────────────────────────────────────────────
  const loadUser = () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) setUser(JSON.parse(userData));
      else setUser(null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("userAuthChanged", loadUser);
    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("userAuthChanged", loadUser);
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  // ── Outside click / touch to close profile dropdown ─────────────────────
  useEffect(() => {
    const handler = (e) => {
      const inDesktop = dropdownRef.current && dropdownRef.current.contains(e.target);
      const inMobile = mobileDropdownRef.current && mobileDropdownRef.current.contains(e.target);
      if (!inDesktop && !inMobile) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    setIsProfileDropdownOpen(false);
    window.dispatchEvent(new Event("userAuthChanged"));
    router.push("/");
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About Us", href: "/about-us" },
    { label: "Process", href: "/how-its-made" },
    { label: "Blog", href: "/our-blogs" },
    { label: "Recipes", href: "/recipes" },
  ];

  const toggleTheme = () => {
    const current = resolvedTheme || theme;
    setTheme(current === "dark" ? "light" : "dark");
  };

  return (
    <header>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-6 bg-transparent border-none">
        {/* Left: Logo & Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={mounted && (resolvedTheme === "dark" || theme === "dark") ? "/Cocofina-white.png" : "/cocofina.png"}
            alt="Cocofina Logo"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-lg"
          />
        </Link>

        {/* Center Pill (Desktop LG+) */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 rounded-full px-2 py-2 items-center gap-1 transition-colors duration-500">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-sm"
                    : "text-neutral-600 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/20 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right CTA, Cart, Theme & Profile Section (Desktop LG+) */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="View Shopping Basket"
            className="relative w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-neutral-800 dark:text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
          >
            {mounted && (resolvedTheme === "dark" || theme === "dark") ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* User Profile Section Button & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              aria-label="User Profile"
              title={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Account"}
              className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
            >
              {user ? (
                <div className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                  {user.firstName?.[0]?.toUpperCase() || "U"}
                </div>
              ) : (
                <User className="w-4 h-4 text-neutral-800 dark:text-white" />
              )}
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-black/10 dark:border-white/15 rounded-2xl p-2 shadow-2xl z-50 flex flex-col gap-1 text-sm font-medium">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/my-profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/my-orders"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/addresses"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Saved Addresses</span>
                    </Link>
                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      User Account
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-900 dark:text-white font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Log In</span>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Create Account</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            href="/products"
            className="whitespace-nowrap bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer active:scale-95"
          >
            Shop Now
          </Link>
        </div>

        {/* Mobile & Tablet Controls (Below LG) */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="View Basket"
            className="relative w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white cursor-pointer"
          >
            {mounted && (resolvedTheme === "dark" || theme === "dark") ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* User Profile Button & Dropdown for Mobile & Tablet */}
          <div className="relative" ref={mobileDropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileDropdownOpen((prev) => !prev);
              }}
              aria-label="User Profile"
              title={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : "Account"}
              className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white cursor-pointer active:scale-95"
            >
              {user ? (
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {user.firstName?.[0]?.toUpperCase() || "U"}
                </div>
              ) : (
                <User className="w-4 h-4 text-neutral-800 dark:text-white" />
              )}
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-black/10 dark:border-white/15 rounded-2xl p-2 shadow-2xl z-[110] flex flex-col gap-1 text-sm font-medium">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/my-profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/my-orders"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>My Orders</span>
                    </Link>
                    <Link
                      href="/addresses"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Saved Addresses</span>
                    </Link>
                    <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      User Account
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-900 dark:text-white font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Log In</span>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Create Account</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile & Tablet Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-4 top-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-black/10 dark:border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-3 z-50">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-left text-base font-medium py-2 border-b border-neutral-100 dark:border-neutral-800 ${
                  pathname === item.href
                    ? "text-amber-600 dark:text-amber-400 font-bold"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-2 flex flex-col gap-2 border-t border-neutral-100 dark:border-neutral-800">
              {user ? (
                <>
                  <Link
                    href="/my-profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 py-1"
                  >
                    <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/my-orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 py-1"
                  >
                    <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/addresses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 py-1"
                  >
                    <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Saved Addresses</span>
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 py-1 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 py-1"
                >
                  <User className="w-4 h-4" />
                  <span>Log In / Sign Up</span>
                </Link>
              )}
            </div>

            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full mt-2 text-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold py-3 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
