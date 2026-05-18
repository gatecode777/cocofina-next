'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import '@/styles/benefits.css';

// Hero Section Component
const BenefitsHeroSection = () => (
  <section className="b-hero-section">
    <div className="b-container">
      <div className="b-banner-wrapper">
        <img
          src="/benefits.webp"
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
    imageSrc: "/Benefits1.webp",
    cardType: "brown",
    imageAlt: "Rich in Natural Minerals"
  },
  {
    title: "Low Glycemic Index",
    description: "Coconut sugar has a lower glycemic index compared to regular refined sugar. This means it releases energy more gradually, helping avoid sudden spikes in blood sugar levels.",
    imageSrc: "/Benefits2.webp",
    cardType: "cream",
    imageAlt: "Low Glycemic Index"
  },
  {
    title: "Natural Source",
    description: "Cocofina Sugar is derived from the sap of coconut blossoms, making it a natural sweetener that comes directly from nature without heavy processing.",
    imageSrc: "/Benefits3.webp",
    cardType: "brown",
    imageAlt: "Natural Source"
  },
  {
    title: "No Chemicals or Additives",
    description: "Our coconut sugar is free from artificial preservatives, chemicals, and synthetic additives, ensuring a clean and pure sweetness in every spoon.",
    imageSrc: "/Benefits4.webp",
    cardType: "cream",
    imageAlt: "No Chemicals"
  },
  {
    title: "Better Flavor",
    description: "Coconut sugar has a naturally rich caramel-like taste that enhances beverages, desserts, and recipes without overpowering other ingredients.",
    imageSrc: "/Benefits5.webp",
    cardType: "brown",
    imageAlt: "Better Flavor"
  },
  {
    title: "Sustainable Production",
    description: "Harvesting coconut blossom sap does not require cutting down trees, making coconut sugar production a more environmentally friendly and sustainable process.",
    imageSrc: "/Benefits6.webp",
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
    image: "/dailybevrage.webp",
    title: "Daily Beverages",
    description: "Add a natural touch to your everyday tea and coffee with Cocofina Coconut Sugar. Its mild caramel sweetness blends perfectly without overpowering the flavour."
  },
  {
    image: "/baking.webp",
    title: "Baking & Desserts",
    description: "Bake your favourite cakes, cookies, and desserts with Cocofina Coconut Sugar for a rich caramel note and a naturally better sweetness in every bite."
  },
  {
    image: "/indiansweet.webp",
    title: "Indian Sweets",
    description: "Prepare traditional Indian sweets using Cocofina Coconut Sugar to enjoy authentic taste with a clean, unrefined sweetness made from coconut blossoms."
  },
  {
    image: "/breakfast.webp",
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
      <Link href="/recipes" className="cf-recipe-btn">Recipes Here</Link>
    </div>
  </div>
);

