import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import '@/models/BlogCategory'; // Register BlogCategory model
import ShareButtons from '@/components/blog/ShareButtons';
import BlogAskForm from '@/components/blog/BlogAskForm';
import '@/styles/singleblog.css';

export const dynamic = "force-dynamic";

const getCoverSrc = (f) => f ? `/uploads/blogs/${f}` : '/Blog1.jpg';

export async function generateMetadata({ params }) {
  await connectDB();
  const blog = await Blog.findOne({ slug: params.slug, status: 'published' }).lean();
  if (!blog) return {
    title: 'Blog Not Found | Cocofina',
    robots: { index: false, follow: false },
  };

  const title = `${blog.title} | Cocofina Blog`;
  const description = blog.excerpt || blog.seo?.metaDescription || `Read "${blog.title}" on the Cocofina blog — tips, recipes and health information about organic coconut sugar.`;
  const imageUrl = blog.coverImage
    ? `https://www.cocofinasugar.com/uploads/blogs/${blog.coverImage}`
    : 'https://www.cocofinasugar.com/og-image.jpg';
  const url = `https://www.cocofinasugar.com/blog/${params.slug}`;

  return {
    title,
    description,
    keywords: [
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
const getAuthorSrc = (f) => f ? `/uploads/profiles/${f}` : null;

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

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
    
    let href = url;
    if (url.startsWith('/') || url.startsWith('#')) {
      result = result.split(linkText).join(`<a href="${href}" target="${target}" rel="${rel}" class="inline-link" data-internal="true">${linkText}</a>`);
    } else {
      const regex = new RegExp(`(${linkText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
      result = result.replace(regex, `<a href="${href}" target="${target}" rel="${rel}" class="inline-link">${linkText}</a>`);
    }
  });
  return <span dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br />') }} />;
};

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

async function getBlogData(slug) {
  await connectDB();
  const blog = await Blog.findOne({ slug, status: 'published' })
    .populate('category', 'name slug')
    .lean();
  
  if (!blog) return null;

  const related = await Blog.find({
    category: blog.category?._id,
    _id: { $ne: blog._id },
    status: 'published'
  })
    .populate('category', 'name slug')
    .limit(3)
    .lean();

  return {
    blog: JSON.parse(JSON.stringify(blog)),
    related: JSON.parse(JSON.stringify(related)),
  };
}

export async function generateMetadata({ params }) {
  const data = await getBlogData(params.slug);
  if (!data || !data.blog) return { title: 'Blog Post Not Found | Cocofina' };
  return {
    title: `${data.blog.title} | Cocofina Blog`,
    description: data.blog.excerpt || `Read article ${data.blog.title} on Cocofina Blog.`,
  };
}

export default async function Page({ params }) {
  const data = await getBlogData(params.slug);
  if (!data) {
    return notFound();
  }

  const { blog, related } = data;
  const contentBlocks = blog.content || [];

  return (
    <main>
      <section className="blg-hero-section">
        <div className="blg-container">
          <div className="blg-header-area">
            {blog.category && (
              <Link href={`/our-blogs?category=${blog.category.slug}`} className="category-tag">
                {blog.category.name}
              </Link>
            )}
            <h1 className="blg-main-title">{blog.title}</h1>
            <div className="blg-meta-info">
              <span>By {blog.author?.name || 'Cocofina'} — {fmtDate(blog.publishedAt || blog.createdAt)}</span>
              <span className="blg-read-time">{blog.readTime} minute read</span>
            </div>
            <ShareButtons title={blog.title} />
          </div>

          <div className="blg-media-grid">
            <div className="blg-img-box">
              <img
                src={getCoverSrc(blog.coverImage)}
                alt={blog.coverImageAlt || blog.title}
                className="blg-featured-img"
                onError={(e) => { e.target.src = '/Blog1.jpg'; }}
              />
            </div>

            <BlogAskForm />
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
          {blog.author?.name && (
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

          {blog.tags?.length > 0 && (
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
}
