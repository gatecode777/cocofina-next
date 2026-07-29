'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cartAPI, addressAPI, orderAPI, couponAPI } from '@/services/api';
import { triggerCartUpdate, useCart } from '@/context/CartContext';
import { getUploadUrl } from '@/lib/imageHelper';
import Link from 'next/link';
import '@/styles/buynow.css';

const getImageSrc = (item) => {
  const img = item.image || item.product?.images?.[0] || item.product?.thumbnail;
  if (img) return getUploadUrl(img, 'products');
  return '/cocofinaproduct.png';
};

// ── Pincode lookup function ─────────────────────────────────────────────────
const fetchPincodeDetails = async (pincode) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === 'Success') {
      const postOffices = data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        const firstOffice = postOffices[0];
        return {
          city: firstOffice.District || firstOffice.Taluk || '',
          state: firstOffice.State || '',
          success: true
        };
      }
    }
    return { city: '', state: '', success: false, message: 'Pincode not found' };
  } catch (error) {
    console.error('Pincode lookup error:', error);
    return { city: '', state: '', success: false, message: 'Failed to fetch pincode details' };
  }
};

// ── Empty address form state ───────────────────────────────────────────────────
const emptyForm = {
  label: 'Home', fullName: '', phone: '',
  line1: '', line2: '', city: '', state: '', pincode: '',
  isDefault: false,
};

