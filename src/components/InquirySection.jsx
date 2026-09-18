"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Package,
  HelpCircle,
} from "lucide-react";
import axios from "axios";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+?[0-9]{1,4}[- ]?)?[0-9]{10,13}$/;

export function InquirySection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Bulk & Customer Inquiry",
    message: "",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateField = (name, value) => {
    const val = (value || "").trim();
    switch (name) {
      case "name":
        if (!val) return "Please enter your full name.";
        if (val.length < 2) return "Name must be at least 2 characters long.";
        if (/[\d<>{}[\]\\]/.test(val)) return "Name should only contain letters and spaces.";
        return "";
      case "email":
        if (!val) return "Please enter your email address.";
        if (!EMAIL_REGEX.test(val)) return "Please enter a valid email address (e.g. name@example.com).";
        return "";
      case "phone":
        if (!val) return "Please enter your 10-digit mobile number.";
        const cleanPhone = val.replace(/[\s-]/g, "");
        if (!PHONE_REGEX.test(cleanPhone)) {
          return "Please enter a valid mobile number (10 to 13 digits).";
        }
        return "";
      case "message":
        if (!val) return "Please write your query or requirement.";
        if (val.length < 10) return "Message must be at least 10 characters long.";
        if (val.length > 2000) return "Message cannot exceed 2000 characters.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
    if (serverError) setServerError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const validateForm = () => {
    const newErrors = {};
    ["name", "email", "phone", "message"].forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        source: "home_page",
      };

      const res = await axios.post("/api/inquiries", payload);

      if (res.data?.success) {
        setSubmittedSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "Bulk & Customer Inquiry",
          message: "",
        });
        setTouched({});
        setErrors({});
      } else {
        setServerError(res.data?.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Inquiry submit error:", err);
      const backendErr = err.response?.data?.errors;
      if (backendErr) {
        setErrors(backendErr);
      }
      setServerError(
        err.response?.data?.message || "Something went wrong. Please check your inputs and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="inquiry-section"
      className="py-24 px-6 sm:px-10 bg-white dark:bg-neutral-950 transition-colors duration-500 relative overflow-hidden"
    >
      {/* Ambient background blur glow */}
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Have Questions or Need Bulk Supply?
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Send an Instant Inquiry
          </h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
            Whether you are looking for bulk wholesale supply, retail distribution partnerships, or have questions regarding Cocofina Coconut Sugar, our team is at your service.
          </p>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Brand Highlights & Quick Contact */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/80 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-lg space-y-6">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white font-playfair italic">
                Why Partner with Cocofina?
              </h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">Wholesale & Custom Packaging</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
                      Available in 400g pouches, 1kg family packs, and commercial bulk bags (25kg) for bakeries, cafes, and health brands.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">100% Certified Organic & Unrefined</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
                      Directly tapped from coconut blossom sap. Low GI (35), vegan, non-GMO, with zero additives or chemicals.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">Fast Response Guarantee</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-xs">
                      Our commercial & support desk operates 7 days a week. Expect a dedicated response within 24 business hours.
                    </p>
                  </div>
                </div>
              </div>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Direct Touchpoints */}
              <div className="space-y-3 pt-2">
                <a
                  href="tel:+918233227986"
                  className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs sm:text-sm font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>+91 8233227986 / +91 9119212778</span>
                </a>

                {/* WhatsApp Direct Chat Touchpoint */}
                <a
                  href="https://wa.me/919772003043?text=Hello%20Cocofina!%20I%20would%20like%20to%20make%20an%20inquiry%20about%20your%20Organic%20Coconut%20Sugar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs sm:text-sm font-medium transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 transition-transform group-hover:scale-110">
                    <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                  </div>
                  <span>+91 9772003043</span>
                </a>

                <a
                  href="mailto:info@cocofinasugar.com"
                  className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs sm:text-sm font-medium transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>info@cocofinasugar.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form Card */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-neutral-900 p-8 sm:p-10 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl relative">
              {submittedSuccess ? (
                <div className="py-12 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white font-playfair italic">
                      Inquiry Received Successfully!
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md mx-auto leading-relaxed">
                      Thank you for contacting Cocofina. Our team has received your message and will get back to you shortly via phone or email.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic">
                      Send Us Your Query
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-medium">
                      * Required fields
                    </span>
                  </div>

                  {serverError && (
                    <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-medium animate-in fade-in duration-300">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  {/* Name and Mobile Number Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. Rahul Sharma"
                        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/80 border rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white transition-all focus:outline-none ${
                          touched.name && errors.name
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-neutral-200 dark:border-neutral-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        }`}
                      />
                      {touched.name && errors.name && (
                        <p className="mt-1 text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 inline" /> {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="10-digit mobile number"
                        className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/80 border rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white transition-all focus:outline-none ${
                          touched.phone && errors.phone
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                            : "border-neutral-200 dark:border-neutral-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                        }`}
                      />
                      {touched.phone && errors.phone && (
                        <p className="mt-1 text-[11px] text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 inline" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Address Field */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/80 border rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white transition-all focus:outline-none ${
                        touched.email && errors.email
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="mt-1 text-[11px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 inline" /> {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Your Message / Requirement *
                      </label>
                      <span className="text-[11px] text-neutral-400">
                        {formData.message.length}/2000
                      </span>
                    </div>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Please specify quantity required, delivery location, or your detailed query..."
                      className={`w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/80 border rounded-xl text-xs sm:text-sm text-neutral-900 dark:text-white transition-all focus:outline-none resize-y ${
                        touched.message && errors.message
                          ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
                          : "border-neutral-200 dark:border-neutral-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      }`}
                    />
                    {touched.message && errors.message && (
                      <p className="mt-1 text-[11px] text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 inline" /> {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shadow-lg shadow-amber-600/25 hover:shadow-amber-600/40 text-xs sm:text-sm"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Your Inquiry...</span>
                      </div>
                    ) : (
                      <>
                        <span>Send Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-neutral-500 dark:text-neutral-400">
                    🔒 We respect your privacy. Your contact details are never shared with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
