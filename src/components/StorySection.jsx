"use client";

import React from "react";
import Link from "next/link";
import { TreePalm, Sparkles, Sun, ArrowRight, ShieldCheck } from "lucide-react";

export function StorySection() {
  return (
    <section className="py-24 px-6 sm:px-10 bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column - Image Stack */}
        <div className="lg:col-span-6 relative">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <img
              src="/03.webp"
              alt="Sustainable Coconut Tapping Process"
              loading="lazy"
              decoding="async"
              className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
              <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                Artisan Tapping Heritage
              </span>
              <h3 className="text-xl font-bold font-playfair italic mt-1">
                Tapped high in the tropical canopy, 30 meters above the forest floor.
              </h3>
            </div>
          </div>

          {/* Floating Badge */}
          <div className="absolute -bottom-6 -right-6 z-20 bg-amber-600 text-white p-5 rounded-2xl shadow-xl hidden sm:flex items-center gap-4 max-w-xs border border-amber-400/30">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <TreePalm className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Zero Deforestation</p>
              <p className="text-[11px] text-white/90">Coconut trees produce sap for 20+ years without harming the tree.</p>
            </div>
          </div>
        </div>

        {/* Right Column - Text Content */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Our Story & Sourcing
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white font-playfair italic leading-[1.1]">
            From Blossom Sap to Golden Amber Crystals
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
            Contrary to popular belief, coconut sugar does not come from coconuts. It is harvested from the sweet, nutrient-rich nectar of the coconut palm blossom.
          </p>

          <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
            Every morning, skilled local tappers climb high into the tropical canopy to slice the unopened flower buds, gathering fresh sap drop by drop into bamboo containers. Within hours, the sap is gently kettle-heated to evaporate moisture until it naturally crystallizes into rich amber sugar.
          </p>

          {/* Grid Highlights */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
              <ShieldCheck className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Unrefined & Pure</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">No bone-char bleaching or chemical refining involved.</p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
              <Sun className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">Sustainable Harvest</h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Produces 50-75% more sugar per acre than sugarcane with 1/5th the water.</p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
            >
              <span>Learn more about our sustainable sourcing promise</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
