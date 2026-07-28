"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCart } from "../context/CartContext";
import { Sun, Moon, Menu, X, ShoppingBag } from "lucide-react";

export function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { totalItems, setIsCartOpen } = useCart();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About Us", href: "/about-us" },
    { label: "Process", href: "/how-its-made" },
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
          <img src="/cocofina.png" alt="Cocofina Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-lg" />
        </Link>

        {/* Center Pill (Desktop) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 rounded-full px-2 py-2 items-center gap-1 transition-colors duration-500">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
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

        {/* Right CTA, Cart & Theme Toggle (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
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

          <Link
            href="/products"
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer active:scale-95"
          >
            Shop Now
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2.5">
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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/20 flex items-center justify-center text-neutral-800 dark:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-4 top-20 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-black/10 dark:border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 z-50">
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
