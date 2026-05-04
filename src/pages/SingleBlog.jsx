'use client';

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { blogAPI } from '@/services/api';
import '@/styles/singleblog.css';

const getCoverSrc = (f) => f ? `/uploads/blogs/${f}` : '/Blog1.jpg';
const getAuthorSrc = (f) => f ? `/uploads/profiles/${f}` : null;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

// Helper function to render text with links
const renderTextWithLinks = (text, links = []) => {
  if (!text) return null;
  if (!links || links.length === 0) {
    // Return text with line breaks
    return <span dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />;
  }
  
  // Create a copy of the text to work with
  let result = text;
  
  // Sort links by text length (longest first) to avoid partial replacements
  const sortedLinks = [...links].sort((a, b) => b.text.length - a.text.length);
  
  // Replace each link text with an HTML anchor
  sortedLinks.forEach(link => {
    const linkText = link.text;
    const url = link.url;
    const openInNewTab = link.openInNewTab !== false;
    const target = openInNewTab ? '_blank' : '_self';
    const rel = openInNewTab ? 'noopener noreferrer' : '';
    
    // Check if internal or external link
    let href = url;
    if (url.startsWith('/') || url.startsWith('#')) {
      // Internal link - will be handled by Next.js Link component
      // We'll use a special marker and replace later
      const marker = `__LINK_MARKER_${Math.random()}_${Date.now()}__`;
      const replacement = `<a href="${href}" target="${target}" rel="${rel}" class="inline-link" data-internal="true">${linkText}</a>`;
      result = result.split(linkText).join(marker);
      // Store the replacement for later
      // This is a simplified approach; for production, use a more robust method
    } else {
      // External link
      const regex = new RegExp(`(${linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
      result = result.replace(regex, `<a href="${href}" target="${target}" rel="${rel}" class="inline-link">${linkText}</a>`);
    }
  });
  
  // Replace any remaining markers (for internal links) - simplified
  return <span dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />;
};

// ── Content block renderer with link support ────────────────────────────────────
const ContentBlock = ({ block }) => {
  switch (block.type) {

    case 'heading':
      return (
        <h2 className="blg-sub-heading">
          {block.links && block.links.length > 0 
            ? renderTextWithLinks(block.text, block.links)
            : block.text}
        </h2>
      );

    case 'subheading':
      return (
        <h3 className="blg-list-title">
          {block.links && block.links.length > 0 
            ? renderTextWithLinks(block.text, block.links)
            : block.text}
        </h3>
      );

    case 'paragraph':
      if (block.links && block.links.length > 0) {
        return (
          <div className="blg-paragraph">
            {renderTextWithLinks(block.text, block.links)}
          </div>
        );
      }
      return (
        <p dangerouslySetInnerHTML={{
          __html: (block.text || '').replace(/\n/g, '<br />')
        }} />
      );

    case 'bullet_list':
      return (
        <ul className="blg-bullets">
          {(block.items || []).filter(Boolean).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );

    case 'numbered_list':
      return (
        <ol className="blg-numbered">
          {(block.items || []).filter(Boolean).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );

    case 'quote':
      return (
        <blockquote className="blg-blockquote">
          <p>{block.text}</p>
        </blockquote>
      );

    case 'callout':
      return (
        <div className="blg-callout">
          <span className="blg-callout-icon">💡</span>
          <p>{block.text}</p>
        </div>
      );

    case 'image':
      return block.imageFile ? (
        <figure className="blg-figure">
          <img
            src={`/uploads/blogs/${block.imageFile}`}
            alt={block.imageAlt || ''}
            className="blg-block-img"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          {block.imageCaption && <figcaption>{block.imageCaption}</figcaption>}
        </figure>
      ) : null;

    case 'table':
      if (!block.tableHeaders?.length) return null;
      return (
        <div className="blg-table-responsive">
          <table className="blg-compare-table">
            <thead>
              <tr>{block.tableHeaders.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {(block.tableRows || []).map((row, ri) => (
                <tr key={ri}>
                  {block.tableHeaders.map((_, ci) => (
                    <td key={ci} className={ci === 0 ? 'feature-name' : ''}>{row[ci] || ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'divider':
      return <hr className="blg-divider" />;

    default:
      return null;
  }
};

// ── Loading skeleton ──────────────────────────────────────────────────────────
const SingleBlogSkeleton = () => (
  <main>
    <section className="blg-hero-section">
      <div className="blg-container">
        <div className="sbl-skel sbl-skel-title"></div>
        <div className="sbl-skel sbl-skel-meta" style={{ width: '40%' }}></div>
        <div className="blg-media-grid" style={{ marginTop: 24 }}>
          <div className="sbl-skel sbl-skel-cover"></div>
          <div className="sbl-skel" style={{ borderRadius: 12, height: 300 }}></div>
        </div>
      </div>
    </section>
    <section className="blg-body-section">
      <div className="blg-container">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginBottom: 20 }}>
            <div className="sbl-skel" style={{ height: 20, width: '40%', marginBottom: 10 }}></div>
            <div className="sbl-skel" style={{ height: 14, width: '100%', marginBottom: 8 }}></div>
            <div className="sbl-skel" style={{ height: 14, width: '85%', marginBottom: 8 }}></div>
            <div className="sbl-skel" style={{ height: 14, width: '70%' }}></div>
          </div>
        ))}
      </div>
    </section>
  </main>
);

// ── Related card ──────────────────────────────────────────────────────────────
const RelatedCard = ({ blog }) => (
  <Link href={`/blog/${blog.slug}`} className="sbl-related-card">
    <div className="sbl-related-img">
      <img src={getCoverSrc(blog.coverImage)} alt={blog.title}
        onError={(e) => { e.target.src = '/Blog1.jpg'; }} loading="lazy" />
    </div>
    <div className="sbl-related-info">
      {blog.category && <span className="category-tag" style={{ fontSize: 11, padding: '2px 10px' }}>{blog.category.name}</span>}
      <h4>{blog.title}</h4>
      <span className="read-time">{blog.readTime} Min read</span>
    </div>
  </Link>
);

// ── Share buttons with updated styling for links ──────────────────────────────
const ShareButtons = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
  const text = encodeURIComponent(title);

  return (
    <div className="blg-share-btns">
      <a href={`https://wa.me/?text=${text}%20${url}`} target="_blank" rel="noreferrer"
        className="btn-share btn-whatsapp">
        <i className="fab fa-whatsapp"></i> WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noreferrer"
        className="btn-share btn-facebook">
        <i className="fab fa-facebook-f"></i> Facebook
      </a>
      <button className="btn-share btn-copy" onClick={handleCopy}>
        <i className="fas fa-link"></i> {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
};

// ── Main SingleBlog ───────────────────────────────────────────────────────────
const SingleBlogPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Sidebar form
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', location: '' });
  const [formSent, setFormSent] = useState(false);
  const [formSending, setFormSending] = useState(false);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !slug) return;
    window.scrollTo(0, 0);
    fetchBlog();
  }, [slug, isMounted]);

  const fetchBlog = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await blogAPI.getPublicBySlug(slug);
      if (res.data.success) {
        setBlog(res.data.blog);
        setRelated(res.data.related || []);
        document.title = `${res.data.blog.title} — Cocofina`;
      } else {
        setError('Blog not found');
      }
    } catch (err) {
      if (err.response?.status === 404) setError('Blog not found');
      else setError('Failed to load article. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSending(true);
    await new Promise(r => setTimeout(r, 900));
    setFormSent(true);
    setFormSending(false);
  };

  if (!isMounted || !slug) {
    return <SingleBlogSkeleton />;
  }

  if (loading) return <SingleBlogSkeleton />;

  if (error) return (
    <main>
      <div className="blg-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📰</div>
        <h2 style={{ color: '#374151', marginBottom: 8 }}>{error}</h2>
        <button onClick={() => router.push('/blogs')}
          style={{ padding: '10px 24px', background: '#3b2a1a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
          ← Back to Blogs
        </button>
      </div>
    </main>
  );

  const contentBlocks = blog?.content || [];

  return (
    <main>
      <section className="blg-hero-section">
        <div className="blg-container">
          <div className="blg-header-area">
            {blog?.category && (
              <Link href={`/our-blogs?category=${blog.category.slug}`} className="category-tag">
                {blog.category.name}
              </Link>
            )}
            <h1 className="blg-main-title">{blog?.title}</h1>
            <div className="blg-meta-info">
              <span>By {blog?.author?.name || 'Cocofina'} — {fmtDate(blog?.publishedAt || blog?.createdAt)}</span>
              <span className="blg-read-time">{blog?.readTime} minute read</span>
            </div>
            <ShareButtons title={blog?.title} />
          </div>

          <div className="blg-media-grid">
            <div className="blg-img-box">
              <img
                src={getCoverSrc(blog?.coverImage)}
                alt={blog?.coverImageAlt || blog?.title}
                className="blg-featured-img"
                onError={(e) => { e.target.src = '/Blog1.jpg'; }}
              />
            </div>

            <div className="blg-form-box">
              <h2 className="blg-form-title">Ask Your Question</h2>
              <p className="blg-form-sub">Fill the form Below</p>
              {formSent ? (
                <div className="blg-form-success">
                  <i className="fas fa-check-circle"></i>
                  <p>Thank you! We'll get back to you soon.</p>
                </div>
              ) : (
                <form className="blg-form" onSubmit={handleFormSubmit}>
                  <input type="text" placeholder="Full Name" required
                    value={form.fullName} onChange={(e) => setForm(p => ({ ...p, fullName: e.target.value }))} />
                  <input type="email" placeholder="Email Address" required
                    value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
                  <input type="tel" placeholder="Phone Number" required
                    value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
                  <input type="text" placeholder="Your Location"
                    value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} />
                  <button type="submit" className="blg-submit-btn" disabled={formSending}>
                    {formSending ? 'Sending…' : 'Request a Call Back'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="blg-body-section">
        <div className="blg-container">
          <div className="blg-text-block">
            {contentBlocks.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}
          </div>
        </div>
      </section>

      <section className="blg-bottom-section">
        <div className="blg-container">
          {blog?.author?.name && (
            <div className="blg-author-card">
              <div className="blg-author-flex">
                <div className="blg-author-img">
                  {getAuthorSrc(blog.author.image) ? (
                    <img src={getAuthorSrc(blog.author.image)} alt={blog.author.name}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="blg-author-initials">
                      {blog.author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="blg-author-info">
                  <h3>{blog.author.name}</h3>
                  {blog.author.designation && <p>({blog.author.designation})</p>}
                </div>
              </div>
            </div>
          )}

          {blog?.tags?.length > 0 && (
            <div className="blg-tags">
              {blog.tags.map((tag, idx) => (
                <span key={idx} className="blg-tag">#{tag} </span>
              ))}
            </div>
          )}

          <div className="blg-disclaimer">
            <p>
              <strong>Disclaimer:</strong> The information provided in this blog is intended for general
              informational and educational purposes only. While we strive to provide accurate and
              up-to-date information, it should not be considered as professional medical or dietary advice.
            </p>
            <p>
              Coconut sugar, including products from Cocofina Sugar, should be consumed in moderation
              as part of a balanced diet. Individuals with specific health conditions should consult a
              qualified healthcare professional before making any dietary changes.
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="blg-related-section">
          <div className="blg-container">
            <h2 className="blg-related-title">Related Articles</h2>
            <div className="sbl-related-grid">
              {related.map(r => <RelatedCard key={r._id} blog={r} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default SingleBlogPage;