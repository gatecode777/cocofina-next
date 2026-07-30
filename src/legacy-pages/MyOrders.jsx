'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import { Navbar } from '@/components/Navbar';
import { Eye, XCircle, ShoppingBag, ArrowLeft, Package, MapPin, CreditCard, ShieldCheck, X } from 'lucide-react';
import '@/styles/myorders.css';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  placed:     { label: 'Placed',     color: '#f59e0b', bg: '#fef3c7' },
  confirmed:  { label: 'Confirmed',  color: '#3b82f6', bg: '#eff6ff' },
  processing: { label: 'Processing', color: '#8b5cf6', bg: '#f5f3ff' },
  shipped:    { label: 'Shipped',    color: '#f97316', bg: '#fff7ed' },
  delivered:  { label: 'Delivered',  color: '#10b981', bg: '#ecfdf5' },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', bg: '#fef2f2' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS[status] || { label: status, color: '#6b7280', bg: '#f9fafb' };
  return (
    <span className="status-badge-o" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtPrice = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

// ── Preset cancellation reasons ────────────────────────────────────────────────
const PRESET_REASONS = [
  'Ordered by mistake / Duplicate order',
  'Found a better price elsewhere',
  'Delivery is taking too long / Changed my mind',
  'Incorrect delivery address or contact number',
  'Other / Custom reason',
];

// ── Cancel Reason Modal ────────────────────────────────────────────────────────
const CancelReasonModal = ({ order, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other / Custom reason'
      ? (customNote.trim() || 'Other reason')
      : selectedReason;

    if (!finalReason) return;

    setSubmitting(true);
    await onConfirm(order._id, finalReason);
    setSubmitting(false);
  };

  return (
    <div className="mo-modal-overlay" onClick={onClose}>
      <div className="mo-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="mo-modal-header">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Cancel Order #{order.orderNumber}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Please tell us why you want to cancel this order:
            </p>
          </div>
          <button className="mo-close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          <div className="space-y-2">
            {PRESET_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all text-xs sm:text-sm font-medium ${
                  selectedReason === reason
                    ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 font-semibold shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-amber-500/50'
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="accent-amber-600"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other / Custom reason' && (
            <textarea
              rows={3}
              placeholder="Please provide details (optional)..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full text-xs font-semibold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={!selectedReason || submitting}
              className="flex-1 py-3 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Order Detail Modal ─────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onRequestCancel }) => {
  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const activeItem = order.items?.[activeItemIndex] || order.items?.[0];

  if (!mounted) return null;

  return createPortal(
    <div className="mo-modal-overlay" onClick={onClose}>
      <div className="mo-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Floating Close Button */}
        <button className="mo-floating-close-btn" onClick={onClose} aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        <div className="mo-modal-grid">
          {/* Left Column: Product Showcase / Image Gallery */}
          <div className="mo-modal-left-col">
            <div className="mo-image-preview-box">
              <img
                src={activeItem?.image ? getUploadUrl(activeItem.image, 'products') : '/cocofinaproduct.png'}
                alt={activeItem?.name || 'Product'}
                onError={(e) => { e.currentTarget.src = '/cocofinaproduct.png'; }}
                className="mo-main-preview-img"
              />
            </div>

            {/* Thumbnail selector if multiple items */}
            {order.items?.length > 1 && (
              <div className="mo-thumb-list">
                {order.items.map((item, idx) => (
                  <button
                    key={idx}
                    className={`mo-thumb-btn ${activeItemIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveItemIndex(idx)}
                  >
                    <img
                      src={item.image ? getUploadUrl(item.image, 'products') : '/cocofinaproduct.png'}
                      alt={item.name}
                      onError={(e) => { e.currentTarget.src = '/cocofinaproduct.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Ordered Items summary list */}
            <div className="mo-items-summary">
              <span className="mo-col-label">Ordered Items ({order.items?.length || 0})</span>
              <div className="mo-items-mini-list">
                {order.items?.map((item, i) => (
                  <div className={`mo-mini-item ${activeItemIndex === i ? 'selected' : ''}`} key={i} onClick={() => setActiveItemIndex(i)}>
                    <div className="min-w-0 flex-1">
                      <p className="mo-mini-item-name">{item.name}</p>
                      <p className="mo-mini-item-sub">{item.variantWeight} × {item.quantity}</p>
                    </div>
                    <span className="mo-mini-item-price">{fmtPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Details & Information */}
          <div className="mo-modal-right-col">
            <div className="mo-header-tag-row">
              <span className="mo-tag-category">ORDER #{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>

            <h2 className="mo-detail-title">
              {activeItem?.name || `Order Summary`}
            </h2>

            <p className="mo-date-subtitle">
              Placed on {fmtDate(order.placedAt || order.createdAt)}
            </p>

            <div className="mo-price-display">
              {fmtPrice(order.total)}
              <span className="mo-price-label">Total Amount</span>
            </div>

            {/* Delivery Address Box */}
            <div className="mo-detail-section">
              <span className="mo-col-label">Delivery Address</span>
              <div className="mo-address-card">
                <p className="mo-addr-name">{order.shippingAddress?.fullName}</p>
                <p className="mo-addr-line">📞 {order.shippingAddress?.phone}</p>
                <p className="mo-addr-line">📍 {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
                <p className="mo-addr-sub">{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
              </div>
            </div>

            {/* Cancellation Reason if cancelled */}
            {order.status === 'cancelled' && (
              <div className="mo-cancel-reason-box">
                <span className="mo-cancel-reason-title">⚠️ Reason for Cancellation:</span>
                <p>{order.cancelReason || 'Cancelled by customer'}</p>
              </div>
            )}

            {/* Payment Summary Box */}
            <div className="mo-detail-section">
              <span className="mo-col-label">Payment Summary</span>
              <div className="mo-summary-card">
                <div className="mo-summary-row">
                  <span>Subtotal</span><span>{fmtPrice(order.subtotal)}</span>
                </div>
                <div className="mo-summary-row">
                  <span>GST (5%)</span><span>{fmtPrice(order.tax)}</span>
                </div>
                <div className="mo-summary-row">
                  <span>Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : fmtPrice(order.shippingCharge)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="mo-summary-row mo-discount-row">
                    <span>Coupon ({order.coupon?.code || 'Applied'})</span>
                    <span>−{fmtPrice(order.discount)}</span>
                  </div>
                )}
                <div className="mo-summary-divider" />
                <div className="mo-summary-row mo-total-row">
                  <span>Total Paid</span>
                  <span className="mo-total-price">{fmtPrice(order.total)}</span>
                </div>
                <div className="mo-summary-meta">
                  <span>Payment Method: <strong>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}</strong></span>
                  <span className={`mo-payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Action button */}
            {canCancel && (
              <div className="mo-action-footer">
                <button
                  className="mo-cancel-btn-lg"
                  onClick={() => {
                    onClose();
                    onRequestCancel(order);
                  }}
                >
                  <XCircle className="w-4 h-4" /> Cancel Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// ── Skeleton ───────────────────────────────────────────────────────────────────
const OrderSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <div className="order-card mo-skel-card" key={i}>
        <div className="mo-skel mo-skel-line" style={{ width: '40%', height: '16px', marginBottom: '12px' }}></div>
        <div className="mo-skel mo-skel-line" style={{ width: '60%', height: '13px', marginBottom: '8px' }}></div>
        <div className="mo-skel mo-skel-line" style={{ width: '30%', height: '13px' }}></div>
      </div>
    ))}
  </>
);

// ── Main Component ─────────────────────────────────────────────────────────────
const MyOrders = () => {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);

  const LIMIT = 5;

  useEffect(() => {
    document.title = 'My Orders - Cocofina';
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page: currentPage, limit: LIMIT };
      if (filterStatus !== 'all') params.status = filterStatus;
      const res = await orderAPI.getMyOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
        setTotalOrders(res.data.totalOrders || 0);
      }
    } catch (err) {
      if (err.response?.status === 401) router.push('/login');
      else setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => { 
    fetchOrders(); 
  }, [fetchOrders]);

  const handleConfirmCancel = async (orderId, reason) => {
    try {
      const res = await orderAPI.cancelOrder(orderId, { reason });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) =>
          o._id === orderId ? { ...o, status: 'cancelled', cancelledAt: new Date(), cancelReason: reason } : o
        ));
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, status: 'cancelled', cancelReason: reason }));
        }
        setCancelModalOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handlePageChange = (p) => { 
    setCurrentPage(p); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const buildPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <Navbar />
      <div className="my-orders-wrapper">
        <div className="mo-container">
          <div className="mo-header">
            <div>
              <h1>My Orders</h1>
              <p>View, track and manage your orders. {totalOrders > 0 && `(${totalOrders} total)`}</p>
            </div>
            <button
              className="btn-back"
              onClick={() => router.push('/my-profile')}
            >
              ← Back to Profile
            </button>
          </div>

          <div className="middle-content">
            <div className="container">

              {/* Filter tabs */}
              <div className="mo-filter-tabs">
                {['all', 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <button
                    key={s}
                    className={`mo-filter-tab ${filterStatus === s ? 'active' : ''}`}
                    onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                  >
                    {s === 'all' ? 'All' : STATUS[s]?.label || s}
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px' }}>
                  {error} <button onClick={fetchOrders} style={{ marginLeft: '8px', color: '#dc2626', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button>
                </div>
              )}

              {loading ? (
                <OrderSkeleton />
              ) : orders.length === 0 ? (
                <div className="mo-empty">
                  <Package className="w-12 h-12 stroke-[1.2] text-neutral-400 mx-auto mb-2" />
                  <h3>No orders found</h3>
                  <p>{filterStatus === 'all' ? "You haven't placed any orders yet." : `No ${filterStatus} orders.`}</p>
                  <Link href="/products" className="mo-shop-btn">Start Shopping</Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div className="order-card" key={order._id}>
                    <div className="card-row">
                      <div>
                        <span className="label">Order ID: </span>
                        <span className="val id-val">{order.orderNumber}</span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="card-row">
                      <div>
                        <span className="label">Date: </span>
                        <span className="val">{fmtDate(order.placedAt || order.createdAt)}</span>
                      </div>
                      <div>
                        <span className="label">Total: </span>
                        <span className="val"><strong>{fmtPrice(order.total)}</strong></span>
                      </div>
                    </div>

                    <div className="card-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        {order.items?.slice(0, 2).map((item, i) => (
                          <span key={i} style={{ display: 'block', fontSize: '14px', color: '#444' }}>
                            <span className="prod-title">{item.name}</span>
                            <span className="label"> · {item.variantWeight} × {item.quantity}</span>
                          </span>
                        ))}
                        {order.items?.length > 2 && (
                          <span style={{ fontSize: '12px', color: '#888' }}>+{order.items.length - 2} more items</span>
                        )}
                      </div>

                      <div className="order-card-actions">
                        {['placed', 'confirmed'].includes(order.status) && (
                          <button className="mo-cancel-inline-btn" onClick={() => setCancelModalOrder(order)}>
                            <XCircle style={{ width: '14px', height: '14px' }} />
                            <span>Cancel Order</span>
                          </button>
                        )}
                        <button className="btn-view-o" onClick={() => setSelectedOrder(order)}>
                          <Eye style={{ width: '14px', height: '14px' }} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Coupon badge */}
                    {order.coupon?.code && (
                      <div className="mo-coupon-badge mt-2 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                        🏷️ {order.coupon.code} — saved {fmtPrice(order.discount)}
                      </div>
                    )}

                    {/* Reason if cancelled */}
                    {order.status === 'cancelled' && order.cancelReason && (
                      <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 font-medium">
                        ⚠️ Reason: {order.cancelReason}
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div className="pagination">
                  <button
                    className={`pg-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >‹</button>

                  {buildPages().map((p, i) =>
                    p === '...' ? (
                      <span key={`d${i}`} style={{ color: '#888', padding: '0 5px' }}>…</span>
                    ) : (
                      <button
                        key={p}
                        className={`pg-item ${currentPage === p ? 'active' : ''}`}
                        onClick={() => handlePageChange(p)}
                      >{p}</button>
                    )
                  )}

                  <button
                    className={`pg-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >›</button>
                </div>
              )}
            </div>
          </div>

          <div className="footer-section">
            <div className="container">
              <div className="trust-flex">
                {['Secure Payments', 'Verified Products', 'Warranty Available'].map((t) => (
                  <div className="trust-item" key={t}><div className="check-icon">✓</div>{t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* View Order Detail Modal */}
          {selectedOrder && (
            <OrderDetailModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onRequestCancel={(orderToCancel) => setCancelModalOrder(orderToCancel)}
            />
          )}

          {/* Cancel Reason Modal */}
          {cancelModalOrder && (
            <CancelReasonModal
              order={cancelModalOrder}
              onClose={() => setCancelModalOrder(null)}
              onConfirm={handleConfirmCancel}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default MyOrders;