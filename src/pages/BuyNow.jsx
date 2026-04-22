'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cartAPI, addressAPI, orderAPI } from '@/services/api';
import { triggerCartUpdate } from '@/context/CartContext';
import '@/styles/buynow.css';

const getImageSrc = (item) => {
  const img = item.image || item.product?.images?.[0] || item.product?.thumbnail;
  if (img) return `/uploads/products/${img}`;
  return '/cocofinaproduct.png';
};

// ── Empty address form state ───────────────────────────────────────────────────
const emptyForm = {
  label: 'Home', fullName: '', phone: '',
  line1: '', line2: '', city: '', state: '', pincode: '',
  isDefault: false,
};

// ── Step 1: Address ────────────────────────────────────────────────────────────
const StepAddress = ({ selected, setSelected, addresses, setAddresses, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit = (addr) => {
    setForm({
      label: addr.label, fullName: addr.fullName, phone: addr.phone,
      line1: addr.line1, line2: addr.line2 || '', city: addr.city,
      state: addr.state, pincode: addr.pincode, isDefault: addr.isDefault,
    });
    setEditId(addr._id);
    setFormError('');
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
                <span className="tag">{addr.label}</span>
                {addr.isDefault && <span className="tag tag-default">Default</span>}
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
          <form onSubmit={handleSave}>
            <div className="bn-form-row">
              <div className="bn-field">
                <label>Label</label>
                <select name="label" value={form.label} onChange={handleInput}>
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="bn-form-row">
              <div className="bn-field">
                <label>Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleInput} placeholder="Rahul Sharma" />
              </div>
              <div className="bn-field">
                <label>Phone *</label>
                <input name="phone" value={form.phone} onChange={handleInput} placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div className="bn-form-row">
              <div className="bn-field full">
                <label>House / Flat / Street *</label>
                <input name="line1" value={form.line1} onChange={handleInput} placeholder="208 Shiv Vihar, MG Road" />
              </div>
            </div>
            <div className="bn-form-row">
              <div className="bn-field full">
                <label>Area / Landmark</label>
                <input name="line2" value={form.line2} onChange={handleInput} placeholder="Near City Mall (optional)" />
              </div>
            </div>
            <div className="bn-form-row">
              <div className="bn-field">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleInput} placeholder="Jaipur" />
              </div>
              <div className="bn-field">
                <label>State *</label>
                <input name="state" value={form.state} onChange={handleInput} placeholder="Rajasthan" />
              </div>
              <div className="bn-field">
                <label>Pincode *</label>
                <input name="pincode" value={form.pincode} onChange={handleInput} placeholder="302020" maxLength={6} />
              </div>
            </div>
            <label className="bn-checkbox">
              <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleInput} />
              Set as default address
            </label>
            <div className="bn-form-actions">
              <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save" disabled={saving}>
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
    // { id: 'express', label: 'Express — ₹50', desc: 'Get your order as fast as possible', price: '₹50', badge: 'Fast' },
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
const StepPayment = ({ cartItems, address, shippingMethod, paymentMethod, setPaymentMethod, couponApplied }) => {
  const getItemPrice = (item) => item.price ?? 0;
  const subtotal = cartItems.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const shippingCharge = shippingMethod === 'express' ? 50 : 0;
  const discount = couponApplied?.discount || 0;
  const total = subtotal + tax + shippingCharge - discount;

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
                src={item.image ? `/uploads/products/${item.image}` : '/cocofinaproduct.png'}
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
        <div className="summary-divider"></div>
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
          <div className="summary-row summary-discount">
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
              <div>
                <strong>{pm.label}</strong>
                <span className="pay-desc">{pm.desc}</span>
              </div>
            </div>
            {pm.id === 'prepaid' && <span className="soon-badge">Soon</span>}
          </div>
        ))}

        {paymentMethod === 'cod' && (
          <div className="cod-note">
            <span>💡</span>
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
      const res = await cartAPI.getCart();
      if (res.data.success) {
        const items = res.data.cart?.items || [];
        if (items.length === 0) { 
          router.push('/cart'); 
          return; 
        }

        // Build snapshot with price from variant
        const snapshots = items.map((item) => {
          const variant = item.product?.variants?.find((v) => v.weight === item.variantWeight);
          return {
            product: item.product?._id,
            name: item.product?.name,
            variantWeight: item.variantWeight,
            price: variant?.price ?? 0,
            quantity: item.quantity,
            image: item.product?.images?.[0] || item.product?.thumbnail || '',
          };
        });
        setCartItems(snapshots);
        
        // Retrieve coupon from sessionStorage
        const savedCoupon = sessionStorage.getItem('appliedCoupon');
        if (savedCoupon) {
          try {
            const parsed = JSON.parse(savedCoupon);
            setCouponApplied(parsed);
          } catch (e) {
            console.error('Error parsing coupon:', e);
            sessionStorage.removeItem('appliedCoupon');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      router.push('/cart');
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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // ── Place order ────────────────────────────────────────────────────────────
  const placeOrder = async () => {
    const address = addresses.find((a) => a._id === selectedAddr);
    if (!address) { 
      setStepError('Please select a delivery address.'); 
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
      
      // Clear coupon from sessionStorage after successful order
      sessionStorage.removeItem('appliedCoupon');
      triggerCartUpdate();

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
    <main>
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