// ── Step 1: Address with Pincode Lookup ────────────────────────────────────────
const StepAddress = ({ selected, setSelected, addresses, setAddresses, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState({ type: '', message: '' });

  const lastFetchedPincode = React.useRef('');

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'pincode') {
      setPincodeStatus({ type: '', message: '' });
      // Reset last fetched pincode when user types
      if (value.length < 6) {
        lastFetchedPincode.current = '';
      }
    }
  };

  // Handle pincode blur - fetch city and state
  const handlePincodeBlur = async () => {
    const pincode = form.pincode.trim();

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return;
    }

    // Don't lookup if we already fetched this same pincode
    if (lastFetchedPincode.current === pincode) {
      return;
    }

    setIsLookingUp(true);
    setPincodeStatus({ type: 'info', message: 'Fetching location details...' });

    const result = await fetchPincodeDetails(pincode);

    if (result.success) {
      setForm(prev => ({
        ...prev,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }));
      setPincodeStatus({ type: 'success', message: `Location found: ${result.city}, ${result.state}` });
      lastFetchedPincode.current = pincode;

      setTimeout(() => {
        setPincodeStatus(prev => prev.type === 'success' ? { type: '', message: '' } : prev);
      }, 3000);
    } else {
      setPincodeStatus({ type: 'error', message: result.message || 'Could not fetch location. Please enter manually.' });
      lastFetchedPincode.current = '';
    }

    setIsLookingUp(false);
  };

  const handleCityStateChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    // Reset fetched pincode when user manually edits city/state
    if (lastFetchedPincode.current) {
      lastFetchedPincode.current = '';
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setFormError('');
    setPincodeStatus({ type: '', message: '' });
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm({
      label: addr.label, fullName: addr.fullName, phone: addr.phone,
      line1: addr.line1, line2: addr.line2 || '', city: addr.city,
      state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault,
    });
    setEditId(addr._id);
    setFormError('');
    setPincodeStatus({ type: '', message: '' });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const req = ['fullName', 'phone', 'line1', 'city', 'state', 'pincode'];
    for (const f of req) {
      if (!form[f].trim()) { setFormError(`${f} is required`); return; }
    }
    try {
      setSaving(true);
      setFormError('');
      let res;
      if (editId) res = await addressAPI.update(editId, form);
      else res = await addressAPI.create(form);
      if (res.data.success) {
        await onRefresh();
        setShowForm(false);
        if (!editId) setSelected(res.data.address._id);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save address');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this address?')) return;
    try {
      setDeleting(id);
      await addressAPI.delete(id);
      await onRefresh();
      if (selected === id) setSelected(null);
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  return (
    <div className="step-body">
      <h2 className="step-heading">Select Delivery Address</h2>

      {addresses.length === 0 && !showForm && (
        <div className="bn-empty-msg">No saved addresses. Add one below.</div>
      )}

      <div className="address-list">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            className={`selection-card ${selected === addr._id ? 'selected' : ''}`}
            onClick={() => setSelected(addr._id)}
          >
            <div className={`radio-circle ${selected === addr._id ? 'filled' : ''}`}></div>
            <div className="address-info">
              <h3>
                {addr.fullName}
                <div className="address-labels-c">
                  <span className="tag">{addr.label}</span>
                  {addr.isDefault && <span className="tag tag-default">Default</span>}
                </div>
              </h3>
              <p>{addr.phone}</p>
              <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}</p>
            </div>
            <div className="card-actions">
              <button type="button" className="card-action-btn" onClick={(e) => { e.stopPropagation(); openEdit(addr); }} title="Edit">✏️</button>
              <button type="button" className="card-action-btn" onClick={(e) => handleDelete(addr._id, e)} disabled={deleting === addr._id} title="Delete">
                {deleting === addr._id ? '…' : '✕'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!showForm && (
        <button type="button" className="add-new-btn-row" onClick={openAdd}>
          <span className="add-new-circle">+</span>
          <span>Add New Address</span>
        </button>
      )}

      {showForm && (
        <div className="address-form-box">
          <h3>{editId ? 'Edit Address' : 'New Address'}</h3>
          {formError && <div className="bn-error">{formError}</div>}
          <form onSubmit={handleSave} className="bn-form">
            <div className="addr-label-row">
              {['Home', 'Office', 'Other'].map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`addr-label-btn ${form.label === l ? 'active' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, label: l }))}
                >
                  <i className={`fas fa-${l === 'Home' ? 'home' : l === 'Office' ? 'briefcase' : 'map-marker-alt'}`}></i>
                  {l}
                </button>
              ))}
            </div>

            <div className="bn-form-row">
              <div className="bn-field">
                <label>Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleInput} placeholder="Rahul Sharma" required />
              </div>
              <div className="bn-field">
                <label>Phone Number *</label>
                <input name="phone" value={form.phone} onChange={handleInput} placeholder="9876543210" maxLength={10} required />
              </div>
            </div>

            <div className="bn-form-row">
              <div className="bn-field full">
                <label>House / Flat / Street *</label>
                <input name="line1" value={form.line1} onChange={handleInput} placeholder="208 Shiv Vihar, MG Road" required />
              </div>
            </div>

            <div className="bn-form-row">
              <div className="bn-field full">
                <label>Area / Landmark</label>
                <input name="line2" value={form.line2} onChange={handleInput} placeholder="Near City Mall (optional)" />
              </div>
            </div>

            {/* Pincode & City */}
            <div className="bn-form-row">
              <div className="bn-field">
                <label>Pincode *</label>
                <div className="pincode-wrapper">
                  <input
                    name="pincode"
                    value={form.pincode}
                    onChange={handleInput}
                    onBlur={handlePincodeBlur}
                    placeholder="302020"
                    maxLength={6}
                    required
                  />
                  {isLookingUp && (
                    <i className="fas fa-spinner fa-spin pincode-spinner"></i>
                  )}
                </div>
                {pincodeStatus.message && (
                  <div className={`pincode-status pincode-status-${pincodeStatus.type}`}>
                    <i className={`fas fa-${pincodeStatus.type === 'success' ? 'check-circle' : pincodeStatus.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
                    {pincodeStatus.message}
                  </div>
                )}
              </div>

              <div className="bn-field">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleCityStateChange} placeholder="Jaipur" required />
              </div>
            </div>

            <div className="bn-form-row">
              <div className="bn-field full">
                <label>State *</label>
                <input name="state" value={form.state} onChange={handleCityStateChange} placeholder="Rajasthan" required />
              </div>
            </div>

            <label className="bn-checkbox">
              <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleInput} />
              <span>Set as default address</span>
            </label>

            <div className="bn-form-actions">
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save" disabled={saving}>
                <i className="fas fa-save"></i>
                {saving ? 'Saving…' : (editId ? 'Update Address' : 'Save Address')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// ── Step 2: Shipping ───────────────────────────────────────────────────────────
const StepShipping = ({ selected, setSelected }) => {
  const methods = [
    { id: 'free', label: 'Free Delivery', desc: 'Standard delivery, 5–7 working days', price: 'Free', badge: '' },
  ];
  return (
    <div className="step-body">
      <h2 className="step-heading">Shipment Method</h2>
      {methods.map((m) => (
        <div
          key={m.id}
          className={`selection-card ship-method ${selected === m.id ? 'selected' : ''}`}
          onClick={() => setSelected(m.id)}
        >
          <div className={`radio-circle ${selected === m.id ? 'filled' : ''}`}></div>
          <div className="ship-details">
            <strong>{m.label}</strong>
            {m.badge && <span className="ship-badge">{m.badge}</span>}
            <span className="ship-desc">{m.desc}</span>
          </div>
          <div className="ship-price">{m.price}</div>
        </div>
      ))}
    </div>
  );
};

// ── Step 3: Payment + Summary ──────────────────────────────────────────────────
const StepPayment = ({ cartItems, address, shippingMethod, paymentMethod, setPaymentMethod, couponApplied, setCouponApplied }) => {
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);

  const getItemPrice = (item) => item.price ?? 0;
  const subtotal = cartItems.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const shippingCharge = shippingMethod === 'express' ? 50 : 0;
  const discount = couponApplied?.discount || 0;
  const total = subtotal + tax + shippingCharge - discount;

  useEffect(() => {
    let isMounted = true;
    const fetchCoupons = async () => {
      try {
        const res = await couponAPI.getAvailable(subtotal);
        if (res?.data?.success && isMounted) {
          setAvailableCoupons(res.data.coupons || []);
        }
      } catch (err) {
        if (isMounted) {
          setAvailableCoupons([
            {
              code: 'COCO10',
              label: '10% off (max ₹100)',
              description: '10% OFF on all orders above ₹299',
              minOrderValue: 299,
              eligible: subtotal >= 299,
              previewDiscount: subtotal >= 299 ? Math.round(subtotal * 0.1) : 0,
            },
            {
              code: 'HEALTHY50',
              label: '₹50 off',
              description: 'Flat ₹50 OFF on orders above ₹499',
              minOrderValue: 499,
              eligible: subtotal >= 499,
              previewDiscount: subtotal >= 499 ? 50 : 0,
            },
          ]);
        }
      }
    };
    fetchCoupons();
    return () => { isMounted = false; };
  }, [subtotal]);

  const executeApplyCoupon = async (codeToApply) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;

    // Check condition first!
    const targetCoupon = availableCoupons.find((c) => c.code.toUpperCase() === code);
    if (targetCoupon && subtotal < (targetCoupon.minOrderValue || 0)) {
      const needed = targetCoupon.minOrderValue - subtotal;
      setCouponError(`Minimum order of ₹${targetCoupon.minOrderValue} required for promo code "${code}". Add ₹${needed} more to unlock!`);
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await couponAPI.apply(code, subtotal);
      if (res.data.success) {
        const couponData = {
          code: res.data.coupon?.code || code,
          discount: res.data.discount || 0,
        };
        setCouponApplied(couponData);
        sessionStorage.setItem('appliedCoupon', JSON.stringify(couponData));
        setCouponInput('');
      } else {
        setCouponError(res.data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Coupon conditions not met or code is expired.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    await executeApplyCoupon(couponInput);
  };

  const payMethods = [
    { id: 'cod', icon: '₹', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
    { id: 'prepaid', icon: '💳', label: 'Online Payment', desc: 'Coming soon — UPI / Card' },
  ];

  return (
    <div className="step-body payment-grid">

      {/* Summary */}
      <div className="summary-panel">
        <h3 className="panel-title">Order Summary</h3>
        <div className="summary-items">
          {cartItems.map((item, i) => (
            <div className="summary-item" key={i}>
              <img
                src={item.image ? getUploadUrl(item.image, 'products') : '/cocofinaproduct.png'}
                alt={item.name}
                onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
              />
              <div className="summary-item-info">
                <span className="summary-item-name">{item.name}</span>
                <span className="summary-item-variant">{item.variantWeight} × {item.quantity}</span>
              </div>
              <strong>₹{(getItemPrice(item) * item.quantity).toLocaleString('en-IN')}</strong>
            </div>
          ))}
        </div>

        {/* ── Coupon Form & Active Offers ───────────────────────────────── */}
        <div className="coupon-section-summary my-4 pt-2 pb-1 border-t border-b border-neutral-100 dark:border-neutral-800">
          {couponApplied ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl my-2">
              <div className="flex items-center gap-2">
                <i className="fas fa-tag text-emerald-600 dark:text-emerald-400"></i>
                <span className="font-bold text-sm font-mono text-emerald-700 dark:text-emerald-300">{couponApplied.code}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400"> (Saved ₹{discount.toLocaleString('en-IN')})</span>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                onClick={() => {
                  setCouponApplied(null);
                  sessionStorage.removeItem('appliedCoupon');
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleApplyCoupon} className="flex gap-2 my-2">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. COCO10)"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-mono focus:outline-none focus:border-amber-600 dark:focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={applyingCoupon || !couponInput.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {applyingCoupon ? <i className="fas fa-spinner fa-spin"></i> : 'Apply'}
                </button>
              </form>

              {/* ── Active Offers & Coupons List ───────────────────────────── */}
              {availableCoupons.length > 0 && (
                <div className="available-coupons-section my-3">
                  <div className="available-coupons-title">
                    <span>🎟️</span> Active Store Offers
                  </div>
                  <div className="available-coupons-list">
                    {availableCoupons.map((c) => {
                      const isEligible = c.eligible !== undefined ? c.eligible : subtotal >= (c.minOrderValue || 0);
                      const shortFall = (c.minOrderValue || 0) - subtotal;

                      return (
                        <div
                          key={c.code}
                          className={`coupon-offer-card ${!isEligible ? 'ineligible' : ''}`}
                        >
                          <div className="coupon-left-info">
                            <div className="coupon-code-badge">
                              <span>🏷️</span> {c.code}
                              {c.label && <span className="text-xs font-normal">({c.label})</span>}
                            </div>
                            {c.description && <span className="coupon-offer-desc">{c.description}</span>}
                            <span className="coupon-req-text">
                              {isEligible
                                ? `Min order: ₹${c.minOrderValue || 0}`
                                : `Requires min order of ₹${c.minOrderValue || 0} (Add ₹${shortFall} more)`}
                            </span>
                          </div>

                          {isEligible ? (
                            <button
                              type="button"
                              onClick={() => executeApplyCoupon(c.code)}
                              className="btn-apply-coupon-badge"
                            >
                              Apply Code
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCouponError(`Min order ₹${c.minOrderValue} required for ${c.code}. Add ₹${shortFall} more to unlock!`)}
                              className="btn-apply-coupon-badge disabled-btn"
                            >
                              Min ₹{c.minOrderValue}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {couponError && (
            <p className="text-xs text-rose-500 mb-2 mt-2 flex items-center gap-1 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900">
              <i className="fas fa-circle-exclamation"></i> {couponError}
            </p>
          )}
        </div>

        {address && (
          <div className="summary-row">
            <span>Deliver to</span>
            <span className="summary-addr">{address.fullName}, {address.city}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-row">
          <span>GST (5%)</span><span>₹{tax.toLocaleString('en-IN')}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span><span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
        </div>
        {discount > 0 && (
          <div className="summary-row summary-discount text-emerald-600 dark:text-emerald-400 font-semibold">
            <span><i className="fas fa-tag"></i> Coupon ({couponApplied?.code})</span>
            <span>−₹{discount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="summary-row total-row">
          <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="payment-panel">
        <h3 className="panel-title">Payment Method</h3>
        {payMethods.map((pm) => (
          <div
            key={pm.id}
            className={`selection-card ${paymentMethod === pm.id ? 'selected' : ''} ${pm.id === 'prepaid' ? 'disabled-card' : ''}`}
            onClick={() => pm.id !== 'prepaid' && setPaymentMethod(pm.id)}
          >
            <div className={`radio-circle ${paymentMethod === pm.id ? 'filled' : ''}`}></div>
            <div className="pay-info">
              <span className="pay-icon">{pm.icon}</span>
              <div className="pay-info-text">
                <strong>{pm.label}</strong>
                <span className="pay-desc">{pm.desc}</span>
              </div>
            </div>
            {pm.id === 'prepaid' && <span className="soon-badge">Soon</span>}
          </div>
        ))}

        {paymentMethod === 'cod' && (
          <div className="cod-note">
            <span className="cod-icon">💡</span>
            <p>Pay ₹{(subtotal + tax + shippingCharge - discount).toLocaleString('en-IN')} in cash when your order is delivered. No online payment needed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main BuyNow Page ───────────────────────────────────────────────────────────
const BuyNowPage = () => {
  const router = useRouter();
  const { clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('free');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [stepError, setStepError] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);

  const steps = ['Address', 'Shipping', 'Payment'];
  const stepIcons = ['📍', '🚚', '💳'];

  // ── Auth check + data fetch ────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Checkout - Cocofina';
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchAddresses();
    fetchCart();
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await addressAPI.getAll();
      if (res.data.success) {
        setAddresses(res.data.addresses);
        // Auto-select default
        const def = res.data.addresses.find((a) => a.isDefault);
        if (def) setSelectedAddr(def._id);
        else if (res.data.addresses.length > 0) setSelectedAddr(res.data.addresses[0]._id);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchCart = async () => {
    try {
      setCartLoading(true);

      // 1. Check local cart first (from CartDrawer / CartContext)
      const localCartRaw = typeof window !== 'undefined' ? localStorage.getItem('cocofina_cart') : null;
      if (localCartRaw) {
        try {
          const localItems = JSON.parse(localCartRaw);
          if (Array.isArray(localItems) && localItems.length > 0) {
            const snapshots = localItems.map((item) => {
              const rawVal = String(item.productId || item._id || item.product || item.id || '');
              const hexMatch = rawVal.match(/[0-9a-fA-F]{24}/);
              const cleanId = hexMatch ? hexMatch[0] : rawVal;
              return {
                product: cleanId,
                name: item.name,
                variantWeight: item.weight || item.variantWeight || '',
                price: item.price ?? 0,
                quantity: item.quantity || 1,
                image: item.image || '',
              };
            });
            setCartItems(snapshots);

            const savedCoupon = sessionStorage.getItem('appliedCoupon');
            if (savedCoupon) {
              try {
                setCouponApplied(JSON.parse(savedCoupon));
              } catch (e) {
                sessionStorage.removeItem('appliedCoupon');
              }
            }

            setCartLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing local cart:', e);
        }
      }

      // 2. Fallback to backend cart API
      const res = await cartAPI.getCart();
      if (res?.data?.success) {
        const items = res.data.cart?.items || [];
        if (items.length > 0) {
          const snapshots = items.map((item) => {
            const variant = item.product?.variants?.find((v) => v.weight === item.variantWeight);
            return {
              product: item.product?._id,
              name: item.product?.name,
              variantWeight: item.variantWeight,
              price: variant?.price ?? item.price ?? 0,
              quantity: item.quantity,
              image: item.product?.images?.[0] || item.product?.thumbnail || '',
            };
          });
          setCartItems(snapshots);

          const savedCoupon = sessionStorage.getItem('appliedCoupon');
          if (savedCoupon) {
            try {
              setCouponApplied(JSON.parse(savedCoupon));
            } catch (e) {
              sessionStorage.removeItem('appliedCoupon');
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setCartLoading(false);
    }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = async () => {
    setStepError('');

    if (currentStep === 0) {
      if (!selectedAddr) {
        setStepError('Please select or add a delivery address.');
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else {
      // Place order
      await placeOrder();
    }
  };

  const handleBack = () => {
    setStepError('');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/products');
    }
  };

  // ── Place order ────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    const address = addresses.find((a) => a._id === selectedAddr);
    if (!address) {
      setStepError('Please select a delivery address.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      setStepError('Your cart is empty. Please add products before checking out.');
      return;
    }

    try {
      setPlacing(true);
      setStepError('');

      const addressSnapshot = {
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        label: address.label,
      };

      const orderData = {
        addressSnapshot,
        shippingMethod,
        paymentMethod,
        items: cartItems,
        couponCode: couponApplied?.code || null,
        discount: couponApplied?.discount || 0,
      };

      const res = await orderAPI.createOrder(orderData);

      // Clear coupon & cart context after successful order
      sessionStorage.removeItem('appliedCoupon');
      clearCart();

      if (res.data.success) {
        router.push(`/order-success?orderId=${res.data.order._id}`);
      } else {
        throw new Error(res.data.message || 'Failed to place order');
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setStepError(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedAddress = addresses.find((a) => a._id === selectedAddr);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const shippingCharge = shippingMethod === 'express' ? 50 : 0;
  const discount = couponApplied?.discount || 0;
  const total = subtotal + tax + shippingCharge - discount;

  if (cartLoading) {
    return (
      <main>
        <div className="checkout-container bn-loading">
          <div className="bn-spinner"></div>
          <p>Loading checkout…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <header className="checkout-top-header border-b border-neutral-200 dark:border-neutral-800 py-4 px-6 sm:px-12 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/cocofina.png" alt="Cocofina Logo" className="h-10 w-auto dark:hidden" />
          <img src="/Cocofina-white.png" alt="Cocofina Logo" className="h-10 w-auto hidden dark:block" />
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/80 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-700">
          <i className="fa-solid fa-shield-halved text-amber-600 dark:text-amber-400 text-sm"></i>
          <span>256-Bit SSL Secure Checkout</span>
        </div>
      </header>
      <div className="checkout-container">

        {/* ── Stepper ──────────────────────────────────────────────────────── */}
        <div className="stepper">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`step ${currentStep === i ? 'active' : ''} ${currentStep > i ? 'done' : ''}`}>
                <div className="step-icon">
                  {currentStep > i ? '✓' : stepIcons[i]}
                </div>
                <div className="step-info">
                  <span>Step {i + 1}</span>
                  <strong>{label}</strong>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className={`step-connector ${currentStep > i ? 'done' : ''}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step content ─────────────────────────────────────────────────── */}
        <div className="step-content-wrapper">
          {currentStep === 0 && (
            <StepAddress
              selected={selectedAddr}
              setSelected={setSelectedAddr}
              addresses={addresses}
              setAddresses={setAddresses}
              onRefresh={fetchAddresses}
            />
          )}
          {currentStep === 1 && (
            <StepShipping selected={shippingMethod} setSelected={setShippingMethod} />
          )}
          {currentStep === 2 && (
            <StepPayment
              cartItems={cartItems}
              address={selectedAddress}
              shippingMethod={shippingMethod}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              couponApplied={couponApplied}
              setCouponApplied={setCouponApplied}
            />
          )}
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {stepError && (
          <div className="bn-step-error">
            <span>⚠️</span> {stepError}
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="checkout-footer">
          <button
            type="button"
            className="btn btn-back"
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
            onClick={handleBack}
            disabled={placing}
          >
            ← Back
          </button>

          <button
            type="button"
            className="btn btn-next"
            onClick={handleNext}
            disabled={placing}
          >
            {placing ? (
              <><span className="btn-spinner"></span> Placing…</>
            ) : currentStep === steps.length - 1 ? (
              paymentMethod === 'cod' ? '✓ Place Order (COD)' : 'Pay Now'
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default BuyNowPage;