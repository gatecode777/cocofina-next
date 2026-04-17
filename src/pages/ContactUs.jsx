import React, { useState, useEffect } from 'react';
import { Phone, Mail, Clock, ArrowUpRight, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/contactus.css';

// Hero Banner Section Component
const ContactHeroSection = () => (
  <div
    className="cu-hero-banner"
    style={{
      backgroundImage: 'url("contact us.jpg.jpeg")'
    }}
  >
    <div className="cu-hero-content"></div>
  </div>
);

// Contact Information Item Component
const ContactInfoItem = ({ icon: Icon, label, children }) => (
  <div className="cu-info-item">
    <div className="cu-info-icon-box">
      <Icon size={20} />
    </div>
    <div className="cu-info-details">
      <label>{label}</label>
      <p>{children}</p>
    </div>
  </div>
);

// Contact Information Section
const ContactInfoSection = () => (
  <div className="cu-info-section">
    <h2 className="cu-section-title">Contact Information</h2>

    <div className="cu-info-list">
      <ContactInfoItem icon={Phone} label="Phone">
        +91 8233227986,
        +91 9119212778
      </ContactInfoItem>

      <ContactInfoItem icon={Mail} label="Email">
        info@cocofinasugar.com
      </ContactInfoItem>

      <ContactInfoItem icon={Clock} label="Business Hours">
        Monday – Saturday <br />
        10:00 AM – 6:00 PM
      </ContactInfoItem>
    </div>
  </div>
);

// Form Input Component
const FormInput = ({ type, name, placeholder, value, onChange, disabled, required, className, error }) => (
  <div className="cu-input-wrapper">
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={`${className || ''} ${error ? 'error' : ''}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
    />
    {error && <span className="cu-field-error">{error}</span>}
  </div>
);

// Form Textarea Component
const FormTextarea = ({ name, rows, placeholder, value, onChange, disabled, required, error }) => (
  <div className="cu-input-wrapper">
    <textarea
      name={name}
      rows={rows}
      placeholder={placeholder}
      className={`cu-field-full ${error ? 'error' : ''}`}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
    ></textarea>
    {error && <span className="cu-field-error">{error}</span>}
  </div>
);

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: ''
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value.trim() ? 'Name is required' : '';
      case 'phone':
        return !value.trim() ? 'Phone number is required' : '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return '';
      case 'subject':
        return !value.trim() ? 'Subject is required' : '';
      case 'message':
        return !value.trim() ? 'Message is required' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear form error when user starts typing
    if (formStatus.error) {
      setFormStatus(prev => ({ ...prev, error: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormStatus({ submitting: true, success: false, error: '' });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);
      
      setFormStatus({ submitting: false, success: true, error: '' });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: ''
      });
      setErrors({});

      // Clear success message after 5 seconds
      setTimeout(() => {
        setFormStatus(prev => ({ ...prev, success: false }));
      }, 5000);
      
    } catch (error) {
      setFormStatus({ 
        submitting: false, 
        success: false, 
        error: 'Failed to send message. Please try again.' 
      });
    }
  };

  return (
    <div className="cu-form-section">
      <div className="cu-form-card">
        <h2 className="cu-form-title">Contact Form</h2>
        
        {formStatus.success && (
          <div className="cu-success-message">
            <CheckCircle size={20} />
            <span>Thank you for your message! We'll get back to you within 24 hours.</span>
          </div>
        )}
        
        {formStatus.error && (
          <div className="cu-error-message">
            <AlertCircle size={20} />
            <span>{formStatus.error}</span>
          </div>
        )}
        
        <form className="cu-form" onSubmit={handleSubmit} noValidate>
          <FormInput
            type="text"
            name="name"
            placeholder="Name *"
            className="cu-field-full"
            value={formData.name}
            onChange={handleChange}
            disabled={formStatus.submitting}
            required
            error={errors.name}
          />

          <div className="cu-input-row">
            <FormInput
              type="tel"
              name="phone"
              placeholder="Phone *"
              value={formData.phone}
              onChange={handleChange}
              disabled={formStatus.submitting}
              required
              error={errors.phone}
            />
            <FormInput
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              disabled={formStatus.submitting}
              required
              error={errors.email}
            />
          </div>

          <FormInput
            type="text"
            name="subject"
            placeholder="Subject *"
            className="cu-field-full"
            value={formData.subject}
            onChange={handleChange}
            disabled={formStatus.submitting}
            required
            error={errors.subject}
          />

          <FormTextarea
            name="message"
            rows="5"
            placeholder="Message *"
            value={formData.message}
            onChange={handleChange}
            disabled={formStatus.submitting}
            required
            error={errors.message}
          />

          <div className="cu-btn-container">
            <button 
              type="submit" 
              className="cu-submit-btn"
              disabled={formStatus.submitting}
            >
              {formStatus.submitting ? 'Sending...' : 'Submit Button'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Contact Support Section Component
const ContactSupportSection = () => (
  <div className="cs-support-top">
    <div className="cs-container">
      <div className="cs-image-box">
        <img
          src="femalecontactus.png"
          alt="Support Illustration"
          className="cs-main-img"
          loading="lazy"
        />
      </div>

      <div className="cs-content-box">
        <h2 className="cs-heading">Contact Support</h2>
        <p className="cs-desc">
          Our support team is here to assist you with any questions
          related to Cocofina Coconut Sugar. Whether you need help with
          orders, product information, or business inquiries, we are
          always ready to help and ensure you have the best experience
          with our products.
        </p>

        <div className="cs-info-points">
          <div className="cs-point">
            <h3>Order Assistance</h3>
            <p>
              If you have questions about your order, delivery status,
              or shipping details, our team will guide you and provide
              quick support.
            </p>
          </div>
          <div className="cs-point">
            <h3>Product Information</h3>
            <p>
              Want to know more about our coconut sugar, its benefits,
              ingredients, or how to use it in recipes? Feel free to
              reach out to us.
            </p>
          </div>
          <div className="cs-point">
            <h3>Business & Partnership</h3>
            <p>
              For wholesale inquiries, collaborations, or partnership
              opportunities, our team would be happy to connect with
              you.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// FAQ Section Component
const FAQSection = () => (
  <div className="cs-faq-bottom">
    <div className="cs-container cs-faq-flex">
      <div className="cs-faq-text">
        <h2>Have questions?</h2>
        <p>
          Visit our FAQ page for quick answers about orders, shipping,
          and product details.
        </p>
        <a href="/faq" className="cs-visit-btn">
          Visit Now <ArrowUpRight size={18} />
        </a>
      </div>

      <div className="cs-faq-avatar">
        <div className="cs-avatar-circle">
          <img
            src="male-contactus.png"
            alt="FAQ Character"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
);

// Main Contact Us Page Component
const ContactUsPage = () => {
  useEffect(() => {
    // Set page title
    document.title = "Contact Us - Cocofina";
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <div className="cu-contact-page-wrapper">
        <ContactHeroSection />
        
        <div className="cu-main-container">
          <ContactInfoSection />
          <ContactForm />
        </div>

        <div className="cs-wrapper">
          <ContactSupportSection />
          <FAQSection />
        </div>
      </div>
    </main>
  );
};

export default ContactUsPage;