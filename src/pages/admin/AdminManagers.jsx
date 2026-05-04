'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import '@/styles/admin/AdminManagers.css';
import '@/styles/admin/AdminOrders.css';
import '@/styles/admin/AdminCategories.css';

const tok = () => localStorage.getItem('adminToken');

const req = async (method, url, body) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

// ── All modules + their label ──────────────────────────────────────────────────
const MODULES = [
  { key: 'dashboard',      label: 'Dashboard',        icon: 'fa-home'          },
  { key: 'users',          label: 'Users',            icon: 'fa-users'         },
  { key: 'products',       label: 'Products',         icon: 'fa-box'           },
  { key: 'categories',     label: 'Categories',       icon: 'fa-tags'          },
  { key: 'orders',         label: 'Orders',           icon: 'fa-shopping-cart' },
  { key: 'coupons',        label: 'Coupons',          icon: 'fa-tag'           },
  { key: 'blogs',          label: 'Blogs',            icon: 'fa-newspaper'     },
  { key: 'blogCategories', label: 'Blog Categories',  icon: 'fa-newspaper'     },
];

const ACTIONS = ['view', 'create', 'edit', 'delete'];

const defaultPermissions = () =>
  Object.fromEntries(MODULES.map(m => [m.key, { view: false, create: false, edit: false, delete: false }]));

