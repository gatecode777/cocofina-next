'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cartAPI } from '@/services/api';
import { useCart, triggerCartUpdate } from '@/context/CartContext';
import { getUploadUrl } from '@/lib/imageHelper';

const getLowestVariant = (product) => {
  if (!product.variants?.length) return null;
  return product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
};

const AddToCartControls = ({ product = {}, isOutOfStock = false }) => {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const lowestVar = getLowestVariant(product);
  const [selectedVariant, setSelectedVariant] = useState(lowestVar);
  const [cartLoading, setCartLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef(null);

  const handleAddToCart = async (openDrawer = true) => {
    if (!selectedVariant) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.push('/login');
      return;
    }

    const itemToAdd = {
      id: `${product._id}_${selectedVariant.weight}`,
      productId: product._id,
      name: product.name,
      price: selectedVariant.price,
      originalPrice: selectedVariant.oldPrice,
      weight: selectedVariant.weight,
      image: getUploadUrl(product.thumbnail || product.images?.[0], 'products') || '/cocofinaproduct.png',
      quantity: 1,
    };

    addToCart(itemToAdd, 1);

    if (openDrawer) {
      setIsCartOpen(true);
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
    await handleAddToCart(true);
  };

  return (
    <>
      {selectedVariant && (
        <div className="product-price">
          <span className="current-price">₹{selectedVariant.price}</span>
          {selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price && (
            <>
              <span className="old-price">₹{selectedVariant.oldPrice}</span>
              <span className="discount-badge">
                SAVE {Math.round(((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100)}%
              </span>
            </>
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

      {isOutOfStock ? (
        <div className="action-buttons">
          <button className="btn-buy-now" disabled style={{ width: '100%', background: '#6b7280', cursor: 'not-allowed', borderColor: '#4b5563' }}>
            🚫 Out of Stock
          </button>
        </div>
      ) : (
        <div className="action-buttons">
          <button className="btn-buy-now" onClick={handleBuyNow} disabled={cartLoading}>
            Buy Now
          </button>
          <button className="btn-add-cart" onClick={handleAddToCart} disabled={cartLoading}>
            {cartLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      )}

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
