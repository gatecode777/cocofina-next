"use client";

import React, { useState } from "react";
import axios from "axios";
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setFormStatus({ submitting: false, success: false, error: "Please fill in all required fields." });
      return;
    }

    setFormStatus({ submitting: true, success: false, error: "" });
    try {
      const res = await axios.post("/api/inquiries", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || "Contact Page Message",
        message: formData.message.trim(),
        source: "contact_page",
      });

      if (res.data?.success) {
        setFormStatus({ submitting: false, success: true, error: "" });
        setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
        setTimeout(() => {
          setFormStatus((prev) => ({ ...prev, success: false }));
        }, 6000);
      } else {
        setFormStatus({ submitting: false, success: false, error: res.data?.message || "Failed to send message." });
      }
    } catch (err) {
      console.error("Contact form error:", err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors)[0] : "Failed to send message.");
      setFormStatus({ submitting: false, success: false, error: errMsg });
    }
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
              <a
                href="https://wa.me/919772003043?text=Hello%20Cocofina!%20I%20would%20like%20to%20make%20an%20inquiry%20about%20your%20Organic%20Coconut%20Sugar."
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 transition-transform hover:scale-110"
                title="Chat on WhatsApp"
              >
                <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
              <div>
                <label className="font-bold text-neutral-900 dark:text-white block mb-0.5">WhatsApp Support</label>
                <a
                  href="https://wa.me/919772003043?text=Hello%20Cocofina!%20I%20would%20like%20to%20make%20an%20inquiry%20about%20your%20Organic%20Coconut%20Sugar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                >
                  +91 9772003043
                </a>
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
