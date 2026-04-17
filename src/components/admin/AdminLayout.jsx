'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '@/styles/admin/AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [adminData, setAdminData] = useState({});
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem('adminToken');
    const adminDataStr = localStorage.getItem('adminData');
    
    if (!adminToken) {
      router.push('/admin/login');
      return;
    }
    
    if (adminDataStr) {
      setAdminData(JSON.parse(adminDataStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    router.push('/admin/login');
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuOpen && !event.target.closest('.admin-profile')) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileMenuOpen]);

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {sidebarOpen && <span>Cocofina Admin</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`fas fa-${sidebarOpen ? 'angle-left' : 'angle-right'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link
            href="/admin/dashboard"
            className={`nav-item ${isActive('/admin') && !pathname.includes('/admin/') ? 'active' : ''}`}
          >
            <i className="fas fa-home"></i>
            {sidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            href="/admin/users"
            className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <i className="fas fa-users"></i>
            {sidebarOpen && <span>Users</span>}
          </Link>

          <Link
            href="/admin/categories"
            className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`}
          >
            <i className="fas fa-tags"></i>
            {sidebarOpen && <span>Categories</span>}
          </Link>

          <Link
            href="/admin/blogcategories"
            className={`nav-item ${isActive('/admin/blogcategories') ? 'active' : ''}`}
          >
            <i className="fas fa-tags"></i>
            {sidebarOpen && <span>Blog Categories</span>}
          </Link>

          <Link
            href="/admin/products"
            className={`nav-item ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <i className="fas fa-box"></i>
            {sidebarOpen && <span>Products</span>}
          </Link>

          <Link
            href="/admin/coupons"
            className={`nav-item ${isActive('/admin/coupons') ? 'active' : ''}`}
          >
            <i className="fas fa-tag"></i>
            {sidebarOpen && <span>Coupons</span>}
          </Link>

          <Link
            href="/admin/orders"
            className={`nav-item ${isActive('/admin/orders') ? 'active' : ''}`}
          >
            <i className="fas fa-shopping-cart"></i>
            {sidebarOpen && <span>Orders</span>}
          </Link>

          <Link
            href="/admin/blogs"
            className={`nav-item ${isActive('/admin/blogs') ? 'active' : ''}`}
          >
            <i className="fas fa-newspaper"></i>
            {sidebarOpen && <span>Blogs</span>}
          </Link>
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
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div className="breadcrumb">
              <i className="fas fa-home"></i>
              <span>
                {pathname.split('/').filter(Boolean).join(' / ')}
              </span>
            </div>
          </div>

          <div className="header-right">
            <div className="admin-profile">
              <button
                className="profile-btn"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div className="profile-avatar">
                  {adminData.profile ? (
                    <img src={adminData.profile} alt={adminData.firstName} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="profile-info">
                  <span className="profile-name">
                    {adminData.firstName} {adminData.lastName}
                  </span>
                  <span className="profile-role">{adminData.role || 'Admin'}</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>

              {profileMenuOpen && (
                <div className="profile-dropdown">
                  <Link href="/admin/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    My Profile
                  </Link>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;