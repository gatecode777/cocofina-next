'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { inquiryAPI } from '@/services/api';
import '@/styles/admin/AdminInquiries.css';

// Audio chime using browser Web Audio API
function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    console.debug('Audio chime unable to play:', err);
  }
}

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: true, create: false, edit: true, delete: true };
  } catch {
    return { view: true, edit: true, delete: true };
  }
};

export default function AdminInquiries() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [perms, setPerms] = useState({});

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInquiries, setTotalInquiries] = useState(0);

  // Aggregated Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    in_progress: 0,
    resolved: 0,
    archived: 0,
  });

  // Real-time state
  const [liveConnected, setLiveConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  const [recentLiveAlert, setRecentLiveAlert] = useState(null);

  // Modals
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);
  const [modalNotes, setModalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const searchTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);

  useEffect(() => {
    setPerms(getAdminPerms('inquiries'));
    const savedSound = localStorage.getItem('cocofina_admin_sound');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('cocofina_admin_sound', String(next));
    if (next) playChime();
  };

  // Fetch inquiries data
  const fetchInquiries = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        setError('');

        const params = {
          page: currentPage,
          limit: 10,
          search: searchTerm.trim(),
        };

        if (filterStatus !== 'all') {
          params.status = filterStatus;
        }

        const res = await inquiryAPI.getAll(params);

        if (res.data?.success) {
          setInquiries(res.data.inquiries || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalInquiries(res.data.pagination?.total || 0);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        }
      } catch (err) {
        console.error('Error fetching inquiries:', err);
        if (!isBackground) {
          setError(err.response?.data?.message || 'Failed to load inquiries');
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [currentPage, filterStatus, searchTerm]
  );

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchInquiries();
    }, 400);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, filterStatus]);

  // Page change
  useEffect(() => {
    fetchInquiries();
  }, [currentPage]);

  // ── Real-Time SSE Connection ────────────────────────────────────────────────
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    let es = null;
    let reconnectTimeout = null;

    const connectSSE = () => {
      try {
        const streamUrl = `/api/admin/inquiries/stream?token=${encodeURIComponent(adminToken)}`;
        es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.addEventListener('connected', () => {
          setLiveConnected(true);
        });

        es.addEventListener('new-inquiry', (event) => {
          try {
            const newDoc = JSON.parse(event.data);

            // Play notification sound
            if (soundEnabled) {
              playChime();
            }

            // Show temporary alert banner
            setRecentLiveAlert({
              id: newDoc._id,
              name: newDoc.name,
              subject: newDoc.subject,
              time: new Date().toLocaleTimeString(),
            });

            setTimeout(() => {
              setRecentLiveAlert(null);
            }, 7000);

            // Flash highlight row
            setHighlightId(newDoc._id);
            setTimeout(() => setHighlightId(null), 4500);

            // Prepend new inquiry if matching current status filter or 'all'
            setInquiries((prev) => {
              const exists = prev.some((item) => item._id === newDoc._id);
              if (exists) return prev;
              return [newDoc, ...prev];
            });

            // Update stats
            setStats((prev) => ({
              ...prev,
              total: prev.total + 1,
              new: prev.new + 1,
            }));
            setTotalInquiries((prev) => prev + 1);
          } catch (e) {
            console.error('Error handling new-inquiry event:', e);
          }
        });

        es.addEventListener('inquiry-updated', (event) => {
          try {
            const data = JSON.parse(event.data);
            setInquiries((prev) =>
              prev.map((item) =>
                item._id === data.id
                  ? { ...item, status: data.status, notes: data.notes, updatedAt: data.updatedAt }
                  : item
              )
            );
            if (selectedInquiry?._id === data.id) {
              setSelectedInquiry((prev) => ({
                ...prev,
                status: data.status,
                notes: data.notes,
              }));
            }
          } catch (e) {
            console.error('Error handling inquiry-updated event:', e);
          }
        });

        es.addEventListener('inquiry-deleted', (event) => {
          try {
            const data = JSON.parse(event.data);
            setInquiries((prev) => prev.filter((item) => item._id !== data.id));
            setStats((prev) => ({
              ...prev,
              total: Math.max(0, prev.total - 1),
            }));
            setTotalInquiries((prev) => Math.max(0, prev - 1));
          } catch (e) {
            console.error('Error handling inquiry-deleted event:', e);
          }
        });

        es.onerror = () => {
          setLiveConnected(false);
          es.close();
          // Try reconnecting in 5 seconds
          reconnectTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('SSE initialization error:', err);
        setLiveConnected(false);
      }
    };

    connectSSE();

    // Fallback polling interval every 15s to keep list perfectly in sync
    const pollInterval = setInterval(() => {
      fetchInquiries(true);
    }, 15000);

    return () => {
      if (es) es.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(pollInterval);
    };
  }, [soundEnabled, fetchInquiries]);

  // Handle status update
  const handleUpdateStatus = async (inquiryId, newStatus) => {
    try {
      setUpdatingStatusId(inquiryId);
      const res = await inquiryAPI.update(inquiryId, { status: newStatus });
      if (res.data?.success) {
        setInquiries((prev) =>
          prev.map((item) =>
            item._id === inquiryId ? { ...item, status: newStatus } : item
          )
        );
        if (selectedInquiry?._id === inquiryId) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
        }
        // Refresh stats
        fetchInquiries(true);
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Open Detail Modal
  const openDetailModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setModalNotes(inquiry.notes || '');
    setShowDetailModal(true);

    // If status is 'new', auto-mark as 'read'
    if (inquiry.status === 'new') {
      handleUpdateStatus(inquiry._id, 'read');
    }
  };

  // Save admin internal notes
  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    try {
      setSavingNotes(true);
      const res = await inquiryAPI.update(selectedInquiry._id, { notes: modalNotes });
      if (res.data?.success) {
        setSelectedInquiry((prev) => ({ ...prev, notes: modalNotes }));
        setInquiries((prev) =>
          prev.map((item) =>
            item._id === selectedInquiry._id ? { ...item, notes: modalNotes } : item
          )
        );
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Delete inquiry
  const confirmDelete = async () => {
    if (!inquiryToDelete) return;
    try {
      const res = await inquiryAPI.delete(inquiryToDelete._id);
      if (res.data?.success) {
        setInquiries((prev) => prev.filter((i) => i._id !== inquiryToDelete._id));
        setShowDeleteModal(false);
        setInquiryToDelete(null);
        fetchInquiries(true);
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      alert('Failed to delete inquiry');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <AdminLayout>
      <div className="admin-inquiries">
        {/* Page Header */}
        <div className="inquiries-header">
          <div>
            <h1>
              <i className="fas fa-envelope-open-text" style={{ color: '#d97706' }}></i>
              Customer & Wholesale Inquiries
            </h1>
            <p>Monitor, respond to, and manage incoming inquiries in real-time</p>
          </div>

          <div className="header-actions">
            {/* Live Indicator */}
            <div className={`live-pill ${liveConnected ? '' : 'disconnected'}`}>
              <div className="pulse-dot"></div>
              <span>{liveConnected ? 'Real-Time Live' : 'Connecting...'}</span>
            </div>

            {/* Sound Notification Toggle */}
            <button
              onClick={toggleSound}
              className={`btn-sound ${soundEnabled ? 'active' : ''}`}
              title={soundEnabled ? 'Sound alerts enabled' : 'Sound alerts muted'}
            >
              <i className={`fas fa-volume-${soundEnabled ? 'up' : 'mute'}`}></i>
              <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
            </button>

            {/* Refresh Button */}
            <button onClick={() => fetchInquiries()} className="btn-refresh" title="Refresh list">
              <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Notification Floating Toast */}
        {recentLiveAlert && (
          <div className="live-toast-alert">
            <div className="live-toast-content">
              <i className="fas fa-bell fa-shake" style={{ color: '#f59e0b', fontSize: 18 }}></i>
              <div>
                <strong>New Inquiry Received!</strong> from{' '}
                <span style={{ fontWeight: 700 }}>{recentLiveAlert.name}</span> (
                {recentLiveAlert.subject}) at {recentLiveAlert.time}
              </div>
            </div>
            <button
              onClick={() => setRecentLiveAlert(null)}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="inquiry-stats-grid">
          <div className="inquiry-stat-card">
            <div className="stat-icon-wrap total">
              <i className="fas fa-inbox"></i>
            </div>
            <div className="stat-meta">
              <h3>{stats.total || totalInquiries}</h3>
              <p>Total Inquiries</p>
            </div>
          </div>

          <div className="inquiry-stat-card">
            <div className="stat-icon-wrap new">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="stat-meta">
              <h3>{stats.new || 0}</h3>
              <p>New / Unread</p>
            </div>
          </div>

          <div className="inquiry-stat-card">
            <div className="stat-icon-wrap in-progress">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <div className="stat-meta">
              <h3>{stats.in_progress || 0}</h3>
              <p>In Progress</p>
            </div>
          </div>

          <div className="inquiry-stat-card">
            <div className="stat-icon-wrap resolved">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-meta">
              <h3>{stats.resolved || 0}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        {/* Controls: Search & Status Filter */}
        <div className="inquiries-controls">
          <div className="search-and-source">
            <div className="search-input-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, email, phone, subject, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-pills">
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginRight: 4 }}>
              FILTER BY:
            </span>
            {[
              { key: 'all', label: 'All Inquiries' },
              { key: 'new', label: `New (${stats.new || 0})` },
              { key: 'read', label: 'Read' },
              { key: 'in_progress', label: `In Progress (${stats.in_progress || 0})` },
              { key: 'resolved', label: `Resolved (${stats.resolved || 0})` },
              { key: 'archived', label: 'Archived' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => {
                  setFilterStatus(f.key);
                  setCurrentPage(1);
                }}
                className={`filter-pill ${filterStatus === f.key ? 'active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#991b1b',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Inquiries Table */}
        <div className="inquiries-table-container">
          {loading ? (
            <div className="table-loading">
              <i className="fas fa-spinner fa-spin fa-2x"></i>
              <p style={{ marginTop: 12, fontSize: 14 }}>Loading inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h3>No Inquiries Found</h3>
              <p>
                {searchTerm || filterStatus !== 'all'
                  ? 'No inquiries match your filter criteria.'
                  : 'New customer and wholesale inquiries will appear here automatically in real time.'}
              </p>
            </div>
          ) : (
            <table className="inquiries-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Sender</th>
                  <th>Subject & Message</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((item) => {
                  const isHighlighted = highlightId === item._id;
                  return (
                    <tr
                      key={item._id}
                      className={`inquiry-row ${isHighlighted ? 'new-live-arrival' : ''}`}
                    >
                      {/* Date */}
                      <td style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#64748b' }}>
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Sender */}
                      <td>
                        <div className="sender-info">
                          <span className="sender-name">{item.name}</span>
                          <div className="sender-contacts">
                            <a href={`mailto:${item.email}`} title="Email sender">
                              <i className="fas fa-envelope"></i>
                              <span>{item.email}</span>
                            </a>
                            {item.phone && (
                              <a href={`tel:${item.phone}`} title="Call sender">
                                <i className="fas fa-phone"></i>
                                <span>{item.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subject & snippet */}
                      <td>
                        <div className="subject-text">{item.subject}</div>
                        <div className="message-snippet">{item.message}</div>
                      </td>

                      {/* Source */}
                      <td>
                        <span className={`source-tag ${item.source || 'home_page'}`}>
                          {item.source === 'home_page'
                            ? 'Home Page'
                            : item.source === 'contact_page'
                            ? 'Contact Us'
                            : 'Direct'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item._id, e.target.value)}
                          disabled={updatingStatusId === item._id}
                          className={`status-badge ${item.status}`}
                          style={{ border: 'none', outline: 'none' }}
                        >
                          <option value="new">● New</option>
                          <option value="read">● Read</option>
                          <option value="in_progress">● In Progress</option>
                          <option value="resolved">● Resolved</option>
                          <option value="archived">● Archived</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openDetailModal(item)}
                            className="btn-view"
                            title="View Full Inquiry & Respond"
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          {perms.delete && (
                            <button
                              onClick={() => {
                                setInquiryToDelete(item);
                                setShowDeleteModal(true);
                              }}
                              className="btn-delete"
                              title="Delete inquiry"
                            >
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 20,
              padding: '0 4px',
            }}
          >
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              {totalInquiries} inquiries total)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="btn-refresh"
                style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="btn-refresh"
                style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* Detail & Quick Response Modal */}
        {showDetailModal && selectedInquiry && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="inquiry-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>
                  <i className="fas fa-envelope-open-text" style={{ color: '#d97706', marginRight: 8 }}></i>
                  Inquiry Details
                </h2>
                <button onClick={() => setShowDetailModal(false)} className="btn-close-modal">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                {/* Sender card with 1-click reply */}
                <div className="modal-sender-card">
                  <div className="modal-sender-details">
                    <h4>{selectedInquiry.name}</h4>
                    <p style={{ margin: '2px 0', fontSize: 13, color: '#475569' }}>
                      <i className="fas fa-envelope" style={{ marginRight: 6, color: '#64748b' }}></i>
                      {selectedInquiry.email}
                    </p>
                    {selectedInquiry.phone && (
                      <p style={{ margin: '2px 0', fontSize: 13, color: '#475569' }}>
                        <i className="fas fa-phone" style={{ marginRight: 6, color: '#64748b' }}></i>
                        {selectedInquiry.phone}
                      </p>
                    )}
                    <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: 4 }}>
                      Received: {formatDate(selectedInquiry.createdAt)} • Source:{' '}
                      {selectedInquiry.source || 'home_page'}
                    </span>
                  </div>

                  <div className="modal-quick-actions">
                    <a
                      href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(
                        selectedInquiry.subject
                      )} - Cocofina Support`}
                      className="btn-quick-reply email"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-reply"></i> Email Reply
                    </a>

                    {selectedInquiry.phone && (
                      <a
                        href={`https://wa.me/${getCleanPhone(selectedInquiry.phone)}?text=Hello%20${encodeURIComponent(
                          selectedInquiry.name
                        )},%20thank%20you%20for%20contacting%20Cocofina!`}
                        className="btn-quick-reply whatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-whatsapp"></i> WhatsApp
                      </a>
                    )}
                  </div>
                </div>

                {/* Topic / Subject */}
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Inquiry Topic
                  </span>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                    {selectedInquiry.subject}
                  </div>
                </div>

                {/* Message Box */}
                <div className="modal-message-box">
                  <label>Message Content</label>
                  <div className="modal-message-content">{selectedInquiry.message}</div>
                </div>

                {/* Status Changer */}
                <div className="modal-status-section">
                  <label>Update Status:</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedInquiry._id, e.target.value)}
                    className="status-select"
                  >
                    <option value="new">New (Unread)</option>
                    <option value="read">Read</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Internal Admin Notes */}
                <div className="modal-notes-section">
                  <label>Internal Admin Notes (Private):</label>
                  <textarea
                    rows={3}
                    placeholder="Add internal notes about callback time, wholesale quotation sent, requirements discussed..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="btn-save-notes"
                    >
                      {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowDetailModal(false)} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && inquiryToDelete && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="inquiry-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 style={{ color: '#dc2626' }}>Delete Inquiry</h2>
                <button onClick={() => setShowDeleteModal(false)} className="btn-close-modal">
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: 14, color: '#334155', margin: 0 }}>
                  Are you sure you want to delete the inquiry from{' '}
                  <strong>{inquiryToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delete Inquiry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
