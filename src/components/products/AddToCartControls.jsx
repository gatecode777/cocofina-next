'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cartAPI } from '@/services/api';
import { triggerCartUpdate } from '@/context/CartContext';

const getLowestVariant = (product) => {
  if (!product.variants?.length) return null;
  return product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
};

const AddToCartControls = ({ product = {}, isOutOfStock = false }) => {
  const router = useRouter();
  const lowestVar = getLowestVariant(product);
  const [selectedVariant, setSelectedVariant] = useState(lowestVar);
  const [cartLoading, setCartLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef(null);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }
    try {
      setCartLoading(true);
      const res = await cartAPI.addToCart(product._id, 1, selectedVariant.weight);
      if (res.data.success) {
        triggerCartUpdate();
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setShowToast(true);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 2800);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }
    await handleAddToCart();
    router.push('/cart');
  };

  return (
    <>
      {selectedVariant && (
        <div className="product-price">
          <span className="current-price">₹{selectedVariant.price}</span>
          {selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price && (
            <span className="old-price">₹{selectedVariant.oldPrice}</span>
          )}
        </div>
      )}

      {product.variants?.length > 0 && (
        <div className="weight-selector">
          {product.variants.map((v) => (
            <button key={v.weight}
              className={`weight-btn ${selectedVariant?.weight === v.weight ? 'active' : ''}`}
              onClick={() => setSelectedVariant(v)}
              disabled={isOutOfStock}
            >{v.weight}</button>
          ))}
        </div>
      )}

      <div className="action-buttons">
        <button className="btn-buy-now" onClick={handleBuyNow} disabled={isOutOfStock || cartLoading}>
          {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
        </button>
        <button className="btn-add-cart" onClick={handleAddToCart} disabled={isOutOfStock || cartLoading}>
          {cartLoading ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>

      <div className={`cart-toast ${showToast ? 'show' : ''}`}>
        <span className="cart-toast-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {product?.name} added to cart!
      </div>
    </>
  );
};

export default AddToCartControls;
