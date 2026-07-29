'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import { Navbar } from '@/components/Navbar';
import { Eye, XCircle } from 'lucide-react';
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
    <span className={`status-badge-o`}
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtPrice = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

// ── Order Detail Modal ─────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onCancel }) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    await onCancel(order._id);
    setCancelling(false);
  };

  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <div className="mo-modal-overlay" onClick={onClose}>
      <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mo-modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{order.orderNumber}</h2>
            <small style={{ color: '#888' }}>{fmtDate(order.placedAt || order.createdAt)}</small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusBadge status={order.status} />
            <button className="mo-close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="mo-modal-body">
          {/* Items */}
          <h3 className="mo-section-title">Items Ordered</h3>
          <div className="mo-items">
            {order.items?.map((item, i) => (
              <div className="mo-item" key={i}>
                <div className="mo-item-img">
                  <img
                    src={item.image ? getUploadUrl(item.image, 'products') : '/cocofinaproduct.png'}
                    alt={item.name}
                    onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                  />
                </div>
                <div className="mo-item-info">
                  <span className="mo-item-name">{item.name}</span>
                  <span className="mo-item-variant">{item.variantWeight} × {item.quantity}</span>
                </div>
                <span className="mo-item-price">{fmtPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Delivery address */}
          <h3 className="mo-section-title">Delivery Address</h3>
          <div className="mo-address-box">
            <strong>{order.shippingAddress?.fullName}</strong>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</p>
          </div>

          {/* Pricing */}
          <h3 className="mo-section-title">Payment Summary</h3>
          <div className="mo-pricing">
            <div className="mo-pricing-row"><span>Subtotal</span><span>{fmtPrice(order.subtotal)}</span></div>
            <div className="mo-pricing-row"><span>GST (5%)</span><span>{fmtPrice(order.tax)}</span></div>
            <div className="mo-pricing-row"><span>Shipping</span><span>{order.shippingCharge === 0 ? 'Free' : fmtPrice(order.shippingCharge)}</span></div>
            {order.discount > 0 && (
              <div className="mo-pricing-row mo-discount">
                <span><i className="fas fa-tag"></i> Coupon {order.coupon?.code ? `(${order.coupon.code})` : ''}</span>
                <span>−{fmtPrice(order.discount)}</span>
              </div>
            )}
            <div className="mo-pricing-row mo-total"><strong>Total</strong><strong>{fmtPrice(order.total)}</strong></div>
          </div>

          <div className="mo-payment-method">
            <span>{order.paymentMethod === 'cod' ? '₹ Cash on Delivery' : '💳 Online Payment'}</span>
            <span className="mo-payment-status" style={{
              color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
            }}>
              {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
            </span>
          </div>
        </div>

        {canCancel && (
          <div className="mo-modal-footer">
            <button className="mo-cancel-btn" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <><i className="fas fa-spinner fa-spin"></i> Cancelling…</> : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>
    </div>
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
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleCancel = async (orderId) => {
    try {
      const res = await orderAPI.cancelOrder(orderId);
      if (res.data.success) {
        // Update in list
        setOrders((prev) => prev.map((o) =>
          o._id === orderId ? { ...o, status: 'cancelled', cancelledAt: new Date() } : o
        ));
        // Update detail modal
        setSelectedOrder((prev) => prev ? { ...prev, status: 'cancelled' } : null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handlePageChange = (p) => { 
    setCurrentPage(p); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // Pagination with ellipsis
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
              <i className="fas fa-shopping-bag"></i>
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
                      <button className="mo-cancel-inline-btn" onClick={() => handleCancel(order._id)}>
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
                  <div className="mo-coupon-badge">
                    <i className="fas fa-tag"></i> {order.coupon.code} — saved {fmtPrice(order.discount)}
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

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={handleCancel}
        />
      )}
        </div>
      </div>
    </main>
  );
};

export default MyOrders;