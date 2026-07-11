'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

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

  const updateSlidesToShow = useCallback(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) setSlidesToShow(4);
      else if (window.innerWidth >= 768) setSlidesToShow(2);
      else setSlidesToShow(1);
    }
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slidesToShow]);

  useEffect(() => {
    setIsMounted(true);
    updateSlidesToShow();

    window.addEventListener('resize', updateSlidesToShow);

    return () => {
      window.removeEventListener('resize', updateSlidesToShow);
    };
  }, [updateSlidesToShow]);

  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
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
                <div className="cf-recipe-card" key={i}>
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

export default RecipesSection;
