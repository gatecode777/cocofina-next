'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { orderAPI } from '@/services/api';
import '@/styles/admin/AdminOrders.css';

// ── Status config matching Order schema enum ───────────────────────────────────
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
  const c = config[status] || { color: '#6b7280', bg: '#f9fafb', label: status };
  return (
    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, color: c.color, background: c.bg }}>
      {c.label}
    </span>
  );
};

const formatPrice = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// ── Main Component ─────────────────────────────────────────────────────────────
const AdminOrders = () => {
  const debounceRef = useRef(null);
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', paymentStatus: '' });
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchOrders, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  useEffect(() => {
    fetchStats();
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 20 };
      if (searchTerm) params.search = searchTerm;
      if (filterStatus !== 'all') params.status = filterStatus;

      const res = await orderAPI.getAllOrders(params);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('fetchOrders error:', err);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await orderAPI.getOrderStats();
      if (res.data.success) setStats(res.data.stats);
    } catch (err) {
      console.error('fetchStats error:', err);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setStatusForm({ status: order.status, paymentStatus: order.paymentStatus });
    setShowStatusModal(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!statusForm.status) { toast.error('Please select a status'); return; }
    try {
      setStatusSaving(true);
      const res = await orderAPI.updateOrderStatus(selectedOrder._id, statusForm);
      if (res.data.success) {
        toast.success('Order updated successfully');
        setShowStatusModal(false);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setStatusSaving(false);
    }
  };

  // ── Stat cards config ──────────────────────────────────────────────────────
  const statCards = stats ? [
    { icon: 'fa-shopping-cart', iconColor: '#3b82f6', iconBg: '#eff6ff', value: stats.total, label: 'Total Orders' },
    { icon: 'fa-clock', iconColor: '#f59e0b', iconBg: '#fef3c7', value: stats.placed, label: 'New / Placed' },
    { icon: 'fa-check-circle', iconColor: '#10b981', iconBg: '#ecfdf5', value: stats.delivered, label: 'Delivered' },
    { icon: 'fa-rupee-sign', iconColor: '#8b5cf6', iconBg: '#f5f3ff', value: formatPrice(stats.revenue), label: 'Revenue' },
  ] : [];

  if (loading && orders.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-orders">

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Orders Management</h1>
            <p>Manage and track all customer orders</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            {statCards.map((s, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-icon" style={{ background: s.iconBg }}>
                  <i className={`fas ${s.icon}`} style={{ color: s.iconColor }}></i>
                </div>
                <div className="stat-info">
                  <h3>{s.value}</h3>
                  <p>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="orders-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by order number, name or phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="filter-select">
            <option value="all">All Status</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Coupon</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    <i className="fas fa-shopping-cart"></i>
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td><strong style={{ fontFamily: 'monospace', fontSize: '13px' }}>{order.orderNumber}</strong></td>

                    <td>
                      <div>
                        <strong>{order.shippingAddress?.fullName}</strong>
                        <br />
                        <small style={{ color: '#888' }}>{order.shippingAddress?.phone}</small>
                        <br />
                        <small style={{ color: '#888' }}>{order.shippingAddress?.city}, {order.shippingAddress?.state}</small>
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>{order.items?.length} item(s)</td>

                    <td><strong>{formatPrice(order.total)}</strong></td>

                    {/* Coupon Column */}
                    <td>
                      {order.coupon?.code ? (
                        <div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#8b5cf6',
                            background: '#f5f3ff',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            display: 'inline-block',
                            marginBottom: '4px'
                          }}>
                            {order.coupon.code}
                          </div>
                          <br />
                          <small style={{ color: '#10b981' }}>−{formatPrice(order.coupon.discount)}</small>
                        </div>
                      ) : (
                        <span style={{ color: '#888', fontSize: '12px' }}>—</span>
                      )}
                    </td>

                    <td>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>
                          {order.paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}
                        </div>
                        <StatusBadge status={order.paymentStatus} config={PAYMENT_STATUS_CONFIG} />
                      </div>
                    </td>

                    <td><StatusBadge status={order.status} config={STATUS_CONFIG} /></td>

                    <td><small style={{ color: '#888' }}>{formatDate(order.placedAt || order.createdAt)}</small></td>

                    <td>
                      <div className="action-buttons-a">
                        <button className="btn-action btn-view" onClick={() => openDetailsModal(order)} title="View Details">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn-action btn-edit" onClick={() => openStatusModal(order)} title="Update Status">
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ── Update Status Modal ───────────────────────────────────────────────── */}
      {showStatusModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button className="close-btn" onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>{selectedOrder.orderNumber}</strong>
                <small style={{ color: '#64748b' }}>{selectedOrder.shippingAddress?.fullName} · {selectedOrder.shippingAddress?.city}</small>
              </div>

              <form onSubmit={handleUpdateStatus}>
                <div className="form-group">
                  <label>Order Status *</label>
                  <select value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} required>
                    <option value="">Select Status</option>
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Payment Status</label>
                  <select value={statusForm.paymentStatus} onChange={(e) => setStatusForm({ ...statusForm, paymentStatus: e.target.value })}>
                    <option value="">No change</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                {/* Tip for COD delivered */}
                {statusForm.status === 'delivered' && selectedOrder.paymentMethod === 'cod' && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#166534', marginBottom: '16px' }}>
                    💡 This is a COD order. Set Payment Status to <strong>Paid</strong> when cash is collected.
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={statusSaving}>
                    {statusSaving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Update</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Details Modal ───────────────────────────────────────────────── */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-container modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order — {selectedOrder.orderNumber}</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="modal-body">

              {/* Status row */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <StatusBadge status={selectedOrder.status} config={STATUS_CONFIG} />
                <StatusBadge status={selectedOrder.paymentStatus} config={PAYMENT_STATUS_CONFIG} />
                <span style={{ fontSize: '13px', color: '#888', marginLeft: 'auto' }}>
                  {formatDate(selectedOrder.placedAt || selectedOrder.createdAt)}
                </span>
              </div>

              {/* Order info grid */}
              <div className="order-detail-section">
                <h3>Order Information</h3>
                <div className="detail-grid">
                  {[
                    { label: 'Order Number', value: selectedOrder.orderNumber },
                    { label: 'Payment Method', value: selectedOrder.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online' },
                    { label: 'Shipping Method', value: selectedOrder.shippingMethod === 'express' ? '🚀 Express' : '📦 Free Standard' },
                    { label: 'Customer', value: selectedOrder.user ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : selectedOrder.shippingAddress?.fullName },
                  ].map(({ label, value }) => (
                    <div className="detail-item" key={label}>
                      <label>{label}:</label>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Details Section */}
              {selectedOrder.coupon?.code && (
                <div className="order-detail-section">
                  <h3>Coupon Applied</h3>
                  <div style={{
                    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #c4b5fd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <i className="fas fa-ticket-alt" style={{ color: '#8b5cf6', fontSize: '20px' }}></i>
                          <span style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            background: '#fff',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            letterSpacing: '1px'
                          }}>
                            {selectedOrder.coupon.code}
                          </span>
                          <span style={{
                            background: '#8b5cf6',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}>
                            {selectedOrder.coupon.type === 'flat' ? 'FLAT OFF' : '% OFF'}
                          </span>
                        </div>
                        <div style={{ color: '#4c1d95', fontSize: '13px', marginTop: '4px' }}>
                          {selectedOrder.coupon.type === 'flat'
                            ? `₹${selectedOrder.coupon.value} off on entire order`
                            : `${selectedOrder.coupon.value}% off on entire order`
                          }
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6b21a5' }}>Discount Applied</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
                          -{formatPrice(selectedOrder.coupon.discount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping address */}
              <div className="order-detail-section">
                <h3>Shipping Address</h3>
                <div className="address-box">
                  <strong>{selectedOrder.shippingAddress?.fullName}</strong>
                  <span className="tag" style={{ marginLeft: '8px', fontSize: '11px', background: '#f0e8de', color: '#5a3e28', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                    {selectedOrder.shippingAddress?.label || 'Home'}
                  </span>
                  <p style={{ margin: '6px 0 2px' }}>{selectedOrder.shippingAddress?.phone}</p>
                  <p style={{ margin: '0', color: '#555' }}>
                    {selectedOrder.shippingAddress?.line1}
                    {selectedOrder.shippingAddress?.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}
                  </p>
                  <p style={{ margin: '0', color: '#555' }}>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} — {selectedOrder.shippingAddress?.pincode}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className="order-detail-section">
                <h3>Order Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Variant</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, i) => (
                      <tr key={i}>
                        <td><strong>{item.name}</strong></td>
                        <td><span style={{ background: '#f5f0eb', color: '#6b5c4e', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.variantWeight}</span></td>
                        <td>{formatPrice(item.price)}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td><strong>{formatPrice(item.price * item.quantity)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pricing summary */}
              <div className="order-detail-section">
                <h3>Payment Summary</h3>
                <div className="pricing-summary">
                  {[
                    { label: 'Subtotal', value: formatPrice(selectedOrder.subtotal) },
                    { label: 'GST (5%)', value: formatPrice(selectedOrder.tax) },
                    { label: 'Shipping', value: selectedOrder.shippingCharge === 0 ? 'Free' : formatPrice(selectedOrder.shippingCharge) },
                  ].map(({ label, value }) => (
                    <div className="pricing-row" key={label}>
                      <span>{label}</span><span>{value}</span>
                    </div>
                  ))}

                  {/* Discount row */}
                  {selectedOrder.discount > 0 && (
                    <div className="pricing-row" style={{ color: '#10b981' }}>
                      <span><i className="fas fa-tag"></i> Coupon Discount</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}

                  <hr />
                  <div className="pricing-row total">
                    <strong>Total</strong>
                    <strong>{formatPrice(selectedOrder.total)}</strong>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="order-detail-section">
                  <h3>Order Notes</h3>
                  <p style={{ color: '#555', fontSize: '14px', background: '#fafafa', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="order-detail-section">
                <h3>Timeline</h3>
                <div className="status-timeline">
                  {[
                    { label: 'Placed', time: selectedOrder.placedAt },
                    { label: 'Confirmed', time: selectedOrder.confirmedAt },
                    { label: 'Shipped', time: selectedOrder.shippedAt },
                    { label: 'Delivered', time: selectedOrder.deliveredAt },
                    { label: 'Cancelled', time: selectedOrder.cancelledAt },
                  ].filter((t) => t.time).map((t, i) => (
                    <div className="timeline-item" key={i}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <strong>{t.label}</strong>
                        <small> {formatDate(t.time)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminOrders;