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
    return data.permissions?.[module] || { view: true, create: true, edit: true, delete: true };
  } catch {
    return { view: true, create: true, edit: true, delete: true };
  }
};

const emptyForm = {
  title: '',
  category: 'Beverage',
  time: '15 mins',
  servings: '2 servings',
  description: '',
  ingredients: [''],
  steps: [''],
  order: 0,
  isActive: true,
};

const CATEGORIES = [
  'Beverage',
  'Baking',
  'Traditional Indian Dessert',
  'Daily Beverages',
  'Breakfast',
  'Everyday Cooking',
  'Sauces & Syrups',
];

export default function AdminRecipes() {
  const debounceRef = useRef(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  const [formData, setFormData] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [perms, setPerms] = useState({});

  // Compute all unique categories combining defaults and existing recipes
  const allCategories = Array.from(new Set([
    ...CATEGORIES,
    ...recipes.map((r) => r.category).filter(Boolean)
  ]));

  useEffect(() => {
    setPerms(getAdminPerms('recipes'));
  }, []);

  // ── Fetch Recipes ────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchRecipes, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm, categoryFilter, filterActive]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (filterActive !== 'all') params.append('isActive', filterActive);

      const res = await fetch(`/api/recipes?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error('fetchRecipes error:', err);
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // ── Form Input Handlers ──────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleIngredientChange = (index, value) => {
    const updated = [...formData.ingredients];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: updated }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({ ...prev, ingredients: [...prev.ingredients, ''] }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length <= 1) return;
    const updated = formData.ingredients.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, ingredients: updated }));
  };

  const handleStepChange = (index, value) => {
    const updated = [...formData.steps];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, steps: updated }));
  };

  const addStep = () => {
    setFormData((prev) => ({ ...prev, steps: [...prev.steps, ''] }));
  };

  const removeStep = (index) => {
    if (formData.steps.length <= 1) return;
    const updated = formData.steps.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, steps: updated }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Submit Form ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('title', formData.title.trim());
      fd.append('category', formData.category);
      fd.append('time', formData.time);
      fd.append('servings', formData.servings);
      fd.append('description', formData.description);
      fd.append('order', formData.order);
      fd.append('isActive', formData.isActive);

      const validIngredients = formData.ingredients.filter((i) => i.trim() !== '');
      const validSteps = formData.steps.filter((s) => s.trim() !== '');

      fd.append('ingredients', JSON.stringify(validIngredients));
      fd.append('steps', JSON.stringify(validSteps));

      if (imageFile) fd.append('image', imageFile);

      const url = editingRecipe ? `/api/recipes/${editingRecipe._id}` : '/api/recipes';
      const method = editingRecipe ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingRecipe ? 'Recipe updated' : 'Recipe created');
        closeModal();
        fetchRecipes();
      } else {
        toast.error(data.message || 'Failed to save recipe');
      }
    } catch (err) {
      console.error('handleSubmit error:', err);
      toast.error('Failed to save recipe');
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    const cat = recipe.category || 'Beverage';
    const isCustom = !CATEGORIES.includes(cat);
    setIsCustomCategory(isCustom);
    setFormData({
      title: recipe.title || '',
      category: cat,
      time: recipe.time || '15 mins',
      servings: recipe.servings || '2 servings',
      description: recipe.description || '',
      ingredients: recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [''],
      steps: recipe.steps && recipe.steps.length > 0 ? recipe.steps : [''],
      order: recipe.order ?? 0,
      isActive: recipe.isActive ?? true,
    });
    setImagePreview(recipe.image ? getUploadUrl(recipe.image, 'recipes') : null);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Recipe deleted');
        fetchRecipes();
      } else {
        toast.error(data.message || 'Failed to delete recipe');
      }
    } catch (err) {
      console.error('handleDelete error:', err);
      toast.error('Failed to delete recipe');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/recipes/${id}/toggle-active`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchRecipes();
      } else {
        toast.error('Failed to toggle status');
      }
    } catch (err) {
      toast.error('Failed to toggle status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecipe(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setIsCustomCategory(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading && recipes.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading recipes...</p>
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
            <h1>Recipes Management</h1>
            <p>Add, edit, delete and manage storefront recipes ({recipes.length} total)</p>
          </div>
          {perms.create && (
            <button className="btn-primary" onClick={() => { closeModal(); setShowModal(true); }}>
              <i className="fas fa-plus"></i> Add New Recipe
            </button>
          )}
        </div>

        {/* Controls / Filters */}
        <div className="categories-controls">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search recipes by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Recipes Table */}
        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Time & Servings</th>
                <th>Ingredients</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <i className="fas fa-utensils"></i>
                    <p>No recipes found</p>
                  </td>
                </tr>
              ) : (
                recipes.map((rec) => (
                  <tr key={rec._id}>
                    <td>
                      {rec.image ? (
                        <img
                          src={getUploadUrl(rec.image, 'recipes')}
                          alt={rec.title}
                          className="category-thumbnail"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/50x50?text=Recipe'; }}
                        />
                      ) : (
                        <div className="category-icon">
                          <i className="fas fa-utensils"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{rec.title}</strong>
                      {rec.description && (
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rec.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                        {rec.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        <div><i className="far fa-clock" style={{ marginRight: '4px', color: '#d97706' }}></i>{rec.time}</div>
                        <div style={{ color: '#6b7280' }}><i className="fas fa-users" style={{ marginRight: '4px', color: '#d97706' }}></i>{rec.servings}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#374151' }}>
                        {rec.ingredients ? rec.ingredients.length : 0} items
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-badge ${rec.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(rec._id)}
                      >
                        {rec.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons-a">
                        {perms.edit && (
                          <button className="btn-action-c btn-edit" onClick={() => handleEdit(rec)} title="Edit Recipe">
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {perms.delete && (
                          <button className="btn-action-c btn-delete" onClick={() => handleDelete(rec._id)} title="Delete Recipe">
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

      {/* Add / Edit Recipe Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container category-modal" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {/* Image Upload */}
              <div className="form-group">
                <label>Recipe Image</label>
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="recipeImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="recipeImage" className="upload-label">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="image-preview" style={{ maxHeight: '160px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <p>Click to upload recipe image</p>
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

              {/* Title */}
              <div className="form-group">
                <label>Recipe Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInput}
                  placeholder="e.g., Morning Caramel Iced Latte"
                  required
                />
              </div>

              {/* Category, Prep Time, Servings */}
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ margin: 0 }}>Category</label>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#d97706',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory) {
                          setFormData(prev => ({ ...prev, category: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, category: allCategories[0] || 'Beverage' }));
                        }
                      }}
                    >
                      {isCustomCategory ? 'Select from List' : '+ Add Custom'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInput}
                      placeholder="Type custom category..."
                      required
                      autoFocus
                    />
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setFormData(prev => ({ ...prev, category: '' }));
                        } else {
                          handleInput(e);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        background: '#ffffff',
                        fontSize: '13px',
                        color: '#111827',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__" style={{ fontWeight: 700, color: '#d97706' }}>
                        + Add Custom Category...
                      </option>
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Prep Time</label>
                  <input
                    type="text"
                    name="time"
                    value={formData.time}
                    onChange={handleInput}
                    placeholder="e.g., 15 mins"
                  />
                </div>

                <div className="form-group">
                  <label>Servings</label>
                  <input
                    type="text"
                    name="servings"
                    value={formData.servings}
                    onChange={handleInput}
                    placeholder="e.g., 2 servings"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInput}
                  placeholder="Brief description of the recipe..."
                  rows="2"
                />
              </div>

              {/* Key Ingredients */}
              <div className="form-group" style={{ background: '#fdfbf7', padding: '14px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ margin: 0, fontWeight: 700, letterSpacing: '0.05em', fontSize: '13px', color: '#92400e' }}>
                    KEY INGREDIENTS:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                      onClick={() => {
                        const raw = prompt("Paste all ingredients (one per line):");
                        if (raw) {
                          const parsed = raw.split('\n').map(l => l.replace(/^[•●\-\*\d\.\)\s]+/, '').trim()).filter(Boolean);
                          if (parsed.length > 0) setFormData(p => ({ ...p, ingredients: parsed }));
                        }
                      }}
                    >
                      <i className="fas fa-paste"></i> Bulk Paste
                    </button>
                    <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={addIngredient}>
                      <i className="fas fa-plus"></i> Add Item
                    </button>
                  </div>
                </div>

                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ color: '#d97706', fontSize: '14px', lineHeight: 1, userSelect: 'none' }}>●</span>
                    <input
                      type="text"
                      value={ing}
                      onChange={(e) => handleIngredientChange(idx, e.target.value)}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        if (pasted.includes('\n')) {
                          e.preventDefault();
                          const lines = pasted.split('\n').map(l => l.replace(/^[•●\-\*\d\.\)\s]+/, '').trim()).filter(Boolean);
                          if (lines.length > 0) {
                            const newIngs = [...formData.ingredients];
                            newIngs.splice(idx, 1, ...lines);
                            setFormData(prev => ({ ...prev, ingredients: newIngs }));
                          }
                        }
                      }}
                      placeholder="e.g. 1 cup Cocofina Coconut Sugar (1:1 substitute for brown sugar)"
                      style={{ flex: 1 }}
                    />
                    {formData.ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '32px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Preparation Steps */}
              <div className="form-group" style={{ background: '#fdfbf7', padding: '14px', borderRadius: '12px', border: '1px solid #fef3c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ margin: 0, fontWeight: 700, letterSpacing: '0.05em', fontSize: '13px', color: '#92400e' }}>
                    PREPARATION STEPS:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                      onClick={() => {
                        const raw = prompt("Paste all preparation steps (one per line):");
                        if (raw) {
                          const parsed = raw.split('\n').map(l => l.replace(/^[•●\-\*\d\.\)\s]+/, '').trim()).filter(Boolean);
                          if (parsed.length > 0) setFormData(p => ({ ...p, steps: parsed }));
                        }
                      }}
                    >
                      <i className="fas fa-paste"></i> Bulk Paste
                    </button>
                    <button type="button" className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={addStep}>
                      <i className="fas fa-plus"></i> Add Step
                    </button>
                  </div>
                </div>

                {formData.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#d97706', fontSize: '13px', minWidth: '20px', paddingTop: '8px', textAlign: 'right' }}>
                      {idx + 1}.
                    </span>
                    <textarea
                      rows="2"
                      value={step}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        if (pasted.includes('\n')) {
                          e.preventDefault();
                          const lines = pasted.split('\n').map(l => l.replace(/^[•●\-\*\d\.\)\s]+/, '').trim()).filter(Boolean);
                          if (lines.length > 0) {
                            const newSteps = [...formData.steps];
                            newSteps.splice(idx, 1, ...lines);
                            setFormData(prev => ({ ...prev, steps: newSteps }));
                          }
                        }
                      }}
                      placeholder={`Step ${idx + 1} method...`}
                      style={{ flex: 1 }}
                    />
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', width: '32px', height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Order & Active toggle */}
              <div className="form-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0, flex: 1 }}>
                  <label>Display Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInput}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-row checkbox-row" style={{ margin: 0, flex: 1, paddingTop: '16px' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInput}
                    />
                    <span>Active (Visible on storefront)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
