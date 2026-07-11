'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import '@/styles/admin/AdminLogs.css';
import '@/styles/admin/AdminOrders.css';
import '@/styles/admin/AdminCategories.css';

const tok = () => localStorage.getItem('adminToken');

// ── Config ─────────────────────────────────────────────────────────────────────
const MODULE_META = {
  dashboard:      { label: 'Dashboard',       icon: 'fa-home',         color: '#6366f1' },
  users:          { label: 'Users',           icon: 'fa-users',        color: '#3b82f6' },
  products:       { label: 'Products',        icon: 'fa-box',          color: '#f59e0b' },
  categories:     { label: 'Categories',      icon: 'fa-tags',         color: '#10b981' },
  blogCategories: { label: 'Blog Categories', icon: 'fa-bookmark',     color: '#06b6d4' },
  orders:         { label: 'Orders',          icon: 'fa-shopping-cart',color: '#f97316' },
  coupons:        { label: 'Coupons',         icon: 'fa-tag',          color: '#8b5cf6' },
  blogs:          { label: 'Blogs',           icon: 'fa-newspaper',    color: '#ec4899' },
  managers:       { label: 'Managers',        icon: 'fa-user-shield',  color: '#ef4444' },
  auth:           { label: 'Auth',            icon: 'fa-key',          color: '#64748b' },
  other:          { label: 'Other',           icon: 'fa-circle',       color: '#9ca3af' },
};

const ACTION_META = {
  view:          { label: 'View',          icon: 'fa-eye',           color: '#3b82f6', bg: '#eff6ff'  },
  create:        { label: 'Create',        icon: 'fa-plus-circle',   color: '#10b981', bg: '#ecfdf5'  },
  edit:          { label: 'Edit',          icon: 'fa-edit',          color: '#f59e0b', bg: '#fef3c7'  },
  delete:        { label: 'Delete',        icon: 'fa-trash',         color: '#ef4444', bg: '#fef2f2'  },
  login:         { label: 'Login',         icon: 'fa-sign-in-alt',   color: '#10b981', bg: '#ecfdf5'  },
  logout:        { label: 'Logout',        icon: 'fa-sign-out-alt',  color: '#6b7280', bg: '#f9fafb'  },
  toggle_status: { label: 'Toggle Status', icon: 'fa-toggle-on',     color: '#f97316', bg: '#fff7ed'  },
  publish:       { label: 'Publish',       icon: 'fa-globe',         color: '#06b6d4', bg: '#ecfeff'  },
  archive:       { label: 'Archive',       icon: 'fa-archive',       color: '#8b5cf6', bg: '#f5f3ff'  },
  export:        { label: 'Export',        icon: 'fa-download',      color: '#64748b', bg: '#f8fafc'  },
  other:         { label: 'Other',         icon: 'fa-circle',        color: '#9ca3af', bg: '#f9fafb'  },
};

const fmtDateTime = (d) => new Date(d).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: true,
});
const fmtTime = (d) => new Date(d).toLocaleString('en-IN', {
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
});

