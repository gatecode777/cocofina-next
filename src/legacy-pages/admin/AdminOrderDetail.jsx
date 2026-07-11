'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminOrderDetail.css';

const tok = () => localStorage.getItem('adminToken');
const api = async (method, url, body) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};
const srAction = (action, orderId, extra = {}) =>
  api('POST', '/api/admin/shiprocket', { action, orderId, ...extra });

const fmt   = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const fmtDT = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtD  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_COLOR = {
  placed:     { color: '#f59e0b', bg: '#fef3c7' },
  confirmed:  { color: '#3b82f6', bg: '#eff6ff' },
  processing: { color: '#8b5cf6', bg: '#f5f3ff' },
  shipped:    { color: '#f97316', bg: '#fff7ed' },
  delivered:  { color: '#10b981', bg: '#ecfdf5' },
  cancelled:  { color: '#ef4444', bg: '#fef2f2' },
};
const PAY_COLOR = {
  pending:  { color: '#f59e0b', bg: '#fef3c7' },
  paid:     { color: '#10b981', bg: '#ecfdf5' },
  failed:   { color: '#ef4444', bg: '#fef2f2' },
  refunded: { color: '#6b7280', bg: '#f9fafb' },
};

const Badge = ({ label, color, bg }) => (
  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color, background: bg, display: 'inline-block' }}>
    {label}
  </span>
);

// ── Tracking timeline ──────────────────────────────────────────────────────────
const TrackingTimeline = ({ activities }) => {
  if (!activities?.length) return <p style={{ color: '#9ca3af', fontSize: 13 }}>No tracking events yet.</p>;
  return (
    <div className="aod-timeline">
      {activities.map((a, i) => (
        <div className={`aod-tl-item ${i === 0 ? 'aod-tl-latest' : ''}`} key={i}>
          <div className="aod-tl-dot"></div>
          {i < activities.length - 1 && <div className="aod-tl-line"></div>}
          <div className="aod-tl-content">
            <p className="aod-tl-desc">{a.activity || a.status || a.sr-status || '—'}</p>
            <span className="aod-tl-time">{fmtDT(a.date || a.created_at)}</span>
            {a.location && <span className="aod-tl-loc"><i className="fas fa-map-marker-alt"></i> {a.location}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Courier card ───────────────────────────────────────────────────────────────
const CourierCard = ({ courier, onSelect, selected }) => (
  <div
    className={`aod-courier-card ${selected ? 'aod-courier-selected' : ''}`}
    onClick={() => onSelect(courier.courier_company_id)}
  >
    <div className={`aod-courier-radio ${selected ? 'filled' : ''}`}></div>
    <div className="aod-courier-info">
      <div className="aod-courier-name">{courier.courier_name}</div>
      <div className="aod-courier-meta">
        ETA: {courier.estimated_delivery_days} days
        {courier.cod === 1 && <span className="aod-courier-cod">COD</span>}
      </div>
    </div>
    <div className="aod-courier-rate">
      <strong>₹{parseFloat(courier.rate || courier.freight_charge || 0).toFixed(0)}</strong>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const AdminOrderDetail = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order,         setOrder]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [srLoading,     setSrLoading]     = useState(false);
  const [tracking,      setTracking]      = useState(null);
  const [couriers,      setCouriers]      = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [showCouriers,  setShowCouriers]  = useState(false);
  const [statusForm,    setStatusForm]    = useState({ status: '', paymentStatus: '' });
  const [savingStatus,  setSavingStatus]  = useState(false);

  useEffect(() => { fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const data = await api('GET', `/api/admin/orders/${orderId}`);
      if (data.success) {
        setOrder(data.order);
        setStatusForm({ status: data.order.status, paymentStatus: data.order.paymentStatus });
        // Auto-load tracking if AWB exists
        if (data.order.shiprocket?.awbCode) loadTracking(data.order);
      } else toast.error(data.message);
    } catch { toast.error('Failed to load order'); }
    finally { setLoading(false); }
  };

  const loadTracking = async (o = order) => {
    if (!o?.shiprocket?.awbCode && !o?.shiprocket?.shipmentId) return;
    setSrLoading(true);
    try {
      const data = await srAction('track', o._id);
      if (data.success) setTracking(data.data);
      else toast.error('Could not load tracking: ' + data.message);
    } catch { toast.error('Tracking failed'); }
    finally { setSrLoading(false); }
  };

  const loadCouriers = async () => {
    setSrLoading(true);
    setShowCouriers(true);
    try {
      const data = await srAction('couriers', order._id);
      if (data.success) {
        const list = data.data?.data?.available_courier_companies || [];
        setCouriers(list);
        if (!list.length) toast.info('No couriers available for this pincode');
      } else toast.error(data.message);
    } catch { toast.error('Failed to fetch couriers'); }
    finally { setSrLoading(false); }
  };

  const handleAssignAWB = async () => {
    if (!selectedCourier) { toast.error('Select a courier first'); return; }
    setSrLoading(true);
    try {
      const data = await srAction('assign_awb', order._id, { courierId: selectedCourier });
      if (data.success) {
        toast.success('AWB assigned successfully!');
        setShowCouriers(false);
        fetchOrder();
      } else toast.error(data.message || 'Failed to assign AWB');
    } catch { toast.error('Failed to assign AWB'); }
    finally { setSrLoading(false); }
  };

  const handleRequestPickup = async () => {
    if (!window.confirm('Request pickup from Shiprocket?')) return;
    setSrLoading(true);
    try {
      const data = await srAction('request_pickup', order._id);
      if (data.success) toast.success('Pickup requested!');
      else toast.error(data.message || 'Pickup request failed');
    } catch { toast.error('Pickup request failed'); }
    finally { setSrLoading(false); }
  };

  const handleGenerateLabel = async () => {
    setSrLoading(true);
    try {
      const data = await srAction('generate_label', order._id);
      if (data.success) {
        const url = data.data?.label_url;
        if (url) window.open(url, '_blank');
        else toast.info('Label generated — check Shiprocket panel');
      } else toast.error(data.message);
    } catch { toast.error('Failed to generate label'); }
    finally { setSrLoading(false); }
  };

  const handleGenerateInvoice = async () => {
    setSrLoading(true);
    try {
      const data = await srAction('generate_invoice', order._id);
      if (data.success) {
        const url = data.data?.invoice_url;
        if (url) window.open(url, '_blank');
        else toast.info('Invoice generated — check Shiprocket panel');
      } else toast.error(data.message);
    } catch { toast.error('Failed to generate invoice'); }
    finally { setSrLoading(false); }
  };

  const handleCancelSR = async () => {
    if (!window.confirm('Cancel this shipment on Shiprocket? This cannot be undone.')) return;
    setSrLoading(true);
    try {
      // 1. Cancel on Shiprocket
      const srData = await srAction('cancel', order._id);
      if (!srData.success) { toast.error(srData.message || 'SR cancel failed'); setSrLoading(false); return; }

      // 2. Also update local order status to cancelled
      await api('PUT', `/api/admin/orders/${order._id}`, {
        status: 'cancelled',
        paymentStatus: order.paymentStatus,
      });

      toast.success('Shipment cancelled on Shiprocket & order marked cancelled');
      fetchOrder(); // reload the full order
    } catch { toast.error('Cancel failed'); }
    finally { setSrLoading(false); }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    try {
      const data = await api('PUT', `/api/admin/orders/${orderId}`, statusForm);
      if (data.success) { toast.success('Order updated'); fetchOrder(); }
      else toast.error(data.message);
    } catch { toast.error('Update failed'); }
    finally { setSavingStatus(false); }
  };

  if (loading) return (
    <AdminLayout>
      <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i><p>Loading order…</p></div>
    </AdminLayout>
  );
  if (!order) return (
    <AdminLayout>
      <div style={{ textAlign: 'center', padding: 80 }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: 48, color: '#ef4444' }}></i>
        <h2>Order not found</h2>
        <button className="btn-secondary" onClick={() => router.push('/admin/orders')}>← Back to Orders</button>
      </div>
    </AdminLayout>
  );

  const sc = STATUS_COLOR[order.status] || { color: '#6b7280', bg: '#f9fafb' };
  const pc = PAY_COLOR[order.paymentStatus] || { color: '#6b7280', bg: '#f9fafb' };
  const sr = order.shiprocket || {};
  const hasAWB = Boolean(sr.awbCode);
  const hasSR  = Boolean(sr.orderId);

  // Extract tracking activities
  const trackActivities = tracking?.tracking_data?.shipment_track_activities
    || tracking?.tracking_data?.track_activities
    || tracking?.shipment_track?.[0]?.activities
    || [];
  const trackStatus = tracking?.tracking_data?.track_status
    || tracking?.shipment_track?.[0]?.current_status
    || '';
  const trackCourier = tracking?.tracking_data?.shipment_track?.[0]?.courier_name
    || sr.courierName || '';

  return (
    <AdminLayout>
      <div className="aod-page">

        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <div className="aod-topbar">
          <div className="aod-topbar-left">
            <button className="aod-back-btn" onClick={() => router.push('/admin/orders')}>
              <i className="fas fa-arrow-left"></i> Orders
            </button>
            <div className="aod-header-info">
              <h1 className="aod-order-num">{order.orderNumber}</h1>
              <span className="aod-order-date">{fmtDT(order.placedAt || order.createdAt)}</span>
            </div>
          </div>
          <div className="aod-topbar-right">
            <Badge label={order.status.charAt(0).toUpperCase() + order.status.slice(1)} color={sc.color} bg={sc.bg} />
            <Badge label={order.paymentStatus} color={pc.color} bg={pc.bg} />
          </div>
        </div>

        <div className="aod-grid">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div className="aod-col-main">

            {/* Shiprocket status card */}
            <div className={`aod-card aod-sr-card ${!hasSR ? 'aod-sr-missing' : ''}`}>
              <div className="aod-sr-header">
                <div className="aod-sr-title">
                  <div className={`aod-sr-dot ${hasSR ? (hasAWB ? 'sr-dot-green' : 'sr-dot-yellow') : 'sr-dot-red'}`}></div>
                  <h2>Shiprocket Shipment</h2>
                </div>
                {hasSR && (
                  <button className="aod-btn-ghost" onClick={() => loadTracking()} disabled={srLoading}>
                    <i className={`fas ${srLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i> Refresh
                  </button>
                )}
              </div>

              {!hasSR ? (
                <div className="aod-sr-empty">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>Shiprocket order not created yet</p>
                  <p className="aod-sr-error">{sr.error || 'Order was placed before Shiprocket integration'}</p>
                </div>
              ) : (
                <>
                  {/* SR IDs row */}
                  <div className="aod-sr-ids">
                    {[
                      { label: 'SR Order ID',   value: sr.orderId    || '—' },
                      { label: 'Shipment ID',   value: sr.shipmentId || '—' },
                      { label: 'AWB Number',    value: sr.awbCode    || <span style={{ color: '#f59e0b' }}>Not assigned</span> },
                      { label: 'Courier',       value: sr.courierName || trackCourier || '—' },
                    ].map(({ label, value }) => (
                      <div className="aod-sr-id-item" key={label}>
                        <span className="aod-sr-id-label">{label}</span>
                        <span className="aod-sr-id-value">{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Current tracking status */}
                  {trackStatus && (
                    <div className="aod-sr-current-status">
                      <i className="fas fa-map-marker-alt"></i>
                      <strong>Current Status:</strong> {trackStatus}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="aod-sr-actions">
                    {!hasAWB && order.status !== 'cancelled' && (
                      <button className="aod-btn aod-btn-primary" onClick={loadCouriers} disabled={srLoading}>
                        <i className="fas fa-truck"></i> Assign Courier & AWB
                      </button>
                    )}
                    {hasAWB && order.status !== 'cancelled' && (
                      <button className="aod-btn aod-btn-primary" onClick={() => loadTracking()} disabled={srLoading}>
                        <i className="fas fa-search-location"></i> Refresh Tracking
                      </button>
                    )}
                    {order.status !== 'cancelled' && (
                      <>
                        <button className="aod-btn aod-btn-outline" onClick={handleRequestPickup} disabled={srLoading || !sr.shipmentId}>
                          <i className="fas fa-hands"></i> Request Pickup
                        </button>
                        <button className="aod-btn aod-btn-outline" onClick={handleGenerateLabel} disabled={srLoading || !hasAWB}>
                          <i className="fas fa-tag"></i> Label
                        </button>
                        <button className="aod-btn aod-btn-outline" onClick={handleGenerateInvoice} disabled={srLoading || !sr.orderId}>
                          <i className="fas fa-file-invoice"></i> Invoice
                        </button>
                        <button className="aod-btn aod-btn-danger" onClick={handleCancelSR} disabled={srLoading}>
                          <i className="fas fa-times"></i> Cancel SR
                        </button>
                      </>
                    )}
                    {order.status === 'cancelled' && (
                      <div className="aod-cancelled-banner">
                        <i className="fas fa-times-circle"></i>
                        This order has been cancelled
                      </div>
                    )}
                  </div>

                  {/* Courier selection panel */}
                  {showCouriers && (
                    <div className="aod-couriers-panel">
                      <div className="aod-couriers-header">
                        <h3>Select Courier</h3>
                        <button className="aod-btn-ghost" onClick={() => setShowCouriers(false)}>✕</button>
                      </div>
                      {srLoading ? (
                        <div style={{ padding: 20, textAlign: 'center' }}>
                          <i className="fas fa-spinner fa-spin"></i> Loading couriers…
                        </div>
                      ) : couriers.length === 0 ? (
                        <p style={{ color: '#9ca3af', padding: 16, textAlign: 'center' }}>No couriers available</p>
                      ) : (
                        <>
                          <div className="aod-couriers-list">
                            {couriers.map(c => (
                              <CourierCard
                                key={c.courier_company_id}
                                courier={c}
                                selected={selectedCourier === c.courier_company_id}
                                onSelect={setSelectedCourier}
                              />
                            ))}
                          </div>
                          <button
                            className="aod-btn aod-btn-primary"
                            style={{ width: '100%', marginTop: 12 }}
                            onClick={handleAssignAWB}
                            disabled={!selectedCourier || srLoading}
                          >
                            <i className="fas fa-check"></i> Confirm & Assign AWB
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Tracking timeline */}
                  {tracking && (
                    <div className="aod-tracking-section">
                      <h3 className="aod-section-title">
                        <i className="fas fa-route"></i> Tracking History
                      </h3>
                      <TrackingTimeline activities={trackActivities} />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Order items */}
            <div className="aod-card">
              <h2 className="aod-card-title"><i className="fas fa-box"></i> Order Items</h2>
              <div className="aod-items">
                {order.items?.map((item, i) => (
                  <div className="aod-item-row" key={i}>
                    <div className="aod-item-img">
                      {item.image
                        ? <img src={getUploadUrl(item.image, 'products')} alt={item.name} onError={e => { e.target.src = '/cocofinaproduct.png'; }} />
                        : <i className="fas fa-cube"></i>
                      }
                    </div>
                    <div className="aod-item-info">
                      <div className="aod-item-name">{item.name}</div>
                      <div className="aod-item-variant">{item.variantWeight}</div>
                    </div>
                    <div className="aod-item-qty">× {item.quantity}</div>
                    <div className="aod-item-price">{fmt(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>
              {/* Pricing */}
              <div className="aod-pricing">
                {[
                  { label: 'Subtotal',  value: fmt(order.subtotal) },
                  { label: 'GST (5%)', value: fmt(order.tax) },
                  { label: 'Shipping', value: order.shippingCharge === 0 ? 'Free' : fmt(order.shippingCharge) },
                ].map(({ label, value }) => (
                  <div className="aod-price-row" key={label}><span>{label}</span><span>{value}</span></div>
                ))}
                {order.discount > 0 && (
                  <div className="aod-price-row aod-discount">
                    <span><i className="fas fa-tag"></i> {order.coupon?.code || 'Discount'}</span>
                    <span>−{fmt(order.discount)}</span>
                  </div>
                )}
                <div className="aod-price-total">
                  <span>Total</span><strong>{fmt(order.total)}</strong>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ─────────────────────────────────────────────── */}
          <div className="aod-col-side">

            {/* Update status */}
            <div className="aod-card">
              <h2 className="aod-card-title"><i className="fas fa-edit"></i> Update Status</h2>
              <form onSubmit={handleUpdateStatus}>
                <div className="aod-field">
                  <label>Order Status</label>
                  <select value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}>
                    {['placed','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="aod-field" style={{ marginTop: 10 }}>
                  <label>Payment Status</label>
                  <select value={statusForm.paymentStatus} onChange={e => setStatusForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                    {['pending','paid','failed','refunded'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                {statusForm.status === 'delivered' && order.paymentMethod === 'cod' && (
                  <div className="aod-cod-tip">
                    💡 COD order — set Payment to <strong>Paid</strong> when cash collected.
                  </div>
                )}
                <button type="submit" className="aod-btn aod-btn-primary aod-btn-full" disabled={savingStatus} style={{ marginTop: 14 }}>
                  {savingStatus ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Update</>}
                </button>
              </form>
            </div>

            {/* Customer info */}
            <div className="aod-card">
              <h2 className="aod-card-title"><i className="fas fa-user"></i> Customer</h2>
              {order.user ? (
                <div className="aod-customer">
                  <div className="aod-customer-avatar">
                    {`${order.user.firstName?.[0] || ''}${order.user.lastName?.[0] || ''}`.toUpperCase()}
                  </div>
                  <div>
                    <div className="aod-customer-name">{order.user.firstName} {order.user.lastName}</div>
                    <div className="aod-customer-email">{order.user.email}</div>
                    {order.user.phone && <div className="aod-customer-phone">{order.user.phone}</div>}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#9ca3af', fontSize: 13 }}>Guest order</p>
              )}
            </div>

            {/* Shipping address */}
            <div className="aod-card">
              <h2 className="aod-card-title"><i className="fas fa-map-marker-alt"></i> Delivery Address</h2>
              <div className="aod-address">
                <div className="aod-address-name">
                  <strong>{order.shippingAddress?.fullName}</strong>
                  <span className="aod-addr-tag">{order.shippingAddress?.label || 'Home'}</span>
                </div>
                <div>{order.shippingAddress?.phone}</div>
                <div>{order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ''}</div>
                <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}</div>
              </div>
            </div>

            {/* Payment info */}
            <div className="aod-card">
              <h2 className="aod-card-title"><i className="fas fa-credit-card"></i> Payment</h2>
              <div className="aod-payment-rows">
                <div className="aod-pay-row"><span>Method</span><strong>{order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online'}</strong></div>
                <div className="aod-pay-row"><span>Status</span><Badge label={order.paymentStatus} color={pc.color} bg={pc.bg} /></div>
                <div className="aod-pay-row"><span>Shipping</span><strong>{order.shippingMethod === 'express' ? '🚀 Express' : '📦 Free Standard'}</strong></div>
              </div>
            </div>

            {/* Coupon */}
            {order.coupon?.code && (
              <div className="aod-card">
                <h2 className="aod-card-title"><i className="fas fa-ticket-alt"></i> Coupon</h2>
                <div className="aod-coupon">
                  <span className="aod-coupon-code">{order.coupon.code}</span>
                  <span className="aod-coupon-saving">−{fmt(order.coupon.discount)}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                  {order.coupon.type === 'flat' ? `₹${order.coupon.value} flat off` : `${order.coupon.value}% off`}
                </div>
              </div>
            )}

            {/* Order timeline */}
            <div className="aod-card">
              <h2 className="aod-card-title"><i className="fas fa-history"></i> Order Timeline</h2>
              <div className="aod-timeline">
                {[
                  { label: 'Placed',    icon: 'fa-shopping-bag',  time: order.placedAt    },
                  { label: 'Confirmed', icon: 'fa-check-circle',  time: order.confirmedAt },
                  { label: 'Shipped',   icon: 'fa-truck',         time: order.shippedAt   },
                  { label: 'Delivered', icon: 'fa-box-open',      time: order.deliveredAt },
                  { label: 'Cancelled', icon: 'fa-times-circle',  time: order.cancelledAt },
                ].filter(s => s.time).map((s, i) => (
                  <div className="aod-tl-item" key={i}>
                    <div className="aod-tl-dot"></div>
                    {i < 4 && <div className="aod-tl-line"></div>}
                    <div className="aod-tl-content">
                      <span className="aod-tl-desc">{s.label}</span>
                      <span className="aod-tl-time">{fmtDT(s.time)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;