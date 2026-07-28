"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What are the sizes and prices available for Cocofina Coconut Sugar?",
      a: "Cocofina Organic Coconut Sugar is available in two convenient options: a 400g daily pack for ₹349 (Save 12%) and a best-value 1kg family bulk pack for ₹700 (Save ₹170 with FREE Express Delivery across India).",
    },
    {
      q: "How does coconut sugar differ from refined white sugar?",
      a: "Refined white sugar is heavily processed and stripped of all nutrients, giving it a high Glycemic Index of 65. Cocofina Coconut Sugar is 100% unrefined sap with a low Glycemic Index of 35, rich in Inulin dietary fiber, Potassium, Zinc, and Iron.",
    },
    {
      q: "Does Cocofina Coconut Sugar taste like raw coconut?",
      a: "No! Because it is harvested from the blossom nectar rather than the coconut fruit, it has no coconut flavor. Instead, it offers a rich, luxurious warm caramel and butterscotch taste that enhances tea, coffee, and desserts.",
    },
    {
      q: "Can I substitute it 1:1 in my everyday cooking and baking?",
      a: "Yes! Cocofina replaces white or brown sugar in an exact 1:1 ratio. If your recipe calls for 1 cup of white sugar, simply use 1 cup of Cocofina Coconut Sugar.",
    },
    {
      q: "Is it suitable for individuals managing blood sugar levels?",
      a: "Yes. With a low Glycemic Index of 35 and naturally occurring Inulin fiber, it causes a much slower release of glucose into the bloodstream, avoiding sudden energy spikes and crashes.",
    },
    {
      q: "What is the shelf life and how should I store it?",
      a: "Cocofina Coconut Sugar has a shelf life of 24 months. Store it in a cool, dry place inside our heavy-duty resealable pouch or an airtight glass container.",
    },
  ];

  return (
    <section className="py-24 px-6 sm:px-10 bg-neutral-50 dark:bg-neutral-900/60 transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-neutral-800/90 border border-neutral-200/80 dark:border-neutral-700 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-neutral-900 dark:text-white text-sm sm:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-amber-600 dark:text-amber-400 transition-transform duration-300 flex-shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-700/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
