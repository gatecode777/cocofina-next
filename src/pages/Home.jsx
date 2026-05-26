'use client';

export const dynamic = "force-dynamic";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swiper from 'swiper';
import 'swiper/css';
import { Compass, ArrowRight } from 'lucide-react';
import { productAPI } from '@/services/api';
import '@/styles/style.css';

// ── helpers ────────────────────────────────────────────────────────────────────
const getImageSrc = (product) => {
  if (product.images?.length)
    return `/uploads/products/${product.images[0]}`;
  if (product.thumbnail)
    return `/uploads/products/${product.thumbnail}`;
  return null;
};

const getLowestVariant = (product) => {
  if (!product.variants?.length) return null;
  return product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
};

const heroSliderStyles = `
/* Hero Slider Styles */
.cf-hero {
  max-width: 1400px;
  overflow: hidden;
  position: relative;
  margin: auto;
  margin-top: 20px;
  border-radius: 8px;
}

.cf-hero-banner {
  width: 100%;
  position: relative;
}

.cf-slider {
  position: relative;
  width: 100%;
  height: 650px;
  overflow: visible;
}

.cf-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  will-change: transform;
}

.cf-hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Dots Navigation */
.cf-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 10;
}

.cf-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cf-dot.active {
  background-color: #fff;
  width: 24px;
  border-radius: 6px;
}

.cf-dot:hover {
  background-color: rgba(255, 255, 255, 0.8);
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .cf-slider {
    height: 550px;
  }
  
  .cf-dots {
    bottom: 15px;
    gap: 10px;
  }
}

@media (max-width: 992px) {
  .cf-slider {
    height: 450px;
  }
  
  .cf-dots {
    bottom: 12px;
    gap: 8px;
  }
  
  .cf-dot {
    width: 10px;
    height: 10px;
  }
  
  .cf-dot.active {
    width: 20px;
  }
}

@media (max-width: 768px) {
  .cf-slider {
    height: 350px;
  }
  
  .cf-dots {
    bottom: 10px;
    gap: 8px;
  }
  
  .cf-dot {
    width: 8px;
    height: 8px;
  }
  
  .cf-dot.active {
    width: 16px;
  }
}

@media (max-width: 576px) {
  .cf-slider {
    height: 250px;
  }
  
  .cf-dots {
    bottom: 8px;
    gap: 6px;
  }
  
  .cf-dot {
    width: 6px;
    height: 6px;
  }
  
  .cf-dot.active {
    width: 12px;
  }
}

@media (max-width: 480px) {
  .cf-hero-banner .cf-slider {
    height: 192px !important;
  }

  .cf-hero-img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  
  .cf-dots {
    bottom: 6px;
    gap: 5px;
  }
  
  .cf-dot {
    width: 5px;
    height: 5px;
  }
  
  .cf-dot.active {
    width: 10px;
  }
}


@media (max-width: 376px) {
  .cf-hero-banner .cf-slider {
    height: 170px !important ;
  }

  .cf-hero-img {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  
  .cf-dots {
    bottom: 6px;
    gap: 5px;
  }
  
  .cf-dot {
    width: 5px;
    height: 5px;
  }
  
  .cf-dot.active {
    width: 10px;
  }
}


@media (max-width: 320px) {
  .cf-hero-banner .cf-slider {
    height: 142px !important;
  }
}

/* Optional: Add touch/swipe support indicator for mobile */
@media (max-width: 768px) {
  .cf-hero::after {
    content: '';
    position: absolute;
    bottom: 15px;
    right: 15px;
    width: 30px;
    height: 30px;
    background: rgba(0,0,0,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    z-index: 10;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .cf-hero:hover::after {
    opacity: 1;
  }
}
`;

// Hero Section with responsive slide effect
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    // { id: 0, src: "/banner.png", alt: "Banner 1" },
    { id: 0, src: "/Main Poster 02 (3).webp", alt: "Banner 1" },
    { id: 1, src: "/Main Poster 03 (1).webp", alt: "Banner 2" },
    { id: 2, src: "/Main Poster 05.webp", alt: "Banner 3" },
    { id: 3, src: "/Main Poster 06.webp", alt: "Banner 4" },
    { id: 4, src: "/Main Poster 07.webp", alt: "Banner 5" }
  ];
  const intervalRef = useRef(null);
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  // Auto-slide effect
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [nextSlide]);

  // Pause auto-slide on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 3000);
    }
  };

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      // Swipe left - next slide
      nextSlide();
    }

    if (touchStart - touchEnd < -50) {
      // Swipe right - previous slide
      prevSlide();
    }

    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Inject styles
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('hero-slider-styles')) {
      const styleSheet = document.createElement("style");
      styleSheet.id = 'hero-slider-styles';
      styleSheet.textContent = heroSliderStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  return (
    <section
      className="cf-hero"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="cf-hero-banner">
        <div className="cf-slider">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`cf-slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                transform: `translateX(${100 * (index - currentSlide)}%)`,
                transition: 'transform 0.5s ease-in-out'
              }}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className="cf-hero-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="cf-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`cf-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              role="button"
              aria-label={`Go to slide ${index + 1}`}
            ></span>
          ))}
        </div>
      </div>
    </section>
  );
};

