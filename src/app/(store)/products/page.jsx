import React from "react";
import { Navbar } from "@/components/Navbar";
import { ProductsSection } from "@/components/ProductsSection";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import "@/models/Category";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products & Packs | Cocofina Organic Coconut Sugar",
  description: "Explore Cocofina Organic Coconut Sugar in 400g daily pack (₹349) and 1kg family bulk pack (₹700) with free shipping across India.",
};

async function getProducts() {
  try {
    await connectDB();
    const products = await Product.find({ status: "active" })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();
    return JSON.parse(JSON.stringify(products));
  } catch (err) {
    console.error("DB fetch fallback:", err);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 pt-20">
      <Navbar />

      <div className="py-12 px-6 text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white font-playfair italic">
          Organic Coconut Sugar Packs
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
          Handcrafted from 100% unrefined tropical coconut blossom sap. Available in 400g daily pouches and 1kg bulk family packs.
        </p>
      </div>

      <ProductsSection products={products} />
    </main>
  );
}