// ── Permission matrix editor ───────────────────────────────────────────────────
const PermissionMatrix = ({ permissions, onChange, disabled }) => {
  const toggle = (module, action) => {
    const updated = {
      ...permissions,
      [module]: { ...permissions[module], [action]: !permissions[module]?.[action] },
    };
    // If disabling view, disable all others too
    if (action === 'view' && !permissions[module]?.view === false) {
      updated[module] = { view: false, create: false, edit: false, delete: false };
    }
    // If enabling create/edit/delete, auto-enable view
    if (action !== 'view' && !permissions[module]?.[action]) {
      updated[module].view = true;
    }
    onChange(updated);
  };

  const toggleAll = (module) => {
    const all = ACTIONS.every(a => permissions[module]?.[a]);
    onChange({
      ...permissions,
      [module]: { view: !all, create: !all, edit: !all, delete: !all },
    });
  };

  const toggleColumn = (action) => {
    const allOn = MODULES.every(m => permissions[m.key]?.[action]);
    const updated = { ...permissions };
    MODULES.forEach(m => {
      updated[m.key] = { ...updated[m.key], [action]: !allOn };
      if (!allOn && action !== 'view') updated[m.key].view = true;
    });
    onChange(updated);
  };

  return (
    <div className="pm-wrap">
      <table className="pm-table">
        <thead>
          <tr>
            <th className="pm-module-col">Module</th>
            {ACTIONS.map(a => (
              <th key={a} className="pm-action-col">
                <div className="pm-action-header">
                  <span>{a.charAt(0).toUpperCase() + a.slice(1)}</span>
                  {!disabled && (
                    <button type="button" className="pm-col-toggle"
                      onClick={() => toggleColumn(a)} title={`Toggle all ${a}`}>
                      <i className="fas fa-adjust"></i>
                    </button>
                  )}
                </div>
              </th>
            ))}
            {!disabled && <th className="pm-all-col">All</th>}
          </tr>
        </thead>
        <tbody>
          {MODULES.map(mod => {
            const modPerms = permissions[mod.key] || {};
            const allChecked = ACTIONS.every(a => modPerms[a]);
            return (
              <tr key={mod.key} className={`pm-row ${modPerms.view ? 'pm-row-active' : ''}`}>
                <td className="pm-module-name">
                  <i className={`fas ${mod.icon}`}></i>
                  <span>{mod.label}</span>
                </td>
                {ACTIONS.map(action => (
                  <td key={action} className="pm-check-cell">
                    <label className="pm-checkbox">
                      <input
                        type="checkbox"
                        checked={Boolean(modPerms[action])}
                        onChange={() => !disabled && toggle(mod.key, action)}
                        disabled={disabled}
                      />
                      <span className="pm-checkmark"></span>
                    </label>
                  </td>
                ))}
                {!disabled && (
                  <td className="pm-all-cell">
                    <button type="button"
                      className={`pm-all-btn ${allChecked ? 'pm-all-on' : ''}`}
                      onClick={() => toggleAll(mod.key)}>
                      {allChecked ? 'None' : 'All'}
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Create/Edit Modal ──────────────────────────────────────────────────────────
const AdminFormModal = ({ editData, onClose, onSaved }) => {
  const isEdit = Boolean(editData?._id);
  const [form, setForm] = useState({
    fullName:    editData?.fullName    || '',
    email:       editData?.email       || '',
    password:    '',
    role:        editData?.role        || 'admin',
    isActive:    editData?.isActive    ?? true,
    permissions: editData?.permissions || defaultPermissions(),
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) { setError('Name and email are required'); return; }
    if (!isEdit && form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (isEdit && form.password && form.password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setSaving(true);
    setError('');
    try {
      const body = {
        fullName:    form.fullName.trim(),
        email:       form.email.trim(),
        role:        form.role,
        permissions: form.permissions,
        isActive:    form.isActive,
      };
      if (form.password) body[isEdit ? 'newPassword' : 'password'] = form.password;

      const data = isEdit
        ? await req('PUT',  `/api/admin/managers/${editData._id}`, body)
        : await req('POST', '/api/admin/managers', body);

      if (data.success) {
        toast.success(isEdit ? 'Admin updated!' : 'Admin created!');
        onSaved();
      } else {
        setError(data.message || 'Failed to save');
      }
    } catch { setError('Server error. Please try again.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="am-modal" onClick={e => e.stopPropagation()}>
        <div className="am-modal-header">
          <h2>{isEdit ? 'Edit Admin' : 'Create New Admin'}</h2>
          <button className="am-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <form className="am-modal-body" onSubmit={handleSubmit}>
          {error && <div className="am-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}

          <div className="am-section-title">Basic Information</div>
          <div className="am-row">
            <div className="am-field">
              <label>Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleInput} placeholder="John Deo" required />
            </div>
            <div className="am-field">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleInput} placeholder="admin@example.com" required />
            </div>
          </div>
          <div className="am-row">
            <div className="am-field">
              <label>{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input type="password" name="password" value={form.password} onChange={handleInput}
                placeholder={isEdit ? 'Leave blank to keep current' : 'Min 8 characters'}
                required={!isEdit} minLength={isEdit ? undefined : 8} />
            </div>
            <div className="am-field">
              <label>Role</label>
              <select name="role" value={form.role} onChange={handleInput}>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          </div>
          <label className="am-active-toggle">
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInput} />
            <span>Account Active</span>
          </label>

          {/* Permission matrix */}
          <div className="am-section-title" style={{ marginTop: 20 }}>
            <i className="fas fa-shield-alt"></i> Module Permissions
            <span className="am-section-hint">Enabling create/edit/delete auto-enables View</span>
          </div>
          <PermissionMatrix
            permissions={form.permissions}
            onChange={(p) => setForm(prev => ({ ...prev, permissions: p }))}
            disabled={false}
          />

          <div className="am-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving
                ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                : <><i className="fas fa-save"></i> {isEdit ? 'Update Admin' : 'Create Admin'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── View Permissions Modal ─────────────────────────────────────────────────────
const ViewPermissionsModal = ({ admin, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="am-modal" onClick={e => e.stopPropagation()}>
      <div className="am-modal-header">
        <h2>Permissions — {admin.fullName}</h2>
        <button className="am-close" onClick={onClose}><i className="fas fa-times"></i></button>
      </div>
      <div className="am-modal-body">
        {admin.role === 'super_admin' ? (
          <div className="am-super-badge">
            <i className="fas fa-crown"></i>
            <p>Super Admin — has full access to everything</p>
          </div>
        ) : (
          <PermissionMatrix permissions={admin.permissions || {}} onChange={() => {}} disabled />
        )}
        <div className="am-modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminManagers = () => {
  const [admins,       setAdmins]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [editData,     setEditData]     = useState(null);
  const [viewAdmin,    setViewAdmin]    = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const debRef = useRef(null);

  useEffect(() => {
    // Check if current user is super_admin
    const data = localStorage.getItem('adminData');
    if (data) {
      try { setIsSuperAdmin(JSON.parse(data)?.role === 'super_admin'); } catch {}
    }
  }, []);

  const fetchAdmins = async (search = searchTerm) => {
    setLoading(true);
    const data = await req('GET', `/api/admin/managers?search=${encodeURIComponent(search)}&limit=50`);
    if (data.success) setAdmins(data.admins);
    else toast.error(data.message || 'Failed to load admins');
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleSearch = (val) => {
    setSearchTerm(val);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => fetchAdmins(val), 400);
  };

  const handleToggleActive = async (admin) => {
    const data = await req('PUT', `/api/admin/managers/${admin._id}`, { isActive: !admin.isActive });
    if (data.success) {
      toast.success(`Admin ${data.admin.isActive ? 'activated' : 'deactivated'}`);
      setAdmins(prev => prev.map(a => a._id === admin._id ? { ...a, isActive: !a.isActive } : a));
    } else {
      toast.error(data.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const data = await req('DELETE', `/api/admin/managers/${deleteTarget._id}`);
    if (data.success) { toast.success('Admin deleted'); setDeleteTarget(null); fetchAdmins(); }
    else toast.error(data.message);
    setDeleting(false);
  };

  const openEdit = async (admin) => {
    const data = await req('GET', `/api/admin/managers/${admin._id}`);
    if (data.success) { setEditData(data.admin); setShowForm(true); }
    else toast.error('Failed to load admin');
  };

  const handleSaved = () => { setShowForm(false); setEditData(null); fetchAdmins(); };

  const roleColors = {
    super_admin: { bg: '#fef3c7', color: '#92400e' },
    admin:       { bg: '#eff6ff', color: '#1e40af' },
    moderator:   { bg: '#f5f3ff', color: '#4c1d95' },
  };

  if (!isSuperAdmin) return (
    <AdminLayout>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <i className="fas fa-lock" style={{ fontSize: 48, color: '#ef4444', marginBottom: 16 }}></i>
        <h2>Access Denied</h2>
        <p style={{ color: '#6b7280' }}>Only Super Admins can manage admin accounts.</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="admin-managers">

        <div className="page-header">
          <div>
            <h1>Admin Management</h1>
            <p>Create and manage admin accounts with custom permissions</p>
          </div>
          <button className="btn-primary" onClick={() => { setEditData(null); setShowForm(true); }}>
            <i className="fas fa-user-plus"></i> Add Admin
          </button>
        </div>

        {/* Controls */}
        <div className="orders-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search by name or email…"
              value={searchTerm} onChange={e => handleSearch(e.target.value)} />
          </div>
        </div>

        {/* Table */}
        <div className="orders-table-container">
          {loading ? (
            <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i><p>Loading…</p></div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Admin</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Permissions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr><td colSpan="7" className="no-data">
                    <i className="fas fa-user-shield"></i>
                    <p>No sub-admins yet. Create one to get started.</p>
                  </td></tr>
                ) : admins.map(admin => {
                  const rc = roleColors[admin.role] || roleColors.admin;
                  const moduleCount = admin.role === 'super_admin'
                    ? MODULES.length
                    : MODULES.filter(m => admin.permissions?.[m.key]?.view).length;
                  return (
                    <tr key={admin._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b2a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {admin.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600 }}>{admin.fullName}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: '#555' }}>{admin.email}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, background: rc.bg, color: rc.color }}>
                          {admin.role === 'super_admin' ? '👑 Super Admin' : admin.role === 'admin' ? 'Admin' : 'Moderator'}
                        </span>
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: admin.isActive ? '#ecfdf5' : '#fef2f2', color: admin.isActive ? '#10b981' : '#ef4444' }}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button className="am-perm-badge" onClick={() => setViewAdmin(admin)}>
                          <i className="fas fa-shield-alt"></i>
                          {admin.role === 'super_admin' ? 'Full Access' : `${moduleCount}/${MODULES.length} modules`}
                        </button>
                      </td>
                      <td style={{ fontSize: 12, color: '#888' }}>
                        {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div className="action-buttons-a">
                          <button className="btn-action-c btn-view" title="View permissions" onClick={() => setViewAdmin(admin)}>
                            <i className="fas fa-eye"></i>
                          </button>
                          {admin.role !== 'super_admin' && (
                            <>
                              <button className="btn-action-c btn-edit" title="Edit" onClick={() => openEdit(admin)}>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className={`btn-action-c ${admin.isActive ? 'btn-toggle-on' : 'btn-toggle-off'}`}
                                title={admin.isActive ? 'Deactivate' : 'Activate'}
                                onClick={() => handleToggleActive(admin)}
                              >
                                <i className={`fas fa-toggle-${admin.isActive ? 'on' : 'off'}`}></i>
                              </button>
                              <button className="btn-action-c btn-delete" title="Delete" onClick={() => setDeleteTarget(admin)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <AdminFormModal
          editData={editData}
          onClose={() => { setShowForm(false); setEditData(null); }}
          onSaved={handleSaved}
        />
      )}
      {viewAdmin && <ViewPermissionsModal admin={viewAdmin} onClose={() => setViewAdmin(null)} />}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Admin</h2>
              <button className="close-btn" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to delete <strong>{deleteTarget.fullName}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash"></i> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminManagers;