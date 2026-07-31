'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminLayout.css';

// ── Permission check helper ────────────────────────────────────────────────────
// Returns true if the current admin can access the given module+action
export const useCan = (module, action = 'view') => {
  const [allowed, setAllowed] = useState(true); // default true to avoid flash
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('adminData') || '{}');
      if (data.role === 'super_admin') { setAllowed(true); return; }
      setAllowed(Boolean(data.permissions?.[module]?.[action]));
    } catch { setAllowed(false); }
  }, [module, action]);
  return allowed;
};

// ── Inline permission guard ────────────────────────────────────────────────────
export const PermissionGuard = ({ module, action = 'view', children, fallback }) => {
  const allowed = useCan(module, action);
  if (!allowed) return fallback || (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <i className="fas fa-lock" style={{ fontSize: 48, color: '#ef4444', marginBottom: 16, display: 'block' }}></i>
      <h2 style={{ color: '#1a1a1a' }}>Access Denied</h2>
      <p style={{ color: '#6b7280' }}>You don't have permission to view this section.</p>
    </div>
  );
  return children;
};

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminDataStr = localStorage.getItem('adminData');
    if (!adminToken) { router.push('/admin/login'); return; }
    if (adminDataStr) {
      try { setAdminData(JSON.parse(adminDataStr)); } catch { }
    }
  }, []);

  // Refresh adminData when it changes (e.g. after profile update)
  useEffect(() => {
    const handler = () => {
      try {
        const d = localStorage.getItem('adminData');
        if (d) setAdminData(JSON.parse(d));
      } catch { }
    };
    window.addEventListener('adminDataChanged', handler);
    return () => window.removeEventListener('adminDataChanged', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  useEffect(() => {
    const handler = (e) => {
      if (profileMenuOpen && !e.target.closest('.admin-profile')) setProfileMenuOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [profileMenuOpen]);

  const isSuperAdmin = adminData.role === 'super_admin';
  const perms = adminData.permissions || {};

  // Whether to show a nav link (super_admin sees everything)
  const canSee = (module) => isSuperAdmin || Boolean(perms[module]?.view);

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {sidebarOpen && <span>Cocofina Admin</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fas fa-angle-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard — always visible */}
          <Link href="/admin/dashboard"
            className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
            <i className="fas fa-home"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          {canSee('users') && (
            <Link href="/admin/users"
              className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}>
              <i className="fas fa-users"></i>
              {sidebarOpen && <span>Users</span>}
            </Link>
          )}

          {canSee('categories') && (
            <Link href="/admin/categories"
              className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`}>
              <i className="fas fa-tags"></i>
              {sidebarOpen && <span>Categories</span>}
            </Link>
          )}

          {canSee('blogCategories') && (
            <Link href="/admin/blogcategories"
              className={`nav-item ${isActive('/admin/blogcategories') ? 'active' : ''}`}>
              <i className="fas fa-bookmark"></i>
              {sidebarOpen && <span>Blog Categories</span>}
            </Link>
          )}

          {canSee('products') && (
            <Link href="/admin/products"
              className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`}>
              <i className="fas fa-box"></i>
              {sidebarOpen && <span>Products</span>}
            </Link>
          )}

          {canSee('coupons') && (
            <Link href="/admin/coupons"
              className={`nav-item ${isActive('/admin/coupons') ? 'active' : ''}`}>
              <i className="fas fa-tag"></i>
              {sidebarOpen && <span>Coupons</span>}
            </Link>
          )}

          {canSee('orders') && (
            <Link href="/admin/orders"
              className={`nav-item ${isActive('/admin/orders') ? 'active' : ''}`}>
              <i className="fas fa-shopping-cart"></i>
              {sidebarOpen && <span>Orders</span>}
            </Link>
          )}

          {canSee('blogs') && (
            <Link href="/admin/blogs"
              className={`nav-item ${isActive('/admin/blogs') ? 'active' : ''}`}>
              <i className="fas fa-newspaper"></i>
              {sidebarOpen && <span>Blogs</span>}
            </Link>
          )}

          {canSee('recipes') && (
            <Link href="/admin/recipes"
              className={`nav-item ${isActive('/admin/recipes') ? 'active' : ''}`}>
              <i className="fas fa-utensils"></i>
              {sidebarOpen && <span>Recipes</span>}
            </Link>
          )}

          {/* Admin Management — super_admin only */}
          {isSuperAdmin && (
            <Link href="/admin/managers"
              className={`nav-item ${isActive('/admin/managers') ? 'active' : ''}`}>
              <i className="fas fa-user-shield"></i>
              {sidebarOpen && <span>Admin Managers</span>}
            </Link>
          )}

          {isSuperAdmin && (
            <Link href="/admin/logs" className={`nav-item ${isActive('/admin/logs') ? 'active' : ''}`}>
              <i className="fas fa-history"></i>
              {sidebarOpen && <span>Activity Logs</span>}
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <i className="fas fa-bars"></i>
            </button>
            <div className="breadcrumb">
              <i className="fas fa-home"></i>
              <span>{pathname.split('/').filter(Boolean).join(' / ')}</span>
            </div>
          </div>

          <div className="header-right">
            {/* Role badge */}
            {adminData.role && (
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                background: isSuperAdmin ? '#fef3c7' : '#eff6ff',
                color: isSuperAdmin ? '#92400e' : '#1e40af',
                marginRight: 10,
              }}>
                {isSuperAdmin ? '👑 Super Admin' : adminData.role}
              </span>
            )}

            <div className="admin-profile">
              <button className="profile-btn" onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                <div className="profile-avatar">
                  {adminData.profile
                    ? <img src={getUploadUrl(adminData.profile, 'profiles')} alt={adminData.fullName} />
                    : <i className="fas fa-user"></i>
                  }
                </div>
                <div className="profile-info">
                  <span className="profile-name">{adminData.fullName}</span>
                  <span className="profile-role">{adminData.role || 'Admin'}</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link href="/admin/profile" className="dropdown-item">
                    <i className="fas fa-user"></i> My Profile
                  </Link>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;