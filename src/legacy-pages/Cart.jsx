'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cartAPI, couponAPI } from '@/services/api';
import { triggerCartUpdate } from '@/context/CartContext';
import '@/styles/cart.css';

const getImageSrc = (item) => {
  const img = item.product?.images?.[0] || item.product?.thumbnail;
  return img ? `/uploads/products/${img}` : '/cocofinaproduct.png';
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const CartSkeleton = () => (
  <div className="cart-items-section">
    <div className="cart-title-skel"></div>
    {[1, 2, 3].map((i) => (
      <div className="cart-item cart-item-skel" key={i}>
        <div className="skel skel-img"></div>
        <div className="skel-info">
          <div className="skel skel-name"></div>
          <div className="skel skel-sku"></div>
        </div>
        <div className="skel skel-qty"></div>
        <div className="skel skel-price"></div>
      </div>
    ))}
  </div>
);

// ── Available Coupons Panel ────────────────────────────────────────────────────
const CouponsPanel = ({ subtotal, onApply, appliedCode }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    if (subtotal <= 0) return;
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const res = await couponAPI.getAvailable(subtotal);
        console.log('Available coupons:', res.data.coupons);
        if (res.data.success) setCoupons(res.data.coupons);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchCoupons();
  }, [subtotal]);

  const handleApply = async (code) => {
    setApplying(code);
    await onApply(code);
    setApplying(null);
  };

  if (loading) return (
    <div className="cp-loading">
      <i className="fas fa-spinner fa-spin"></i> Loading offers…
    </div>
  );

  if (coupons.length === 0) return (
    <p className="cp-empty">No coupons available right now.</p>
  );

  return (
    <div className="cp-list">
      {coupons.map((c) => (
        <div key={c._id} className={`cp-card ${!c.eligible ? 'cp-card--dim' : ''} ${appliedCode === c.code ? 'cp-card--applied' : ''}`}>
          <div className="cp-card-left">
            <div className="cp-tag">{c.type === 'flat' ? '₹ FLAT' : '% OFF'}</div>
            <div className="cp-code">{c.code}</div>
            <div className="cp-label">{c.label}</div>
            {c.description && <div className="cp-desc">{c.description}</div>}
            {c.expiryDate && (
              <div className="cp-expiry">
                Expires {new Date(c.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            )}
          </div>
          <div className="cp-card-right">
            {c.eligible && appliedCode !== c.code && (
              <div className="cp-saving">Save ₹{c.previewDiscount}</div>
            )}
            {appliedCode === c.code ? (
              <span className="cp-applied-badge"><i className="fas fa-check"></i> Applied</span>
            ) : c.eligible ? (
              <button className="cp-apply-btn" onClick={() => handleApply(c.code)} disabled={applying === c.code}>
                {applying === c.code ? <i className="fas fa-spinner fa-spin"></i> : 'Apply'}
              </button>
            ) : (
              <span className="cp-reason">{c.reason}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main Cart ──────────────────────────────────────────────────────────────────
const Cart = () => {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(new Set());

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { code, discount, message }
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showCouponPanel, setShowCouponPanel] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await cartAPI.getCart();
      if (res.data.success) setCartItems(res.data.cart?.items || []);
    } catch (err) {
      if (err.response?.status === 401) router.push('/login');
      else setError('Failed to load cart. Please try again.');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQty = async (item, delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return;
    const key = `${item.product._id}-${item.variantWeight}`;
    setUpdating((p) => new Set(p).add(key));
    setCartItems((p) => p.map((ci) =>
      ci.product._id === item.product._id && ci.variantWeight === item.variantWeight
        ? { ...ci, quantity: newQty } : ci
    ));
    try {
      await cartAPI.updateQuantity(item.product._id, newQty, item.variantWeight);
      triggerCartUpdate();
    } catch {
      fetchCart();
    } finally {
      setUpdating((p) => { const s = new Set(p); s.delete(key); return s; });
    }
  };

  const removeItem = async (item) => {
    const key = `${item.product._id}-${item.variantWeight}`;
    setUpdating((p) => new Set(p).add(key));
    setCartItems((p) => p.filter((ci) => !(ci.product._id === item.product._id && ci.variantWeight === item.variantWeight)));
    try {
      await cartAPI.removeItem(item.product._id, item.variantWeight);
      triggerCartUpdate();
    } catch {
      fetchCart();
    } finally {
      setUpdating((p) => { const s = new Set(p); s.delete(key); return s; });
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Remove all items from cart?')) return;
    try {
      await cartAPI.clearCart();
      setCartItems([]);
      setCouponApplied(null);
      triggerCartUpdate();
    } catch {
      fetchCart();
    }
  };

  // ── Coupon logic ─────────────────────────────────────────────────────────
  // Cart.jsx — replace handleApplyCoupon
  const handleApplyCoupon = async (code) => {
    const c = (code || couponInput).trim().toUpperCase();
    if (!c) { setCouponError('Please enter a coupon code'); return; }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await couponAPI.apply(c, subtotal);
      if (res.data.success) {
        setCouponApplied({
          code: res.data.coupon.code,      // ← was res.data.couponCode (undefined)
          discount: res.data.discount,
          message: res.data.message,
        });
        setCouponInput('');
        setShowCouponPanel(false);
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setCouponApplied(null);
    } finally { setCouponLoading(false); }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponError('');
    setCouponInput('');
  };

  // ── Calculations ──────────────────────────────────────────────────────────
  const getItemPrice = (item) =>
    item.product?.variants?.find((v) => v.weight === item.variantWeight)?.price ?? 0;

  const subtotal = cartItems.reduce((s, i) => s + getItemPrice(i) * (i.quantity || 1), 0);
  const shipping = subtotal > 0 ? 50 : 0;
  const tax = Math.round(subtotal * 0.05);
  const discount = couponApplied?.discount || 0;
  const total = subtotal + shipping + tax - discount;
  const isEmpty = !loading && cartItems.length === 0;

  const handleCheckout = () => {
    // Pass coupon info to checkout via sessionStorage
    if (couponApplied) {
      sessionStorage.setItem('appliedCoupon', JSON.stringify(couponApplied));
    } else {
      sessionStorage.removeItem('appliedCoupon');
    }
    router.push('/buynow');
  };

  return (
    <main>
      <div className="cart-page-container">
        <div className={`cart-layout ${isEmpty ? 'cart-layout-empty' : ''}`}>

          {loading ? (
            <CartSkeleton />
          ) : isEmpty ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <Link href="/our-products" className="cart-empty-btn">Shop Now</Link>
            </div>
          ) : (
            <div className="cart-items-section">
              <div className="cart-header-row">
                <h1 className="cart-title">Shopping Cart</h1>
                <button className="cart-clear-btn" onClick={clearCart}>Clear all</button>
              </div>

              {error && <div className="cart-error">{error}</div>}

              {cartItems.map((item) => {
                const key = `${item.product._id}-${item.variantWeight}`;
                const isUpdating = updating.has(key);
                const price = getItemPrice(item);
                const lineTotal = price * (item.quantity || 1);

                return (
                  <div className={`cart-item ${isUpdating ? 'cart-item-updating' : ''}`} key={key}>
                    <div className="item-img">
                      <img
                        src={getImageSrc(item)}
                        alt={item.product?.name}
                        onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                      />
                    </div>
                    <div className="item-details">
                      <h3
                        className="item-name"
                        onClick={() => router.push(`/products/${item.product?.slug || item.product?._id}`)}
                      >
                        {item.product?.name}
                      </h3>
                      {item.variantWeight && <span className="item-variant">{item.variantWeight}</span>}
                      <span className="item-unit-price">₹{price} each</span>
                    </div>
                    <div className="item-quantity">
                      <button
                        className="qty-btn minus-btn"
                        onClick={() => updateQty(item, -1)}
                        disabled={isUpdating || item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity || 1}</span>
                      <button
                        className="qty-btn plus-btn"
                        onClick={() => updateQty(item, +1)}
                        disabled={isUpdating}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-price">₹{lineTotal.toLocaleString('en-IN')}</div>
                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item)}
                      disabled={isUpdating}
                      title="Remove"
                    >
                      {isUpdating ? <span className="cart-row-spinner"></span> : '✕'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !isEmpty && (
            <div className="summary-section">
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>

                {/* ── Coupon section ──────────────────────────────────────── */}
                <div className="coupon-section">
                  {couponApplied ? (
                    // Applied state
                    <div className="coupon-applied-bar">
                      <div className="coupon-applied-info">
                        <i className="fas fa-tag"></i>
                        <div>
                          <span className="coupon-applied-code">{couponApplied.code}</span>
                          <span className="coupon-applied-saving">You save ₹{couponApplied.discount}</span>
                        </div>
                      </div>
                      <button className="coupon-remove-btn" onClick={removeCoupon} title="Remove coupon">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    // Input + available toggle
                    <>
                      <div className="coupon-input-row">
                        <div className="coupon-input-wrap">
                          <i className="fas fa-tag"></i>
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponInput}
                            onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          />
                        </div>
                        <button
                          className="coupon-apply-btn"
                          onClick={() => handleApplyCoupon()}
                          disabled={couponLoading || !couponInput.trim()}
                        >
                          {couponLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Apply'}
                        </button>
                      </div>

                      {couponError && (
                        <div className="coupon-error-msg">
                          <i className="fas fa-exclamation-circle"></i> {couponError}
                        </div>
                      )}

                      <button className="coupon-browse-btn" onClick={() => setShowCouponPanel(p => !p)}>
                        <i className="fas fa-ticket-alt"></i>
                        View available coupons
                        <i className={`fas fa-chevron-${showCouponPanel ? 'up' : 'down'}`}></i>
                      </button>

                      {showCouponPanel && (
                        <CouponsPanel
                          subtotal={subtotal}
                          onApply={handleApplyCoupon}
                          appliedCode={couponApplied?.code}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* ── Summary rows ────────────────────────────────────────── */}
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal ({cartItems.reduce((s, i) => s + (i.quantity || 1), 0)} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST (5%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  {discount > 0 && (
                    <div className="summary-row summary-discount">
                      <span><i className="fas fa-tag"></i> Coupon ({couponApplied.code})</span>
                      <span>−₹{discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <span><strong>Total</strong></span>
                    <span><strong>₹{total.toLocaleString('en-IN')}</strong></span>
                  </div>
                </div>

                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
                <Link href="/our-products" className="cart-continue-link">← Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Cart;