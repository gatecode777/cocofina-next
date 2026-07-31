'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { Sparkles, Search, Clock, Calendar, ArrowRight, Loader2, BookOpen, X } from 'lucide-react';
import { getUploadUrl } from '@/lib/imageHelper';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const BlogCardSkeleton = () => (
  <div className="bg-neutral-100 dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden p-4 space-y-4 animate-pulse">
    <div className="h-48 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>
    <div className="h-4 bg-amber-500/20 w-1/4 rounded-full"></div>
    <div className="h-6 bg-neutral-200 dark:bg-neutral-800 w-3/4 rounded-lg"></div>
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-full rounded"></div>
    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 w-2/3 rounded"></div>
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between">
      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/3 rounded"></div>
      <div className="h-3 bg-neutral-200 dark:bg-neutral-800 w-1/4 rounded"></div>
    </div>
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
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-20 flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Hero Header Section */}
        <section className="py-16 px-6 sm:px-10 text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Articles & Health Insights
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-neutral-900 dark:text-white font-playfair italic">
            The Cocofina Journal
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore expert articles on coconut sugar health benefits, low-GI nutrition, cooking recipes, and organic wellness living.
          </p>

          {/* Search Bar */}
          <div className="pt-4 max-w-md mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles, recipes & guides..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-10 py-3 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs sm:text-sm rounded-full border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:border-amber-500 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="px-6 sm:px-10 max-w-7xl mx-auto mb-10">
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-6">
            <button
              onClick={() => handleCategory('all')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              All Articles
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeCategory === 'all' ? 'bg-amber-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}>
                {totalBlogs}
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategory(cat.slug)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                {cat.name}
                {cat.blogCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeCategory === cat.slug ? 'bg-amber-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}>
                    {cat.blogCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Main Grid */}
        <section className="pb-24 px-6 sm:px-10 max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic">
                No articles found
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {searchTerm ? `No stories matching "${searchTerm}"` : 'No articles available in this category yet.'}
              </p>
              {(searchTerm || activeCategory !== 'all') && (
                <button
                  onClick={() => {
                    handleSearch('');
                    handleCategory('all');
                  }}
                  className="bg-amber-600 text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-amber-700 transition-colors cursor-pointer"
                >
                  View All Articles
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <article
                  key={blog._id}
                  className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative h-56 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                      <Link href={`/blog/${blog.slug}`}>
                        <img
                          src={getUploadUrl(blog.coverImage, 'blogs')}
                          alt={blog.coverImageAlt || blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/Blog1.jpg';
                          }}
                        />
                      </Link>
                      {blog.category && (
                        <button
                          onClick={() => handleCategory(blog.category.slug)}
                          className="absolute top-4 left-4 bg-neutral-900/80 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-md hover:bg-amber-600 transition-colors"
                        >
                          {blog.category.name}
                        </button>
                      )}
                      {blog.isFeatured && (
                        <span className="absolute top-4 right-4 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                          Featured
                        </span>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-3">
                      <Link href={`/blog/${blog.slug}`} className="block group-hover:text-amber-600 transition-colors">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-playfair italic leading-snug">
                          {blog.title}
                        </h3>
                      </Link>

                      {blog.excerpt && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-3">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        {fmtDate(blog.publishedAt || blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {blog.readTime || 5} min read
                      </span>
                    </div>

                    <Link
                      href={`/blog/${blog.slug}`}
                      className="text-amber-600 dark:text-amber-400 font-bold hover:text-amber-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                    >
                      Read <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-center gap-2 mt-16">
              <button
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentPage === 1
                    ? 'opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 text-neutral-400'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-600 hover:text-white cursor-pointer'
                }`}
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {buildPages().map((p, i) =>
                p === '...' ? (
                  <span key={`d${i}`} className="px-2 text-xs text-neutral-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`w-9 h-9 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentPage === totalPages
                    ? 'opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 text-neutral-400'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-amber-600 hover:text-white cursor-pointer'
                }`}
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default BlogsView;
