'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/services/api';
import '@/styles/orderdetails.css';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
const fmtPrice = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  placed:     { label: 'Placed',     color: '#f59e0b', bg: '#fef3c7', icon: 'fa-clock' },
  confirmed:  { label: 'Confirmed',  color: '#3b82f6', bg: '#eff6ff', icon: 'fa-check' },
  processing: { label: 'Processing', color: '#8b5cf6', bg: '#f5f3ff', icon: 'fa-cog' },
  shipped:    { label: 'Shipped',    color: '#f97316', bg: '#fff7ed', icon: 'fa-truck' },
  delivered:  { label: 'Delivered',  color: '#10b981', bg: '#ecfdf5', icon: 'fa-check-circle' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: '#fef2f2', icon: 'fa-times-circle' },
};

const TIMELINE_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || { label: status, color: '#6b7280', bg: '#f9fafb' };
  return (
    <span className="od-status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
      <i className={`fas ${s.icon}`}></i> {s.label}
    </span>
  );
};

// ── Progress Timeline ──────────────────────────────────────────────────────────
const OrderTimeline = ({ order }) => {
  if (order.status === 'cancelled') {
    return (
      <div className="od-timeline od-timeline--cancelled">
        <div className="od-timeline-cancelled">
          <i className="fas fa-times-circle"></i>
          <div>
            <strong>Order Cancelled</strong>
            {order.cancelledAt && <span>{fmtDate(order.cancelledAt)}</span>}
          </div>
        </div>
      </div>
    );
  }

  const currentIdx = TIMELINE_STEPS.indexOf(order.status);
  const timestamps = {
    placed:     order.placedAt || order.createdAt,
    confirmed:  order.confirmedAt,
    processing: order.confirmedAt, // use confirmedAt as proxy if no processingAt
    shipped:    order.shippedAt,
    delivered:  order.deliveredAt,
  };

  return (
    <div className="od-timeline">
      {TIMELINE_STEPS.map((step, i) => {
        const done    = i <= currentIdx;
        const current = i === currentIdx;
        const s       = STATUS[step];
        return (
          <React.Fragment key={step}>
            <div className={`od-step ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
              <div className="od-step-circle" style={done ? { background: s.color, borderColor: s.color } : {}}>
                {done
                  ? <i className={`fas ${current ? s.icon : 'fa-check'}`}></i>
                  : <span className="od-step-num">{i + 1}</span>
                }
              </div>
              <div className="od-step-info">
                <span className="od-step-label" style={current ? { color: s.color, fontWeight: 700 } : {}}>
                  {s.label}
                </span>
                {done && timestamps[step] && (
                  <span className="od-step-date">{fmtDateShort(timestamps[step])}</span>
                )}
              </div>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`od-connector ${i < currentIdx ? 'done' : ''}`}
                style={i < currentIdx ? { background: STATUS[TIMELINE_STEPS[i + 1]].color } : {}} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Loading Skeleton ──────────────────────────────────────────────────────────
const OrderDetailSkeleton = () => (
  <div className="od-page">
    <div className="od-header-row">
      <div className="od-skel" style={{ width: 180, height: 28 }}></div>
      <div className="od-skel" style={{ width: 100, height: 36, borderRadius: 8 }}></div>
    </div>
    <div className="od-grid">
      <div className="od-col-main">
        {[1, 2].map(i => (
          <div className="od-card" key={i}>
            <div className="od-skel" style={{ width: '40%', height: 16, marginBottom: 16 }}></div>
            {[1, 2].map(j => (
              <div key={j} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div className="od-skel" style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div className="od-skel" style={{ width: '70%', height: 13, marginBottom: 8 }}></div>
                  <div className="od-skel" style={{ width: '40%', height: 11 }}></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="od-col-side">
        <div className="od-card">
          <div className="od-skel" style={{ width: '50%', height: 16, marginBottom: 16 }}></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="od-skel" style={{ width: '40%', height: 13 }}></div>
              <div className="od-skel" style={{ width: '25%', height: 13 }}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const OrderDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');

  useEffect(() => {
    document.title = 'Order Details - Cocofina';
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderAPI.getOrderById(id);
      if (res.data.success) setOrder(res.data.order);
      else setError(res.data.message || 'Order not found');
    } catch (err) {
      if (err.response?.status === 401) router.push('/login');
      else if (err.response?.status === 404) setError('Order not found');
      else setError('Failed to load order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setCancelMsg('');
    try {
      const res = await orderAPI.cancelOrder(id);
      if (res.data.success) {
        setOrder(res.data.order);
        setCancelMsg('Order cancelled successfully.');
      }
    } catch (err) {
      setCancelMsg(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <main>
      <div className="od-container"><OrderDetailSkeleton /></div>
    </main>
  );

  if (error) return (
    <main>
      <div className="od-container">
        <div className="od-error-state">
          <i className="fas fa-exclamation-circle"></i>
          <h2>{error}</h2>
          <button onClick={() => router.push('/my-orders')} className="od-btn-primary">← My Orders</button>
        </div>
      </div>
    </main>
  );

  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const s = STATUS[order.status] || STATUS.placed;

  return (
    <main>
      <div className="od-container">
        <div className="od-page">

          {/* ── Breadcrumb + header ──────────────────────────────────────── */}
          <div className="od-breadcrumb">
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/my-orders">My Orders</Link>
            <span>›</span>
            <span>{order.orderNumber}</span>
          </div>

          <div className="od-header-row">
            <div>
              <h1 className="od-title">{order.orderNumber}</h1>
              <p className="od-subtitle">Placed on {fmtDate(order.placedAt || order.createdAt)}</p>
            </div>
            <div className="od-header-actions">
              <StatusBadge status={order.status} />
              {canCancel && (
                <button className="od-btn-cancel" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? <><i className="fas fa-spinner fa-spin"></i> Cancelling…</> : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>

          {cancelMsg && (
            <div className={`od-alert ${order.status === 'cancelled' ? 'od-alert--success' : 'od-alert--error'}`}>
              <i className={`fas fa-${order.status === 'cancelled' ? 'check-circle' : 'exclamation-circle'}`}></i>
              {cancelMsg}
            </div>
          )}

          {/* ── Progress timeline ────────────────────────────────────────── */}
          <div className="od-card od-timeline-card">
            <h2 className="od-card-title">Order Progress</h2>
            <OrderTimeline order={order} />
          </div>

          {/* ── Main 2-col layout ────────────────────────────────────────── */}
          <div className="od-grid">

            {/* Left col */}
            <div className="od-col-main">

              {/* Items */}
              <div className="od-card">
                <h2 className="od-card-title">
                  Items Ordered
                  <span className="od-card-title-count">({order.items?.length} item{order.items?.length !== 1 ? 's' : ''})</span>
                </h2>
                <div className="od-items">
                  {order.items?.map((item, i) => (
                    <div className="od-item" key={i}>
                      <div className="od-item-img">
                        <img
                          src={item.image ? `/uploads/products/${item.image}` : '/cocofinaproduct.png'}
                          alt={item.name}
                          onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                        />
                      </div>
                      <div className="od-item-info">
                        <span className="od-item-name">{item.name}</span>
                        <span className="od-item-meta">
                          <span className="od-variant-tag">{item.variantWeight}</span>
                          Qty: {item.quantity}
                        </span>
                        <span className="od-item-unit">₹{item.price} each</span>
                      </div>
                      <div className="od-item-price">{fmtPrice(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery address */}
              <div className="od-card">
                <h2 className="od-card-title">Delivery Address</h2>
                <div className="od-address">
                  <div className="od-address-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="od-address-info">
                    <strong>{order.shippingAddress?.fullName}</strong>
                    {order.shippingAddress?.label && (
                      <span className="od-address-tag">{order.shippingAddress.label}</span>
                    )}
                    <p>{order.shippingAddress?.phone}</p>
                    <p>
                      {order.shippingAddress?.line1}
                      {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}
                    </p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="od-card">
                <h2 className="od-card-title">Payment Information</h2>
                <div className="od-payment-info">
                  <div className="od-payment-method">
                    <span className="od-payment-icon">
                      {order.paymentMethod === 'cod' ? '💵' : '💳'}
                    </span>
                    <div>
                      <span className="od-payment-label">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </span>
                      <span className="od-payment-status"
                        style={{ color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                        {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="od-shipping-method">
                    <span><i className="fas fa-truck"></i> {order.shippingMethod === 'express' ? 'Express Delivery' : 'Standard Delivery'}</span>
                    <span>{order.shippingCharge === 0 ? 'Free' : fmtPrice(order.shippingCharge)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right sidebar */}
            <div className="od-col-side">
              <div className="od-card od-sticky-card">
                <h2 className="od-card-title">Order Summary</h2>
                <div className="od-summary">
                  <div className="od-summary-row">
                    <span>Subtotal ({order.items?.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>{fmtPrice(order.subtotal)}</span>
                  </div>
                  <div className="od-summary-row">
                    <span>GST (5%)</span>
                    <span>{fmtPrice(order.tax)}</span>
                  </div>
                  <div className="od-summary-row">
                    <span>Shipping</span>
                    <span>{order.shippingCharge === 0 ? 'Free' : fmtPrice(order.shippingCharge)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="od-summary-row od-summary-discount">
                      <span>
                        <i className="fas fa-tag"></i>
                        {order.coupon?.code ? ` ${order.coupon.code}` : ' Coupon'}
                      </span>
                      <span>−{fmtPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className="od-summary-divider"></div>
                  <div className="od-summary-row od-summary-total">
                    <strong>Total Paid</strong>
                    <strong style={{ color: s.color }}>{fmtPrice(order.total)}</strong>
                  </div>
                </div>

                {/* Coupon detail */}
                {order.coupon?.code && (
                  <div className="od-coupon-applied">
                    <i className="fas fa-tag"></i>
                    <div>
                      <span className="od-coupon-code">{order.coupon.code}</span>
                      <span className="od-coupon-saving">Saved {fmtPrice(order.discount)}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {order.notes && (
                  <div className="od-notes">
                    <i className="fas fa-sticky-note"></i>
                    <p>{order.notes}</p>
                  </div>
                )}
              </div>

              <div className="od-card">
                <h2 className="od-card-title">Need Help?</h2>
                <div className="od-help-links">
                  <Link href="/contact-us" className="od-help-link">
                    <i className="fas fa-headset"></i> Contact Support
                  </Link>
                  <Link href="/my-orders" className="od-help-link">
                    <i className="fas fa-list"></i> All Orders
                  </Link>
                  <Link href="/our-products" className="od-help-link">
                    <i className="fas fa-shopping-bag"></i> Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetail;