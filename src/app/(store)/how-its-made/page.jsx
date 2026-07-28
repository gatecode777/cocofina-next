import React from "react";
import { Navbar } from "@/components/Navbar";
import { ProcessSection } from "@/components/ProcessSection";
import { StorySection } from "@/components/StorySection";

export const metadata = {
  title: "Sustainable Process | Cocofina Coconut Sugar",
  description: "Discover the 4-step artisan process of harvesting sweet coconut sap high in tropical palm canopies.",
};

export default function ProcessPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20">
      <Navbar />

      <div className="py-12 px-6 text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white font-playfair italic">
          Our Sustainable Craft Process
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
          From morning tree tapping high in the palm canopy to slow kettle evaporation and amber granulation.
        </p>
      </div>

      <ProcessSection />
      <StorySection />
    </main>
  );
}
