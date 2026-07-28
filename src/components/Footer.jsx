"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Leaf, HeartHandshake, Sparkles, Phone, Mail, MapPin, Clock } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 transition-colors duration-500">
      {/* Top Value Props Banner */}
      <div className="border-b border-neutral-800 py-10 px-6 sm:px-10 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Leaf className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">100% Organic & Pure</h4>
          <p className="text-xs text-neutral-400">Unrefined sap without bleaching or synthetic additives</p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">Low Glycemic Index (GI 35)</h4>
          <p className="text-xs text-neutral-400">Gentle on blood sugar compared to white sugar (GI 65)</p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">Sustainably Tapped</h4>
          <p className="text-xs text-neutral-400">Hand-collected high in tropical coconut palm canopies</p>
        </div>

        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-semibold text-white text-sm">Rich in Minerals</h4>
          <p className="text-xs text-neutral-400">Contains natural Potassium, Zinc, Iron & Inulin fiber</p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Brand info */}
        <div className="md:col-span-5 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/cocofina.png" alt="Cocofina Logo" className="h-10 w-auto object-contain" />
          </Link>
          <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
            Jaipur's #1 organic coconut sugar brand. Crafting pure, unrefined organic coconut sugar straight from tropical coconut blossoms. Elevate your coffee, tea, desserts, and daily cooking.
          </p>

          <div className="pt-2">
            <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Join the Pure Club for 10% Off
            </h5>
            <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 bg-neutral-800 text-white text-xs px-4 py-2.5 rounded-full border border-neutral-700 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-5 py-2.5 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Welcome! Check your inbox for your 10% coupon code.
              </p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="md:col-span-2 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-wider font-playfair italic">
            Navigation
          </h5>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li><Link href="/" className="hover:text-amber-400 transition-colors">Home Landing</Link></li>
            <li><Link href="/products" className="hover:text-amber-400 transition-colors">Our Products</Link></li>
            <li><Link href="/about-us" className="hover:text-amber-400 transition-colors">About Us</Link></li>
            <li><Link href="/how-its-made" className="hover:text-amber-400 transition-colors">Our Sourcing</Link></li>
            <li><Link href="/recipes" className="hover:text-amber-400 transition-colors">Recipes & Ideas</Link></li>
            <li><Link href="/contact-us" className="hover:text-amber-400 transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Products */}
        <div className="md:col-span-2 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-wider font-playfair italic">
            Products & Packs
          </h5>
          <ul className="space-y-2 text-xs text-neutral-400">
            <li>
              <Link href="/products" className="hover:text-amber-400 transition-colors flex justify-between">
                <span>Cocofina 400g Pack</span>
                <span className="text-amber-400 font-semibold">₹349</span>
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-amber-400 transition-colors flex justify-between">
                <span>Cocofina 1kg Bulk Pack</span>
                <span className="text-amber-400 font-semibold">₹700</span>
              </Link>
            </li>
            <li><span className="text-neutral-500">Free Shipping on ₹499+</span></li>
            <li><span className="text-neutral-500">100% Eco-Friendly Pouch</span></li>
          </ul>
        </div>

        {/* Contact & Support Numbers from Old Site */}
        <div className="md:col-span-3 space-y-3">
          <h5 className="text-sm font-bold text-white uppercase tracking-wider font-playfair italic">
            Contact Us & Support
          </h5>
          <div className="text-xs text-neutral-400 space-y-2">
            <div className="flex items-start gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium">+91 8233227986</p>
                <p className="text-white font-medium">+91 9119212778</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <a href="mailto:info@cocofinasugar.com" className="text-white hover:underline">info@cocofinasugar.com</a>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Jaipur, Rajasthan & Kochi, Kerala, India</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Mon – Sun: 10:00 AM – 6:00 PM</span>
            </div>

            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700">UPI / GPay</span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700">Credit/Debit Cards</span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700">NetBanking</span>
              <span className="px-2 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700">COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-neutral-800 py-6 px-6 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Cocofina Sugar. All rights reserved. Jaipur's Premier Organic Coconut Sugar.</p>
      </div>
    </footer>
  );
}