'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userAuth, orderAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import { Navbar } from '@/components/Navbar';
import '@/styles/myprofile.css';

const getAvatarUrl = (filename) => filename ? getUploadUrl(filename, 'profiles') : null;

const AccountPage = () => {
  const router = useRouter();

  // ── State ────────────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'edit' | 'password'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Edit profile form
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Change password form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [passErrors, setPassErrors] = useState({});

  // ── Fetch profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    document.title = 'My Account - Cocofina';
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUser(u);
        setProfileForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
        setLoading(false);
      } catch (e) {}
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAuth.getProfile();
      if (res.data.success) {
        const u = res.data.user;
        setUser(u);
        setProfileForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '' });
      }
    } catch (err) {
      if (err.response?.status === 401) router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  // ── Close delete modal on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowDeleteModal(false);
        document.body.style.overflow = 'auto';
      }
    };
    if (showDeleteModal) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDeleteModal]);

  // ── Image handling ───────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB'); return; }
    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImagePreview = () => {
    setProfileImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Update profile ───────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileMsg({ type: 'error', text: 'First and last name are required' });
      return;
    }
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const fd = new FormData();
      fd.append('firstName', profileForm.firstName.trim());
      fd.append('lastName', profileForm.lastName.trim());
      fd.append('phone', profileForm.phone.replace(/\D/g, ''));
      if (profileImage) fd.append('profile', profileImage);

      const data = await userAuth.updateProfile(fd);
      if (data.success) {
        const updated = data.user;
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
        window.dispatchEvent(new Event('userAuthChanged'));
        setProfileImage(null);
        setImagePreview(null);
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => { setProfileMsg({ type: '', text: '' }); setCurrentView('dashboard'); }, 1800);
      } else {
        setProfileMsg({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────────
  const validatePass = () => {
    const e = {};
    if (!passForm.currentPassword) e.currentPassword = 'Current password is required';
    if (!passForm.newPassword) e.newPassword = 'New password is required';
    else if (passForm.newPassword.length < 6) e.newPassword = 'Minimum 6 characters';
    if (!passForm.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (passForm.newPassword !== passForm.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setPassErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (!validatePass()) return;
    setPassSaving(true);
    setPassMsg({ type: '', text: '' });
    try {
      const res = await userAuth.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      if (res.data.success) {
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPassMsg({ type: 'success', text: 'Password updated successfully!' });
        setTimeout(() => { setPassMsg({ type: '', text: '' }); setCurrentView('dashboard'); }, 2000);
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPassSaving(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try { await userAuth.logout(); } catch { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userAuthChanged'));
    router.push('/');
  };

  const showView = (v) => { setCurrentView(v); window.scrollTo(0, 0); };
  const getAvatar = () => user?.profile ? getAvatarUrl(user.profile) : null;
  const initials = () => `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (!mounted || loading) return (
    <div className="account-page-wrapper">
      <div className="acc-loading">
        <div className="acc-spinner"></div>
        <p>Loading your account…</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <Navbar />
      <div className="my-account-wrapper">
        <div className="account-page-wrapper">

        {/* ── DASHBOARD ─────────────────────────────────────────────────────────── */}
        {currentView === 'dashboard' && (
          <>
            <div className="account-header">
              <div className="title-section">
                <h1>My Account</h1>
                <p>Manage your profile, orders, and account settings.</p>
              </div>
              <div className="account-header-actions">
                <button
                  onClick={() => router.push('/')}
                  className="btn-back-to-store"
                >
                  ← Back to Store
                </button>
                <button className="btn-logout" onClick={handleLogout}>Log Out</button>
              </div>
            </div>

            <div className="account-overview-card">
              <p className="section-label">Account Overview</p>
              <div className="user-profile-info">
                <div className="user-main">
                  <div className="avatar">
                    {getAvatar()
                      ? <img src={getAvatar()} alt={user.firstName} onError={(e) => { e.target.style.display = 'none'; }} />
                      : <span className="avatar-initials">{initials()}</span>
                    }
                  </div>
                  <div className="user-details-m">
                    <h3>{user?.firstName} {user?.lastName}</h3>
                    <p><i className="fas fa-envelope"></i> {user?.email}</p>
                    {user?.phone && <p><i className="fas fa-phone-alt"></i> +91-{user.phone}</p>}
                  </div>
                </div>
                <button className="btn-edit" onClick={() => showView('edit')}>Edit Profile</button>
              </div>

              <div className="action-cards-grid">
                <div className="action-card-m clickable" onClick={() => router.push('/my-orders')}>
                  <div className="icon-box orange"><i className="fas fa-shopping-bag"></i></div>
                  <div className="card-text"><h4>My Orders</h4><p>View and Track Orders</p></div>
                </div>
                <div className="action-card-m clickable" onClick={() => router.push('/addresses')}>
                  <div className="icon-box gold"><i className="fas fa-address-book"></i></div>
                  <div className="card-text"><h4>Address Book</h4><p>Manage Addresses</p></div>
                </div>
                <div className="action-card-m clickable" onClick={() => showView('password')}>
                  <div className="icon-box yellow"><i className="fas fa-key"></i></div>
                  <div className="card-text"><h4>Change Password</h4><p>Keep your account secure</p></div>
                </div>
                <div className="action-card-m clickable" onClick={() => { setShowDeleteModal(true); document.body.style.overflow = 'hidden'; }}>
                  <div className="icon-box red-icon"><i className="fas fa-user-times"></i></div>
                  <div className="card-text"><h4>Delete Account</h4><p>Permanently remove account</p></div>
                </div>
              </div>
            </div>

            {/* Recent orders strip */}
            <div className="order-history-section">
              <h3 className="history-title">Recent Orders</h3>
              <div className="orders-list">
                <RecentOrders />
              </div>
              <div className="view-all">
                <Link href="/my-orders">View All Orders <i className="fas fa-arrow-right"></i></Link>
              </div>
            </div>
          </>
        )}

        {/* ── EDIT PROFILE ─────────────────────────────────────────────────────── */}
        {currentView === 'edit' && (
          <>
            <div className="password-header">
              <div className="title-section"><h1>Edit Profile</h1><p>Update your personal information</p></div>
              <button className="btn-back" onClick={() => showView('dashboard')}><i className="fas fa-arrow-left"></i> Back</button>
            </div>
            <div className="password-form-card">
              {profileMsg.text && (
                <div className={`acc-msg acc-msg--${profileMsg.type}`}>
                  <i className={`fas fa-${profileMsg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                {/* Avatar upload */}
                <div className="profile-img-upload">
                  <div className="profile-avatar-lg">
                    {(imagePreview || getAvatar()) ? (
                      <img src={imagePreview || getAvatar()} alt="Profile"
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <span className="avatar-initials lg">{initials()}</span>
                    )}
                  </div>
                  <div className="profile-img-actions">
                    <input ref={fileInputRef} type="file" accept="image/*"
                      onChange={handleImageChange} style={{ display: 'none' }} id="profileImgInput" />
                    <label htmlFor="profileImgInput" className="btn-img-upload">
                      <i className="fas fa-camera"></i> {getAvatar() || imagePreview ? 'Change Photo' : 'Add Photo'}
                    </label>
                    {(imagePreview) && (
                      <button type="button" className="btn-img-remove" onClick={removeImagePreview}>
                        Remove
                      </button>
                    )}
                    <small>JPG, PNG — max 5MB</small>
                  </div>
                </div>

                <div className="acc-form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input type="text" value={profileForm.firstName}
                      onChange={(e) => setProfileForm(p => ({ ...p, firstName: e.target.value }))}
                      placeholder="First name" required />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input type="text" value={profileForm.lastName}
                      onChange={(e) => setProfileForm(p => ({ ...p, lastName: e.target.value }))}
                      placeholder="Last name" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={profileForm.phone}
                    onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="10-digit phone number" maxLength={10} />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={user?.email} disabled className="acc-disabled-input" />
                  <small style={{ color: '#aaa', fontSize: '12px' }}>Email cannot be changed</small>
                </div>

                <button type="submit" className="btn-update" disabled={profileSaving}>
                  {profileSaving
                    ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                    : <><i className="fas fa-save"></i> Save Changes</>}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── CHANGE PASSWORD ───────────────────────────────────────────────────── */}
        {currentView === 'password' && (
          <>
            <div className="password-header">
              <div className="title-section"><h1>Change Password</h1><p>Keep your account secure</p></div>
              <button className="btn-back" onClick={() => showView('dashboard')}><i className="fas fa-arrow-left"></i> Back</button>
            </div>
            <div className="password-form-card">
              {passMsg.text && (
                <div className={`acc-msg acc-msg--${passMsg.type}`}>
                  <i className={`fas fa-${passMsg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  {passMsg.text}
                </div>
              )}
              <form onSubmit={handlePassSubmit}>
                {[
                  { key: 'currentPassword', label: 'Current Password *', placeholder: 'Enter current password' },
                  { key: 'newPassword', label: 'New Password *', placeholder: 'Min 6 characters' },
                  { key: 'confirmPassword', label: 'Confirm Password *', placeholder: 'Re-enter new password' },
                ].map(({ key, label, placeholder }) => (
                  <div className="form-group" key={key}>
                    <label>{label}</label>
                    <div className="input-wrapper">
                      <input
                        type={showPass[key.replace('Password', '').toLowerCase() || 'current'] ? 'text' : 'password'}
                        name={key}
                        placeholder={placeholder}
                        value={passForm[key]}
                        onChange={(e) => { setPassForm(p => ({ ...p, [key]: e.target.value })); setPassErrors(p => ({ ...p, [key]: '' })); }}
                        disabled={passSaving}
                        className={passErrors[key] ? 'error' : ''}
                      />
                      <i className={`fas fa-eye${showPass[key] ? '-slash' : ''}`}
                        onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}></i>
                    </div>
                    {passErrors[key] && <span className="field-error">{passErrors[key]}</span>}
                  </div>
                ))}
                <button type="submit" className="btn-update" disabled={passSaving}>
                  {passSaving
                    ? <><i className="fas fa-spinner fa-spin"></i> Updating…</>
                    : 'Update Password'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── DELETE MODAL ─────────────────────────────────────────────────────── */}
        {showDeleteModal && (
          <div className="modal-overlay active">
            <div className="modal-content" ref={modalRef}>
              <div className="modal-header">
                <div><h2>Delete Account</h2><p className="subtitle">This action cannot be undone</p></div>
                <i className="fas fa-times close-icon" onClick={() => { setShowDeleteModal(false); document.body.style.overflow = 'auto'; }}></i>
              </div>
              <div className="modal-body">
                <p>Deleting your account will permanently remove all your data, including your profile, saved addresses, and order history.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => { setShowDeleteModal(false); document.body.style.overflow = 'auto'; }}>Cancel</button>
                <button className="btn-delete-confirm" onClick={() => alert('Delete account feature coming soon')}>Delete Account</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </main>
  );
};

// ── Recent Orders Strip (last 3) ─────────────────────────────────────────────
const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderAPI.getMyOrders({ page: 1, limit: 3 });
        if (res.data.success) setOrders(res.data.orders);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const STATUS_COLORS = {
    placed: '#f59e0b', confirmed: '#3b82f6',
    processing: '#8b5cf6', shipped: '#f97316',
    delivered: '#10b981', cancelled: '#ef4444',
  };

  if (loading) return <div className="acc-loading-sm"><i className="fas fa-spinner fa-spin"></i></div>;
  if (orders.length === 0) return (
    <div className="recent-orders-header" style={{ textAlign: 'center', padding: '20px', color: '#aaa' }}>
      No orders yet. <Link href="/products" style={{ color: '#5a3e28' }}>Start shopping →</Link>
    </div>
  );

  return (
    <>
      {orders.map((order) => (
        <Link href="/my-orders" className="order-row" key={order._id} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <strong>#{order.orderNumber}</strong>
            <span style={{
              fontSize: '11px',
              background: STATUS_COLORS[order.status] ? STATUS_COLORS[order.status] + '20' : 'rgba(217, 119, 6, 0.15)',
              color: STATUS_COLORS[order.status] || '#d97706',
              padding: '3px 10px', borderRadius: '9999px', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}>
              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
            </span>
          </div>
          <i className="fas fa-arrow-right"></i>
        </Link>
      ))}
    </>
  );
};

export default AccountPage;