// Featured Recipes Section
const RecipesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(4);
  const [isMounted, setIsMounted] = useState(false);

  const recipes = [
    { image: '/dailybevrage.webp', title: 'Daily Beverages', desc: 'Add a natural touch to your everyday tea and coffee with Cocofina Coconut Sugar. Its mild caramel sweetness blends perfectly without overpowering the flavour.', link: '/recipes/daily-beverages' },
    { image: '/baking.webp', title: 'Baking & Desserts', desc: 'Bake your favourite cakes, cookies, and desserts with Cocofina Coconut Sugar for a rich caramel note and a naturally better sweetness in every bite.', link: '/recipes/baking-desserts' },
    { image: '/indiansweet.webp', title: 'Indian Sweets', desc: 'Prepare traditional Indian sweets using Cocofina Coconut Sugar to enjoy authentic taste with a clean, unrefined sweetness made from coconut blossoms.', link: '/recipes/indian-sweets' },
    { image: '/breakfast.webp', title: 'Breakfast Recipes', desc: 'Start your mornings on a healthier note by adding Cocofina Coconut Sugar to oatmeal, smoothies, and breakfast bowls for gentle, balanced sweetness.', link: '/recipes/breakfast-recipes' },
    { image: '/sauces.webp', title: 'Sauces & Homemade Syrups', desc: 'Create homemade sauces and syrups with Cocofina Coconut Sugar for deeper flavour, smooth texture, and naturally rich sweetness.', link: '/recipes/sauces-homemade-syrups' },
    { image: '/everyday.webp', title: 'Everyday Cooking', desc: 'From daily beverages to desserts and cooking, Cocofina Coconut Sugar is a versatile sweetener that fits effortlessly into every recipe.', link: '/recipes/everyday-cooking' },
  ];

  // Update slidesToShow based on screen size
  const updateSlidesToShow = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) setSlidesToShow(4);
      else if (window.innerWidth >= 768) setSlidesToShow(2);
      else setSlidesToShow(1);
    }
  }, []);

  // Reset index when slidesToShow changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [slidesToShow]);

  // Handle mounting and resize
  useEffect(() => {
    setIsMounted(true);
    updateSlidesToShow();

    window.addEventListener('resize', updateSlidesToShow);

    return () => {
      window.removeEventListener('resize', updateSlidesToShow);
    };
  }, [updateSlidesToShow]);

  // Reset index when coming back to page (using visibility API)
  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again - reset slider position
        setCurrentIndex(0);
        updateSlidesToShow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMounted, updateSlidesToShow]);

  const totalSlides = recipes.length;
  const maxIndex = Math.max(0, totalSlides - slidesToShow);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(Math.min(maxIndex, Math.max(0, index)));
  }, [maxIndex]);

  const totalDots = Math.ceil(totalSlides / slidesToShow);
  const currentDotIndex = Math.floor(currentIndex / slidesToShow);

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return (
      <section className="cf-recipes-section">
        <div className="cf-container">
          <div className="cf-recipes-header">
            <h2 className="cf-recipes-title-b">Featured Recipes</h2>
            <div className="cf-recipes-underline"></div>
          </div>
          <div className="cf-slider-outer">
            <div className="cf-slider-viewport">
              <div className="cf-recipes-grid">
                {recipes.slice(0, 4).map((recipe, i) => (
                  <div className="cf-recipe-card" key={i}>
                    <div className="cf-recipe-img-wrapper">
                      <img src={recipe.image} alt={recipe.title} className="cf-recipe-img" />
                    </div>
                    <div className="cf-recipe-content">
                      <h3 className="cf-recipe-card-title">{recipe.title}</h3>
                      <p className="cf-recipe-card-desc">{recipe.desc}</p>
                    </div>
                    <div className="cf-recipe-action">
                      <Link href={recipe.link} className="cf-recipe-btn">
                        View Recipe
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cf-recipes-section">
      <div className="cf-container">
        <div className="cf-recipes-header">
          <h2 className="cf-recipes-title-b">Featured Recipes</h2>
          <div className="cf-recipes-underline"></div>
        </div>

        <div className="cf-slider-outer">
          <button
            className="cf-slider-btn cf-slider-prev"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            aria-label="Previous"
          >
            &#8249;
          </button>

          <div className="cf-slider-viewport">
            <div
              className="cf-recipes-grid"
              style={{
                transform: `translateX(-${currentIndex * (100 / slidesToShow)}%)`,
                transition: 'transform 0.3s ease-in-out'
              }}
            >
              {recipes.map((recipe, i) => (
                <div
                  className="cf-recipe-card"
                  key={i}
                >
                  <div className="cf-recipe-img-wrapper">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="cf-recipe-img"
                      onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                      loading="lazy"
                    />
                  </div>
                  <div className="cf-recipe-content">
                    <h3 className="cf-recipe-card-title">{recipe.title}</h3>
                    <p className="cf-recipe-card-desc">{recipe.desc}</p>
                  </div>
                  <div className="cf-recipe-action">
                    <Link href={recipe.link} className="cf-recipe-btn">
                      View Recipe
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="cf-slider-btn cf-slider-next"
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            aria-label="Next"
          >
            &#8250;
          </button>
        </div>

        {totalDots > 1 && (
          <div className="cf-slider-dots">
            {Array.from({ length: totalDots }).map((_, i) => (
              <span
                key={i}
                className={`cf-dot ${currentDotIndex === i ? 'active' : ''}`}
                onClick={() => goToSlide(i * slidesToShow)}
                role="button"
                aria-label={`Go to slide group ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

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
      <RecipesSection />
      <StayConnectedSection />
    </main>
  );
};

export default BenefitsPage;