const IntroSection = () => (
  <section className="cf-intro">
    <div className="cf-container">
      <h1 className="cf-intro-title">Sweeten Your Life Naturally</h1>
      <div className="cf-title-line"></div>
      <p className="cf-intro-desc">
        Discover the rich caramel notes of premium organic coconut sugar, sourced
        from the finest coconut blossoms. A pure, unrefined alternative to regular sugar.
      </p>
      <Link href="/our-products" className="cf-btn-primary">
        <Compass /> Explore Our Product
      </Link>
    </div>
  </section>
);

const features = [
  { icon: '/icon1.png', title: '100% Coconut Blossom Sap', text: 'Made exclusively from fresh sap collected from coconut blossoms—nothing else added.' },
  { icon: '/icon2.png', title: 'No Chemicals or Preservatives', text: 'Naturally processed without bleaching agents, additives, or artificial preservatives.' },
  { icon: '/icon3.png', title: 'Low Glycemic Index', text: 'Releases energy slowly, helping maintain more balanced blood sugar levels than refined sugar.' },
  { icon: '/icon4.png', title: 'Sustainably Sourced', text: 'Harvested using eco-friendly methods that support coconut farmers and protect nature.' },
];

const FeaturesSection = () => (
  <section className="cf-features">
    <div className="cf-container">
      <div className="cf-features-grid">
        {features.map((f, i) => (
          <div className="cf-feature-card" key={i}>
            <div className="cf-card-icon">
              <img src={f.icon} alt={f.title} />
            </div>
            <h3 className="cf-card-title">{f.title}</h3>
            <p className="cf-card-text">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── Dynamic Products Section ───────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const router = useRouter();
  const imageSrc = getImageSrc(product);
  const lowestVar = getLowestVariant(product);
  const isComingSoon = product.isComingSoon;
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isLimitedStock = product.stockStatus === 'Limited Stock';

  const variantWeights = product.variants?.map((v) => v.weight) || [];
  const [selectedVariant, setSelectedVariant] = useState(lowestVar);

  return (
    <div className="cf-product-card">
      <div className="cf-card-header-brown" style={{ position: 'relative' }}>
        <img
          src={imageSrc || '/cocofinaproduct.png'}
          alt={product.name}
          className="cf-product-image"
          onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
          style={isComingSoon || isOutOfStock ? { opacity: 0.7, filter: 'grayscale(25%)' } : {}}
        />
        {isComingSoon && (
          <span className="cf-coming-soon-badge">⏳ Coming Soon</span>
        )}
        {isOutOfStock && !isComingSoon && (
          <span className="cf-out-of-stock-badge">🚫 Out of Stock</span>
        )}
        {isLimitedStock && !isComingSoon && (
          <span className="cf-limited-stock-badge">⚠️ Limited Stock</span>
        )}
      </div>

      <div className="cf-card-body">
        <h3 className="cf-product-name">{product.name}</h3>

        {variantWeights.length > 1 && !isComingSoon && (
          <div className="cf-variant-buttons">
            {product.variants.map((v) => (
              <button
                key={v.weight}
                className={`cf-variant-btn ${selectedVariant?.weight === v.weight ? 'active' : ''}`}
                onClick={() => setSelectedVariant(v)}
              >
                {v.weight}
              </button>
            ))}
          </div>
        )}

        {product.description?.short && (
          <p className="cf-product-desc">{product.description.short}</p>
        )}

        <div className="cf-card-footer">
          <div className="cf-price-block">
            {isComingSoon ? (
              <span className="cf-price" style={{ color: '#f97316', fontSize: '14px', fontWeight: 600 }}>Available Soon</span>
            ) : selectedVariant ? (
              <span className="cf-price">₹{selectedVariant.price}/-</span>
            ) : (
              <span className="cf-price" style={{ color: '#999' }}>Price unavailable</span>
            )}
          </div>
          <button
            className="cf-order-btn"
            onClick={() => !isComingSoon && !isOutOfStock && router.push(`/products/${product.slug || product._id}`)}
            disabled={isComingSoon || isOutOfStock}
            style={{
              border: 'none',
              ...(isComingSoon ? { opacity: 0.55, cursor: 'not-allowed', background: '#9ca3af', boxShadow: 'none' } : {}),
              ...(isOutOfStock ? { opacity: 0.65, cursor: 'not-allowed', background: '#dc2626', color: '#fff', boxShadow: 'none' } : {})
            }}
          >
            {isComingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Order Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductsSkeleton = () => (
  <div className="cf-products-grid">
    {[1, 2, 3].map((i) => (
      <div className="cf-product-card cf-skeleton" key={i}>
        <div className="cf-card-header-brown cf-skel-img"></div>
        <div className="cf-card-body">
          <div className="cf-skel-line cf-skel-title"></div>
          <div className="cf-skel-line cf-skel-desc"></div>
          <div className="cf-skel-line cf-skel-desc" style={{ width: '60%' }}></div>
          <div className="cf-skel-footer"></div>
        </div>
      </div>
    ))}
  </div>
);

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');



  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch first 6 active products for the homepage
        const res = await productAPI.getAll({ page: 1, limit: 6 });
        if (res.data.success) setProducts(res.data.products);
        else setError('Could not load products');
      } catch (err) {
        console.error('ProductsSection fetch error:', err);
        setError('Could not load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="cf-products-section">
      <div className="cf-container">
        <div className="cf-products-title-area">
          <h2 className="cf-products-main-title">Our Products</h2>
          <div className="cf-title-underline-center"></div>
        </div>

        {loading && <ProductsSkeleton />}

        {error && !loading && (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            No products available yet.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="cf-products-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Static sections (unchanged) ────────────────────────────────────────────────
const StorySection = () => (
  <section className="cf-story-section">
    <div className="cf-container">
      <div className="cf-story-card">
        <div className="cf-story-image-side">
          {/* <img src="/our page.webp" alt="Our Story Book" className="cf-story-main-img" /> */}
        </div>
        <div className="cf-story-content-side">
          <div className="cf-story-header">
            <h2 className="cf-story-title">Our Story</h2>
            <div className="cf-story-underline"></div>
          </div>
          <div className="cf-story-text">
            <p>
              Cocofina was born from a simple belief — sweetness should come from
              nature, not chemicals. In a world full of over-processed sugars, we
              wanted to return to something pure and honest.
            </p>
            <p>
              Our coconut sugar is made from the fresh sap of coconut blossoms,
              gently processed using traditional methods that preserve its natural
              minerals and rich caramel flavour. No refining. No shortcuts. Just
              real sweetness, the way nature intended.
            </p>
            <p>
              By working closely with coconut farmers and following sustainable
              practices, Cocofina supports both people and the planet. Every pack
              is a promise of purity, transparency, and mindful living.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const AboutProductSection = () => (
  <section className="cf-about-product">
    <div className="cf-container">
      <div className="cf-about-header">
        <h2 className="cf-about-title">About Our Product</h2>
        <div className="cf-about-underline"></div>
        <div className="cf-about-desc-container">
          <p>
            Cocofina is a natural sweetener brand dedicated to offering a healthier
            alternative to refined sugar. Our coconut sugar is made from the fresh
            sap of coconut blossoms and gently processed to retain its natural
            minerals and rich caramel flavour.
          </p>
          <p>
            We believe in clean ingredients, honest sourcing, and sustainable
            practices. That's why Cocofina coconut sugar is unrefined, free from
            chemicals or preservatives, and responsibly sourced from coconut farmers
            who follow eco-friendly harvesting methods.
          </p>
          <p>Every pack of Cocofina reflects our commitment to purity, quality, and mindful living.</p>
        </div>
      </div>
      <div className="cf-about-visual">
        <div className="cf-about-bg-box"></div>
        <img src="/ingredient.webp" alt="Cocofina Coconut Sugar Ingredients" className="cf-about-main-img" />
      </div>
    </div>
  </section>
);

// ── Recipes Section with Slider ─────────────────────────────────────────────────
// ── Recipes Section with Slider (Fixed for Navigation) ─────────────────────────────────
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
            <h2 className="cf-recipes-title">Featured Recipes</h2>
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
          <h2 className="cf-recipes-title">Featured Recipes</h2>
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

const StayConnectedSection = () => {
  const [email, setEmail] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  return (
    <section className="cf-connect-section">
      <div className="cf-container">
        <div className="cf-connect-wrapper">
          <div className="cf-newsletter-side">
            <span className="cf-sub-title">New Harvest Updates</span>
            <h2 className="cf-main-title">
              Stay Connected <br /> with Cocofina
            </h2>
            <form
              className="cf-input-box"
              onSubmit={(e) => { e.preventDefault(); setEmail(''); }}
            >
              <input
                type="email"
                placeholder="Enter Your Email .."
                className="cf-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="cf-submit-btn"><ArrowRight /></button>
            </form>
          </div>

          <div className="cf-chat-side">
            <div className="cf-circle-top"></div>
            <div className="cf-circle-bottom"></div>
            <div className="cf-chat-card">
              <div className="cf-chat-body">
                <div className="cf-bubble cf-bubble-small">Hey, There</div>
                <div className="cf-bubble cf-bubble-large">
                  Get updates on new harvests, seasonal editions, and exclusive offers.
                </div>
              </div>
              <div className="cf-chat-footer">
                <form
                  className="cf-chat-input-wrapper"
                  onSubmit={(e) => { e.preventDefault(); setChatMessage(''); }}
                >
                  <span className="cf-cursor">|</span>
                  <input
                    type="text"
                    placeholder="Write message .."
                    className="cf-chat-input"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <button type="submit" className="cf-send-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const testimonials = [
  { text: 'Cocofina Sugar has a clean, natural sweetness that feels truly unprocessed. It has completely replaced refined sugar in my daily tea and desserts.', name: 'Anjali R.', location: 'Mumbai' },
  { text: 'I love how Cocofina Sugar sweetens without overpowering the taste of food. Knowing it\'s organically harvested makes it even better.', name: 'Rahul S.', location: 'Bengaluru' },
  { text: 'We were looking for a natural sugar alternative, and Cocofina Sugar exceeded our expectations. It\'s now a staple in our kitchen.', name: 'Neha Sharma', location: 'Delhi' },
  { text: 'Excellent quality and very healthy. Best replacement for white sugar in the market right now.', name: 'Vikas M.', location: 'Pune' },
];

const TestimonialsSection = () => {
  const swiperRef = useRef(null);
  const swiperInst = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const updatePagination = useCallback(() => {
    if (!swiperInst.current) return;

    const swiper = swiperInst.current;

    const total = swiper.snapGrid.length;
    const current = swiper.snapIndex + 1;

    setTotalPages(total);
    setCurrentPage(current);
  }, []);

  useEffect(() => {
    if (!swiperRef.current) return;

    swiperInst.current = new Swiper(swiperRef.current, {
      slidesPerView: 1,
      spaceBetween: 30,
      loop: false,
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
      navigation: {
        nextEl: '.ctm-arrow-next',
        prevEl: '.ctm-arrow-prev',
      },
      on: {
        init: function () {
          setActiveIndex(this.activeIndex);
          updatePagination();
        },
        slideChange: function () {
          setActiveIndex(this.activeIndex);
          // setTimeout(() => updatePagination(), 50); // Small delay to ensure Swiper has updated
        },
        resize: function () {
          updatePagination();
        },
      },
    });

    return () => {
      if (swiperInst.current) {
        swiperInst.current.destroy(true, true);
      }
    };
  }, [updatePagination]);

  // Force update when activeIndex changes
  useEffect(() => {
    if (swiperInst.current) {
      updatePagination();
    }
  }, [activeIndex, updatePagination]);

  const goToPage = (pageIndex) => {
    if (swiperInst.current) {
      swiperInst.current.slideTo(pageIndex);
    }
  };

  return (
    <section className="ctm-testimonial-wrapper">
      <div className="ctm-container">
        <h2 className="ctm-main-heading">Testimonials</h2>

        <div className="swiper ctm-slider-container" ref={swiperRef}>
          <div className="swiper-wrapper">
            {testimonials.map((t, i) => (
              <div className="swiper-slide" key={i}>
                <div className="ctm-card">
                  <div className="ctm-stars">★★★★★</div>
                  <p className="ctm-text">{t.text}</p>
                  <div className="ctm-user-box">
                    <div className="ctm-avatar"></div>
                    <div className="ctm-user-info">
                      <h4 className="ctm-username">{t.name}</h4>
                      <p className="ctm-user-loc">{t.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ctm-controls-area">
            <button className="ctm-arrow-prev" aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div className="ctm-custom-pagination">
              {Array.from({ length: totalPages }).map((_, i) => (
                <span
                  key={i}
                  className={`ctm-num ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => goToPage(i)}
                >
                  {(i + 1).toString().padStart(2, '0')}
                </span>
              ))}
            </div>

            <button className="ctm-arrow-next" aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const HomePage = () => {
  useEffect(() => { document.title = 'Cocofina Sugar'; }, []);

  useEffect(() => {
    const selectors =
      ".cf-product-card, .cf-feature-card, .cf-title-underline-center, .cf-products-main-title, .cf-about-title, .cf-about-underline, .cf-recipes-title";

    const elements = document.querySelectorAll(selectors);

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="cf-main">
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <ProductsSection />
      <StorySection />
      <AboutProductSection />
      <RecipesSection />
      <StayConnectedSection />
      <TestimonialsSection />
    </main>
  );
};

export default HomePage;