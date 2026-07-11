'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import '@/styles/admin/AdminCoupons.css';

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: false, create: false, edit: false, delete: false };
  } catch { return {}; }
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const isExpired = (c) => c.expiryDate && new Date() > new Date(c.expiryDate);
const isExhausted = (c) => c.usageLimit !== null && c.usedCount >= c.usageLimit;

const emptyForm = {
  code: '', description: '', type: 'percentage', value: '',
  maxDiscount: '', minOrderValue: '', usageLimit: '', perUserLimit: '1',
  startDate: '', expiryDate: '', isActive: true,
};

// ── Helper function for API calls ──────────────────────────────────────────────
const req = async (method, url, body) => {
  const token = localStorage.getItem('adminToken');
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
};

// ── Coupon Card ────────────────────────────────────────────────────────────────
const CouponCard = ({ coupon, onEdit, onDelete, onToggle }) => {

  const [perms, setPerms] = useState({});

  useEffect(() => {
    setPerms(getAdminPerms('coupons'));
  }, []);

  const expired = isExpired(coupon);
  const exhausted = isExhausted(coupon);
  const inactive = !coupon.isActive;
  const invalid = expired || exhausted || inactive;

  const statusLabel = expired ? 'Expired'
    : exhausted ? 'Exhausted'
      : inactive ? 'Inactive'
        : 'Active';
  const statusClass = expired || exhausted ? 'cs-expired'
    : inactive ? 'cs-inactive'
      : 'cs-active';

  return (
    <div className={`coupon-card ${invalid ? 'coupon-card--dim' : ''}`}>
      {/* Ticket notch left */}
      <div className="coupon-notch coupon-notch--left"></div>
      <div className="coupon-notch coupon-notch--right"></div>

      {/* Left: code + type */}
      <div className="coupon-left">
        <div className={`coupon-type-pill ${coupon.type === 'flat' ? 'pill-flat' : 'pill-pct'}`}>
          {coupon.type === 'flat' ? '₹ Flat' : '% Off'}
        </div>
        <div className="coupon-code">{coupon.code}</div>
        <div className="coupon-value">
          {coupon.type === 'flat'
            ? `₹${coupon.value} off`
            : `${coupon.value}% off${coupon.maxDiscount ? ` (max ₹${coupon.maxDiscount})` : ''}`}
        </div>
        {coupon.description && <div className="coupon-desc">{coupon.description}</div>}
      </div>

      {/* Dashed divider */}
      <div className="coupon-divider"></div>

      {/* Right: details */}
      <div className="coupon-right">
        <div className="coupon-meta-row">
          <span className="coupon-meta-label">Min Order</span>
          <span className="coupon-meta-val">{coupon.minOrderValue > 0 ? `₹${coupon.minOrderValue}` : 'None'}</span>
        </div>
        <div className="coupon-meta-row">
          <span className="coupon-meta-label">Usage</span>
          <span className="coupon-meta-val">
            {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
          </span>
        </div>
        <div className="coupon-meta-row">
          <span className="coupon-meta-label">Expires</span>
          <span className={`coupon-meta-val ${expired ? 'text-red' : ''}`}>{fmtDate(coupon.expiryDate)}</span>
        </div>
        <div className="coupon-meta-row">
          <span className="coupon-meta-label">Status</span>
          <span className={`coupon-status ${statusClass}`}>{statusLabel}</span>
        </div>

        {/* Actions */}
        <div className="coupon-actions">
          {perms.edit &&
            <button className="ca-btn ca-edit" onClick={() => onEdit(coupon)} title="Edit"><i className="fas fa-pen"></i></button>
          }
          {perms.edit &&
            <button className={`ca-btn ca-toggle ${coupon.isActive ? 'ca-on' : 'ca-off'}`}
              onClick={() => onToggle(coupon)} title={coupon.isActive ? 'Deactivate' : 'Activate'}>
              <i className={`fas fa-${coupon.isActive ? 'toggle-on' : 'toggle-off'}`}></i>
            </button>
          }
          {perms.delete &&
            <button className="ca-btn ca-delete" onClick={() => onDelete(coupon)} title="Delete"><i className="fas fa-trash"></i></button>
          }
        </div>
      </div>
    </div>
  );
};

// ── Form Modal ─────────────────────────────────────────────────────────────────
const CouponFormModal = ({ editData, onClose, onSaved }) => {
  const [form, setForm] = useState(editData || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(editData?._id);

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const generateCode = async () => {
    const data = await req('GET', '/api/admin/coupons/generate-code');
    if (data.success) setForm(p => ({ ...p, code: data.code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) { setError('Type is required'); return; }
    if (!form.value) { setError('Discount value is required'); return; }
    if (form.type === 'percentage' && parseFloat(form.value) > 100) { setError('Percentage cannot exceed 100'); return; }

    const payload = { ...form };
    // Clean up empty optional fields
    if (!payload.code?.trim()) delete payload.code;
    if (!payload.maxDiscount) payload.maxDiscount = null;
    if (!payload.usageLimit) payload.usageLimit = null;
    if (!payload.expiryDate) payload.expiryDate = null;
    if (!payload.minOrderValue) payload.minOrderValue = 0;

    setSaving(true);
    setError('');
    try {
      const data = isEdit
        ? await req('PUT', `/api/admin/coupons/${editData._id}`, payload)
        : await req('POST', '/api/admin/coupons', payload);

      if (data.success) {
        toast.success(isEdit ? 'Coupon updated!' : 'Coupon created!');
        onSaved();
      } else {
        setError(data.message || 'Failed to save coupon');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cf-modal-overlay" onClick={onClose}>
      <div className="cf-modal" onClick={e => e.stopPropagation()}>
        <div className="cf-modal-header">
          <h2>{isEdit ? 'Edit Coupon' : 'Create New Coupon'}</h2>
          <button className="cf-close" onClick={onClose}>×</button>
        </div>

        <form className="cf-modal-body" onSubmit={handleSubmit}>
          {error && <div className="cf-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          {/* Code row */}
          <div className="cf-row">
            <div className="cf-field cf-field-grow">
              <label>Coupon Code</label>
              <input name="code" value={form.code} onChange={handleInput}
                placeholder="e.g. SAVE20 (auto-generate if blank)" />
            </div>
            <div className="cf-field" style={{ justifyContent: 'flex-end', paddingTop: '20px' }}>
              <button type="button" className="cf-gen-btn" onClick={generateCode}>
                <i className="fas fa-magic"></i> Generate
              </button>
            </div>
          </div>

          {/* Type + Value */}
          <div className="cf-row">
            <div className="cf-field">
              <label>Type *</label>
              <div className="cf-type-toggle">
                {['percentage', 'flat'].map(t => (
                  <button key={t} type="button"
                    className={`cf-type-btn ${form.type === t ? 'active' : ''}`}
                    onClick={() => setForm(p => ({ ...p, type: t }))}>
                    {t === 'percentage' ? '% Percentage' : '₹ Flat Amount'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cf-row">
            <div className="cf-field">
              <label>{form.type === 'flat' ? 'Discount Amount (₹) *' : 'Discount Percentage (%) *'}</label>
              <input type="number" name="value" value={form.value} onChange={handleInput}
                placeholder={form.type === 'flat' ? '50' : '20'} min="0"
                max={form.type === 'percentage' ? 100 : undefined} step="0.01" required />
            </div>
            {form.type === 'percentage' && (
              <div className="cf-field">
                <label>Max Discount Cap (₹)</label>
                <input type="number" name="maxDiscount" value={form.maxDiscount}
                  onChange={handleInput} placeholder="e.g. 200 (optional)" min="0" />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="cf-field cf-field-full">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleInput}
              placeholder="e.g. Get 20% off on orders above ₹500" />
          </div>

          {/* Order value + limits */}
          <div className="cf-row">
            <div className="cf-field">
              <label>Min Order Value (₹)</label>
              <input type="number" name="minOrderValue" value={form.minOrderValue}
                onChange={handleInput} placeholder="0" min="0" />
            </div>
            <div className="cf-field">
              <label>Total Usage Limit</label>
              <input type="number" name="usageLimit" value={form.usageLimit}
                onChange={handleInput} placeholder="Unlimited" min="1" />
            </div>
            <div className="cf-field">
              <label>Per User Limit</label>
              <input type="number" name="perUserLimit" value={form.perUserLimit}
                onChange={handleInput} placeholder="1" min="1" />
            </div>
          </div>

          {/* Dates */}
          <div className="cf-row">
            <div className="cf-field">
              <label>Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleInput} />
            </div>
            <div className="cf-field">
              <label>Expiry Date</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleInput} />
            </div>
          </div>

          {/* Active toggle */}
          <label className="cf-checkbox">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInput} />
            <span>Active (visible and usable)</span>
          </label>

          <div className="cf-modal-footer">
            <button type="button" className="cf-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="cf-btn-save" disabled={saving}>
              {saving
                ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                : <><i className="fas fa-save"></i> {isEdit ? 'Update Coupon' : 'Create Coupon'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
const DeleteModal = ({ coupon, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const data = await req('DELETE', `/api/admin/coupons/${coupon._id}`);
    if (data.success) {
      toast.success('Coupon deleted');
      onDeleted();
    } else {
      toast.error(data.message || 'Delete failed');
      setDeleting(false);
    }
  };

  return (
    <div className="cf-modal-overlay" onClick={onClose}>
      <div className="cf-modal cf-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="cf-modal-header">
          <h2>Delete Coupon</h2>
          <button className="cf-close" onClick={onClose}>×</button>
        </div>
        <div className="cf-modal-body">
          <div className="cf-delete-warn">
            <i className="fas fa-exclamation-triangle"></i>
            <p>Are you sure you want to delete coupon <strong>{coupon.code}</strong>?</p>
            <p className="cf-delete-sub">This action cannot be undone.</p>
          </div>
          <div className="cf-modal-footer">
            <button className="cf-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="cf-btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash"></i> Delete</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0 });
  const [perms, setPerms] = useState({});

  useEffect(() => {
    setPerms(getAdminPerms('coupons'));
  }, []);

  const debounceRef = useRef(null);

  const fetchCoupons = async (search = searchTerm, status = filterStatus) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ search, status, limit: 50 });
      const data = await req('GET', `/api/admin/coupons?${params}`);
      if (data.success) {
        setCoupons(data.coupons);
        // Compute stats
        const total = data.coupons.length;
        const active = data.coupons.filter(c => c.isActive && !isExpired(c) && !isExhausted(c)).length;
        const expired = data.coupons.filter(c => isExpired(c) || isExhausted(c)).length;
        setStats({ total, active, expired });
      }
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSearch = (val) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCoupons(val, filterStatus), 400);
  };

  const handleFilter = (val) => {
    setFilterStatus(val);
    fetchCoupons(searchTerm, val);
  };

  const handleToggle = async (coupon) => {
    const data = await req('PUT', `/api/admin/coupons/${coupon._id}/toggle`);
    if (data.success) {
      toast.success(data.message);
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    } else {
      toast.error(data.message || 'Toggle failed');
    }
  };

  const openCreate = () => { setEditData(null); setShowForm(true); };
  const openEdit = (c) => {
    // Format dates for input[type=date]
    const fmt = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
    setEditData({
      ...c,
      startDate: fmt(c.startDate),
      expiryDate: fmt(c.expiryDate),
      maxDiscount: c.maxDiscount ?? '',
      usageLimit: c.usageLimit ?? '',
      minOrderValue: c.minOrderValue ?? 0,
    });
    setShowForm(true);
  };

  const handleSaved = () => { setShowForm(false); fetchCoupons(); };
  const handleDeleted = () => { setDeleteTarget(null); fetchCoupons(); };

  return (
    <AdminLayout>
      <div className="admin-coupons">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Coupons</h1>
            <p>Create and manage discount coupons</p>
          </div>
          {perms.create && (
            <button className="btn-primary" onClick={openCreate}>
              <i className="fas fa-plus"></i> New Coupon
            </button>
          )}
        </div>

        {/* Stats strip */}
        <div className="coupon-stats-strip">
          {[
            { icon: 'fa-ticket-alt', color: '#6366f1', bg: '#eef2ff', value: stats.total, label: 'Total Coupons' },
            { icon: 'fa-check-circle', color: '#10b981', bg: '#ecfdf5', value: stats.active, label: 'Active' },
            { icon: 'fa-clock', color: '#f59e0b', bg: '#fffbeb', value: stats.expired, label: 'Expired / Used up' },
          ].map((s, i) => (
            <div className="coupon-stat" key={i}>
              <div className="coupon-stat-icon" style={{ background: s.bg }}>
                <i className={`fas ${s.icon}`} style={{ color: s.color }}></i>
              </div>
              <div>
                <span className="coupon-stat-value">{s.value}</span>
                <span className="coupon-stat-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="coupon-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search coupons by code or description…"
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => handleFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="coupon-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading coupons…</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="coupon-empty">
            <i className="fas fa-ticket-alt"></i>
            <h3>No coupons found</h3>
            <p>Create your first coupon to offer discounts to customers.</p>
            {perms.create && (
              <button className="btn-primary" onClick={openCreate}>
                <i className="fas fa-plus"></i> Create Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="coupons-grid">
            {coupons.map(coupon => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && <CouponFormModal editData={editData} onClose={() => setShowForm(false)} onSaved={handleSaved} />}
      {deleteTarget && <DeleteModal coupon={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />}
    </AdminLayout>
  );
};

export default AdminCoupons;