'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminProductAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/ProductForm.css';
import '@/styles/admin/AdminOrders.css';

// ── Helpers ────────────────────────────────────────────────────────────────────
const emptyVariant = () => ({ weight: '', price: '', oldPrice: '', stock: '' });

const ProductForm = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const isEditMode = Boolean(id);
  const MAX_IMAGES = 4;

  // ── State ────────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    shortDescription: '',
    longDescription: '',
    variants: [emptyVariant()],
    usage: [''],
    highlights: [''],
    shelfLife: '',
    storageInstructions: '',
    delivery: '',
    stockStatus: 'In Stock',
    status: 'active',
    isComingSoon: false,
    metaTitle: '',
    metaDescription: '',
    keywords: [''],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // ── Fetch categories ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?isActive=true');
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
          if (!isEditMode && data.categories.length > 0) {
            setFormData((prev) => ({ ...prev, category: data.categories[0]._id }));
          }
        }
      } catch (e) {
        console.error('fetchCategories error:', e);
      }
    };
    fetchCategories();
  }, []);

  // ── Fetch product for edit mode ───────────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await adminProductAPI.getById(id);
        if (res.data.success) {
          const p = res.data.product;
          setFormData({
            name: p.name || '',
            category: p.category?._id || p.category || '',
            shortDescription: p.description?.short || '',
            longDescription: p.description?.long || '',
            variants: p.variants?.length ? p.variants.map((v) => ({
              weight: v.weight || '',
              price: v.price ?? '',
              oldPrice: v.oldPrice ?? '',
              stock: v.stock ?? '',
            })) : [emptyVariant()],
            usage: p.usage?.length ? p.usage : [''],
            highlights: p.highlights?.length ? p.highlights : [''],
            shelfLife: p.shelfLife || '',
            storageInstructions: p.storageInstructions || '',
            delivery: p.delivery || '',
            stockStatus: p.stockStatus || 'In Stock',
            status: p.status || 'active',
            isComingSoon: p.isComingSoon || false,
            metaTitle: p.seo?.metaTitle || '',
            metaDescription: p.seo?.metaDescription || '',
            keywords: p.seo?.keywords?.length ? p.seo.keywords : [''],
          });
          if (p.images?.length) setExistingImages(p.images);
        }
      } catch (e) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, isEditMode]);

  // ── Generic input handler ─────────────────────────────────────────────────────
  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Array field helpers (usage / highlights / keywords) ───────────────────────
  const handleArrayChange = (field, index, value) => {
    const arr = [...formData[field]];
    arr[index] = value;
    setFormData((prev) => ({ ...prev, [field]: arr }));
  };
  const addArrayItem = (field) =>
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  const removeArrayItem = (field, index) =>
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  // ── Variant helpers ───────────────────────────────────────────────────────────
  const handleVariantChange = (index, field, value) => {
    const variants = [...formData.variants];
    variants[index][field] = value;
    setFormData((prev) => ({ ...prev, variants }));
  };
  const addVariant = () =>
    setFormData((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  const removeVariant = (index) =>
    setFormData((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));

  // ── Image handling ────────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = existingImages.length + imageFiles.length;
    const remaining = MAX_IMAGES - currentCount;

    if (remaining <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const valid = files.filter((f) => {
      if (!f.type.startsWith('image/')) { alert(`${f.name} is not an image`); return false; }
      if (f.size > 5 * 1024 * 1024) { alert(`${f.name} exceeds 5MB`); return false; }
      return true;
    }).slice(0, remaining);

    setImageFiles((prev) => [...prev, ...valid]);
    setImagePreview((prev) => [...prev, ...valid.map((f) => URL.createObjectURL(f))]);
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (filename) => {
    if (!isEditMode) return;
    try {
      const res = await adminProductAPI.deleteImage(id, filename);
      if (res.data.success) setExistingImages((prev) => prev.filter((img) => img !== filename));
    } catch {
      alert('Failed to delete image');
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) return setError('Product name is required');
    if (!formData.category) return setError('Category is required');

    const validVariants = formData.variants.filter((v) => v.weight.trim() && v.price !== '');
    if (validVariants.length === 0) return setError('At least one complete variant (weight + price) is required');

    setSaving(true);
    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        description: {
          short: formData.shortDescription,
          long: formData.longDescription,
        },
        variants: validVariants.map((v) => ({
          weight: v.weight.trim(),
          price: parseFloat(v.price) || 0,
          ...(v.oldPrice !== '' && { oldPrice: parseFloat(v.oldPrice) }),
          stock: parseInt(v.stock) || 0,
        })),
        usage: formData.usage.filter((u) => u.trim()),
        highlights: formData.highlights.filter((h) => h.trim()),
        shelfLife: formData.shelfLife,
        storageInstructions: formData.storageInstructions,
        delivery: formData.delivery,
        stockStatus: formData.stockStatus,
        status: formData.status,
        isComingSoon: formData.isComingSoon,
        seo: {
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          keywords: formData.keywords.filter(k => k.trim()),
        },
      };

      const fd = new FormData();
      fd.append('productData', JSON.stringify(productData));
      imageFiles.forEach((file) => fd.append('images', file));
      if (isEditMode) fd.append('keepExistingImages', 'true');

      const token = localStorage.getItem('adminToken');
      const url = isEditMode ? `/api/admin/products/${id}` : '/api/admin/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        router.push('/admin/products');
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (e) {
      setError(e.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const totalImages = existingImages.length + imageFiles.length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading product...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="product-form">
        {/* Header */}
        <div className="form-header">
          <div>
            <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <p>Fill in the product information below</p>
          </div>
          <button className="btn-secondary" onClick={() => router.push('/admin/products')}>
            <i className="fas fa-times"></i> Cancel
          </button>
        </div>

        {error && (
          <div className="error-message" style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#c53030' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Tabs */}
        <div className="form-tabs">
          {[
            { key: 'basic', icon: 'fa-info-circle', label: 'Basic Info' },
            { key: 'variants', icon: 'fa-tags', label: 'Variants & Pricing' },
            { key: 'details', icon: 'fa-list', label: 'Usage & Highlights' },
            { key: 'images', icon: 'fa-images', label: 'Images' },
            { key: 'status', icon: 'fa-cog', label: 'Status & SEO' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`fas ${tab.icon}`}></i> {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>

          {/* ── BASIC INFO ─────────────────────────────────────────────────────── */}
          {activeTab === 'basic' && (
            <div className="form-section-p">
              <h2>Basic Information</h2>

              <div className="form-group full-width">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInput}
                  placeholder="e.g., Cocofina Coconut Sugar"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleInput} required>
                  <option value="">Select Category</option>
                  {categories.filter((c) => !c.parentCategory).map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label>Short Description</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInput}
                  placeholder="Brief product description (max 200 characters)"
                  rows="2"
                  maxLength="200"
                />
                <small>{formData.shortDescription.length}/200 characters</small>
              </div>

              <div className="form-group full-width">
                <label>Long Description</label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInput}
                  placeholder="Detailed product description"
                  rows="6"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Shelf Life</label>
                  <input
                    type="text"
                    name="shelfLife"
                    value={formData.shelfLife}
                    onChange={handleInput}
                    placeholder="e.g., 6 Month"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery</label>
                  <input
                    type="text"
                    name="delivery"
                    value={formData.delivery}
                    onChange={handleInput}
                    placeholder="e.g., Free Delivery 1-2 day"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Storage Instructions</label>
                <input
                  type="text"
                  name="storageInstructions"
                  value={formData.storageInstructions}
                  onChange={handleInput}
                  placeholder="e.g., Store in a cool and dry place in an airtight container"
                />
              </div>
            </div>
          )}

          {/* ── VARIANTS & PRICING ──────────────────────────────────────────────── */}
          {activeTab === 'variants' && (
            <div className="form-section-p">
              <h2>Variants &amp; Pricing</h2>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                Add weight-based variants with their individual prices and stock. Each variant can have a selling price and an optional MRP (old price).
              </p>

              {formData.variants.map((variant, index) => (
                <div
                  key={index}
                  style={{
                    background: '#f9f9f9',
                    border: '1px solid #e0e0e0',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, color: '#333', fontWeight: '600' }}>
                      Variant {index + 1}
                    </h4>
                    {formData.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                      >
                        <i className="fas fa-times"></i> Remove
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Weight / Size *</label>
                      <input
                        type="text"
                        value={variant.weight}
                        onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                        placeholder="e.g., 100g, 250g, 400g"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Selling Price (₹) *</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="120"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>MRP / Old Price (₹)</label>
                      <input
                        type="number"
                        value={variant.oldPrice}
                        onChange={(e) => handleVariantChange(index, 'oldPrice', e.target.value)}
                        placeholder="150"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        placeholder="50"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Discount preview */}
                  {variant.price && variant.oldPrice && parseFloat(variant.oldPrice) > parseFloat(variant.price) && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ background: '#e6f9f0', color: '#1a7f4e', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                        {Math.round(((variant.oldPrice - variant.price) / variant.oldPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addVariant}
                className="btn-add"
                style={{ background: '#667eea', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-plus"></i> Add Another Variant
              </button>
            </div>
          )}

          {/* ── USAGE & HIGHLIGHTS ──────────────────────────────────────────────── */}
          {activeTab === 'details' && (
            <div className="form-section-p">
              <h2>Usage &amp; Highlights</h2>

              {/* Usage */}
              <div className="array-field-group">
                <label>Usage / Applications</label>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  List how this product can be used (e.g., Tea &amp; Coffee, Baking, Desserts)
                </p>
                {formData.usage.map((item, index) => (
                  <div key={index} className="array-field-item">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('usage', index, e.target.value)}
                      placeholder={`Usage ${index + 1} — e.g., Tea & Coffee`}
                    />
                    {formData.usage.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('usage', index)} className="btn-remove">
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('usage')} className="btn-add">
                  <i className="fas fa-plus"></i> Add Usage
                </button>
              </div>

              {/* Highlights */}
              <div className="array-field-group" style={{ marginTop: '32px' }}>
                <label>Product Highlights</label>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                  Key selling points shown on the product page (e.g., 100% Natural, No Preservatives)
                </p>
                {formData.highlights.map((item, index) => (
                  <div key={index} className="array-field-item">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                      placeholder={`Highlight ${index + 1} — e.g., 100% Natural Coconut Sugar`}
                    />
                    {formData.highlights.length > 1 && (
                      <button type="button" onClick={() => removeArrayItem('highlights', index)} className="btn-remove">
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => addArrayItem('highlights')} className="btn-add">
                  <i className="fas fa-plus"></i> Add Highlight
                </button>
              </div>
            </div>
          )}

          {/* ── IMAGES ──────────────────────────────────────────────────────────── */}
          {activeTab === 'images' && (
            <div className="form-section-p">
              <h2>Product Images</h2>

              <div style={{ background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <i className="fas fa-info-circle" style={{ color: '#2196f3', fontSize: '20px', marginTop: '2px' }}></i>
                <div>
                  <strong>Image Requirements:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '14px' }}>
                    <li>Maximum {MAX_IMAGES} images allowed</li>
                    <li>First image will be used as thumbnail</li>
                    <li>Each image max 5MB (JPG, PNG, WEBP)</li>
                    <li>Current: {totalImages}/{MAX_IMAGES}</li>
                  </ul>
                </div>
              </div>

              <div className="image-upload-container">
                {totalImages < MAX_IMAGES ? (
                  <div className="upload-area">
                    <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <label htmlFor="imageUpload" className="upload-label">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to upload images</p>
                      <small>{MAX_IMAGES - totalImages} more image(s) can be added</small>
                    </label>
                  </div>
                ) : (
                  <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '16px', textAlign: 'center', marginBottom: '20px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ color: '#ffc107', fontSize: '24px', marginBottom: '8px' }}></i>
                    <p style={{ margin: 0, fontWeight: '600' }}>Maximum image limit reached ({MAX_IMAGES})</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>Delete existing images to upload new ones</p>
                  </div>
                )}

                {/* Existing Images */}
                {isEditMode && existingImages.length > 0 && (
                  <div>
                    <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Current Images <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>({existingImages.length}/{MAX_IMAGES})</span></h3>
                    <div className="image-preview-grid">
                      {existingImages.map((filename, index) => (
                        <div key={`existing-${index}`} className="preview-item">
                          <img src={getUploadUrl(filename, 'products')} alt={`Product ${index + 1}`} />
                          <button type="button" className="remove-image-btn" onClick={() => removeExistingImage(filename)}>
                            <i className="fas fa-times"></i>
                          </button>
                          {index === 0 && <span className="primary-badge"><i className="fas fa-star"></i> Thumbnail</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {imagePreview.length > 0 && (
                  <div>
                    <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>New Images to Upload <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666' }}>({imagePreview.length} new)</span></h3>
                    <div className="image-preview-grid">
                      {imagePreview.map((preview, index) => (
                        <div key={`new-${index}`} className="preview-item">
                          <img src={preview} alt={`New ${index + 1}`} />
                          <button type="button" className="remove-image-btn" onClick={() => removeNewImage(index)}>
                            <i className="fas fa-times"></i>
                          </button>
                          {existingImages.length === 0 && index === 0 && (
                            <span className="primary-badge"><i className="fas fa-star"></i> Thumbnail</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STATUS & SEO ────────────────────────────────────────────────────── */}
          {activeTab === 'status' && (
            <div className="form-section-p">
              <h2>Status &amp; Availability</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Status</label>
                  <select name="status" value={formData.status} onChange={handleInput}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock Status</label>
                  <select name="stockStatus" value={formData.stockStatus} onChange={handleInput}>
                    <option value="In Stock">In Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="Limited Stock">Limited Stock</option>
                  </select>
                </div>
              </div>

              <div style={{ background: '#f0f4ff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#4338ca' }}><i className="fas fa-info-circle"></i> Status Guide</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
                  <li><strong>Active</strong> — Product is visible and purchasable on the storefront</li>
                  <li><strong>Inactive</strong> — Product is hidden from customers</li>
                  <li><strong>Draft</strong> — Work in progress, not yet published</li>
                </ul>
              </div>

              {/* Coming Soon toggle */}
              <div style={{ marginTop: '24px', background: '#fff8f0', border: '1.5px solid #fed7aa', borderRadius: '10px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', color: '#92400e', fontSize: '15px' }}>
                      <i className="fas fa-clock" style={{ marginRight: '7px' }}></i>Coming Soon
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#78350f' }}>
                      Product appears on the store with a "Coming Soon" badge and the Add to Cart / Buy Now buttons are disabled.
                    </p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: formData.isComingSoon ? '#92400e' : '#6b7280' }}>
                      {formData.isComingSoon ? 'Enabled' : 'Disabled'}
                    </span>
                    <div
                      onClick={() => setFormData(prev => ({ ...prev, isComingSoon: !prev.isComingSoon }))}
                      style={{
                        width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
                        background: formData.isComingSoon ? '#f97316' : '#d1d5db',
                        position: 'relative', transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '3px',
                        left: formData.isComingSoon ? '25px' : '3px',
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </div>
                  </label>
                </div>
              </div>

              {/* SEO Section */}
              <div style={{ marginTop: '32px', borderTop: '1px solid #e0e0e0', paddingTop: '24px' }}>
                <h3>SEO Settings</h3>
                
                <div className="form-group full-width">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInput}
                    placeholder="SEO title (60 characters recommended)"
                    maxLength="60"
                  />
                  <small>{formData.metaTitle.length}/60 characters</small>
                </div>

                <div className="form-group full-width">
                  <label>Meta Description</label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInput}
                    placeholder="SEO description (160 characters recommended)"
                    rows="2"
                    maxLength="160"
                  />
                  <small>{formData.metaDescription.length}/160 characters</small>
                </div>

                <div className="array-field-group">
                  <label>Keywords</label>
                  {formData.keywords.map((keyword, index) => (
                    <div key={index} className="array-field-item">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => handleArrayChange('keywords', index, e.target.value)}
                        placeholder={`Keyword ${index + 1}`}
                      />
                      {formData.keywords.length > 1 && (
                        <button type="button" onClick={() => removeArrayItem('keywords', index)} className="btn-remove">
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addArrayItem('keywords')} className="btn-add">
                    <i className="fas fa-plus"></i> Add Keyword
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => router.push('/admin/products')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <><i className="fas fa-spinner fa-spin"></i> Saving...</>
              ) : (
                <><i className="fas fa-save"></i> {isEditMode ? 'Update Product' : 'Create Product'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;