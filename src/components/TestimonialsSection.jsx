"use client";

import React from "react";
import { Star, Quote, CheckCircle } from "lucide-react";

export function TestimonialsSection() {
  const reviews = [
    {
      name: "Dr. Ananya Sharma",
      role: "Clinical Nutritionist, Mumbai",
      comment:
        "As a nutritionist, I strictly recommend low-GI alternatives to my diabetic and fitness-focused clients. Cocofina 1kg pack has become a permanent staple in my home. The caramel flavor in morning lattes is unmatched!",
      rating: 5,
      pack: "Verified 1kg Buyer",
    },
    {
      name: "Rohan Varma",
      role: "Specialty Coffee Roaster, Bangalore",
      comment:
        "Refined white sugar ruins the delicate acidity of single-origin espresso. Cocofina's unrefined coconut sugar adds a subtle butterscotch warmth that elevates espresso without overwhelming it.",
      rating: 5,
      pack: "Verified 400g Buyer",
    },
    {
      name: "Priya Nair",
      role: "Home Baker, Kochi",
      comment:
        "I swapped white sugar 1:1 in my banana bread and chocolate chip cookies. They turned out moister, richer, and deeply flavorful! The 1kg pack is amazing value for money.",
      rating: 5,
      pack: "Verified 1kg Buyer",
    },
  ];

  return (
    <section className="py-24 px-6 sm:px-10 bg-white dark:bg-neutral-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="flex justify-center gap-1 text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Loved by Health Enthusiasts & Bakers
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base">
            Over 5,000+ happy households across India have made the switch to Cocofina Organic Coconut Sugar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 flex flex-col justify-between space-y-6 shadow-lg relative"
            >
              <Quote className="w-8 h-8 text-amber-500/20 absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex text-amber-500 gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                  &quot;{rev.comment}&quot;
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white font-playfair italic">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {rev.role}
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {rev.pack}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
