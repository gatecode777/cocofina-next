'use client';
import { useEffect } from 'react';

export default function HomeRevealObserver() {
  useEffect(() => {
    const selectors =
      ".cf-product-card, .cf-feature-card, .cf-title-underline-center, .cf-products-main-title, .cf-about-title, .cf-about-underline, .cf-recipes-title";

    // Set up observer to reveal elements
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

  return null;
}
