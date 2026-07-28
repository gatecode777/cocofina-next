"use client";

import React from "react";
import { Flame, Droplets, Sparkles, PackageCheck, Layers } from "lucide-react";

export function ProcessSection() {
  const steps = [
    {
      num: "01",
      title: "Sustainable Tapping",
      desc: "Artisan farmers climb high into coconut tree canopies at dawn to tap unopened blossom buds for fresh sap.",
      icon: Droplets,
    },
    {
      num: "02",
      title: "Fresh Collection",
      desc: "Sweet coconut nectar is collected in natural bamboo containers within 4 hours to preserve pure enzymatic freshness.",
      icon: Layers,
    },
    {
      num: "03",
      title: "Kettle Evaporation",
      desc: "Slow-cooked at gentle low temperatures in open kettles to evaporate water without caramel burning.",
      icon: Flame,
    },
    {
      num: "04",
      title: "Granulation & Packaging",
      desc: "Naturally cooled and micro-sifted into golden amber crystals, sealed directly into eco pouches.",
      icon: PackageCheck,
    },
  ];

  return (
    <section className="py-24 px-6 sm:px-10 bg-neutral-100 dark:bg-black transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 4-Step Craftsmanship
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            How Pure Cocofina Is Crafted
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
            No chemicals, no bleaching agents, no artificial colors. Just time-honored artisanal care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-white dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 space-y-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <span className="text-4xl font-extrabold text-amber-500/20 dark:text-amber-400/20 font-playfair group-hover:text-amber-500/40 transition-colors">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-playfair italic">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
