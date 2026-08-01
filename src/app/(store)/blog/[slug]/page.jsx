import React, { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import '@/models/BlogCategory'; // Register BlogCategory model
import ShareButtons from '@/components/blog/ShareButtons';
import { BlogCoverImage, BlogBlockImage, BlogRelatedImage, BlogAuthorImage } from '@/components/blog/BlogImage';
import { Navbar } from '@/components/Navbar';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/singleblog.css';

// ISR: cache page for 60 s, revalidate in background — same pattern as product detail
export const revalidate = 60;

const getCoverSrc = (f) => getUploadUrl(f, 'blogs');
const getAuthorSrc = (f) => f ? `/uploads/profiles/${f}` : null;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

/* ── Memoised DB lookup — shared by generateMetadata + Page in one request ── */
const getBlog = cache(async (slug) => {
  try {
    await connectDB();
    const blog = await Promise.race([
      Blog.findOne({ slug, status: 'published' })
        .populate('category', 'name slug')
        .lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 3000)
      ),
    ]);
    return blog ? JSON.parse(JSON.stringify(blog)) : null;
  } catch (err) {
    console.error('getBlog error:', err?.message || err);
    return null;
  }
});

/* ── Pre-build all published blog slugs at build time ── */
export async function generateStaticParams() {
  try {
    await connectDB();
    const blogs = await Blog.find({ status: 'published' }, 'slug').lean();
    return blogs.map((b) => ({ slug: b.slug }));
  } catch {
    return [];
  }
}

