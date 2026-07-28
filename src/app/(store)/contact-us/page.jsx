"use client";

import React, { useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { Phone, Mail, Clock, MapPin, CheckCircle, AlertCircle, Sparkles, Send } from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ submitting: false, success: false, error: "Please fill in all required fields." });
      return;
    }

    setFormStatus({ submitting: true, success: false, error: "" });
    setTimeout(() => {
      setFormStatus({ submitting: false, success: true, error: "" });
      setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
      setTimeout(() => {
        setFormStatus((prev) => ({ ...prev, success: false }));
      }, 5000);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20 transition-colors duration-500">
      <Navbar />

      {/* Header */}
      <section className="py-16 px-6 sm:px-10 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> We Are Here to Help
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white font-playfair italic">
          Contact Cocofina Support
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto">
          Have questions about your order, shipping, product specifications, or wholesale partnerships? Get in touch with our team in Jaipur & Kochi.
        </p>
      </section>

      {/* Main Grid */}
      <section className="pb-24 px-6 sm:px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6 bg-neutral-50 dark:bg-neutral-900/80 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Direct Contact Information
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Our customer service desk is open 7 days a week. Feel free to call, email, or send us a message anytime.
          </p>

          <div className="space-y-6 pt-4 text-xs sm:text-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <label className="font-bold text-neutral-900 dark:text-white block mb-0.5">Phone Support</label>
                <p className="text-neutral-600 dark:text-neutral-300">+91 8233227986</p>
                <p className="text-neutral-600 dark:text-neutral-300">+91 9119212778</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <label className="font-bold text-neutral-900 dark:text-white block mb-0.5">Email Support</label>
                <a href="mailto:info@cocofinasugar.com" className="text-amber-600 dark:text-amber-400 hover:underline">
                  info@cocofinasugar.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <label className="font-bold text-neutral-900 dark:text-white block mb-0.5">Headquarters & Locations</label>
                <p className="text-neutral-600 dark:text-neutral-300">Jaipur, Rajasthan & Kochi, Kerala, India</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <label className="font-bold text-neutral-900 dark:text-white block mb-0.5">Business Hours</label>
                <p className="text-neutral-600 dark:text-neutral-300">Monday – Sunday: 10:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900/90 p-8 sm:p-10 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Send Us a Message
          </h2>

          {formStatus.success && (
            <div className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Thank you for reaching out! Our team will respond to your query within 24 hours.</span>
            </div>
          )}

          {formStatus.error && (
            <div className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{formStatus.error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Subject *</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="Order Query / Wholesale / Product Info"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-neutral-700 dark:text-neutral-300 font-semibold mb-1">Message *</label>
              <textarea
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={formStatus.submitting}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 shadow-md"
            >
              {formStatus.submitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
