import React from "react";
import { Navbar } from "@/components/Navbar";
import { StorySection } from "@/components/StorySection";
import { ShieldCheck, Heart, Award, Sparkles } from "lucide-react";

export const metadata = {
  title: "About Us | Cocofina Sugar Story & Philosophy",
  description: "Learn about Cocofina's mission to provide 100% unrefined, organic coconut sugar sustainably tapped high in tropical palm canopies.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20">
      <Navbar />

      {/* Header Banner */}
      <section className="py-16 px-6 sm:px-10 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Our Passion & Purpose
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white font-playfair italic leading-[1.1]">
          Nurturing Earth & Body with Unrefined Pureness
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          At Cocofina, we believe that true sweetness comes directly from nature without chemical refining, bleaching, or artificial additives.
        </p>
      </section>

      {/* Core Values Cards */}
      <section className="py-12 px-6 sm:px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Health-First Philosophy
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We provide a low-GI (35) unrefined alternative to white sugar that nourishes with naturally occurring Inulin fiber, Potassium, Zinc, and Iron.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Artisanal Integrity
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Every batch is hand-harvested by local tappers and kettle-evaporated in small batches to preserve its natural butterscotch aroma.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            100% Fair Harvest
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We support tropical coconut farming communities with fair wages and zero-deforestation agricultural practices.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <StorySection />
    </main>
  );
}
