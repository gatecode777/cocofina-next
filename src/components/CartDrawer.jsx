"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { X, Trash2, ShoppingBag, Plus, Minus, CheckCircle, ArrowRight, Truck } from "lucide-react";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    clearCart,
  } = useCart();

  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const FREE_SHIPPING_THRESHOLD = 499;
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shippingFee;
  const progressToFreeShipping = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setIsCartOpen(false);
      router.push("/buynow");
    }, 600);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col justify-between transition-all">
          {/* Header */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-400/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-playfair italic">
                  Your Sugar Basket
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {cart.length} {cart.length === 1 ? "item" : "items"} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {cart.length > 0 && (
            <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200/50 dark:border-amber-900/30">
              <div className="flex items-center justify-between text-xs font-medium text-amber-900 dark:text-amber-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  {subtotal >= FREE_SHIPPING_THRESHOLD
                    ? "You unlocked FREE express delivery!"
                    : `Add ₹${FREE_SHIPPING_THRESHOLD - subtotal} more for FREE shipping`}
                </span>
                <span>{Math.round(progressToFreeShipping)}%</span>
              </div>
              <div className="w-full h-1.5 bg-amber-200/60 dark:bg-amber-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 dark:bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 text-neutral-400 space-y-3">
                <ShoppingBag className="w-16 h-16 stroke-[1.2] text-neutral-300 dark:text-neutral-700" />
                <p className="text-base font-medium text-neutral-600 dark:text-neutral-400">
                  Your basket is currently empty
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 max-w-xs">
                  Explore our 400g & 1kg organic coconut sugar packs to add natural caramel warmth to your kitchen.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 px-6 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/50 transition-all hover:border-amber-500/30"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-neutral-200 dark:bg-neutral-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.weight}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-amber-700 dark:text-amber-400">
                        ₹{item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-full px-2 py-0.5 bg-white dark:bg-neutral-900">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-semibold text-neutral-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                  <span>Estimated Express Delivery</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-2 flex justify-between text-base font-bold text-neutral-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-full transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-amber-600/30 active:scale-[0.98] cursor-pointer disabled:opacity-75"
              >
                {isCheckingOut ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <span>Proceed to Checkout (₹{grandTotal})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
