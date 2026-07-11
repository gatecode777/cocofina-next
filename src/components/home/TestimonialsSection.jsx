'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Swiper from 'swiper';
import 'swiper/css';

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

export default TestimonialsSection;