// ── Log Row ────────────────────────────────────────────────────────────────────
const LogRow = ({ log, onExpand, expanded }) => {
  const mod = MODULE_META[log.module] || MODULE_META.other;
  const act = ACTION_META[log.action] || ACTION_META.other;
  const initials = log.adminName?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || '?';

  return (
    <>
      <tr
        className={`log-row ${expanded ? 'log-row-expanded' : ''} ${!log.success ? 'log-row-failed' : ''}`}
        onClick={() => onExpand(log._id)}
      >
        {/* Time */}
        <td className="log-td-time">
          <div className="log-time-main">{fmtDateTime(log.createdAt)}</div>
        </td>

        {/* Admin */}
        <td className="log-td-admin">
          <div className="log-admin-cell">
            <div className="log-avatar">{initials}</div>
            <div>
              <div className="log-admin-name">{log.adminName || '—'}</div>
              <div className="log-admin-role">{log.adminRole}</div>
            </div>
          </div>
        </td>

        {/* Module */}
        <td>
          <span className="log-module-badge" style={{ color: mod.color, background: mod.color + '18' }}>
            <i className={`fas ${mod.icon}`}></i> {mod.label}
          </span>
        </td>

        {/* Action */}
        <td>
          <span className="log-action-badge" style={{ color: act.color, background: act.bg }}>
            <i className={`fas ${act.icon}`}></i> {act.label}
          </span>
        </td>

        {/* Description */}
        <td className="log-td-desc">
          <span className={`log-desc ${!log.success ? 'log-desc-fail' : ''}`}>
            {!log.success && <i className="fas fa-exclamation-circle" style={{ color: '#ef4444', marginRight: 5 }}></i>}
            {log.description || '—'}
          </span>
          {log.targetName && <span className="log-target">→ {log.targetName}</span>}
        </td>

        {/* Expand arrow */}
        <td className="log-td-arrow">
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} log-expand-icon`}></i>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="log-detail-row">
          <td colSpan="6">
            <div className="log-detail-grid">
              {[
                { label: 'Path',       value: log.path        || '—', icon: 'fa-link'        },
                { label: 'Method',     value: log.method      || '—', icon: 'fa-code'        },
                { label: 'IP Address', value: log.ipAddress   || '—', icon: 'fa-map-marker-alt' },
                { label: 'Target ID',  value: log.targetId    || '—', icon: 'fa-fingerprint' },
                { label: 'Status',     value: log.success ? '✓ Success' : `✗ Failed: ${log.errorMessage}`, icon: log.success ? 'fa-check-circle' : 'fa-times-circle' },
                { label: 'Browser',    value: log.userAgent ? log.userAgent.slice(0, 80) + '…' : '—', icon: 'fa-globe' },
              ].map(({ label, value, icon }) => (
                <div className="log-detail-item" key={label}>
                  <span className="log-detail-label"><i className={`fas ${icon}`}></i> {label}</span>
                  <span className="log-detail-value" style={{ color: label === 'Status' && !log.success ? '#ef4444' : undefined }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Stats strip ────────────────────────────────────────────────────────────────
const StatsStrip = ({ logs }) => {
  const counts = logs.reduce((acc, l) => {
    acc[l.action] = (acc[l.action] || 0) + 1;
    return acc;
  }, {});

  const topActions = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="log-stats-strip">
      <div className="log-stat-item">
        <span className="log-stat-val">{logs.length}</span>
        <span className="log-stat-label">Shown</span>
      </div>
      {topActions.map(([action, count]) => {
        const m = ACTION_META[action] || ACTION_META.other;
        return (
          <div className="log-stat-item" key={action}>
            <span className="log-stat-val" style={{ color: m.color }}>{count}</span>
            <span className="log-stat-label">
              <i className={`fas ${m.icon}`}></i> {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminLogs = () => {
  const [logs,        setLogs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [adminList,   setAdminList]   = useState([]);
  const [expandedId,  setExpandedId]  = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [clearing,    setClearing]    = useState(false);

  const [filters, setFilters] = useState({
    adminId:  '',
    module:   '',
    action:   '',
    search:   '',
    dateFrom: '',
    dateTo:   '',
  });

  const debRef = useRef(null);

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem('adminData') || '{}');
      setIsSuperAdmin(d.role === 'super_admin');
    } catch {}
  }, []);

  const fetchLogs = async (f = filters, page = currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: 30,
        ...(f.adminId  && { adminId:  f.adminId  }),
        ...(f.module   && { module:   f.module   }),
        ...(f.action   && { action:   f.action   }),
        ...(f.search   && { search:   f.search   }),
        ...(f.dateFrom && { dateFrom: f.dateFrom }),
        ...(f.dateTo   && { dateTo:   f.dateTo   }),
      });

      const res  = await fetch(`/api/admin/logs?${params}`, {
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotal(data.total);
        if (data.adminList?.length) setAdminList(data.adminList);
      } else {
        toast.error(data.message || 'Failed to load logs');
      }
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleFilter = (key, val) => {
    const updated = { ...filters, [key]: val };
    setFilters(updated);
    setCurrentPage(1);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => fetchLogs(updated, 1), key === 'search' ? 400 : 0);
  };

  const handlePage = (p) => {
    setCurrentPage(p);
    fetchLogs(filters, p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  const handleClearLogs = async () => {
    if (!window.confirm('Clear all logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${tok()}` },
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); fetchLogs({ ...filters }, 1); }
      else toast.error(data.message);
    } catch { toast.error('Failed to clear logs'); }
    finally { setClearing(false); }
  };

  const handleExport = () => {
    const csv = [
      ['Time', 'Admin', 'Role', 'Module', 'Action', 'Description', 'Target', 'Path', 'IP', 'Status'],
      ...logs.map(l => [
        fmtDateTime(l.createdAt),
        l.adminName, l.adminRole,
        l.module, l.action,
        l.description, l.targetName,
        l.path, l.ipAddress,
        l.success ? 'Success' : 'Failed',
      ]),
    ].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    const empty = { adminId:'', module:'', action:'', search:'', dateFrom:'', dateTo:'' };
    setFilters(empty);
    setCurrentPage(1);
    fetchLogs(empty, 1);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  if (!isSuperAdmin) return (
    <AdminLayout>
      <div style={{ textAlign:'center', padding:'80px 20px' }}>
        <i className="fas fa-lock" style={{ fontSize:48, color:'#ef4444', marginBottom:16, display:'block' }}></i>
        <h2>Access Denied</h2>
        <p style={{ color:'#6b7280' }}>Only Super Admins can view activity logs.</p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="admin-logs-page">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Activity Logs</h1>
            <p>Track every action taken by admin accounts — {total.toLocaleString()} total entries</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-secondary" onClick={handleExport} title="Export as CSV">
              <i className="fas fa-download"></i> Export CSV
            </button>
            <button className="btn-danger" onClick={handleClearLogs} disabled={clearing}>
              {clearing
                ? <><i className="fas fa-spinner fa-spin"></i> Clearing…</>
                : <><i className="fas fa-trash"></i> Clear All</>}
            </button>
          </div>
        </div>

        {/* Stats */}
        {logs.length > 0 && <StatsStrip logs={logs} />}

        {/* Filters */}
        <div className="log-filters">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text" placeholder="Search description, target, admin name…"
              value={filters.search}
              onChange={e => handleFilter('search', e.target.value)}
            />
          </div>

          <select className="filter-select" value={filters.adminId}
            onChange={e => handleFilter('adminId', e.target.value)}>
            <option value="">All Admins</option>
            {adminList.map(a => (
              <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
            ))}
          </select>

          <select className="filter-select" value={filters.module}
            onChange={e => handleFilter('module', e.target.value)}>
            <option value="">All Modules</option>
            {Object.entries(MODULE_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select className="filter-select" value={filters.action}
            onChange={e => handleFilter('action', e.target.value)}>
            <option value="">All Actions</option>
            {Object.entries(ACTION_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <input type="date" className="filter-select log-date-input"
            value={filters.dateFrom}
            onChange={e => handleFilter('dateFrom', e.target.value)}
            title="From date" />
          <input type="date" className="filter-select log-date-input"
            value={filters.dateTo}
            onChange={e => handleFilter('dateTo', e.target.value)}
            title="To date" />

          {hasFilters && (
            <button className="btn-secondary log-reset-btn" onClick={resetFilters}>
              <i className="fas fa-times"></i> Reset
            </button>
          )}
        </div>

        {/* Table */}
        <div className="log-table-wrap">
          {loading ? (
            <div className="admin-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>Loading logs…</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="no-data" style={{ padding: '60px 20px' }}>
              <i className="fas fa-history"></i>
              <p>{hasFilters ? 'No logs match your filters.' : 'No activity logs yet.'}</p>
            </div>
          ) : (
            <table className="log-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Admin</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th style={{ width: 32 }}></th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <LogRow
                    key={log._id}
                    log={log}
                    expanded={expandedId === log._id}
                    onExpand={handleExpand}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => handlePage(currentPage - 1)}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span>Page {currentPage} of {totalPages} ({total.toLocaleString()} entries)</span>
            <button disabled={currentPage === totalPages} onClick={() => handlePage(currentPage + 1)}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLogs;