'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { orderAPI, userAPI, adminProductAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminDashboard.css';

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    console.log('Admin data from localStorage:', data);
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: false, create: false, edit: false, delete: false };
  } catch { return {}; }
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatPrice = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
}) : '—';
const formatDateTime = (d) => d ? new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
}) : '—';

const STATUS_CONFIG = {
  placed: { color: '#f59e0b', bg: '#fef3c7', label: 'Placed' },
  confirmed: { color: '#3b82f6', bg: '#eff6ff', label: 'Confirmed' },
  processing: { color: '#8b5cf6', bg: '#f5f3ff', label: 'Processing' },
  shipped: { color: '#f97316', bg: '#fff7ed', label: 'Shipped' },
  delivered: { color: '#10b981', bg: '#ecfdf5', label: 'Delivered' },
  cancelled: { color: '#ef4444', bg: '#fef2f2', label: 'Cancelled' },
};
const PAYMENT_STATUS_CONFIG = {
  pending: { color: '#f59e0b', bg: '#fef3c7', label: 'Pending' },
  paid: { color: '#10b981', bg: '#ecfdf5', label: 'Paid' },
  failed: { color: '#ef4444', bg: '#fef2f2', label: 'Failed' },
  refunded: { color: '#6b7280', bg: '#f9fafb', label: 'Refunded' },
};

const StatusBadge = ({ status, config }) => {
  const c = config[status] || { color: '#6b7280', bg: '#f9fafb', label: status || '—' };
  return (
    <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: c.color, background: c.bg, display: 'inline-block' }}>
      {c.label}
    </span>
  );
};

// ── User Detail Modal ──────────────────────────────────────────────────────────
const UserDetailModal = ({ user, onClose }) => {
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="udm-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header banner with avatar ──────────────────────────────────── */}
        <div className="udm-banner">
          <button className="udm-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <div className="udm-avatar-wrap">
            <div className="udm-avatar">
              {user.profile
                ? <img key={user.profile} src={getUploadUrl(user.profile, 'profiles')} alt={user.firstName}
                  onError={(e) => { e.target.style.display = 'none'; }} />
                : <span>{initials}</span>
              }
            </div>
            <div className={`udm-status-dot ${user.isActive ? 'dot-active' : 'dot-inactive'}`}></div>
          </div>
          <h2 className="udm-name">{user.firstName} {user.lastName}</h2>
          <p className="udm-email">{user.email}</p>
          <div className="udm-badges">
            <span className={`udm-badge ${user.isActive ? 'badge-active' : 'badge-inactive'}`}>
              <i className={`fas fa-circle`} style={{ fontSize: 7 }}></i>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`udm-badge ${user.isVerified ? 'badge-verified' : 'badge-unverified'}`}>
              <i className={`fas fa-${user.isVerified ? 'check-circle' : 'clock'}`}></i>
              {user.isVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>

        {/* ── Detail rows ────────────────────────────────────────────────── */}
        <div className="udm-body">
          <div className="udm-row">
            <div className="udm-row-icon"><i className="fas fa-phone"></i></div>
            <div className="udm-row-content">
              <span className="udm-row-label">Phone</span>
              <span className="udm-row-value">{user.phone || <em style={{ color: '#aaa' }}>Not provided</em>}</span>
            </div>
          </div>
          <div className="udm-row">
            <div className="udm-row-icon"><i className="fas fa-calendar-alt"></i></div>
            <div className="udm-row-content">
              <span className="udm-row-label">Member Since</span>
              <span className="udm-row-value">{formatDate(user.createdAt)}</span>
            </div>
          </div>
          <div className="udm-row">
            <div className="udm-row-icon"><i className="fas fa-shield-alt"></i></div>
            <div className="udm-row-content">
              <span className="udm-row-label">Account Status</span>
              <span className="udm-row-value" style={{ color: user.isActive ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {user.isActive ? '✓ Account is active' : '✗ Account is disabled'}
              </span>
            </div>
          </div>
          <div className="udm-row" style={{ borderBottom: 'none' }}>
            <div className="udm-row-icon"><i className="fas fa-id-badge"></i></div>
            <div className="udm-row-content">
              <span className="udm-row-label">Verification</span>
              <span className="udm-row-value" style={{ color: user.isVerified ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                {user.isVerified ? '✓ Email verified' : '⏳ Not yet verified'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="udm-footer">
          <Link href="/admin/users" className="btn-primary" onClick={onClose}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className="fas fa-users"></i> Manage Users
          </Link>
        </div>

      </div>
    </div>
  );
};

// ── Order Detail Modal ─────────────────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose }) => {
  const orderStatus = STATUS_CONFIG[order.status] || { color: '#6b7280', bg: '#f9fafb', label: order.status };
  const payStatus = PAYMENT_STATUS_CONFIG[order.paymentStatus] || { color: '#6b7280', bg: '#f9fafb', label: order.paymentStatus };
  const customerName = order.user
    ? `${order.user.firstName} ${order.user.lastName}`
    : order.shippingAddress?.fullName || 'Customer';

  const timelineSteps = [
    { label: 'Placed', icon: 'fa-shopping-bag', time: order.placedAt },
    { label: 'Confirmed', icon: 'fa-check-circle', time: order.confirmedAt },
    { label: 'Shipped', icon: 'fa-truck', time: order.shippedAt },
    { label: 'Delivered', icon: 'fa-box-open', time: order.deliveredAt },
    { label: 'Cancelled', icon: 'fa-times-circle', time: order.cancelledAt },
  ].filter(s => s.time);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="odm-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Banner ─────────────────────────────────────────────────────── */}
        <div className="odm-banner">
          <button className="udm-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          {/* Order icon */}
          <div className="odm-icon-wrap">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <h2 className="odm-order-num">{order.orderNumber}</h2>
          <p className="odm-date">{formatDateTime(order.placedAt || order.createdAt)}</p>
          {/* Status badges */}
          <div className="udm-badges">
            <span className="odm-status-pill" style={{ background: orderStatus.bg, color: orderStatus.color }}>
              <i className="fas fa-circle" style={{ fontSize: 7 }}></i> {orderStatus.label}
            </span>
            <span className="odm-status-pill" style={{ background: payStatus.bg, color: payStatus.color }}>
              <i className={`fas fa-${order.paymentMethod === 'cod' ? 'money-bill-wave' : 'credit-card'}`}></i>
              {payStatus.label}
            </span>
          </div>
          {/* 3 quick stats */}
          <div className="odm-quick-stats">
            <div className="odm-qs">
              <span className="odm-qs-val">{order.items?.length || 0}</span>
              <span className="odm-qs-label">Items</span>
            </div>
            <div className="odm-qs-divider"></div>
            <div className="odm-qs">
              <span className="odm-qs-val">{formatPrice(order.total)}</span>
              <span className="odm-qs-label">Total</span>
            </div>
            <div className="odm-qs-divider"></div>
            <div className="odm-qs">
              <span className="odm-qs-val">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
              <span className="odm-qs-label">Payment</span>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="odm-body">

          {/* Customer & address */}
          <div className="odm-section">
            <div className="odm-section-title">
              <i className="fas fa-map-marker-alt"></i> Delivery To
            </div>
            <div className="odm-address-card">
              <div className="odm-address-name">
                <strong>{order.shippingAddress?.fullName}</strong>
                <span className="odm-label-tag">{order.shippingAddress?.label || 'Home'}</span>
              </div>
              <div className="odm-address-phone">
                <i className="fas fa-phone" style={{ fontSize: 11, color: '#9ca3af' }}></i>
                {order.shippingAddress?.phone}
              </div>
              <div className="odm-address-line">
                {order.shippingAddress?.line1}
                {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}
              </div>
              <div className="odm-address-line">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="odm-section">
            <div className="odm-section-title">
              <i className="fas fa-box"></i> Order Items
            </div>
            <div className="odm-items">
              {order.items?.map((item, i) => (
                <div className="odm-item-row" key={i}>
                  <div className="odm-item-img">
                    {item.image
                      ? <img src={getUploadUrl(item.image, 'products')} alt={item.name} onError={(e) => { e.target.src = '/cocofinaproduct.png'; }} />
                      : <i className="fas fa-cube"></i>
                    }
                  </div>
                  <div className="odm-item-info">
                    <span className="odm-item-name">{item.name}</span>
                    <span className="odm-item-variant">{item.variantWeight} × {item.quantity}</span>
                  </div>
                  <span className="odm-item-price">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon */}
          {order.coupon?.code && (
            <div className="odm-section">
              <div className="odm-section-title">
                <i className="fas fa-ticket-alt"></i> Coupon Applied
              </div>
              <div className="odm-coupon-card">
                <div className="odm-coupon-left">
                  <span className="odm-coupon-code">{order.coupon.code}</span>
                  <span className="odm-coupon-type">
                    {order.coupon.type === 'flat' ? `₹${order.coupon.value} off` : `${order.coupon.value}% off`}
                  </span>
                </div>
                <span className="odm-coupon-saving">−{formatPrice(order.coupon.discount)}</span>
              </div>
            </div>
          )}

          {/* Pricing summary */}
          <div className="odm-section">
            <div className="odm-section-title">
              <i className="fas fa-receipt"></i> Payment Summary
            </div>
            <div className="odm-pricing">
              <div className="odm-price-row"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="odm-price-row"><span>GST (5%)</span><span>{formatPrice(order.tax)}</span></div>
              <div className="odm-price-row">
                <span>Shipping</span>
                <span>{order.shippingCharge === 0 ? <span style={{ color: '#10b981', fontWeight: 600 }}>Free</span> : formatPrice(order.shippingCharge)}</span>
              </div>
              {order.discount > 0 && (
                <div className="odm-price-row odm-discount-row">
                  <span><i className="fas fa-tag"></i> Coupon Discount</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="odm-price-total">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {timelineSteps.length > 0 && (
            <div className="odm-section" style={{ paddingBottom: 8 }}>
              <div className="odm-section-title">
                <i className="fas fa-history"></i> Timeline
              </div>
              <div className="odm-timeline">
                {timelineSteps.map((step, i) => (
                  <div className="odm-tl-item" key={i}>
                    <div className="odm-tl-icon">
                      <i className={`fas ${step.icon}`}></i>
                    </div>
                    <div className="odm-tl-line" style={{ display: i === timelineSteps.length - 1 ? 'none' : 'block' }}></div>
                    <div className="odm-tl-content">
                      <span className="odm-tl-label">{step.label}</span>
                      <span className="odm-tl-time">{formatDateTime(step.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="udm-footer">
          <Link href="/admin/orders" className="btn-primary" onClick={onClose}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <i className="fas fa-list"></i> All Orders
          </Link>
        </div>

      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0,
    placedOrders: 0, processingOrders: 0, deliveredOrders: 0, cancelledOrders: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [viewUser, setViewUser] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const [perms, setPerms] = useState({});

  useEffect(() => {
    setPerms(getAdminPerms('products'));
  }, []);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true); setError('');
      const [userStatsRes, usersRes, productStatsRes, orderStatsRes, recentOrdersRes] = await Promise.all([
        userAPI.getStats(),
        userAPI.getAll({ page: 1, limit: 5 }),
        adminProductAPI.getStats(),
        orderAPI.getOrderStats(),
        orderAPI.getAllOrders({ page: 1, limit: 5 }),
      ]);

      const userStats = userStatsRes.data.stats || {};
      const productStats = productStatsRes.data.stats || {};
      const orderStats = orderStatsRes.data.stats || {};

      setStats({
        totalUsers: userStats.totalUsers || 0,
        totalProducts: productStats.totalProducts || 0,
        totalOrders: orderStats.total || 0,
        totalRevenue: orderStats.revenue || 0,
        placedOrders: orderStats.placed || 0,
        processingOrders: orderStats.processing || 0,
        deliveredOrders: orderStats.delivered || 0,
        cancelledOrders: orderStats.cancelled || 0,
      });
      setRecentUsers(usersRes.data.users || []);
      setRecentOrders(recentOrdersRes.data.orders || []);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="admin-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading dashboard...</p>
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="admin-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary">Try Again</button>
      </div>
    </AdminLayout>
  );

  const STAT_CARDS = [
    { icon: 'fa-users', bg: '#eff6ff', color: '#3b82f6', value: stats.totalUsers.toLocaleString(), label: 'Total Users' },
    { icon: 'fa-box', bg: '#f0fdf4', color: '#10b981', value: stats.totalProducts.toLocaleString(), label: 'Total Products' },
    { icon: 'fa-shopping-cart', bg: '#fef3c7', color: '#f59e0b', value: stats.totalOrders.toLocaleString(), label: 'Total Orders' },
    { icon: 'fa-rupee-sign', bg: '#f5f3ff', color: '#8b5cf6', value: `₹${stats.totalRevenue.toLocaleString()}`, label: 'Total Revenue' },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">

        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening with your store today.</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          {STAT_CARDS.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
              </div>
              <div className="stat-info">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {perms.create && (
              <Link href="/admin/products/new" className="action-card">
                <i className="fas fa-plus-circle"></i>
                <span>Add New Product</span>
              </Link>
            )}
            <Link href="/admin/users" className="action-card">
              <i className="fas fa-user-plus"></i>
              <span>View All Users</span>
            </Link>
            <Link href="/admin/orders" className="action-card">
              <i className="fas fa-list-alt"></i>
              <span>View Orders</span>
            </Link>
            <Link href="/admin/categories" className="action-card">
              <i className="fas fa-tags"></i>
              <span>Manage Categories</span>
            </Link>
          </div>
        </div>

        {/* Recent tables */}
        <div className="dashboard-content">

          {/* Recent Users */}
          <div className="content-section">
            <div className="section-header-a">
              <h2>Recent Users</h2>
              <Link href="/admin/users" className="view-all">View All <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="table-container">
              {recentUsers.length === 0 ? (
                <div className="empty-state"><i className="fas fa-users"></i><p>No users found</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Status</th><th>Joined</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#3b2a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                              {u.profile
                                ? <img key={u.profile} src={getUploadUrl(u.profile, 'profiles')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                                : <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{(u.firstName?.[0] || '').toUpperCase()}{(u.lastName?.[0] || '').toUpperCase()}</span>
                              }
                            </div>
                            <span>{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: '#555' }}>{u.email}</td>
                        <td>
                          <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: u.isActive ? '#ecfdf5' : '#fef2f2', color: u.isActive ? '#10b981' : '#ef4444' }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: '#888' }}>{formatDate(u.createdAt)}</td>
                        <td>
                          {/* ← Opens modal instead of navigating away */}
                          <button
                            className="btn-view"
                            onClick={() => setViewUser(u)}
                            style={{ background: 'none', border: '1px solid #e0d8cf', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#5a3e28', fontWeight: 600 }}
                          >
                            <i className="fas fa-eye" style={{ marginRight: 4 }}></i>View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="content-section">
            <div className="section-header-a">
              <h2>Recent Orders</h2>
              <Link href="/admin/orders" className="view-all">View All <i className="fas fa-arrow-right"></i></Link>
            </div>
            <div className="table-container">
              {recentOrders.length === 0 ? (
                <div className="empty-state"><i className="fas fa-shopping-cart"></i><p>No orders found</p></div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td><span className="order-number" style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.orderNumber}</span></td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{order.shippingAddress?.fullName || order.user?.firstName}</div>
                            <div style={{ fontSize: 12, color: '#888' }}>{order.shippingAddress?.city}</div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                        <td><StatusBadge status={order.status} config={STATUS_CONFIG} /></td>
                        <td style={{ fontSize: 13, color: '#888' }}>{formatDate(order.placedAt || order.createdAt)}</td>
                        <td>
                          {/* ← Opens modal instead of navigating away */}
                          <button
                            className="btn-view"
                            onClick={() => setViewOrder(order)}
                            style={{ background: 'none', border: '1px solid #e0d8cf', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#5a3e28', fontWeight: 600 }}
                          >
                            <i className="fas fa-eye" style={{ marginRight: 4 }}></i>View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}

    </AdminLayout>
  );
};

export default AdminDashboard;