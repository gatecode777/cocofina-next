'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminProductAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/admin/AdminProducts.css';
import '@/styles/admin/ShippingModal.css';

const getAdminPerms = (module) => {
  try {
    const data = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (data.role === 'super_admin') return { view: true, create: true, edit: true, delete: true };
    return data.permissions?.[module] || { view: false, create: false, edit: false, delete: false };
  } catch { return {}; }
};

const AdminProducts = () => {
  const router = useRouter();
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [currentPage,    setCurrentPage]    = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [totalProducts,  setTotalProducts]  = useState(0);
  const [showDeleteModal,setShowDeleteModal]= useState(false);
  const [selectedProduct,setSelectedProduct]= useState(null);
  const [error,          setError]          = useState('');
  const [perms,          setPerms]          = useState({});

  // ── Shipping edit modal state ──────────────────────────────────────────────
  const [showShipModal,  setShowShipModal]  = useState(false);
  const [shipProduct,    setShipProduct]    = useState(null);
  const [shipForm,       setShipForm]       = useState({ length: 10, breadth: 10, height: 10, weight: 0.5 });
  const [shipSaving,     setShipSaving]     = useState(false);

  const searchTimeoutRef = useRef(null);

  useEffect(() => { setPerms(getAdminPerms('products')); }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProducts(), 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchTerm, filterCategory, filterStatus, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true); setError('');
      const response = await adminProductAPI.getAll({
        page: currentPage, limit: 20,
        search: searchTerm.trim(),
        category: filterCategory,
        status: filterStatus,
      });
      if (response.data.success) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages);
        setTotalProducts(response.data.totalProducts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally { setLoading(false); }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      const response = await adminProductAPI.delete(selectedProduct._id);
      if (response.data.success) {
        setProducts(products.filter((p) => p._id !== selectedProduct._id));
        setTotalProducts((t) => t - 1);
        setShowDeleteModal(false);
        setSelectedProduct(null);
        if (products.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // ── Open shipping modal ────────────────────────────────────────────────────
  const openShipModal = (product) => {
    setShipProduct(product);
    setShipForm({
      length:  product.shipping?.length  ?? 10,
      breadth: product.shipping?.breadth ?? 10,
      height:  product.shipping?.height  ?? 10,
      weight:  product.shipping?.weight  ?? 0.5,
    });
    setShowShipModal(true);
  };

  // ── Save shipping dimensions ───────────────────────────────────────────────
  const handleSaveShipping = async (e) => {
    e.preventDefault();
    if (!shipProduct) return;
    setShipSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('productData', JSON.stringify({ shipping: shipForm }));
      fd.append('keepExistingImages', 'true');

      const res = await fetch(`/api/admin/products/${shipProduct._id}`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      });
      const data = await res.json();
      if (data.success) {
        // Update locally
        setProducts(prev => prev.map(p =>
          p._id === shipProduct._id ? { ...p, shipping: shipForm } : p
        ));
        setShowShipModal(false);
      } else {
        alert(data.message || 'Failed to save');
      }
    } catch (err) {
      alert('Failed to save shipping dimensions');
    } finally { setShipSaving(false); }
  };

  const getLowestPrice = (product) => {
    if (!product.variants?.length) return null;
    return product.variants.reduce((min, v) => (v.price < min ? v.price : min), Infinity);
  };

  const getImageSrc = (product) => {
    if (product.images?.length) return getUploadUrl(product.images[0], 'products');
    if (product.thumbnail) return getUploadUrl(product.thumbnail, 'products');
    return '/cocofinaproduct.png';
  };

  // Check if shipping is set (non-default values)
  const hasShipping = (product) =>
    product.shipping?.weight && product.shipping.weight > 0;

  if (loading && products.length === 0) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading products...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-products">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>Products Management</h1>
            <p>Manage your product catalog ({totalProducts} total)</p>
          </div>
          {perms.create && (
            <Link href="/admin/products/new" className="btn-primary">
              <i className="fas fa-plus"></i> Add New Product
            </Link>
          )}
        </div>

        {error && (
          <div className="error-message" style={{ background: '#fee', border: '1px solid #fcc', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#c53030' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {/* Filters */}
        <div className="products-controls">
          <div className="search-bar" style={{ position: 'relative' }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            {loading && searchTerm && (
              <i className="fas fa-spinner fa-spin" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}></i>
            )}
          </div>
          <div className="filter-group">
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="filter-select">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.map((product) => {
            const lowestPrice  = getLowestPrice(product);
            const variantCount = product.variants?.length || 0;
            const shipSet      = hasShipping(product);

            return (
              <div key={product._id} className="product-card-admin">
                <div className="product-image">
                  <img
                    src={getImageSrc(product)}
                    alt={product.name}
                    onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                  />
                  <span className={`stock-badge ${product.stockStatus?.toLowerCase().replace(/ /g, '-') || 'in-stock'}`}>
                    {product.stockStatus || 'In Stock'}
                  </span>
                </div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">
                    <i className="fas fa-tag"></i>
                    {product.category?.name || 'Uncategorized'}
                  </p>

                  {/* Pricing */}
                  <div className="product-pricing">
                    {lowestPrice !== null ? (
                      <>
                        <span className="selling-price">₹{lowestPrice.toLocaleString()}</span>
                        {variantCount > 1 && (
                          <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>
                            ({variantCount} variants)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="selling-price" style={{ color: '#999' }}>No variants</span>
                    )}
                  </div>

                  {/* Status + Coming Soon badges */}
                  <div className="product-meta">
                    <div className="meta-item">
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
                        background: product.status === 'active' ? '#e6f9f0' : product.status === 'draft' ? '#fff3cd' : '#fde8e8',
                        color:      product.status === 'active' ? '#1a7f4e' : product.status === 'draft' ? '#856404' : '#c53030',
                      }}>
                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                      </span>
                      {product.isComingSoon && (
                        <span style={{ marginLeft: '6px', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                          <i className="fas fa-clock" style={{ marginRight: '4px', fontSize: '10px' }}></i> Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Shipping dimensions pill ──────────────────────────── */}
                  {perms.edit && (
                    <button
                      className={`ship-dim-pill ${shipSet ? 'ship-dim-set' : 'ship-dim-unset'}`}
                      onClick={() => openShipModal(product)}
                      title="Edit shipping dimensions for Shiprocket"
                    >
                      <i className="fas fa-truck"></i>
                      {shipSet
                        ? `${product.shipping.length}×${product.shipping.breadth}×${product.shipping.height}cm · ${product.shipping.weight}kg`
                        : 'Set shipping dimensions'
                      }
                      <i className="fas fa-pencil-alt" style={{ marginLeft: 5, fontSize: 10 }}></i>
                    </button>
                  )}
                  {!perms.edit && shipSet && (
                    <div className="ship-dim-pill ship-dim-set" style={{ cursor: 'default' }}>
                      <i className="fas fa-truck"></i>
                      {product.shipping.length}×{product.shipping.breadth}×{product.shipping.height}cm · {product.shipping.weight}kg
                    </div>
                  )}

                  {/* Actions */}
                  <div className="product-actions">
                    {perms.edit && (
                      <Link href={`/admin/products/edit/${product._id}`} className="btn-action btn-edit">
                        <i className="fas fa-edit"></i> Edit
                      </Link>
                    )}
                    {perms.view && (
                      <button className="btn-action btn-view" onClick={() => window.open(`/products/${product.slug || product._id}`, '_blank')}>
                        <i className="fas fa-eye"></i> View
                      </button>
                    )}
                    {perms.delete && (
                      <button className="btn-action btn-delete" onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}>
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && !loading && !error && (
          <div className="no-data">
            <i className="fas fa-box-open"></i>
            <p>No products found</p>
            {perms.create && (
              <Link href="/admin/products/new" className="btn-primary">Add Your First Product</Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <i className="fas fa-chevron-left"></i> Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              Next <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button onClick={() => setShowDeleteModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <p>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?</p>
                <p className="warning-text">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteProduct}>
                <i className="fas fa-trash"></i> Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Shipping Dimensions Modal — uses sdm- prefix to avoid CSS conflicts ── */}
      {showShipModal && shipProduct && (
        <div className="sdm-overlay" onClick={() => setShowShipModal(false)}>
          <div className="sdm-modal" onClick={e => e.stopPropagation()}>

            {/* Banner */}
            <div className="sdm-banner">
              <div className="sdm-banner-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="sdm-banner-text">
                <h2 className="sdm-title">Shipping Dimensions</h2>
                <p className="sdm-subtitle">Packed box size for Shiprocket</p>
              </div>
              <button className="sdm-close" onClick={() => setShowShipModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Product name pill */}
            <div className="sdm-product-tag">
              <i className="fas fa-box"></i>
              {shipProduct.name}
            </div>

            <form onSubmit={handleSaveShipping} className="sdm-body">

              {/* 4 inputs in 2×2 grid */}
              <div className="sdm-grid">
                {[
                  { key: 'length',  label: 'Length',      unit: 'cm', icon: 'fa-arrows-alt-h', placeholder: '15',  step: '0.1'  },
                  { key: 'breadth', label: 'Breadth',     unit: 'cm', icon: 'fa-arrows-alt-v', placeholder: '10',  step: '0.1'  },
                  { key: 'height',  label: 'Height',      unit: 'cm', icon: 'fa-sort-amount-up', placeholder: '8', step: '0.1'  },
                  { key: 'weight',  label: 'Dead Weight', unit: 'kg', icon: 'fa-weight-hanging', placeholder: '0.5',step: '0.01' },
                ].map(({ key, label, unit, icon, placeholder, step }) => (
                  <div className="sdm-field" key={key}>
                    <label className="sdm-label">
                      <i className={`fas ${icon}`}></i> {label}
                    </label>
                    <div className="sdm-input-wrap">
                      <input
                        type="number" min="0.1" step={step} required
                        placeholder={placeholder}
                        value={shipForm[key]}
                        onChange={e => setShipForm(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))}
                        className="sdm-input"
                      />
                      <span className="sdm-unit">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Volumetric weight card */}
              <div className="sdm-vol-card">
                <div className="sdm-vol-row">
                  <span className="sdm-vol-label">
                    <i className="fas fa-calculator"></i> Volumetric Weight
                  </span>
                  <span className="sdm-vol-value">
                    {((shipForm.length * shipForm.breadth * shipForm.height) / 5000).toFixed(3)} kg
                  </span>
                </div>
                <div className="sdm-vol-formula">L × B × H ÷ 5000</div>
                <div className="sdm-vol-note">
                  <i className="fas fa-info-circle"></i>
                  Shiprocket bills whichever is higher — volumetric or dead weight.
                </div>
                {/* Billable weight highlight */}
                {(() => {
                  const vol = parseFloat(((shipForm.length * shipForm.breadth * shipForm.height) / 5000).toFixed(3));
                  const dead = parseFloat(shipForm.weight);
                  const billable = Math.max(vol, dead);
                  return (
                    <div className="sdm-billable">
                      Billable weight: <strong>{billable.toFixed(3)} kg</strong>
                      <span className="sdm-billable-src">({vol > dead ? 'volumetric' : 'dead weight'})</span>
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="sdm-footer">
                <button type="button" className="sdm-btn-cancel" onClick={() => setShowShipModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="sdm-btn-save" disabled={shipSaving}>
                  {shipSaving
                    ? <><i className="fas fa-spinner fa-spin"></i> Saving…</>
                    : <><i className="fas fa-save"></i> Save Dimensions</>}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminProducts;