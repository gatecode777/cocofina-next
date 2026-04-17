'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { adminProductAPI } from '@/services/api';
import '@/styles/admin/AdminProducts.css';

const AdminProducts = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProducts(), 500);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchTerm, filterCategory, filterStatus, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminProductAPI.getAll({
        page: currentPage,
        limit: 20,
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
    } finally {
      setLoading(false);
    }
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

  // Derive lowest variant price for display
  const getLowestPrice = (product) => {
    if (!product.variants?.length) return null;
    return product.variants.reduce((min, v) => (v.price < min ? v.price : min), Infinity);
  };

  const getImageSrc = (product) => {
    if (product.images?.length) return `/uploads/products/${product.images[0]}`;
    if (product.thumbnail) return `/uploads/products/${product.thumbnail}`;
    return '/';
  };

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
          <Link href="/admin/products/new" className="btn-primary">
            <i className="fas fa-plus"></i> Add New Product
          </Link>
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
            const lowestPrice = getLowestPrice(product);
            const variantCount = product.variants?.length || 0;

            return (
              <div key={product._id} className="product-card-admin">
                <div className="product-image">
                  <img
                    src={getImageSrc(product)}
                    alt={product.name}
                    onError={(e) => { e.target.src = '/default-product.png'; }}
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

                  {/* Pricing from variants */}
                  <div className="product-pricing">
                    {lowestPrice !== null ? (
                      <>
                        <span className="selling-price">
                          ₹{lowestPrice.toLocaleString()}
                        </span>
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

                  {/* Status badge */}
                  <div className="product-meta">
                    <div className="meta-item">
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: product.status === 'active' ? '#e6f9f0' : product.status === 'draft' ? '#fff3cd' : '#fde8e8',
                        color: product.status === 'active' ? '#1a7f4e' : product.status === 'draft' ? '#856404' : '#c53030',
                      }}>
                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                      </span>
                      {product.isComingSoon && (
                        <span style={{
                          marginLeft: '6px', padding: '2px 8px', borderRadius: '12px',
                          fontSize: '12px', fontWeight: '600',
                          background: '#fff7ed', color: '#c2410c',
                          border: '1px solid #fed7aa',
                        }}>
                          <i className="fas fa-clock" style={{ marginRight: '4px', fontSize: '10px' }}></i>
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="product-actions">
                    <Link href={`/admin/products/edit/${product._id}`} className="btn-action btn-edit">
                      <i className="fas fa-edit"></i> Edit
                    </Link>
                    <button
                      className="btn-action btn-view"
                      onClick={() => window.open(`/products/${product.slug || product._id}`, '_blank')}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
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
            <Link href="/admin/products/new" className="btn-primary">Add Your First Product</Link>
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

      {/* Delete Modal */}
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
    </AdminLayout>
  );
};

export default AdminProducts;