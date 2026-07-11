'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getUploadUrl } from '@/lib/imageHelper';

// ── helpers ────────────────────────────────────────────────────────────────────
const getImageSrc = (product) => {
  const firstImage = product.images?.[0] || product.thumbnail;
  return getUploadUrl(firstImage, 'products') || '/cocofinaproduct.png';
};

const getLowestVariant = (product) => {
  if (!product.variants?.length) return null;
  return product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
};

// ── Filter Group ───────────────────────────────────────────────────────────────
const FilterGroup = ({ title, index, activeFilter, onToggle, children }) => (
  <div className={`prod-filter-group ${activeFilter ? 'active' : ''}`}>
    <div className="prod-filter-header" onClick={() => onToggle(index)}>
      {title} <i className="chevron-down">▼</i>
    </div>
    <div className="prod-filter-content">{children}</div>
  </div>
);

// ── Skeleton card ──────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="prod-card prod-card-skeleton">
    <div className="prod-img-bg prod-skel-img"></div>
    <div className="prod-info">
      <div className="prod-skel-line prod-skel-title"></div>
      <div className="prod-skel-line prod-skel-desc"></div>
      <div className="prod-skel-line prod-skel-desc" style={{ width: '60%' }}></div>
      <div className="prod-skel-line prod-skel-price"></div>
    </div>
  </div>
);

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product }) => {
  const router = useRouter();
  const lowestVar = getLowestVariant(product);
  const isComingSoon = product.isComingSoon;
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isLimitedStock = product.stockStatus === 'Limited Stock';
  const [selectedVariant, setSelectedVariant] = useState(lowestVar);

  return (
    <div className="prod-card">
      <div className="prod-img-bg" style={{ position: 'relative' }}>
        <img
          src={getImageSrc(product)}
          alt={product.name}
          onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
          style={isComingSoon || isOutOfStock ? { opacity: 0.7, filter: 'grayscale(25%)' } : {}}
        />
        {isComingSoon && (
          <span className="prod-coming-soon-badge">⏳ Coming Soon</span>
        )}
        {isOutOfStock && !isComingSoon && (
          <span className="prod-out-of-stock-badge">🚫 Out of Stock</span>
        )}
        {isLimitedStock && !isComingSoon && (
          <span className="prod-limited-stock-badge">⚠️ Limited Stock</span>
        )}
      </div>
      <div className="prod-info">
        <h3>{product.name}</h3>

        {product.variants?.length > 1 && !isComingSoon && (
          <div className="prod-variant-btns">
            {product.variants.map((v) => (
              <button
                key={v.weight}
                className={`prod-variant-btn ${selectedVariant?.weight === v.weight ? 'active' : ''}`}
                onClick={() => setSelectedVariant(v)}
              >
                {v.weight}
              </button>
            ))}
          </div>
        )}

        {product.description?.short && (
          <p className="prod-desc">{product.description.short}</p>
        )}

        <div className="prod-footer">
          <div className="prod-price-block">
            {isComingSoon ? (
              <span className="prod-price" style={{ color: '#f97316', fontSize: '14px' }}>Available Soon</span>
            ) : selectedVariant ? (
              <>
                <span className="prod-price">₹{selectedVariant.price}/-</span>
              </>
            ) : (
              <span className="prod-price" style={{ color: '#999' }}>—</span>
            )}
          </div>
          <button
            className="prod-order-btn"
            onClick={() => !isComingSoon && !isOutOfStock && router.push(`/products/${product.slug || product._id}`)}
            disabled={isComingSoon || isOutOfStock}
            style={{ 
              border: 'none', 
              ...(isComingSoon ? { opacity: 0.55, cursor: 'not-allowed', background: '#9ca3af', boxShadow: 'none' } : {}),
              ...(isOutOfStock ? { opacity: 0.65, cursor: 'not-allowed', background: '#dc2626', color: '#fff', boxShadow: 'none' } : {})
            }}
          >
            {isComingSoon ? 'Coming Soon' : isOutOfStock ? 'Out of Stock' : 'Order Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const buildPages = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination-container">
      <button
        className="page-arrow"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {buildPages().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="page-dots">...</span>
        ) : (
          <button
            key={p}
            className={`page-num ${p === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="page-arrow"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
};

const CatalogView = ({ initialCategories = [], initialCategoryProducts = {} }) => {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  const [openFilters, setOpenFilters] = useState(() => {
    const defaultOpen = {};
    initialCategories.forEach((_, i) => { defaultOpen[i] = true; });
    return defaultOpen;
  });

  const searchDebounceRef = useRef(null);
  const LIMIT = 9;

  // Debounce search
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let sortParam = '-createdAt';
      if (sortBy === 'price_asc') sortParam = 'variants.0.price';
      if (sortBy === 'price_desc') sortParam = '-variants.0.price';
      if (sortBy === 'newest') sortParam = '-createdAt';

      const params = {
        page: currentPage,
        limit: LIMIT,
        search: debouncedSearch,
        sort: sortParam,
      };

      if (selectedCategoryIds.size === 1) {
        params.category = [...selectedCategoryIds][0];
      }

      const res = await axios.get('/api/products', { params });

      if (res.data.success) {
        let fetched = res.data.products;

        if (selectedProductIds.size > 0) {
          fetched = fetched.filter((p) => selectedProductIds.has(p._id));
        }

        if (sortBy === 'price_asc') {
          fetched = [...fetched].sort((a, b) => {
            const aMin = getLowestVariant(a)?.price ?? Infinity;
            const bMin = getLowestVariant(b)?.price ?? Infinity;
            return aMin - bMin;
          });
        } else if (sortBy === 'price_desc') {
          fetched = [...fetched].sort((a, b) => {
            const aMin = getLowestVariant(a)?.price ?? 0;
            const bMin = getLowestVariant(b)?.price ?? 0;
            return bMin - aMin;
          });
        }

        setProducts(fetched);
        setTotalProducts(res.data.totalProducts);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('fetchProducts error:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, sortBy, selectedCategoryIds, selectedProductIds]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleFilterGroup = (index) =>
    setOpenFilters((prev) => ({ ...prev, [index]: !prev[index] }));

  const toggleProductCheckbox = (productId, categoryId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });

    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      const catProds = initialCategoryProducts[categoryId] || [];
      const newProductIds = new Set(selectedProductIds);
      if (newProductIds.has(productId)) newProductIds.delete(productId);
      else newProductIds.add(productId);
      const anySelected = catProds.some((p) => newProductIds.has(p._id));
      if (anySelected) next.add(categoryId);
      else next.delete(categoryId);
      return next;
    });
    setCurrentPage(1);
  };

  const toggleCategoryCheckbox = (categoryId) => {
    const catProds = initialCategoryProducts[categoryId] || [];
    const allSelected = catProds.every((p) => selectedProductIds.has(p._id));

    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        catProds.forEach((p) => next.delete(p._id));
      } else {
        catProds.forEach((p) => next.add(p._id));
      }
      return next;
    });
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      if (allSelected) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedProductIds(new Set());
    setSelectedCategoryIds(new Set());
    setSearchTerm('');
    setDebouncedSearch('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedProductIds.size > 0 || selectedCategoryIds.size > 0 || debouncedSearch;

  return (
    <main>
      <section className="prod-shop-section">
        <div className="prod-container">
          <nav className="prod-breadcrumb">
            <span className="prod-breadcrumb-link" onClick={() => router.push('/')}> HOME </span>
            <span>&gt;</span>
            <strong> OUR PRODUCTS </strong>
          </nav>

          <div className="prod-layout">
            <aside className="prod-sidebar">
              <div className="prod-search-box">
                <svg className="custom-search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {hasActiveFilters && (
                <button className="prod-clear-filters" onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              )}

              {initialCategories.length === 0 ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="prod-filter-group prod-skel-group">
                    <div className="prod-skel-line" style={{ height: '20px', margin: '12px 16px' }}></div>
                  </div>
                ))
              ) : (
                initialCategories.map((cat, index) => {
                  const catProds = initialCategoryProducts[cat._id] || [];
                  const allSelected = catProds.length > 0 && catProds.every((p) => selectedProductIds.has(p._id));
                  const someSelected = catProds.some((p) => selectedProductIds.has(p._id));

                  return (
                    <FilterGroup
                      key={cat._id}
                      title={cat.name}
                      index={index}
                      activeFilter={openFilters[index]}
                      onToggle={toggleFilterGroup}
                    >
                      {catProds.length > 0 && (
                        <label className="prod-checkbox-item prod-checkbox-all">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={() => toggleCategoryCheckbox(cat._id)}
                          />
                          <span>All {cat.name}</span>
                        </label>
                      )}

                      {catProds.length === 0 ? (
                        <p className="prod-no-items">No products in this category</p>
                      ) : (
                        catProds.map((prod) => (
                          <label key={prod._id} className="prod-checkbox-item">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.has(prod._id)}
                              onChange={() => toggleProductCheckbox(prod._id, cat._id)}
                            />
                            <span>{prod.name}</span>
                          </label>
                        ))
                      )}
                    </FilterGroup>
                  );
                })
              )}
            </aside>

            <main className="prod-main-content">
              <div className="prod-top-bar">
                <div className="prod-count">
                  {loading ? (
                    <span>Loading...</span>
                  ) : (
                    <>Total Products <span>{totalProducts}</span></>
                  )}
                </div>
                <div className="prod-sort">
                  <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {(selectedCategoryIds.size > 0 || selectedProductIds.size > 0) && (
                <div className="prod-active-filters">
                  {[...selectedCategoryIds].map((catId) => {
                    const cat = initialCategories.find((c) => c._id === catId);
                    if (!cat) return null;
                    const catProds = initialCategoryProducts[catId] || [];
                    const allInCat = catProds.every((p) => selectedProductIds.has(p._id));
                    if (!allInCat) return null;
                    return (
                      <span key={catId} className="prod-filter-chip">
                        {cat.name}
                        <button style={{marginLeft:'3px'}} className='prod-clear-filters' onClick={() => toggleCategoryCheckbox(catId)}>×</button>
                      </span>
                    );
                  })}
                  {[...selectedProductIds].map((prodId) => {
                    let prodName = null;
                    for (const prods of Object.values(initialCategoryProducts)) {
                      const found = prods.find((p) => p._id === prodId);
                      if (found) { prodName = found.name; break; }
                    }
                    if (!prodName) return null;
                    const catId = Object.keys(initialCategoryProducts).find((cid) =>
                      initialCategoryProducts[cid].some((p) => p._id === prodId)
                    );
                    const catProds = initialCategoryProducts[catId] || [];
                    if (catProds.length > 0 && catProds.every((p) => selectedProductIds.has(p._id))) return null;
                    return (
                      <span key={prodId} className="prod-filter-chip">
                        {prodName}
                        <button style={{marginLeft:'3px'}} className='prod-clear-filters' onClick={() => {
                          setSelectedProductIds((prev) => {
                            const next = new Set(prev);
                            next.delete(prodId);
                            return next;
                          });
                          setCurrentPage(1);
                        }}>×</button>
                      </span>
                    );
                  })}
                </div>
              )}

              {error && (
                <div className="prod-error">
                  <p>{error}</p>
                  <button onClick={fetchProducts}>Try Again</button>
                </div>
              )}

              {loading ? (
                <div className="prod-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
                </div>
              ) : products.length === 0 ? (
                <div className="prod-empty">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <p>No products found</p>
                  {hasActiveFilters && (
                    <button className="prod-clear-filters" onClick={clearAllFilters}>
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="prod-grid">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </main>
  );
};

export default CatalogView;
