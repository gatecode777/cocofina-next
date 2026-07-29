"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { ShoppingBag, Star, Check, Sparkles, Zap, Search, Filter, ShieldCheck } from "lucide-react";
import { getProductImageUrl } from "@/lib/imageHelper";

function ProductsSectionComponent({ products = [] }) {
  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [variantSelection, setVariantSelection] = useState({}); // { [productId]: variantIndex }
  const [qtyState, setQtyState] = useState({}); // { [productId]: quantity }
  const [addedToast, setAddedToast] = useState(null);

  // Fallback default static products if DB products are empty
  const defaultProducts = [
    {
      _id: "cocofina-400g",
      name: "Cocofina Organic Coconut Sugar (400g)",
      slug: "cocofina-organic-coconut-sugar-400g",
      description: {
        short: "Handy 400g daily pack of pure unrefined organic coconut sugar with rich caramel notes.",
        long: "Ideal for home kitchens, daily coffee brewing, tea, smoothie bowls, and baking. Pure unrefined micro-milled amber crystals.",
      },
      thumbnail: "/images/product_400g.png",
      images: ["/images/product_400g.png"],
      variants: [
        { weight: "400g", price: 349, oldPrice: 399, stock: 50 },
      ],
      stockStatus: "In Stock",
      highlights: ["100% Unrefined & Organic Certified", "Low Glycemic Index (GI 35)", "1:1 Direct Substitute for White Sugar"],
    },
    {
      _id: "cocofina-1kg",
      name: "Cocofina Organic Coconut Sugar (1kg Bulk)",
      slug: "cocofina-organic-coconut-sugar-1kg",
      description: {
        short: "Best-value 1kg family bulk pack for active kitchens and baking enthusiasts.",
        long: "Best value for active kitchens, baking enthusiasts, coffee lovers, and healthy families. Comes in a heavy-duty resealable pouch.",
      },
      thumbnail: "/images/product_1kg.png",
      images: ["/images/product_1kg.png"],
      variants: [
        { weight: "1kg", price: 700, oldPrice: 799, stock: 40 },
      ],
      stockStatus: "In Stock",
      highlights: ["Free Express Shipping included", "100% Organic & Sustainably Tapped", "Low Glycemic Index (GI 35) with Inulin Fiber"],
    },
  ];

  const displayProducts = products && products.length > 0 ? products : defaultProducts;

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    displayProducts.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [displayProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      const matchesCat =
        selectedCategory === "all" || p.category?.name === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description?.short &&
          p.description.short.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [displayProducts, selectedCategory, searchQuery]);

  const handleVariantSelect = (productId, variantIdx) => {
    setVariantSelection((prev) => ({ ...prev, [productId]: variantIdx }));
  };

  const handleQtyChange = (productId, newQty) => {
    setQtyState((prev) => ({ ...prev, [productId]: Math.max(1, newQty) }));
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const vIdx = variantSelection[product._id] || 0;
    const variant = product.variants?.[vIdx] || { weight: "Pack", price: 349 };
    const qty = qtyState[product._id] || 1;

    const img = getProductImageUrl(product.thumbnail || product.images?.[0]);

    addToCart(
      {
        id: `${product._id}-${variant.weight}`,
        name: product.name,
        weight: variant.weight,
        price: variant.price,
        originalPrice: variant.oldPrice || Math.round(variant.price * 1.15),
        image: img,
      },
      qty
    );

    setAddedToast(`Added ${product.name} (${variant.weight}) to your basket!`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleBuyNow = (product, e) => {
    if (e) e.stopPropagation();
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  return (
    <section id="products" className="py-20 px-4 sm:px-8 bg-neutral-50 dark:bg-neutral-900/60 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Toast */}
        {addedToast && (
          <div className="fixed bottom-6 right-6 z-[150] bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
            <Sparkles className="w-4.5 h-4.5 text-amber-400" />
            <span className="text-sm font-semibold">{addedToast}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Jaipur's #1 Certified Organic Sugar
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            Explore Our Organic Coconut Sugar Collection
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base leading-relaxed">
            100% natural, unrefined, and low-glycemic sweetener sourced directly from tropical blossom sap. Free express delivery across Jaipur and all India.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-800/80 p-4 rounded-3xl border border-neutral-200/80 dark:border-neutral-700/80 shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-md"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              }`}
            >
              All Products ({displayProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-md"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* E-Commerce Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => {
            const vIdx = variantSelection[product._id] || 0;
            const variants = product.variants && product.variants.length > 0 ? product.variants : [{ weight: "400g", price: 349, oldPrice: 399 }];
            const currentVariant = variants[vIdx] || variants[0];
            const qty = qtyState[product._id] || 1;

            const img = getProductImageUrl(product.thumbnail || product.images?.[0]);

            const isBestValue = currentVariant.weight === "1kg" || currentVariant.weight === "1000g";
            const discount = currentVariant.oldPrice
              ? Math.round(((currentVariant.oldPrice - currentVariant.price) / currentVariant.oldPrice) * 100)
              : 12;

            const isOutOfStock = product.stockStatus === "Out of Stock" || currentVariant?.stock === 0;
            const productUrl = `/products/${product.slug || product._id}`;

            return (
              <div
                key={product._id}
                className={`group relative bg-white dark:bg-neutral-800/90 border rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                  isBestValue
                    ? "border-2 border-amber-500/70 dark:border-amber-400/70"
                    : "border-neutral-200/80 dark:border-neutral-700/80"
                }`}
              >
                {/* Popular / Best Value Badge */}
                {isBestValue && (
                  <div className="absolute -top-3.5 right-6 bg-amber-600 text-white text-[10px] sm:text-xs font-extrabold px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
                    <Zap className="w-3 h-3 fill-current" /> MOST POPULAR - BEST VALUE
                  </div>
                )}

                <div className="space-y-5">
                  {/* Image Showcase Container */}
                  <Link href={productUrl} prefetch={true} className="relative aspect-4/3 rounded-2xl overflow-hidden bg-amber-50/60 dark:bg-neutral-900/80 flex items-center justify-center p-4 block cursor-pointer">
                    <img
                      src={img}
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/cocofinaproduct.png";
                      }}
                      className="w-full h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 bg-neutral-900/80 dark:bg-white/90 text-white dark:text-neutral-900 text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md">
                      {product.stockStatus || "In Stock"}
                    </span>
                    {discount > 0 && (
                      <span className="absolute top-3 right-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        SAVE {discount}%
                      </span>
                    )}
                  </Link>

                  {/* Product Header & Rating */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-amber-500 font-medium">
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-neutral-500 dark:text-neutral-400 text-[11px] ml-1">(4.9/5)</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        GI 35 Low Glycemic
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      <Link href={productUrl} prefetch={true} className="cursor-pointer">
                        {product.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                      {product.description?.short || "100% unrefined organic coconut sugar tapped from tropical coconut blossoms."}
                    </p>
                  </div>

                  {/* Variant Selection Pills */}
                  {variants.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">Select Pack Weight:</span>
                      <div className="flex flex-wrap gap-2">
                        {variants.map((v, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVariantSelect(product._id, i);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              vIdx === i
                                ? "bg-amber-600 text-white shadow-md"
                                : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-amber-500"
                            }`}
                          >
                            {v.weight}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Display */}
                  <div className="pt-1 flex items-baseline gap-3">
                    <span className="text-2xl font-extrabold text-neutral-900 dark:text-white">
                      ₹{currentVariant.price}
                    </span>
                    {currentVariant.oldPrice && (
                      <span className="text-sm text-neutral-400 line-through">
                        ₹{currentVariant.oldPrice}
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                      {currentVariant.weight}
                    </span>
                  </div>

                  {/* Highlights Bullet List */}
                  {product.highlights && product.highlights.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 pt-1">
                      {product.highlights.slice(0, 2).map((h, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="line-clamp-1">{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card Actions (Qty + Add to Cart + Buy Now) */}
                {isOutOfStock ? (
                  <div className="pt-6" onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled
                      className="w-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold py-3 rounded-full text-xs cursor-not-allowed border border-neutral-300/80 dark:border-neutral-700 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Out of Stock
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 space-y-3">
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        Qty:
                      </span>
                      <div className="flex items-center border border-neutral-300 dark:border-neutral-600 rounded-full px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-900">
                        <button
                          onClick={() => handleQtyChange(product._id, qty - 1)}
                          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-neutral-900 dark:text-white">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(product._id, qty + 1)}
                          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={(e) => handleAddToCart(product, e)}
                        className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-semibold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={(e) => handleBuyNow(product, e)}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-md shadow-amber-600/20"
                      >
                        Buy Now (₹{currentVariant.price * qty})
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table Section */}
        <div className="pt-12 border-t border-neutral-200 dark:border-neutral-800 space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white font-playfair italic">
              Why Cocofina Coconut Sugar Wins
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
              Compare Cocofina Organic Coconut Sugar against refined white sugar, brown sugar, and artificial chemical sweeteners.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                  <th className="p-4 font-bold text-neutral-900 dark:text-white">Feature / Property</th>
                  <th className="p-4 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10">Cocofina Coconut Sugar</th>
                  <th className="p-4 font-medium text-neutral-600 dark:text-neutral-400">Refined White Sugar</th>
                  <th className="p-4 font-medium text-neutral-600 dark:text-neutral-400">Commercial Brown Sugar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                <tr>
                  <td className="p-4 font-semibold">Glycemic Index (GI)</td>
                  <td className="p-4 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/5">35 (Low GI)</td>
                  <td className="p-4 text-red-500 font-medium">65 (High Spike)</td>
                  <td className="p-4">64 (High Spike)</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Processing Level</td>
                  <td className="p-4 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/5">100% Unrefined Sap</td>
                  <td className="p-4 text-neutral-500">Heavily Bleached & Processed</td>
                  <td className="p-4 text-neutral-500">White Sugar + Molasses</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Nutrients & Minerals</td>
                  <td className="p-4 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/5">Potassium, Zinc, Iron, Inulin Fiber</td>
                  <td className="p-4 text-neutral-500">Empty Calories (0 Nutrients)</td>
                  <td className="p-4 text-neutral-500">Trace amounts only</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Flavor Profile</td>
                  <td className="p-4 font-bold text-amber-700 dark:text-amber-300 bg-amber-500/5">Rich Warm Caramel Notes</td>
                  <td className="p-4 text-neutral-500">Harsh Flat Sweetness</td>
                  <td className="p-4 text-neutral-500">Syrupy Sweetness</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export const ProductsSection = React.memo(ProductsSectionComponent);

