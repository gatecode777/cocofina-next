'use client';

export const dynamic = "force-dynamic";
import React, { useEffect, useRef, useState } from 'react';
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

// ── Static sections ────────────────────────────────────────────────────────────
const HeroSection = () => (
  <section className="cf-hero">
    <div className="cf-hero-banner">
      <img src="/banner.png" alt="Coconut Sugar Banner" className="cf-hero-img" />
    </div>
  </section>
);

const IntroSection = () => (
  <section className="cf-intro">
    <div className="cf-container">
      <h2 className="cf-intro-title">Sweeten Your Life Naturally</h2>
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
  { icon: '/icon1.png', title: '100% Coconut Blossom Sap',       text: 'Made exclusively from fresh sap collected from coconut blossoms—nothing else added.' },
  { icon: '/icon2.png', title: 'No Chemicals or Preservatives',  text: 'Naturally processed without bleaching agents, additives, or artificial preservatives.' },
  { icon: '/icon3.png', title: 'Low Glycemic Index',             text: 'Releases energy slowly, helping maintain more balanced blood sugar levels than refined sugar.' },
  { icon: '/icon4.png', title: 'Sustainably Sourced',            text: 'Harvested using eco-friendly methods that support coconut farmers and protect nature.' },
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
          style={isComingSoon ? { opacity: 0.78, filter: 'grayscale(15%)' } : {}}
        />
        {isComingSoon && (
          <span className="cf-coming-soon-badge">⏳ Coming Soon</span>
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
            onClick={() => !isComingSoon && router.push(`/products/${product.slug || product._id}`)}
            disabled={isComingSoon}
            style={{ border: 'none', ...(isComingSoon ? { opacity: 0.55, cursor: 'not-allowed', background: '#9ca3af' } : {}) }}
          >
            {isComingSoon ? 'Coming Soon' : 'Order Now'}
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
          <img src="/Ourstory.png" alt="Our Story Book" className="cf-story-main-img" />
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
        <img src="/AbtOurProduct.png" alt="Cocofina Coconut Sugar Ingredients" className="cf-about-main-img" />
      </div>
    </div>
  </section>
);

const recipes = [
  { image: '/dailybevrage.jpg', title: 'Daily Beverages',  desc: 'Add a natural touch to your everyday tea and coffee with Cocofina Coconut Sugar. Its mild caramel sweetness blends perfectly without overpowering the flavour.' },
  { image: '/baking.png',       title: 'Baking & Desserts', desc: 'Bake your favourite cakes, cookies, and desserts with Cocofina Coconut Sugar for a rich caramel note and a naturally better sweetness in every bite.' },
  { image: '/indiansweet.png',  title: 'Indian Sweets',    desc: 'Prepare traditional Indian sweets using Cocofina Coconut Sugar to enjoy authentic taste with a clean, unrefined sweetness made from coconut blossoms.' },
  { image: '/breakfast.png',    title: 'Breakfast Recipes', desc: 'Start your mornings on a healthier note by adding Cocofina Coconut Sugar to oatmeal, smoothies, and breakfast bowls for gentle, balanced sweetness.' },
];

const RecipesSection = () => (
  <section className="cf-recipes-section">
    <div className="cf-container">
      <div className="cf-recipes-header">
        <h2 className="cf-recipes-title">Featured Recipes</h2>
        <div className="cf-recipes-underline"></div>
      </div>
      <div className="cf-recipes-grid">
        {recipes.map((recipe, i) => (
          <div className="cf-recipe-card" key={i}>
            <div className="cf-recipe-img-wrapper">
              <img src={recipe.image} alt={recipe.title} className="cf-recipe-img" />
            </div>
            <div className="cf-recipe-content">
              <h3 className="cf-recipe-card-title">{recipe.title}</h3>
              <p className="cf-recipe-card-desc">{recipe.desc}</p>
            </div>
            <div className="cf-recipe-action">
              <Link href="#" className="cf-recipe-btn">Recipes Here</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

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
  { text: 'Cocofina Sugar has a clean, natural sweetness that feels truly unprocessed. It has completely replaced refined sugar in my daily tea and desserts.', name: 'Anjali R.',    location: 'Mumbai'    },
  { text: 'I love how Cocofina Sugar sweetens without overpowering the taste of food. Knowing it\'s organically harvested makes it even better.',               name: 'Rahul S.',    location: 'Bengaluru' },
  { text: 'We were looking for a natural sugar alternative, and Cocofina Sugar exceeded our expectations. It\'s now a staple in our kitchen.',                  name: 'Neha Sharma', location: 'Delhi'     },
  { text: 'Excellent quality and very healthy. Best replacement for white sugar in the market right now.',                                                       name: 'Vikas M.',    location: 'Pune'      },
];

const TestimonialsSection = () => {
  const swiperRef = useRef(null);
  const swiperInst = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
        slideChange() { setActiveIndex(this.activeIndex); },
      },
    });

    return () => { if (swiperInst.current) swiperInst.current.destroy(true, true); };
  }, []);

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
              {testimonials.map((_, i) => (
                <span
                  key={i}
                  className={`ctm-num ${i === activeIndex ? 'active' : ''}`}
                  onClick={() => swiperInst.current?.slideTo(i)}
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

  return (
    <main>
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