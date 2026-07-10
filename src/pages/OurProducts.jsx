'use client';

export const dynamic = "force-dynamic";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { productAPI, categoryAPI } from '@/services/api';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/ourproducts.css';

// ── helpers ────────────────────────────────────────────────────────────────────
const getImageSrc = (product) => {
  if (product.images?.length)
    return getUploadUrl(product.images[0], 'products');
  if (product.thumbnail)
    return getUploadUrl(product.thumbnail, 'products');
  return '/cocofinaproduct.png';
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

  // Build page numbers array with ellipsis logic
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

// ── Main Page ─────────────────────────────────────────────────────────────────
const OurProducts = () => {
  const router = useRouter();

  // ── State ───────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Categories for sidebar (fetched from API)
  const [categories, setCategories] = useState([]);
  // Map of categoryId → array of products in that category (for sidebar checkboxes)
  const [categoryProducts, setCategoryProducts] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  // selectedProductIds: Set of product _ids (from sidebar checkboxes)
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());
  // selectedCategoryIds: Set of category _ids (for category-level filtering)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
  // Open/closed state for each filter group
  const [openFilters, setOpenFilters] = useState({});

  const searchDebounceRef = useRef(null);
  const LIMIT = 9;

  // ── Page title ───────────────────────────────────────────────────────────────
  useEffect(() => {
    document.title = 'Our Products - Cocofina';
    window.scrollTo(0, 0);
  }, []);

  // ── Debounce search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [searchTerm]);

  // ── Fetch categories + their products for sidebar ────────────────────────────
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const catRes = await categoryAPI.getAll({ isActive: true });
        if (!catRes.data.success) return;

        const cats = catRes.data.categories;
        setCategories(cats);
        // Default: all filter groups open
        const defaultOpen = {};
        cats.forEach((_, i) => { defaultOpen[i] = true; });
        setOpenFilters(defaultOpen);

        // For each category, fetch its products (name + _id only, large limit)
        const catProductMap = {};
        await Promise.all(
          cats.map(async (cat) => {
            try {
              const res = await productAPI.getAll({ category: cat._id, limit: 100, page: 1 });
              if (res.data.success) {
                catProductMap[cat._id] = res.data.products.map((p) => ({
                  _id: p._id,
                  name: p.name,
                  slug: p.slug,
                }));
              }
            } catch {
              catProductMap[cat._id] = [];
            }
          })
        );
        setCategoryProducts(catProductMap);
      } catch (err) {
        console.error('Sidebar fetch error:', err);
      }
    };
    fetchSidebarData();
  }, []);

  // ── Fetch products (main grid) ───────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Build sort param
      let sortParam = '-createdAt';
      if (sortBy === 'price_asc') sortParam = 'variants.0.price';
      if (sortBy === 'price_desc') sortParam = '-variants.0.price';
      if (sortBy === 'newest') sortParam = '-createdAt';

      // If specific product checkboxes are ticked, we filter client-side
      // Otherwise filter by selected categories
      const params = {
        page: currentPage,
        limit: LIMIT,
        search: debouncedSearch,
        sort: sortParam,
      };

      // If category checkboxes are selected (but no specific products),
      // pass all selected category IDs joined (backend supports single category param,
      // so we do separate requests and merge — or pass the first one for simplicity)
      // Better: fetch all and filter client-side when multi-category needed.
      // Single category filter (most common use case):
      if (selectedCategoryIds.size === 1) {
        params.category = [...selectedCategoryIds][0];
      }

      const res = await productAPI.getAll(params);

      if (res.data.success) {
        let fetched = res.data.products;

        // Client-side: filter by specific checked product IDs
        if (selectedProductIds.size > 0) {
          fetched = fetched.filter((p) => selectedProductIds.has(p._id));
        }

        // Client-side: sort (since backend sort on nested variants may not work)
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggleFilterGroup = (index) =>
    setOpenFilters((prev) => ({ ...prev, [index]: !prev[index] }));

  // Toggle a specific product checkbox
  const toggleProductCheckbox = (productId, categoryId) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
    // Also track the category so we scope the API call
    setSelectedCategoryIds((prev) => {
      const next = new Set(prev);
      // Check if any product in this category is still selected after toggle
      const catProds = categoryProducts[categoryId] || [];
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

  // Toggle an entire category checkbox
  const toggleCategoryCheckbox = (categoryId) => {
    const catProds = categoryProducts[categoryId] || [];
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

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <main>
      <section className="prod-shop-section">
        <div className="prod-container">

          {/* Breadcrumb */}
          <nav className="prod-breadcrumb">
            <span className="prod-breadcrumb-link" onClick={() => router.push('/')}> HOME </span>
            <span>&gt;</span>
            <strong> OUR PRODUCTS </strong>
          </nav>

          <div className="prod-layout">

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="prod-sidebar">
              {/* Search */}
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

              {/* Clear filters button */}
              {hasActiveFilters && (
                <button className="prod-clear-filters" onClick={clearAllFilters}>
                  Clear All Filters
                </button>
              )}

              {/* Dynamic category filter groups */}
              {categories.length === 0 ? (
                // Skeleton for sidebar
                [1, 2, 3].map((i) => (
                  <div key={i} className="prod-filter-group prod-skel-group">
                    <div className="prod-skel-line" style={{ height: '20px', margin: '12px 16px' }}></div>
                  </div>
                ))
              ) : (
                categories.map((cat, index) => {
                  const catProds = categoryProducts[cat._id] || [];
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
                      {/* "All" checkbox for the whole category */}
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

                      {/* Individual product checkboxes */}
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

            {/* ── Main content ─────────────────────────────────────────────── */}
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

              {/* Active filter chips */}
              {(selectedCategoryIds.size > 0 || selectedProductIds.size > 0) && (
                <div className="prod-active-filters">
                  {[...selectedCategoryIds].map((catId) => {
                    const cat = categories.find((c) => c._id === catId);
                    if (!cat) return null;
                    const catProds = categoryProducts[catId] || [];
                    const allInCat = catProds.every((p) => selectedProductIds.has(p._id));
                    if (!allInCat) return null; // only show chip when whole category selected
                    return (
                      <span key={catId} className="prod-filter-chip">
                        {cat.name}
                        <button style={{marginLeft:'3px'}} className='prod-clear-filters' onClick={() => toggleCategoryCheckbox(catId)}>×</button>
                      </span>
                    );
                  })}
                  {[...selectedProductIds].map((prodId) => {
                    // Find this product in categoryProducts
                    let prodName = null;
                    for (const prods of Object.values(categoryProducts)) {
                      const found = prods.find((p) => p._id === prodId);
                      if (found) { prodName = found.name; break; }
                    }
                    if (!prodName) return null;
                    // If entire category is selected, skip individual chips
                    const catId = Object.keys(categoryProducts).find((cid) =>
                      categoryProducts[cid].some((p) => p._id === prodId)
                    );
                    const catProds = categoryProducts[catId] || [];
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

              {/* Error */}
              {error && (
                <div className="prod-error">
                  <p>{error}</p>
                  <button onClick={fetchProducts}>Try Again</button>
                </div>
              )}

              {/* Grid */}
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

export default OurProducts;