import React from "react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";

import { HeroSection } from "@/components/HeroSection";
import { ProductsSection } from "@/components/ProductsSection";
import { StorySection } from "@/components/StorySection";
import { ProcessSection } from "@/components/ProcessSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";
import { FaqSection } from "@/components/FaqSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cocofina Organic Coconut Sugar | 100% Pure, Unrefined & Low-GI",
  description:
    "Buy pure unrefined Cocofina Organic Coconut Sugar. Available in 400g for ₹349 and 1kg for ₹700. Sustainably tapped from tropical coconut blossoms. Free express shipping across India.",
  keywords: [
    "organic coconut sugar",
    "coconut sugar India",
    "natural sweetener",
    "low glycemic index sugar",
    "unrefined coconut sugar",
    "coconut blossom sugar",
    "Cocofina",
    "coconut sugar 400g",
    "coconut sugar 1kg",
  ],
  alternates: { canonical: "https://www.cocofinasugar.com" },
};

async function getHomeProducts() {
  try {
    await connectDB();
    const products = await Product.find({ status: "active" })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (err) {
    console.error("DB fetch fallback:", err);
    return [];
  }
}

export default async function Page() {
  const products = await getHomeProducts();

  return (
    <main className="min-h-screen">
      {/* 1. Spotlight Dual-Themed Hero */}
      <HeroSection />

      {/* 2. Featured Products Section (400g @ ₹349 & 1kg @ ₹700) */}
      <ProductsSection products={products} />

      {/* 3. Sustainable Sourcing & Story Section */}
      <StorySection />

      {/* 4. 4-Step Craft Process */}
      <ProcessSection />

      {/* 5. Customer Testimonials & Reviews */}
      <TestimonialsSection />

      {/* 6. FAQ Accordion Section */}
      <FaqSection />
    </main>
  );
}
