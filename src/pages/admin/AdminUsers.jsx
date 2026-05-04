'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { userAPI } from '@/services/api';
import '@/styles/admin/AdminUsers.css';

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: false, create: false, edit: false, delete: false };
  } catch { return {}; }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [perms, setPerms] = useState({});

  const router = useRouter();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    setPerms(getAdminPerms('users'));
  }, []);

  // Debounced search - only fetch after user stops typing
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchTerm, filterStatus]);

  // Effect 2 — page change (immediate)
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm.trim(),
      };

      // Add status filter
      if (filterStatus === 'active' || filterStatus === 'inactive') {
        params.status = filterStatus;
      }

      // Add verified filter
      if (filterStatus === 'verified' || filterStatus === 'unverified') {
        params.verified = filterStatus;
      }

      const response = await userAPI.getAll(params);

      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await userAPI.toggleStatus(userId);

      if (response.data.success) {
        // Update local state immediately
        setUsers(users.map(user =>
          user._id === userId ? { ...user, isActive: !user.isActive } : user
        ));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await userAPI.delete(selectedUser._id);

      if (response.data.success) {
        setUsers(users.filter(user => user._id !== selectedUser._id));
        setTotalUsers(totalUsers - 1);
        setShowDeleteModal(false);
        setSelectedUser(null);

        // Show success notification
        alert('User deleted successfully');

        // If current page is empty after delete, go to previous page
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const response = await userAPI.verify(userId);

      if (response.data.success) {
        // Update local state
        setUsers(users.map(user =>
          user._id === userId ? { ...user, isVerified: true } : user
        ));

        alert('User verified successfully');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      alert(error.response?.data?.message || 'Failed to verify user');
    }
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        phone: selectedUser.phone,
      };

      const response = await userAPI.update(selectedUser._id, updateData);

      if (response.data.success) {
        // Update local state
        setUsers(users.map(user =>
          user._id === selectedUser._id ? response.data.user : user
        ));

        setShowEditModal(false);
        setSelectedUser(null);
        alert('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading && users.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading users...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-users">
        <div className="page-header">
          <div>
            <h1>Users Management</h1>
            <p>Manage all registered users ({totalUsers} total)</p>
          </div>
          {perms.create && (
            <button className="btn-primary" onClick={() => alert('Add user feature coming soon')}>
              <i className="fas fa-user-plus"></i> Add New User
            </button>
          )}
        </div>

        {error && (
          <div className="error-message" style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#c53030'
          }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Filters and Search */}
        <div className="users-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={handleSearch}
            />
            {loading && searchTerm && (
              <i className="fas fa-spinner fa-spin" style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }}></i>
            )}
          </div>

          <div className="filter-buttons">
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => handleStatusFilter('all')}
            >
              All Users
            </button>
            <button
              className={filterStatus === 'active' ? 'active' : ''}
              onClick={() => handleStatusFilter('active')}
            >
              Active
            </button>
            <button
              className={filterStatus === 'inactive' ? 'active' : ''}
              onClick={() => handleStatusFilter('inactive')}
            >
              Inactive
            </button>
            <button
              className={filterStatus === 'verified' ? 'active' : ''}
              onClick={() => handleStatusFilter('verified')}
            >
              Verified
            </button>
            <button
              className={filterStatus === 'unverified' ? 'active' : ''}
              onClick={() => handleStatusFilter('unverified')}
            >
              Unverified
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Joined Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.profile ? (
                          <img src={`/uploads/profiles/${user.profile}`} alt={user.firstName} />
                        ) : (
                          <i className="fas fa-user"></i>
                        )}
                      </div>
                      <div>
                        <div className="user-name">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                      {user.isVerified ? (
                        <><i className="fas fa-check-circle"></i> Verified</>
                      ) : (
                        <><i className="fas fa-times-circle"></i> Unverified</>
                      )}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons-a">
                      {/* View — always show if they have view permission */}
                      {perms.view && (
                        <button className="btn-action btn-view" title="View Details"
                          onClick={() => openViewModal(user)}>
                          <i className="fas fa-eye"></i>
                        </button>
                      )}

                      {/* Edit — only if edit permission */}
                      {perms.edit && (
                        <button className="btn-action btn-edit" title="Edit User"
                          onClick={() => openEditModal(user)}>
                          <i className="fas fa-edit"></i>
                        </button>
                      )}

                      {/* Toggle status — only if edit permission */}
                      {perms.edit && (
                        <button className={`btn-action btn-toggle ${user.isActive ? 'active' : 'inactive'}`}
                          onClick={() => handleToggleStatus(user._id)}
                          title={user.isActive ? 'Deactivate' : 'Activate'}>
                          <i className={`fas fa-toggle-${user.isActive ? 'on' : 'off'}`}></i>
                        </button>
                      )}

                      {/* Delete — only if delete permission */}
                      {perms.delete && (
                        <button className="btn-action btn-delete" title="Delete User"
                          onClick={() => openDeleteModal(user)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && !error && (
            <div className="no-data">
              <i className="fas fa-users"></i>
              <p>No users found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-row">
                  <strong>Name:</strong>
                  <span>{selectedUser.firstName} {selectedUser.lastName}</span>
                </div>
                <div className="detail-row">
                  <strong>Email:</strong>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-row">
                  <strong>Phone:</strong>
                  <span>{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Verified:</strong>
                  <span className={`status-badge ${selectedUser.isVerified ? 'verified' : 'unverified'}`}>
                    {selectedUser.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="detail-row">
                  <strong>Joined:</strong>
                  <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {!selectedUser.isVerified && (
                <button
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                  onClick={() => {
                    handleVerifyUser(selectedUser._id);
                    setShowViewModal(false);
                  }}
                >
                  <i className="fas fa-check-circle"></i>
                  Verify User
                </button>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={selectedUser.firstName}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      firstName: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={selectedUser.lastName}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      lastName: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      email: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({
                      ...selectedUser,
                      phone: e.target.value
                    })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>
                  Are you sure you want to delete user{' '}
                  <strong>
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </strong>?
                </p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleDeleteUser}
              >
                <i className="fas fa-trash"></i>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;