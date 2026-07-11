'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const getCoverSrc = (filename) =>
  filename ? `/uploads/blogs/${filename}` : '/Blog1.jpg';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

const BlogCardSkeleton = () => (
  <div className="blog-card blog-card-skel">
    <div className="blog-skel blog-skel-img"></div>
    <div className="blog-skel blog-skel-cat"></div>
    <div className="blog-skel blog-skel-title"></div>
    <div className="blog-skel blog-skel-title" style={{ width: '70%' }}></div>
    <div className="blog-skel blog-skel-footer"></div>
  </div>
);

const BlogsView = ({ initialCategories = [], initialBlogs = [], initialTotalCount = 0 }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initCategory = searchParams.get('category') || 'all';

  const [blogs, setBlogs] = useState(initialBlogs);
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(initCategory);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotalCount / 6) || 1);
  const [totalBlogs, setTotalBlogs] = useState(initialTotalCount);
  const LIMIT = 6;
  const searchDebounceRef = useRef(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: LIMIT };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (activeCategory !== 'all') params.category = activeCategory;

      const res = await axios.get('/api/blogs', { params });
      if (res.data.success) {
        setBlogs(res.data.blogs);
        setTotalPages(res.data.totalPages || 1);
        setTotalBlogs(res.data.total || 0);
      }
    } catch (err) {
      console.error(err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, activeCategory]);

  useEffect(() => {
    // Only call fetchBlogs if filters/page changed from initial state
    if (currentPage !== 1 || searchTerm !== '' || activeCategory !== initCategory) {
      fetchBlogs();
    }
  }, [currentPage, searchTerm, activeCategory, fetchBlogs, initCategory]);

  const handleSearch = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategory = (slug) => {
    setActiveCategory(slug);
    setCurrentPage(1);
    if (slug !== 'all') {
      router.push(`/our-blogs?category=${slug}`, { scroll: false });
    } else {
      router.push('/our-blogs', { scroll: false });
    }
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildPages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <>
      <div className="blog-top-bar">
        <div className="container flex-header">
          <div className="breadcrumb">
            Latest Articles<span className="chevron"> › </span>
            {activeCategory !== 'all' && (
              <span className="breadcrumb-cat">
                {categories.find(c => c.slug === activeCategory)?.name || activeCategory}
              </span>
            )}
          </div>

          <div className="search-container">
            <span className="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search articles…"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchTerm && (
              <button className="blog-search-clear" onClick={() => handleSearch('')}>×</button>
            )}
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="blog-category-bar">
          <div className="container">
            <div className="blog-cat-tabs">
              <button
                className={`blog-cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => handleCategory('all')}
              >
                All <span className="blog-cat-count">{totalBlogs}</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  className={`blog-cat-tab ${activeCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategory(cat.slug)}
                >
                  {cat.name}
                  {cat.blogCount > 0 && <span className="blog-cat-count">{cat.blogCount}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="blog-section" style={{ marginBottom: "80px" }}>
        <div className="container">

          {loading ? (
            <div className="grid-container">
              {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📝</div>
              <h3>No articles found</h3>
              <p>{searchTerm ? `No results for "${searchTerm}"` : 'No articles in this category yet.'}</p>
              {(searchTerm || activeCategory !== 'all') && (
                <button className="blog-reset-btn" onClick={() => { handleSearch(''); handleCategory('all'); }}>
                  View all articles
                </button>
              )}
            </div>
          ) : (
            <div className="grid-container">
              {blogs.map(blog => (
                <div className="blog-card" key={blog._id}>
                  <Link href={`/blog/${blog.slug}`}>
                    <div className="blog-img-wrap">
                      <img
                        src={getCoverSrc(blog.coverImage)}
                        alt={blog.coverImageAlt || blog.title}
                        className="blog-img"
                        loading="lazy"
                        onError={(e) => { e.target.src = '/Blog1.jpg'; }}
                      />
                      {blog.isFeatured && <span className="blog-featured-badge">Featured</span>}
                    </div>
                  </Link>
                  {blog.category && (
                    <button
                      className="category-tag"
                      onClick={() => handleCategory(blog.category.slug)}
                    >
                      {blog.category.name}
                    </button>
                  )}
                  <Link href={`/blog/${blog.slug}`} className="blog-title-link" style={{ textDecoration: "none" }}>
                    <h3 className="blog-title">{blog.title}</h3>
                  </Link>
                  {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
                  <div className="blog-footer">
                    <span className="date">{fmtDate(blog.publishedAt || blog.createdAt)}</span>
                    <span className="read-time">Read time {blog.readTime} Min.</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="pagination">
              <button
                className={`arrow ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >‹</button>
              {buildPages().map((p, i) =>
                p === '...'
                  ? <span key={`d${i}`} className="dots">…</span>
                  : <button key={p} className={`pg-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => handlePageChange(p)}>{p}</button>
              )}
              <button
                className={`arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >›</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default BlogsView;