/* ─────────────────────────── Metadata ─────────────────────────── */
export async function generateMetadata({ params }) {
  const blog = await getBlog(params.slug);
  if (!blog) return {
    title: 'Blog Not Found | Cocofina',
    robots: { index: false, follow: false },
  };

  const seoTitle = blog.seo?.metaTitle?.trim();
  const title = seoTitle || `${blog.title} | Cocofina Blog`;

  const seoDescription = blog.seo?.metaDescription?.trim();
  const description = seoDescription || blog.excerpt || `Read "${blog.title}" on the Cocofina blog — tips, recipes and health information about organic coconut sugar.`;

  const seoKeywordsRaw = blog.seo?.metaKeywords || '';
  const seoKeywordsArray = typeof seoKeywordsRaw === 'string'
    ? seoKeywordsRaw.split(',').map(k => k.trim()).filter(Boolean)
    : (Array.isArray(seoKeywordsRaw) ? seoKeywordsRaw : []);

  const imageUrl = blog.coverImage
    ? `https://www.cocofinasugar.com/uploads/blogs/${blog.coverImage}`
    : 'https://www.cocofinasugar.com/og-image.jpg';
  const url = `https://www.cocofinasugar.com/blog/${params.slug}`;

  return {
    title,
    description,
    keywords: [
      ...seoKeywordsArray,
      ...(blog.tags || []),
      'coconut sugar blog',
      'organic sweetener tips',
      'Cocofina recipes',
      'natural sugar health',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: blog.publishedAt || blog.createdAt,
      authors: [blog.author?.name || 'Cocofina'],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

/* ─────────────────────── renderTextWithLinks ──────────────────── */
const renderTextWithLinks = (text, links = []) => {
  if (!text) return null;
  if (!links || links.length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />;
  }
  let result = text;
  const sortedLinks = [...links].sort((a, b) => b.text.length - a.text.length);
  sortedLinks.forEach(link => {
    const linkText = link.text;
    const url = link.url;
    const openInNewTab = link.openInNewTab !== false;
    const target = openInNewTab ? '_blank' : '_self';
    const rel = openInNewTab ? 'noopener noreferrer' : '';
    if (url.startsWith('/') || url.startsWith('#')) {
      result = result.split(linkText).join(`<a href="${url}" target="${target}" rel="${rel}" class="inline-link" data-internal="true">${linkText}</a>`);
    } else {
      const regex = new RegExp(`(${linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
      result = result.replace(regex, `<a href="${url}" target="${target}" rel="${rel}" class="inline-link">${linkText}</a>`);
    }
  });
  return <span dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />;
};

/* ─────────────────────── ContentBlock ────────────────────────── */
const ContentBlock = ({ block }) => {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="blg-sub-heading">
          {block.links?.length > 0 ? renderTextWithLinks(block.text, block.links) : block.text}
        </h2>
      );
    case 'subheading':
      return (
        <h3 className="blg-list-title">
          {block.links?.length > 0 ? renderTextWithLinks(block.text, block.links) : block.text}
        </h3>
      );
    case 'paragraph':
      if (block.links?.length > 0) {
        return <div className="blg-paragraph">{renderTextWithLinks(block.text, block.links)}</div>;
      }
      return (
        <p dangerouslySetInnerHTML={{ __html: (block.text || '').replace(/\n/g, '<br />') }} />
      );
    case 'bullet_list':
      return (
        <ul className="blg-bullets">
          {(block.items || []).filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    case 'numbered_list':
      return (
        <ol className="blg-numbered">
          {(block.items || []).filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
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
          <BlogBlockImage
            src={`/uploads/blogs/${block.imageFile}`}
            alt={block.imageAlt || ''}
            className="blg-block-img"
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

/* ─────────────────────── RelatedCard ─────────────────────────── */
const RelatedCard = ({ blog }) => (
  <Link href={`/blog/${blog.slug}`} className="sblg-rel-card">
    <div className="sblg-rel-img">
      <BlogRelatedImage src={getCoverSrc(blog.coverImage)} alt={blog.title} />
    </div>
    <div className="sblg-rel-body">
      {blog.category && <p className="sblg-rel-cat">{blog.category.name}</p>}
      <h4>{blog.title}</h4>
      <span className="sblg-rel-read">{blog.readTime} min read</span>
    </div>
  </Link>
);

/* ─────────────────── Data Fetcher ─────────────────────────────── */
async function getBlogData(slug) {
  // getBlog is already memoised — no extra DB hit if called after generateMetadata
  const blog = await getBlog(slug);
  if (!blog) return null;

  try {
    await connectDB();
    const related = await Promise.race([
      Blog.find({
        category: blog.category?._id,
        _id: { $ne: blog._id },
        status: 'published',
      })
        .populate('category', 'name slug')
        .limit(3)
        .lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DB timeout')), 3000)
      ),
    ]);
    return { blog, related: JSON.parse(JSON.stringify(related)) };
  } catch (err) {
    console.error('getBlogData related error:', err?.message || err);
    return { blog, related: [] };
  }
}

/* ─────────────────────────── Page ────────────────────────────── */
export default async function Page({ params }) {
  const data = await getBlogData(params.slug);
  if (!data) return notFound();

  const { blog, related } = data;
  const contentBlocks = blog.content || [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDescription || blog.excerpt || blog.title,
    image: getCoverSrc(blog.coverImage),
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt,
    author: { '@type': 'Person', name: blog.author?.name || 'Cocofina' },
    publisher: {
      '@type': 'Organization',
      name: 'Cocofina',
      logo: { '@type': 'ImageObject', url: 'https://www.cocofinasugar.com/logo.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.cocofinasugar.com/blog/${params.slug}`,
    },
    keywords: blog.seo?.metaKeywords || (blog.tags || []).join(', '),
  };

  return (
    <div className="sblg-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* ── Hero ── */}
      <section className="sblg-hero">
        <div className="sblg-hero-inner">

          {/* Breadcrumb */}
          <nav className="sblg-breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">/</span>
            <Link href="/our-blogs">Blog</Link>
            <span className="sep">/</span>
            <span className="current">{blog.title}</span>
          </nav>

          {/* Category */}
          {blog.category && (
            <Link href={`/our-blogs?category=${blog.category.slug}`} className="sblg-cat-badge">
              {blog.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="sblg-title">{blog.title}</h1>

          {/* Meta */}
          <div className="sblg-meta">
            <span>By <strong>{blog.author?.name || 'Cocofina'}</strong></span>
            <span className="dot"></span>
            <span>{fmtDate(blog.publishedAt || blog.createdAt)}</span>
            <span className="dot"></span>
            <span className="read-time">{blog.readTime} min read</span>
          </div>

          {/* Share */}
          <ShareButtons title={blog.title} />

          {/* Cover image */}
          <div className="sblg-cover-wrap">
            <BlogCoverImage
              src={getCoverSrc(blog.coverImage)}
              alt={blog.coverImageAlt || blog.title}
              className="sblg-cover-img"
            />
          </div>
        </div>
      </section>

      {/* ── Article body ── */}
      <section className="sblg-body">
        <div className="sblg-container">
          <hr className="sblg-rule" />

          <div className="sblg-content">
            {contentBlocks.map((block, i) => (
              <ContentBlock key={i} block={block} />
            ))}
          </div>

          {/* Author */}
          {blog.author?.name && (
            <div className="sblg-author-card">
              <div className="sblg-author-avatar">
                {getAuthorSrc(blog.author.image) ? (
                  <BlogAuthorImage src={getAuthorSrc(blog.author.image)} alt={blog.author.name} />
                ) : (
                  <span className="sblg-author-initials">
                    {blog.author.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="sblg-author-info">
                <h3>{blog.author.name}</h3>
                {blog.author.designation && <p>{blog.author.designation}</p>}
              </div>
            </div>
          )}

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="sblg-tags">
              {blog.tags.map((tag, idx) => (
                <span key={idx} className="sblg-tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="sblg-disclaimer">
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

      {/* ── Related Articles ── */}
      {related.length > 0 && (
        <section className="sblg-related-section">
          <div className="sblg-related-header">
            <p className="sblg-related-eyebrow">Continue Reading</p>
            <h2 className="sblg-related-title">Related Articles</h2>
          </div>
          <div className="sblg-related-grid">
            {related.map(r => <RelatedCard key={r._id} blog={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
