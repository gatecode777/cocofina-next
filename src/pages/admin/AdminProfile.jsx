'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminAuth } from '@/services/api';
import '@/styles/admin/AdminProfile.css';

const AdminProfile = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password form
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // ── Fetch admin on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await adminAuth.getProfile();
        if (res.data.success) {
          const a = res.data.admin;
          setAdmin(a);
          setProfileForm({ fullName: a.fullName || '', email: a.email || '' });
        }
      } catch (err) {
        if (err.response?.status === 401) router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmin();
  }, []);

  // ── Profile update ──────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) {
      setProfileMsg({ type: 'error', text: 'Full name is required' });
      return;
    }
    try {
      setProfileSaving(true);
      setProfileMsg({ type: '', text: '' });
      const res = await adminAuth.updateProfile({ fullName: profileForm.fullName });
      if (res.data.success) {
        setAdmin((prev) => ({ ...prev, fullName: profileForm.fullName }));
        // Update localStorage cache
        const cached = JSON.parse(localStorage.getItem('adminData') || '{}');
        localStorage.setItem('adminData', JSON.stringify({ ...cached, fullName: profileForm.fullName }));
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    }
  };

  // ── Password change ─────────────────────────────────────────────────────────
  const handlePassSubmit = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassMsg({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    try {
      setPassSaving(true);
      setPassMsg({ type: '', text: '' });
      const res = await adminAuth.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      if (res.data.success) {
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      }
    } catch (err) {
      setPassMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPassSaving(false);
      setTimeout(() => setPassMsg({ type: '', text: '' }), 3000);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getInitials = (name = '') =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getRoleBadge = (role) => {
    const map = {
      super_admin: { label: 'Super Admin', color: '#7c3aed' },
      admin:       { label: 'Admin',       color: '#0891b2' },
      moderator:   { label: 'Moderator',   color: '#059669' },
    };
    return map[role] || { label: role, color: '#64748b' };
  };

  const togglePass = (field) =>
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));

  // ── Password strength ───────────────────────────────────────────────────────
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak',   color: '#ef4444' };
    if (score <= 3) return { level: 2, label: 'Fair',   color: '#f59e0b' };
    if (score <= 4) return { level: 3, label: 'Good',   color: '#3b82f6' };
    return              { level: 4, label: 'Strong', color: '#10b981' };
  };

  const pwdStrength = getPasswordStrength(passForm.newPassword);

  if (loading) {
    return (
      <AdminLayout>
        <div className="ap-loading">
          <div className="ap-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </AdminLayout>
    );
  }

  const roleBadge = getRoleBadge(admin?.role);

  return (
    <AdminLayout>
      <div className="ap-page">

        {/* ── Hero card ─────────────────────────────────────────────────────── */}
        <div className="ap-hero">
          <div className="ap-hero-bg"></div>
          <div className="ap-hero-content">
            {/* Avatar */}
            <div className="ap-avatar-wrap">
              <div className="ap-avatar">
                {admin?.profile ? (
                  <img src={admin.profile} alt={admin.fullName} />
                ) : (
                  <span className="ap-initials">{getInitials(admin?.fullName)}</span>
                )}
              </div>
              <div className={`ap-status-dot ${admin?.isActive ? 'active' : 'inactive'}`}
                title={admin?.isActive ? 'Active' : 'Inactive'} />
            </div>

            {/* Info */}
            <div className="ap-hero-info">
              <h1 className="ap-name">{admin?.fullName}</h1>
              <p className="ap-email">{admin?.email}</p>
              <div className="ap-badges">
                <span className="ap-role-badge" style={{ background: roleBadge.color + '20', color: roleBadge.color, border: `1px solid ${roleBadge.color}40` }}>
                  <i className="fas fa-shield-alt"></i> {roleBadge.label}
                </span>
                <span className={`ap-status-badge ${admin?.isActive ? 'active' : 'inactive'}`}>
                  <i className={`fas fa-circle`}></i>
                  {admin?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Stats strip */}
            <div className="ap-stats">
              <div className="ap-stat">
                <i className="fas fa-clock"></i>
                <div>
                  <span className="ap-stat-label">Last Login</span>
                  <span className="ap-stat-value">{formatDate(admin?.lastLogin)}</span>
                </div>
              </div>
              <div className="ap-stat-divider"></div>
              <div className="ap-stat">
                <i className="fas fa-calendar-plus"></i>
                <div>
                  <span className="ap-stat-label">Member Since</span>
                  <span className="ap-stat-value">{formatDate(admin?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="ap-tabs">
          <button className={`ap-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fas fa-user-edit"></i> Edit Profile
          </button>
          <button className={`ap-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
            <i className="fas fa-lock"></i> Change Password
          </button>
        </div>

        {/* ── Tab panels ───────────────────────────────────────────────────── */}
        <div className="ap-panel">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form className="ap-form" onSubmit={handleProfileSubmit}>
              <div className="ap-form-header">
                <h2><i className="fas fa-user-edit"></i> Profile Information</h2>
                <p>Update your personal details</p>
              </div>

              {profileMsg.text && (
                <div className={`ap-alert ap-alert-${profileMsg.type}`}>
                  <i className={`fas fa-${profileMsg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  {profileMsg.text}
                </div>
              )}

              <div className="ap-field-grid">
                <div className="ap-field">
                  <label>Full Name</label>
                  <div className="ap-input-wrap">
                    <i className="fas fa-user ap-input-icon"></i>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="ap-field">
                  <label>Email Address</label>
                  <div className="ap-input-wrap disabled">
                    <i className="fas fa-envelope ap-input-icon"></i>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      placeholder="Email cannot be changed"
                    />
                    <span className="ap-input-lock"><i className="fas fa-lock"></i></span>
                  </div>
                  <small>Email address cannot be changed for security reasons</small>
                </div>

                <div className="ap-field">
                  <label>Role</label>
                  <div className="ap-input-wrap disabled">
                    <i className="fas fa-shield-alt ap-input-icon"></i>
                    <input type="text" value={roleBadge.label} disabled />
                    <span className="ap-input-lock"><i className="fas fa-lock"></i></span>
                  </div>
                  <small>Role is assigned by super admin</small>
                </div>

                <div className="ap-field">
                  <label>Account Status</label>
                  <div className="ap-input-wrap disabled">
                    <i className="fas fa-circle ap-input-icon" style={{ color: admin?.isActive ? '#10b981' : '#ef4444', fontSize: '10px' }}></i>
                    <input type="text" value={admin?.isActive ? 'Active' : 'Inactive'} disabled />
                    <span className="ap-input-lock"><i className="fas fa-lock"></i></span>
                  </div>
                </div>
              </div>

              <div className="ap-form-footer">
                <button type="submit" className="ap-btn-save" disabled={profileSaving}>
                  {profileSaving ? (
                    <><span className="ap-btn-spinner"></span> Saving...</>
                  ) : (
                    <><i className="fas fa-save"></i> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* PASSWORD TAB */}
          {activeTab === 'password' && (
            <form className="ap-form" onSubmit={handlePassSubmit}>
              <div className="ap-form-header">
                <h2><i className="fas fa-lock"></i> Change Password</h2>
                <p>Keep your account secure with a strong password</p>
              </div>

              {passMsg.text && (
                <div className={`ap-alert ap-alert-${passMsg.type}`}>
                  <i className={`fas fa-${passMsg.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                  {passMsg.text}
                </div>
              )}

              <div className="ap-field-grid ap-field-grid-single">
                {/* Current Password */}
                <div className="ap-field">
                  <label>Current Password</label>
                  <div className="ap-input-wrap">
                    <i className="fas fa-key ap-input-icon"></i>
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passForm.currentPassword}
                      onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      required
                    />
                    <button type="button" className="ap-toggle-pass" onClick={() => togglePass('current')}>
                      <i className={`fas fa-eye${showPasswords.current ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="ap-field">
                  <label>New Password</label>
                  <div className="ap-input-wrap">
                    <i className="fas fa-lock ap-input-icon"></i>
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passForm.newPassword}
                      onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder="Enter new password (min 8 chars)"
                      required
                    />
                    <button type="button" className="ap-toggle-pass" onClick={() => togglePass('new')}>
                      <i className={`fas fa-eye${showPasswords.new ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  {/* Strength meter */}
                  {passForm.newPassword && (
                    <div className="ap-strength-wrap">
                      <div className="ap-strength-bar">
                        {[1, 2, 3, 4].map((lvl) => (
                          <div
                            key={lvl}
                            className="ap-strength-seg"
                            style={{ background: lvl <= pwdStrength.level ? pwdStrength.color : '#e2e8f0' }}
                          />
                        ))}
                      </div>
                      <span className="ap-strength-label" style={{ color: pwdStrength.color }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="ap-field">
                  <label>Confirm New Password</label>
                  <div className={`ap-input-wrap ${passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword ? 'ap-input-error' : ''}`}>
                    <i className="fas fa-lock ap-input-icon"></i>
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passForm.confirmPassword}
                      onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button type="button" className="ap-toggle-pass" onClick={() => togglePass('confirm')}>
                      <i className={`fas fa-eye${showPasswords.confirm ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  {passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword && (
                    <small className="ap-field-error"><i className="fas fa-times-circle"></i> Passwords do not match</small>
                  )}
                  {passForm.confirmPassword && passForm.confirmPassword === passForm.newPassword && (
                    <small className="ap-field-success"><i className="fas fa-check-circle"></i> Passwords match</small>
                  )}
                </div>

                {/* Tips */}
                <div className="ap-password-tips">
                  <p className="ap-tips-title"><i className="fas fa-lightbulb"></i> Password tips</p>
                  <ul>
                    <li className={passForm.newPassword.length >= 8 ? 'met' : ''}><i className="fas fa-check"></i> At least 8 characters</li>
                    <li className={/[A-Z]/.test(passForm.newPassword) ? 'met' : ''}><i className="fas fa-check"></i> One uppercase letter</li>
                    <li className={/[0-9]/.test(passForm.newPassword) ? 'met' : ''}><i className="fas fa-check"></i> One number</li>
                    <li className={/[^A-Za-z0-9]/.test(passForm.newPassword) ? 'met' : ''}><i className="fas fa-check"></i> One special character</li>
                  </ul>
                </div>
              </div>

              <div className="ap-form-footer">
                <button
                  type="submit"
                  className="ap-btn-save"
                  disabled={passSaving || (passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword)}
                >
                  {passSaving ? (
                    <><span className="ap-btn-spinner"></span> Updating...</>
                  ) : (
                    <><i className="fas fa-shield-alt"></i> Update Password</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;