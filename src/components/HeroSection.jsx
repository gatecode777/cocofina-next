"use client";

import React, { useState, useEffect, useRef } from "react";
import { RevealLayer } from "./RevealLayer";
import { Navbar } from "./Navbar";

const BG_IMAGE_1 = "/04.png";
const BG_IMAGE_2 = "/03.png";

export function HeroSection() {
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef(null);

  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    if (mouseRef.current.x === -999 && typeof window !== "undefined") {
      mouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      smoothRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const loop = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;

      setCursorPos({
        x: smoothRef.current.x,
        y: smoothRef.current.y,
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 tracking-[-0.02em] select-none overflow-hidden">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative w-full overflow-hidden h-screen bg-neutral-100 dark:bg-black"
        style={{ height: "100dvh" }}
      >
        {/* Base Image Layer (z-10) */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat transition-opacity duration-500 z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* Reveal Layer with Spotlight Mask (z-30) */}
        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        {/* Heading (z-50) */}
        <div className="absolute top-[18%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-neutral-900 dark:text-white leading-[0.95] transition-colors duration-500 drop-shadow-md">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
            >
              Nature&apos;s pure
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
            >
              golden nectar
            </span>
          </h1>
        </div>

        {/* Bottom-left Paragraph (z-50) */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-sm text-neutral-600 dark:text-white/80 leading-relaxed transition-colors duration-500">
            — Every crystal originates from the nutrient-rich sap of coconut
            blossoms, sustainably tapped high in the tropical canopy.
          </p>
        </div>

        {/* Bottom-right Block (z-50) */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-white/80 leading-relaxed transition-colors duration-500">
            — Discover how we transform sweet, organic coconut sap into an
            unrefined, low-glycemic sugar that nourishes both body and earth.
          </p>
          <a
            href="#products"
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-amber-600/30 cursor-pointer"
          >
            Taste the Pureness
          </a>
        </div>
      </section>
    </div>
  );
}
