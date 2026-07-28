'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addressAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import '@/styles/addresses.css';

// ── Empty form ─────────────────────────────────────────────────────────────────
const emptyForm = {
  label: 'Home', fullName: '', phone: '',
  line1: '', line2: '', city: '', state: '', pincode: '',
  isDefault: false,
};

// ── Pincode lookup function ─────────────────────────────────────────────────
const fetchPincodeDetails = async (pincode) => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();
    
    if (data && data[0] && data[0].Status === 'Success') {
      const postOffices = data[0].PostOffice;
      if (postOffices && postOffices.length > 0) {
        const firstOffice = postOffices[0];
        return {
          city: firstOffice.District || firstOffice.Taluk || '',
          state: firstOffice.State || '',
          success: true
        };
      }
    }
    return { city: '', state: '', success: false, message: 'Pincode not found' };
  } catch (error) {
    console.error('Pincode lookup error:', error);
    return { city: '', state: '', success: false, message: 'Failed to fetch pincode details' };
  }
};

// ── Address Form (add / edit) with pincode lookup ────────────────────────────
const AddressForm = ({ initial, onSave, onCancel, saving, error }) => {
  const [form, setForm] = useState(initial || emptyForm);
  const [errors, setErrors] = useState({});
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState({ type: '', message: '' });
  const lastFetchedPincode = useRef(''); // Track last fetched pincode

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    
    // Clear pincode status when user types
    if (name === 'pincode') {
      setPincodeStatus({ type: '', message: '' });
    }
  };

  // Handle pincode blur - fetch city and state
  const handlePincodeBlur = async () => {
    const pincode = form.pincode.trim();
    
    // Validate pincode format (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return;
    }
    
    // Don't lookup if we already fetched this same pincode
    if (lastFetchedPincode.current === pincode) {
      return;
    }
    
    setIsLookingUp(true);
    setPincodeStatus({ type: 'info', message: 'Fetching location details...' });
    
    const result = await fetchPincodeDetails(pincode);
    
    if (result.success) {
      setForm(prev => ({
        ...prev,
        city: result.city || prev.city,
        state: result.state || prev.state,
      }));
      setPincodeStatus({ type: 'success', message: `Location found: ${result.city}, ${result.state}` });
      lastFetchedPincode.current = pincode; // Store the fetched pincode
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPincodeStatus(prev => prev.type === 'success' ? { type: '', message: '' } : prev);
      }, 3000);
    } else {
      setPincodeStatus({ type: 'error', message: result.message || 'Could not fetch location. Please enter manually.' });
      lastFetchedPincode.current = ''; // Reset on error
    }
    
    setIsLookingUp(false);
  };

  // Handle pincode change - reset fetched status when pincode is manually changed
  const handlePincodeChange = (e) => {
    const newPincode = e.target.value;
    setForm(p => ({ ...p, pincode: newPincode }));
    
    // If pincode is cleared or shortened, reset the fetched flag
    if (newPincode.length < 6) {
      lastFetchedPincode.current = '';
      setPincodeStatus({ type: '', message: '' });
    }
    
    if (errors.pincode) setErrors(p => ({ ...p, pincode: '' }));
  };

  // Manual override for city and state - reset pincode fetched flag
  const handleCityStateChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
    // Reset fetched pincode when user manually edits city/state
    if (lastFetchedPincode.current) {
      lastFetchedPincode.current = '';
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) e.phone = 'Enter a valid 10-digit number';
    if (!form.line1.trim()) e.line1 = 'Address line 1 is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state.trim()) e.state = 'State is required';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...form, phone: form.phone.replace(/\D/g, '') });
  };

  return (
    <form className="addr-form" onSubmit={submit}>
      {error && (
        <div className="addr-form-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {/* Label selector */}
      <div className="addr-label-row">
        {['Home', 'Office', 'Other'].map(l => (
          <button key={l} type="button"
            className={`addr-label-btn ${form.label === l ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, label: l }))}>
            <i className={`fas fa-${l === 'Home' ? 'home' : l === 'Office' ? 'briefcase' : 'map-marker-alt'}`}></i>
            {l}
          </button>
        ))}
      </div>

      <div className="addr-field-row">
        <div className="addr-field">
          <label>Full Name *</label>
          <input name="fullName" value={form.fullName} onChange={handle}
            placeholder="Rahul Sharma" className={errors.fullName ? 'err' : ''} />
          {errors.fullName && <span className="addr-err">{errors.fullName}</span>}
        </div>
        <div className="addr-field">
          <label>Phone Number *</label>
          <input name="phone" value={form.phone} onChange={handle}
            placeholder="9876543210" maxLength={10} className={errors.phone ? 'err' : ''} />
          {errors.phone && <span className="addr-err">{errors.phone}</span>}
        </div>
      </div>

      <div className="addr-field">
        <label>House / Flat / Street *</label>
        <input name="line1" value={form.line1} onChange={handle}
          placeholder="208 Shiv Vihar, MG Road" className={errors.line1 ? 'err' : ''} />
        {errors.line1 && <span className="addr-err">{errors.line1}</span>}
      </div>

      <div className="addr-field">
        <label>Area / Landmark</label>
        <input name="line2" value={form.line2} onChange={handle}
          placeholder="Near City Mall (optional)" />
      </div>

      <div className="addr-field-row">
        <div className="addr-field">
          <label>Pincode *</label>
          <div className="pincode-wrapper">
            <input 
              name="pincode" 
              value={form.pincode} 
              onChange={handlePincodeChange}
              onBlur={handlePincodeBlur}
              placeholder="302020" 
              maxLength={6} 
              className={errors.pincode ? 'err' : ''} 
            />
            {isLookingUp && (
              <i className="fas fa-spinner fa-spin pincode-spinner"></i>
            )}
          </div>
          {errors.pincode && <span className="addr-err">{errors.pincode}</span>}
          {pincodeStatus.message && (
            <div className={`pincode-status pincode-status-${pincodeStatus.type}`}>
              <i className={`fas fa-${pincodeStatus.type === 'success' ? 'check-circle' : pincodeStatus.type === 'error' ? 'exclamation-circle' : 'info-circle'}`}></i>
              {pincodeStatus.message}
            </div>
          )}
        </div>
      </div>

      <div className="addr-field-row">
        <div className="addr-field">
          <label>City *</label>
          <input name="city" value={form.city} onChange={handleCityStateChange}
            placeholder="Jaipur" className={errors.city ? 'err' : ''} />
          {errors.city && <span className="addr-err">{errors.city}</span>}
        </div>
        <div className="addr-field">
          <label>State *</label>
          <input name="state" value={form.state} onChange={handleCityStateChange}
            placeholder="Rajasthan" className={errors.state ? 'err' : ''} />
          {errors.state && <span className="addr-err">{errors.state}</span>}
        </div>
      </div>

      <label className="addr-default-check">
        <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handle} />
        <span>Set as default address</span>
      </label>

      <div className="addr-form-actions">
        <button type="button" className="addr-btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="addr-btn-save" disabled={saving}>
          {saving
            ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
            : <><i className="fas fa-save"></i> {initial?._id ? 'Update Address' : 'Add Address'}</>}
        </button>
      </div>
    </form>
  );
};

// ── Address Card ──────────────────────────────────────────────────────────────
const AddressCard = ({ addr, onEdit, onDelete, onSetDefault, deleting, settling }) => {
  const LABEL_ICON = { Home: 'fa-home', Office: 'fa-briefcase', Other: 'fa-map-marker-alt' };
  return (
    <div className={`addr-card ${addr.isDefault ? 'addr-card--default' : ''}`}>
      {addr.isDefault && <div className="addr-default-ribbon">Default</div>}

      <div className="addr-card-header">
        <div className="addr-card-label">
          <i className={`fas ${LABEL_ICON[addr.label] || 'fa-map-marker-alt'}`}></i>
          {addr.label}
        </div>
        <div className="addr-card-actions">
          {!addr.isDefault && (
            <button className="addr-action-btn addr-action-btn--default"
              onClick={() => onSetDefault(addr._id)}
              disabled={settling === addr._id}
              title="Set as default">
              {settling === addr._id
                ? <i className="fas fa-spinner fa-spin"></i>
                : <><i className="fas fa-star"></i> Default</>}
            </button>
          )}
          <button className="addr-action-btn addr-action-btn--edit"
            onClick={() => onEdit(addr)} title="Edit">
            <i className="fas fa-pen"></i>
          </button>
          <button className="addr-action-btn addr-action-btn--delete"
            onClick={() => onDelete(addr._id)}
            disabled={deleting === addr._id}
            title="Delete">
            {deleting === addr._id
              ? <i className="fas fa-spinner fa-spin"></i>
              : <i className="fas fa-trash"></i>}
          </button>
        </div>
      </div>

      <div className="addr-card-body">
        <p className="addr-name">{addr.fullName}</p>
        <p className="addr-phone"><i className="fas fa-phone-alt"></i> {addr.phone}</p>
        <p className="addr-line">
          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
        </p>
        <p className="addr-line">
          {addr.city}, {addr.state} — {addr.pincode}
        </p>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AddressesPage = () => {
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [settling, setSettling] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    document.title = 'My Addresses - Cocofina';
    window.scrollTo(0, 0);
    const token = localStorage.getItem('token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }
    fetchAddresses();
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await addressAPI.getAll();
      if (res.data.success) setAddresses(res.data.addresses);
    } catch (err) {
      if (err.response?.status === 401) router.push('/login');
      else setError('Failed to load addresses.');
    } finally { 
      setLoading(false); 
    }
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const openAdd = () => { setEditData(null); setFormError(''); setShowForm(true); };
  const openEdit = (addr) => { setEditData(addr); setFormError(''); setShowForm(true); };

  const handleSave = async (formData) => {
    setSaving(true);
    setFormError('');
    try {
      let res;
      if (editData?._id) {
        res = await addressAPI.update(editData._id, formData);
      } else {
        res = await addressAPI.create(formData);
      }
      if (res.data.success) {
        await fetchAddresses();
        setShowForm(false);
        setEditData(null);
        showToast(editData?._id ? 'Address updated!' : 'Address added!');
      } else {
        setFormError(res.data.message || 'Failed to save address');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save address');
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setDeleting(id);
    try {
      const res = await addressAPI.delete(id);
      if (res.data.success) {
        setAddresses(prev => prev.filter(a => a._id !== id));
        showToast('Address deleted.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    } finally { 
      setDeleting(null); 
    }
  };

  const handleSetDefault = async (id) => {
    setSettling(id);
    try {
      const res = await addressAPI.setDefault(id);
      if (res.data.success) {
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === id })));
        showToast('Default address updated!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to set default');
    } finally { 
      setSettling(null); 
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <Navbar />
      <div className="addresses-page-wrapper">
        <div className="addr-container">
          <div className="addr-header">
            <div>
              <h1>Saved Addresses</h1>
              <p>Manage your delivery locations and default addresses</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                className="btn-addr-action"
                onClick={() => router.push('/my-profile')}
              >
                ← Back to Profile
              </button>
              {!showForm && (
                <button className="btn-add-addr" onClick={openAdd}>
                  + Add Address
                </button>
              )}
            </div>
          </div>
          {toast && (
            <div className="addr-toast">
              <i className="fas fa-check-circle"></i> {toast}
            </div>
          )}

          {error && (
            <div className="addr-global-error">
              <i className="fas fa-exclamation-circle"></i> {error}
              <button onClick={fetchAddresses} className="addr-retry">Retry</button>
            </div>
          )}

          {showForm && (
            <div className="addr-form-panel">
              <div className="addr-form-panel-header">
                <h2>{editData?._id ? 'Edit Address' : 'Add New Address'}</h2>
              </div>
              <AddressForm
                initial={editData}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditData(null); }}
                saving={saving}
                error={formError}
              />
            </div>
          )}

          {loading ? (
            <div className="addr-loading">
              {[1, 2].map(i => (
                <div className="addr-card addr-skel-card" key={i}>
                  <div className="addr-skel" style={{ width: '30%', height: 14, marginBottom: 14 }}></div>
                  <div className="addr-skel" style={{ width: '60%', height: 13, marginBottom: 10 }}></div>
                  <div className="addr-skel" style={{ width: '80%', height: 13, marginBottom: 10 }}></div>
                  <div className="addr-skel" style={{ width: '50%', height: 13 }}></div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 && !showForm ? (
            <div className="addr-empty">
              <div className="addr-empty-icon"><i className="fas fa-map-marker-alt"></i></div>
              <h3>No saved addresses</h3>
              <p>Add a delivery address to get started.</p>
              <button className="addr-btn-add" onClick={openAdd}>
                <i className="fas fa-plus"></i> Add Your First Address
              </button>
            </div>
          ) : (
            <div className="addr-grid">
              {addresses.map(addr => (
                <AddressCard
                  key={addr._id}
                  addr={addr}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onSetDefault={handleSetDefault}
                  deleting={deleting}
                  settling={settling}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AddressesPage;