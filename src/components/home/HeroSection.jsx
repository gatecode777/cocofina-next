'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
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

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    }
    if (touchStart - touchEnd < -50) {
      prevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

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

export default HeroSection;
