'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'react-toastify';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminCategories.css';
import '@/styles/admin/AdminOrders.css';

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: false, create: false, edit: false, delete: false };
  } catch { return {}; }
};

const emptyForm = {
  name: '',
  description: '',
  order: 0,
  isActive: true,
};

const AdminCategories = () => {
  const debounceRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [perms, setPerms] = useState({});

  useEffect(() => {
    setPerms(getAdminPerms('categories'));
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchCategories, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, filterActive]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterActive !== 'all') params.append('isActive', filterActive);

      const res = await fetch(`/api/categories?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      console.error('fetchCategories error:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Name is required'); return; }

    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description);
      fd.append('order', formData.order);
      fd.append('isActive', formData.isActive);
      if (imageFile) fd.append('image', imageFile);

      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();

      if (data.success) {
        toast.success(editingCategory ? 'Category updated' : 'Category created');
        closeModal();
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('handleSubmit error:', err);
      toast.error('Failed to save category');
    }
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      order: category.order ?? 0,
      isActive: category.isActive,
    });
    setImagePreview(category.image ? getUploadUrl(category.image, 'categories') : null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Category deleted');
        fetchCategories();
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('handleDelete error:', err);
      toast.error('Failed to delete category');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/categories/${id}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchCategories();
      } else {
        toast.error('Failed to toggle status');
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading && categories.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading categories...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-categories">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>Categories Management</h1>
            <p>Manage product categories ({categories.length} total)</p>
          </div>
          {perms.create && (
            <button className="btn-primary" onClick={() => { closeModal(); setShowModal(true); }}>
              <i className="fas fa-plus"></i> Add Category
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="categories-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Products</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <i className="fas fa-tags"></i>
                    <p>No categories found</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      {cat.image ? (
                        <img
                          src={getUploadUrl(cat.image, 'categories')}
                          alt={cat.name}
                          className="category-thumbnail"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50?text=No+Image'; }}
                        />
                      ) : (
                        <div className="category-icon">
                          <i className="fas fa-tag"></i>
                        </div>
                      )}
                    </td>
                    <td><strong>{cat.name}</strong></td>
                    <td><code>{cat.slug}</code></td>
                    <td>{cat.productCount ?? 0}</td>
                    <td>{cat.order}</td>
                    <td>
                      <button
                        className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(cat._id)}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-a">
                        {perms.edit && (
                          <button className="btn-action-c btn-edit" onClick={() => handleEdit(cat)} title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {perms.delete && (
                          <button className="btn-action-c btn-delete" onClick={() => handleDelete(cat._id)} title="Delete">
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container category-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Image */}
              <div className="form-group">
                <label>Category Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="categoryImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="categoryImage" className="upload-label">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload image</p>
                        <small>JPG, PNG, WEBP — max 5MB</small>
                      </div>
                    )}
                  </label>
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    style={{ marginTop: '8px', fontSize: '12px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                  >
                    <i className="fas fa-times"></i> Remove image
                  </button>
                )}
              </div>

              {/* Name */}
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder="e.g., Coconut Sugar"
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  placeholder="Brief description of this category..."
                  rows="3"
                />
              </div>

              {/* Order */}
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInput}
                  min="0"
                  placeholder="0"
                />
                <small style={{ color: '#888', fontSize: '12px' }}>Lower number = appears first</small>
              </div>

              {/* Active toggle */}
              <div className="form-row checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInput}
                  />
                  <span>Active (visible on storefront)</span>
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;