import React, { useState, useEffect } from 'react';
import { ArrowRight, Send } from 'lucide-react';
import '../styles/aboutus.css'; // Import your CSS file

// Hero Banner Section Component
const AboutHeroSection = () => (
  <section className="abs-main-wrapper">
    <div className="abs-container">
      <div className="abs-hero-banner">
        <div className="abs-banner-overlay"></div>
      </div>
    </div>

    <div className="abs-container">
      <div className="abs-content-box">
        <h2 className="abs-title">About Cocofina</h2>
        <p className="abs-description">
          Cocofina is dedicated to creating a natural and healthier
          alternative to regular refined sugar. Our coconut sugar is made
          from the pure sap of coconut blossoms, carefully processed to
          preserve its natural nutrients and rich caramel-like flavor. We
          believe sweetness should come from nature, which is why our
          product is minimally processed and free from chemicals or
          artificial additives.
        </p>
      </div>
    </div>
  </section>
);

// Our Mission Section Component
const MissionSection = () => (
  <section className="oms-wrapper">
    <div className="oms-container">
      <div className="oms-row">
        <div className="oms-image-col">
          <div className="oms-img-box">
            <img
              src="Ourmisssion.jpg"
              alt="Our Mission Cocofina"
              loading="lazy"
            />
          </div>
        </div>

        <div className="oms-content-col">
          <h2 className="oms-heading">Our Mission</h2>
          <p className="oms-text">
            Our mission is to provide a natural sweetener that supports
            healthier lifestyles while maintaining authentic taste. Cocofina
            aims to promote sustainable sourcing, responsible farming, and
            products that are both good for people and the planet.
          </p>
        </div>
      </div>
    </div>
  </section>
);

// Why Choose Feature Card Component
const WhyChooseCard = ({ icon, title, text }) => (
  <div className="wcc-card">
    <div className="wcc-icon-box">
      <img src={icon} alt={title} loading="lazy" />
    </div>
    <h3 className="wcc-card-title">{title}</h3>
    <p className="wcc-card-text">{text}</p>
  </div>
);

// Why Choose Section Component
const WhyChooseSection = () => {
  const features = [
    {
      icon: "icon1.png",
      title: "100% Coconut Blossom Sap",
      text: "Made exclusively from fresh sap collected from coconut blossoms - nothing else added."
    },
    {
      icon: "icon2.png",
      title: "No Chemicals or Preservatives",
      text: "Naturally processed without bleaching agents, additives, or artificial preservatives."
    },
    {
      icon: "icon3.png",
      title: "Low Glycemic Index",
      text: "Releases energy slowly, helping maintain more balanced blood sugar levels than refined sugar."
    },
    {
      icon: "icon4.png",
      title: "Sustainably Sourced",
      text: "Harvested using eco-friendly methods that support coconut farmers and protect nature."
    }
  ];

  return (
    <section className="wcc-wrapper">
      <div className="wcc-container">
        <h2 className="wcc-main-heading">Why Choose Cocofina</h2>

        <div className="wcc-grid">
          {features.map((feature, index) => (
            <WhyChooseCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              text={feature.text}
            />
          ))}
        </div>

        <div className="wcc-how-made">
          <h2 className="wcc-main-heading">How Our Coconut Sugar Is Made</h2>
          <p className="wcc-description">
            Our coconut sugar is harvested from the nectar of coconut
            blossoms. Farmers carefully collect the sap and gently heat it to
            evaporate the moisture, forming natural sugar crystals. This
            traditional process helps retain the natural minerals and
            distinctive caramel flavor that make coconut sugar unique.
          </p>
        </div>
      </div>
    </section>
  );
};

// Our Promise Section Component
const PromiseSection = () => (
  <section className="ops-wrapper">
    <div className="ops-container">
      <div className="ops-row">
        <div className="ops-content-col">
          <h2 className="ops-heading">Our Promise</h2>
          <p className="ops-text">
            At Cocofina, quality and purity are our top priorities. We are
            committed to delivering a product that is natural, sustainable,
            and crafted with care so that every spoonful adds both sweetness
            and value to your daily recipes.
          </p>
        </div>

        <div className="ops-image-col">
          <div className="ops-img-box">
            <img
              src="Ourpromise.jpg"
              alt="Our Promise Cocofina"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Newsletter Form Component
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically make an API call to your backend
      // await newsletterService.subscribe(email);
      
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setMessage('Subscription failed. Please try again.');
    }
  };

  return (
    <form className="cf-input-box" onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Enter Your Email .."
        className={`cf-email-input ${status === 'error' ? 'error' : ''}`}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        required
        disabled={status === 'loading' || status === 'success'}
        aria-label="Email for newsletter"
      />
      <button 
        type="submit" 
        className="cf-submit-btn" 
        aria-label="Subscribe"
        disabled={status === 'loading' || status === 'success'}
      >
        <ArrowRight />
      </button>
      {message && <p className={`cf-message ${status}`}>{message}</p>}
    </form>
  );
};

// Chat Section Component
const ChatSection = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, type: 'user' }]);
    
    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: "Thanks for your message! Our team will get back to you soon.", 
        type: 'bot' 
      }]);
      setIsTyping(false);
    }, 1500);

    setMessage('');
  };

  return (
    <div className="cf-chat-side">
      <div className="cf-circle-top"></div>
      <div className="cf-circle-bottom"></div>

      <div className="cf-chat-card">
        <div className="cf-chat-body">
          <div className="cf-bubble cf-bubble-small">Hey, There</div>
          <div className="cf-bubble cf-bubble-large">
            Get updates on new harvests, seasonal editions, and exclusive offers.
          </div>
          
          {/* Display chat messages */}
          {messages.map((msg, index) => (
            <div key={index} className={`cf-bubble cf-bubble-${msg.type}`}>
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="cf-bubble cf-bubble-bot typing">
              <span className="cf-typing-dot"></span>
              <span className="cf-typing-dot"></span>
              <span className="cf-typing-dot"></span>
            </div>
          )}
        </div>

        <div className="cf-chat-footer">
          <form className="cf-chat-input-wrapper" onSubmit={handleSubmit}>
            <span className="cf-cursor">|</span>
            <input
              type="text"
              placeholder="Write message .."
              className="cf-chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-label="Chat message"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="cf-send-btn" 
              aria-label="Send message"
              disabled={isTyping || !message.trim()}
              style={{border:'none', background:'transparent'}}
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Stay Connected Section Component
const StayConnectedSection = () => (
  <section className="cf-connect-section">
    <div className="cf-container">
      <div className="cf-connect-wrapper">
        <div className="cf-newsletter-side">
          <span className="cf-sub-title">New Harvest Updates</span>
          <h2 className="cf-main-title">
            Stay Connected <br />
            with Cocofina
          </h2>
          <NewsletterForm />
        </div>
        <ChatSection />
      </div>
    </div>
  </section>
);

// Main About Us Page Component
const AboutUsPage = () => {
  useEffect(() => {
    // Set page title
    document.title = "About Us - Cocofina";
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <AboutHeroSection />
      <MissionSection />
      <WhyChooseSection />
      <PromiseSection />
      <StayConnectedSection />
    </main>
  );
};

export default AboutUsPage;