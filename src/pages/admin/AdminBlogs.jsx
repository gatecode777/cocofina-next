'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminBlogs.css';
import '@/styles/admin/AdminOrders.css';

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: false, create: false, edit: false, delete: false };
  } catch { return {}; }
};

// ── Helper functions ──────────────────────────────────────────────────────────
const tok = () => localStorage.getItem('adminToken');

const req = async (method, url, body, isFormData = false) => {
  const headers = { Authorization: `Bearer ${tok()}` };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const res = await fetch(url, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  return res.json();
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const STATUS_COLORS = {
  published: { color: '#10b981', bg: '#ecfdf5' },
  draft: { color: '#f59e0b', bg: '#fef3c7' },
  archived: { color: '#6b7280', bg: '#f9fafb' },
};

// ══════════════════════════════════════════════════════════════════════════════
//  AdminBlogs — list + stats + delete + quick-status
// ══════════════════════════════════════════════════════════════════════════════
const AdminBlogs = () => {
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debRef = useRef(null);
  const [perms, setPerms] = useState({});

  useEffect(() => {
    setPerms(getAdminPerms('blogs'));
  }, []);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => fetchBlogs(), 350);
  }, [searchTerm, filterStatus, currentPage]);

  const fetchStats = async () => {
    const d = await req('GET', '/api/admin/blogs/stats');
    if (d.success) setStats(d.stats);
  };

  const fetchBlogs = async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: currentPage, limit: 10 });
    if (searchTerm) p.set('search', searchTerm);
    if (filterStatus !== 'all') p.set('status', filterStatus);
    const d = await req('GET', `/api/admin/blogs?${p}`);
    if (d.success) { setBlogs(d.blogs); setTotalPages(d.totalPages || 1); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const d = await req('DELETE', `/api/admin/blogs/${deleteTarget._id}`);
    if (d.success) { toast.success('Blog deleted'); setDeleteTarget(null); fetchBlogs(); fetchStats(); }
    else toast.error(d.message || 'Delete failed');
    setDeleting(false);
  };

  const handleStatusChange = async (id, status) => {
    const d = await req('PUT', `/api/admin/blogs/${id}/status`, { status });
    if (d.success) { toast.success(d.message); fetchBlogs(); fetchStats(); }
    else toast.error(d.message);
  };

  const handleToggleFeatured = async (id) => {
    const d = await req('PUT', `/api/admin/blogs/${id}/toggle-featured`);
    if (d.success) { toast.success(d.message); fetchBlogs(); fetchStats(); }
  };

  const STAT_CARDS = stats ? [
    { icon: 'fa-newspaper', iconColor: '#6366f1', iconBg: '#eef2ff', value: stats.total, label: 'Total Blogs' },
    { icon: 'fa-check-circle', iconColor: '#10b981', iconBg: '#ecfdf5', value: stats.published, label: 'Published' },
    { icon: 'fa-pencil', iconColor: '#f59e0b', iconBg: '#fef3c7', value: stats.drafts, label: 'Drafts' },
    { icon: 'fa-star', iconColor: '#f97316', iconBg: '#fff7ed', value: stats.featured, label: 'Featured' },
  ] : [];

  return (
    <AdminLayout>
      <div className="admin-blogs">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Blog Management</h1>
            <p>Create, edit and manage your blog posts</p>
          </div>
          {perms.create && (
            <button className="btn-primary" onClick={() => router.push('/admin/blogs/new')}>
              <i className="fas fa-plus"></i> New Blog Post
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="ab-stats-grid">
            {STAT_CARDS.map((s, i) => (
              <div className="ab-stat-card" key={i}>
                <div className="ab-stat-icon" style={{ background: s.iconBg }}>
                  <i className={`fas ${s.icon}`} style={{ color: s.iconColor }}></i>
                </div>
                <div>
                  <span className="ab-stat-value">{typeof s.value === 'number' ? s.value.toLocaleString('en-IN') : s.value}</span>
                  <span className="ab-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="orders-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search blogs by title, tag…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
          </div>
          <select className="filter-select" value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="orders-table-container">
          {loading ? (
            <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i><p>Loading…</p></div>
          ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr><td colSpan="8" className="no-data"><i className="fas fa-newspaper"></i><p>No blogs found</p></td></tr>
                ) : blogs.map((b) => {
                  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.draft;
                  return (
                    <tr key={b._id}>
                      <td>
                        <div className="ab-cover-thumb">
                          {b.coverImage
                            ? <img src={getUploadUrl(b.coverImage, 'blogs')} alt={b.title} onError={(e) => { e.target.style.display = 'none'; }} />
                            : <i className="fas fa-image" style={{ color: '#ccc', fontSize: 20 }}></i>
                          }
                        </div>
                      </td>
                      <td>
                        <div className="ab-title-cell">
                          <strong>{b.title}</strong>
                          {b.excerpt && <small>{b.excerpt.slice(0, 60)}{b.excerpt.length > 60 ? '…' : ''}</small>}
                        </div>
                      </td>
                      <td>
                        {b.category
                          ? <span className="ab-cat-badge">{b.category.name}</span>
                          : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td>
                        <div className="ab-author-cell">
                          {b.author?.image
                            ? <img src={getUploadUrl(b.author.image, 'profiles')} alt={b.author.name}
                              className="ab-author-avatar" onError={(e) => { e.target.style.display = 'none'; }} />
                            : <div className="ab-author-initials">{b.author?.name?.[0] || '?'}</div>
                          }
                          <span>{b.author?.name || '—'}</span>
                        </div>
                      </td>
                      {perms.edit ? (
                      <td>
                        <select
                          className="ab-status-select"
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          style={{ color: sc.color, background: sc.bg, borderColor: sc.color + '50' }}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      ) : (
                      <td>
                        <span style={{ color: sc.color, background: sc.bg, padding: '4px 8px', borderRadius: 4 }}>
                          {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                        </span>
                      </td>
                      )}
                      <td style={{ textAlign: 'center' }}>
                        <button className={`ab-star-btn ${b.isFeatured ? 'starred' : ''}`}
                          onClick={() => handleToggleFeatured(b._id)} title={b.isFeatured ? 'Unfeature' : 'Feature'}>
                          <i className={`fa${b.isFeatured ? 's' : 'r'} fa-star`}></i>
                        </button>
                      </td>
                      <td><small style={{ color: '#888' }}>{fmtDate(b.publishedAt || b.createdAt)}</small></td>
                      <td>
                        <div className="action-buttons-a">
                          {perms.view && (
                            <button className="btn-action btn-view"
                              onClick={() => window.open(`/blog/${b.slug}`, '_blank')} title="Preview">
                              <i className="fas fa-eye"></i>
                            </button>
                          )}
                          {perms.edit && (
                            <button className="btn-action btn-edit"
                              onClick={() => router.push(`/admin/blogs/edit/${b._id}`)} title="Edit">
                              <i className="fas fa-edit"></i>
                            </button>
                          )}
                          {perms.delete && (
                            <button className="btn-action btn-delete"
                              onClick={() => setDeleteTarget(b)} title="Delete">
                              <i className="fas fa-trash"></i>
                            </button>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Blog Post</h2>
              <button className="close-btn" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ textAlign: 'center', padding: '16px 0' }}>
                Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?
                <br /><span style={{ color: '#888', fontSize: '13px' }}>This action cannot be undone.</span>
              </p>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn-danger-confirm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><i className="fas fa-spinner fa-spin"></i> Deleting…</> : <><i className="fas fa-trash"></i> Delete</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBlogs;