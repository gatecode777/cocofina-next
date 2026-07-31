'use client';

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Sparkles, Clock, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { getUploadUrl } from "@/lib/imageHelper";

const DEFAULT_RECIPES = [
  {
    title: "Morning Caramel Iced Latte",
    category: "Beverage",
    time: "5 mins",
    servings: "1 cup",
    image: "/images/bg_sap.png",
    description: "A rich, velvety iced coffee with warm butterscotch notes from unrefined Cocofina coconut sugar.",
    ingredients: [
      "2 tsp Cocofina Coconut Sugar",
      "1 shot fresh Espresso or strong brew",
      "150ml chilled Almond or Oat Milk",
      "Handful of ice cubes",
    ],
    steps: [
      "Dissolve 2 tsp of Cocofina Coconut Sugar into hot espresso until fully dissolved.",
      "Fill a tall glass with ice and pour in chilled milk.",
      "Slowly pour the warm caramel espresso over milk and stir well.",
    ],
  },
  {
    title: "Organic Coconut Sugar Cookies",
    category: "Baking",
    time: "25 mins",
    servings: "12 cookies",
    image: "/images/product_400g.png",
    description: "Chewy, golden cookies with a subtle molasses aroma and crisp edges.",
    ingredients: [
      "1 cup Cocofina Coconut Sugar (1:1 substitute for brown sugar)",
      "1/2 cup unsalted organic butter, softened",
      "1 egg + 1 tsp vanilla extract",
      "1.5 cups whole wheat or oat flour + 1/2 tsp baking soda",
    ],
    steps: [
      "Cream softened butter and Cocofina Coconut Sugar together until fluffy.",
      "Mix in egg and vanilla extract.",
      "Fold in flour and baking soda. Bake at 175°C (350°F) for 10-12 minutes.",
    ],
  },
  {
    title: "Desi Coconut Sugar Kheer / Payasam",
    category: "Traditional Indian Dessert",
    time: "35 mins",
    servings: "4 bowls",
    image: "/images/product_1kg.png",
    description: "A healthy twist on classic Indian rice pudding with a rich caramel-golden tint.",
    ingredients: [
      "3/4 cup Cocofina Coconut Sugar",
      "1 liter full-cream or coconut milk",
      "1/4 cup Basmati rice, soaked",
      "Cardamom pods, roasted cashews & raisins in ghee",
    ],
    steps: [
      "Simmer milk and soaked rice on low heat until thickened.",
      "Stir in cardamom and roasted dry fruits.",
      "Turn off heat, allow to cool slightly for 2 minutes, then stir in Cocofina Coconut Sugar.",
    ],
  },
];

export default function RecipesPage() {
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch("/api/recipes?isActive=true");
        const data = await res.json();
        if (data.success && data.recipes && data.recipes.length > 0) {
          setRecipes(data.recipes);
        }
      } catch (err) {
        console.error("Failed to fetch recipes:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-20">
      <Navbar />

      {/* Header */}
      <section className="py-16 px-6 sm:px-10 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Culinary Inspiration
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white font-playfair italic">
          Delicious Recipes with Cocofina
        </h1>
        <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto">
          Discover how easy it is to replace refined sugar 1:1 in your daily coffee, morning oatmeal, baking, and traditional Indian sweets.
        </p>
      </section>

      {/* 1:1 Substitution Banner */}
      <section className="px-6 sm:px-10 max-w-7xl mx-auto mb-16">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Golden Rule
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-playfair italic">
              Simple 1:1 Direct Replacement
            </h3>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl">
              Use the exact same measurement of Cocofina Coconut Sugar as white or brown sugar in any recipe. No math required!
            </p>
          </div>

          <Link
            href="/products"
            className="bg-white text-neutral-900 font-bold px-8 py-3.5 rounded-full text-xs sm:text-sm hover:bg-neutral-100 transition-colors shadow-lg flex-shrink-0"
          >
            Order Cocofina (400g @ ₹349 / 1kg @ ₹700)
          </Link>
        </div>
      </section>

      {/* Recipes Cards */}
      <section className="pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
            <p className="text-sm">Loading delicious recipes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recipes.map((rec, idx) => (
              <div
                key={rec._id || idx}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="relative h-48 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img
                      src={getUploadUrl(rec.image, "recipes")}
                      alt={rec.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "/images/bg_sap.png";
                      }}
                    />
                    <span className="absolute top-4 left-4 bg-neutral-900/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-md">
                      {rec.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" /> {rec.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-500" /> {rec.servings}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic">
                      {rec.title}
                    </h3>

                    {rec.description && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {rec.description}
                      </p>
                    )}

                    {rec.ingredients && rec.ingredients.length > 0 && (
                      <div className="pt-2 border-t border-neutral-200/50 dark:border-neutral-800/80 mt-4">
                        <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-3">
                          KEY INGREDIENTS:
                        </h4>
                        <ul className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                          {rec.ingredients.map((ing, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="text-amber-600 dark:text-amber-500 font-bold text-sm leading-tight flex-shrink-0">●</span>
                              <span className="leading-snug">{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {rec.steps && rec.steps.length > 0 && (
                  <div className="p-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800 mt-2 space-y-3 bg-neutral-100/50 dark:bg-neutral-900/40">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">
                      PREPARATION STEPS:
                    </h4>
                    <ol className="text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
                      {rec.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2.5">
                          <span className="font-bold text-amber-700 dark:text-amber-400 min-w-[18px] text-right flex-shrink-0">{sIdx + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
