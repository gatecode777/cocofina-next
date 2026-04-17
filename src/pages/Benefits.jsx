import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import '../styles/benefits.css'; // Import your CSS files

// Hero Section Component
const BenefitsHeroSection = () => (
  <section className="b-hero-section">
    <div className="b-container">
      <div className="b-banner-wrapper">
        <img
          src="benefits.jpg.jpeg"
          alt="Cocofina Coconut Sugar"
          className="b-banner-img"
          loading="lazy"
        />
      </div>

      <div className="b-text-wrapper">
        <p className="b-description">
          Cocofina Coconut Sugar is a natural alternative to refined sugar,
          made from the sap of coconut blossoms. It offers a rich caramel
          flavor along with naturally occurring nutrients, making it a
          better choice for everyday sweetness.
        </p>
      </div>
    </div>
  </section>
);

// Benefits Grid Item Component
const BenefitsGridItem = ({ title, description, imageSrc, cardType, imageAlt }) => (
  <div className={`ben-item ${cardType === 'brown' ? 'card-brown' : 'card-cream'}`}>
    <div className="ben-item-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <div className="ben-item-img">
      <img src={imageSrc} alt={imageAlt || title} loading="lazy" />
    </div>
  </div>
);

// Benefits Grid Data
const benefitsData = [
  {
    title: "Rich in Natural Minerals",
    description: "Unlike refined sugar, coconut sugar retains small amounts of minerals such as iron, zinc, calcium, and potassium that naturally occur in coconut blossom sap.",
    imageSrc: "Benefits1.png",
    cardType: "brown",
    imageAlt: "Rich in Natural Minerals"
  },
  {
    title: "Low Glycemic Index",
    description: "Coconut sugar has a lower glycemic index compared to regular refined sugar. This means it releases energy more gradually, helping avoid sudden spikes in blood sugar levels.",
    imageSrc: "Benefits2.png",
    cardType: "cream",
    imageAlt: "Low Glycemic Index"
  },
  {
    title: "Natural Source",
    description: "Cocofina Sugar is derived from the sap of coconut blossoms, making it a natural sweetener that comes directly from nature without heavy processing.",
    imageSrc: "Benefits3.png",
    cardType: "brown",
    imageAlt: "Natural Source"
  },
  {
    title: "No Chemicals or Additives",
    description: "Our coconut sugar is free from artificial preservatives, chemicals, and synthetic additives, ensuring a clean and pure sweetness in every spoon.",
    imageSrc: "Benefits4.png",
    cardType: "cream",
    imageAlt: "No Chemicals"
  },
  {
    title: "Better Flavor",
    description: "Coconut sugar has a naturally rich caramel-like taste that enhances beverages, desserts, and recipes without overpowering other ingredients.",
    imageSrc: "Benefits5.png",
    cardType: "brown",
    imageAlt: "Better Flavor"
  },
  {
    title: "Sustainable Production",
    description: "Harvesting coconut blossom sap does not require cutting down trees, making coconut sugar production a more environmentally friendly and sustainable process.",
    imageSrc: "Benefits6.png",
    cardType: "cream",
    imageAlt: "Sustainable Production"
  }
];

// Benefits Grid Section
const BenefitsGridSection = () => (
  <section className="ben-grid-section">
    <div className="ben-grid-container">
      {benefitsData.map((benefit, index) => (
        <BenefitsGridItem
          key={index}
          title={benefit.title}
          description={benefit.description}
          imageSrc={benefit.imageSrc}
          cardType={benefit.cardType}
          imageAlt={benefit.imageAlt}
        />
      ))}
    </div>
  </section>
);

// Featured Recipes Data
const recipesData = [
  {
    image: "dailybevrage.jpg",
    title: "Daily Beverages",
    description: "Add a natural touch to your everyday tea and coffee with Cocofina Coconut Sugar. Its mild caramel sweetness blends perfectly without overpowering the flavour."
  },
  {
    image: "baking.png",
    title: "Baking & Desserts",
    description: "Bake your favourite cakes, cookies, and desserts with Cocofina Coconut Sugar for a rich caramel note and a naturally better sweetness in every bite."
  },
  {
    image: "indiansweet.png",
    title: "Indian Sweets",
    description: "Prepare traditional Indian sweets using Cocofina Coconut Sugar to enjoy authentic taste with a clean, unrefined sweetness made from coconut blossoms."
  },
  {
    image: "breakfast.png",
    title: "Breakfast Recipes",
    description: "Start your mornings on a healthier note by adding Cocofina Coconut Sugar to oatmeal, smoothies, and breakfast bowls for gentle, balanced sweetness."
  }
];

// Recipe Card Component
const RecipeCard = ({ image, title, description }) => (
  <div className="cf-recipe-card">
    <div className="cf-recipe-img-wrapper">
      <img
        src={image}
        alt={title}
        className="cf-recipe-img"
        loading="lazy"
      />
    </div>
    <div className="cf-recipe-content">
      <h3 className="cf-recipe-card-title">{title}</h3>
      <p className="cf-recipe-card-desc">{description}</p>
    </div>
    <div className="cf-recipe-action">
      <a href="#" className="cf-recipe-btn">Recipes Here</a>
    </div>
  </div>
);

// Featured Recipes Section
const FeaturedRecipesSection = () => (
  <section className="cf-recipes-section">
    <div className="cf-container">
      <div className="cf-recipes-header">
        <h2 className="cf-recipes-title">Featured Recipes</h2>
        <div className="cf-recipes-underline"></div>
      </div>

      <div className="cf-recipes-grid">
        {recipesData.map((recipe, index) => (
          <RecipeCard
            key={index}
            image={recipe.image}
            title={recipe.title}
            description={recipe.description}
          />
        ))}
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
      console.log('Newsletter email:', email);
      
      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
      
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
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Stay Connected Section
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

// Main Benefits Page Component
const BenefitsPage = () => {
  useEffect(() => {
    // Set page title
    document.title = "Benefits - Cocofina";
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <BenefitsHeroSection />
      <BenefitsGridSection />
      <FeaturedRecipesSection />
      <StayConnectedSection />
    </main>
  );
};

export default BenefitsPage;