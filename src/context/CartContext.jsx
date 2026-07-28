"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartAPI } from "../services/api";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [backendCount, setBackendCount] = useState(0);

  // Load local cart on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cocofina_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      // Ignore
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cocofina_cart", JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  // Sync with backend API if logged in
  const refreshCount = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setBackendCount(0);
      return;
    }
    try {
      const res = await cartAPI.getCartCount();
      if (res?.data?.success) {
        setBackendCount(res.data.count ?? 0);
      }
    } catch {
      setBackendCount(0);
    }
  }, []);

  useEffect(() => {
    refreshCount();
    window.addEventListener("userAuthChanged", refreshCount);
    window.addEventListener("cartUpdated", refreshCount);
    return () => {
      window.removeEventListener("userAuthChanged", refreshCount);
      window.removeEventListener("cartUpdated", refreshCount);
    };
  }, [refreshCount]);

  const addToCart = useCallback((item, quantityToAdd = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantityToAdd;
        return newCart;
      } else {
        return [...prevCart, { ...item, quantity: quantityToAdd }];
      }
    });
    setIsCartOpen(true);
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => {
      const nextCart = prevCart.filter((item) => item.id !== id);
      if (nextCart.length === 0) setBackendCount(0);
      return nextCart;
    });
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
    window.dispatchEvent(new Event("cartUpdated"));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setBackendCount(0);
    window.dispatchEvent(new Event("cartUpdated"));
  }, []);

  const localTotalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalItems = cart.length === 0 ? 0 : Math.max(localTotalItems, backendCount);
  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const value = React.useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      totalItems,
      count: totalItems,
      subtotal,
      refreshCount,
    }),
    [
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      totalItems,
      subtotal,
      refreshCount,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const triggerCartUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cartUpdated"));
  }
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      isCartOpen: false,
      setIsCartOpen: () => {},
      totalItems: 0,
      count: 0,
      subtotal: 0,
      refreshCount: () => {},
    };
  }
  return context;
}