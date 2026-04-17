// frontend/src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';

const CartContext = createContext({ count: 0, refreshCount: () => {} });

export const CartProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setCount(0); return; }
    try {
      const res = await cartAPI.getCartCount();
      if (res.data.success) setCount(res.data.count ?? 0);
    } catch {
      setCount(0);
    }
  }, []);

  // Fetch on mount and whenever auth changes
  useEffect(() => {
    refreshCount();
    window.addEventListener('userAuthChanged', refreshCount);
    window.addEventListener('cartUpdated', refreshCount);
    return () => {
      window.removeEventListener('userAuthChanged', refreshCount);
      window.removeEventListener('cartUpdated', refreshCount);
    };
  }, [refreshCount]);

  return (
    <CartContext.Provider value={{ count, refreshCount }}>
      {children}
    </CartContext.Provider>
  );
};

// Fire this after any add/remove/update so the badge refreshes everywhere
export const triggerCartUpdate = () =>
  window.dispatchEvent(new Event('cartUpdated'));

export const useCart = () => useContext(CartContext);