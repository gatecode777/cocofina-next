import React, { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import ProductGallery from '@/components/products/ProductGallery';
import AddToCartControls from '@/components/products/AddToCartControls';
import { Navbar } from '@/components/Navbar';
import '@/styles/productdetail.css';

export const revalidate = 60;

// Memoize DB lookups per request so generateMetadata and Page share the result
const getProduct = cache(async (slugOrId) => {
  try {
    await connectDB();
    let product = null;
    if (slugOrId && slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(slugOrId).lean();
    }
    if (!product && slugOrId) {
      product = await Product.findOne({ slug: slugOrId }).lean();
    }
    return product ? JSON.parse(JSON.stringify(product)) : null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
});

export async function generateStaticParams() {
  try {
    await connectDB();
    const products = await Product.find({ status: { $ne: 'archived' } }, 'slug _id').lean();
    return products.map((p) => ({
      slugOrId: p.slug || p._id.toString(),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slugOrId);
  if (!product) return {
    title: 'Product Not Found | Cocofina',
    robots: { index: false, follow: false },
  };

  const seoTitle = product.seo?.metaTitle?.trim();
  const title = seoTitle || `Buy ${product.name} – Organic Coconut Sugar | Cocofina`;

  const seoDescription = product.seo?.metaDescription?.trim();
  const description = seoDescription || (product.description?.short
    ? `${product.description.short} Shop ${product.name} online at Cocofina – free delivery on ₹499+.`
    : `Buy ${product.name} – premium organic coconut sugar at Cocofina. Natural, unrefined, low GI sweetener. Free delivery on ₹499+.`);

  const seoKeywordsRaw = product.seo?.keywords || product.seo?.metaKeywords || [];
  const seoKeywordsArray = Array.isArray(seoKeywordsRaw)
    ? seoKeywordsRaw
    : (typeof seoKeywordsRaw === 'string' ? seoKeywordsRaw.split(',').map(k => k.trim()).filter(Boolean) : []);

  const firstImage = product.images?.[0];
  const imageUrl = firstImage
    ? (firstImage.startsWith('http') ? firstImage : `https://ik.imagekit.io/zjd5xircoy/cocofina/products/${firstImage}`)
    : 'https://www.cocofinasugar.com/og-image.jpg';
  const url = `https://www.cocofinasugar.com/products/${product.slug || params.slugOrId}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      'organic coconut sugar',
      'buy coconut sugar online India',
      'natural sweetener',
      'low GI sugar',
      'Cocofina products',
      ...seoKeywordsArray,
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

const ReviewsSection = () => (
  <section className="reviews-section">
    <div className="reviews-wrapper">
      <h2 className="reviews-main-title">Reviews</h2>
      <div className="rating-summary">
        <div className="rating-left">
          <div className="big-score">4.8</div>
          <div className="total-reviews">of 125 reviews</div>
          <div className="stars-row">
            {['filled', 'filled', 'filled', 'filled', 'half'].map((t, i) => (
              <span key={i} className={`star ${t}`}>★</span>
            ))}
          </div>
        </div>
        <div className="rating-right">
          {[
            { label: 'Excellent', width: '80%', count: 100 },
            { label: 'Good', width: '15%', count: 11 },
            { label: 'Average', width: '5%', count: 3 },
            { label: 'Below Average', width: '10%', count: 8 },
            { label: 'Poor', width: '2%', count: 1 },
          ].map(({ label, width, count }) => (
            <div className="bar-item" key={label}>
              <span className="bar-label">{label}</span>
              <div className="bar-container"><div className="bar-fill" style={{ width }} /></div>
              <span className="bar-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="comment-box"><input type="text" placeholder="Leave Comment" /></div>
      <div className="reviews-list">
        {[
          { avatar: 'https://i.pravatar.cc/100?u=priya', name: 'Priya Mehra', stars: 4, date: '24 January, 2026', text: 'Great quality product! I use Cocofina Coconut Sugar for baking cookies and cakes. The flavor is natural and much better than refined sugar.', images: [] },
          { avatar: 'https://i.pravatar.cc/100?u=anoop', name: 'Anoop Sharma', stars: 5, date: '24 January, 2026', text: "I switched from regular sugar to Cocofina Coconut Sugar and I absolutely love the taste. It has a light caramel flavor that works perfectly in my tea and coffee.", images: [] },
          { avatar: 'https://i.pravatar.cc/100?u soniya', name: 'Soniya Mathur', stars: 4, date: '24 January, 2023', text: 'I was looking for a healthier alternative to white sugar and Cocofina Coconut Sugar is perfect. It tastes amazing and feels more natural.', images: ['/Review1.jpg', '/Review1.jpg'] },
        ].map((review, i) => (
          <div className="review-item" key={i}>
            <div className="review-header">
              <img src={review.avatar} alt={review.name} className="user-avatar" />
              <div className="user-info">
                <strong>{review.name}</strong>
                <div className="stars-row sm">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`star ${s <= review.stars ? 'filled' : 'empty'}`}>★</span>
                  ))}
                </div>
              </div>
              <span className="review-date">{review.date}</span>
            </div>
            <p className="review-text">{review.text}</p>
            {review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((img, j) => <img key={j} src={img} alt="Product" />)}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="view-more-wrap">
        <button className="btn-view-more">
          View More
          <svg className="chevron-svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </div>
  </section>
);

export default async function Page({ params }) {
  const product = await getProduct(params.slugOrId);
  if (!product) {
    return notFound();
  }

  const images = product.images?.length ? product.images : (product.thumbnail ? [product.thumbnail] : []);
  const initialImage = images[0] || '';
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isLimitedStock = product.stockStatus === 'Limited Stock';
  const lowestPrice = product.variants?.reduce((min, v) => Math.min(min, v.price), Infinity);
  const firstImage = images[0];
  const imageUrl = firstImage
    ? (firstImage.startsWith('http') ? firstImage : `https://ik.imagekit.io/zjd5xircoy/cocofina/products/${firstImage}`)
    : 'https://www.cocofinasugar.com/og-image.jpg';
  const url = `https://www.cocofinasugar.com/products/${product.slug || params.slugOrId}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.seo?.metaTitle || product.name,
    description: product.seo?.metaDescription || product.description?.short || product.name,
    image: imageUrl,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: lowestPrice !== Infinity ? lowestPrice : 0,
      availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: url,
    },
  };

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Navbar />
      <div className="product-page-container">
        <nav className="prod-breadcrumb">
          <Link href="/" className="prod-breadcrumb-link">HOME</Link>
          <span>&gt;</span>
          <Link href="/products" className="prod-breadcrumb-link">PRODUCTS</Link>
          <span>&gt;</span>
          <span className="current-prod">{product.name}</span>
        </nav>
 
        <div className="product-main-layout">
          <ProductGallery product={product} images={images} initialImage={initialImage} />
 
            <div className="product-info">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 text-xs font-extrabold">
                  ★ 4.9 (125 reviews)
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold">
                  GI 35 Low Glycemic
                </span>
                {isOutOfStock && (
                  <span className="detail-out-of-stock-badge">🚫 Out of Stock</span>
                )}
                {isLimitedStock && (
                  <span className="detail-limited-stock-badge">⚠️ Limited Stock</span>
                )}
              </div>

              <h1 className="product-title mb-2">{product.name}</h1>

              <AddToCartControls product={product} isOutOfStock={isOutOfStock} />

              <div className="features-bar">
                {product.delivery && (
                  <div className="feature-item">
                    <span className="f-icon">🚚</span>
                    <div className="f-text">
                      <span className="f-label">Delivery: </span>
                      <span className="f-val">{product.delivery}</span>
                    </div>
                  </div>
                )}
                <div className="feature-item">
                  <span className="f-icon">🌱</span>
                  <div className="f-text">
                    <span className="f-label">Status: </span>
                    <span className="f-val">{product.stockStatus || 'In Stock'}</span>
                  </div>
                </div>
                {product.shelfLife && (
                  <div className="feature-item">
                    <span className="f-icon">🛡️</span>
                    <div className="f-text">
                      <span className="f-label">Best Before: </span>
                      <span className="f-val">{product.shelfLife}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      <section className="details-section">
        <div className="details-card">
          {product.description?.long && (
            <div className="info-block">
              <h2 className="section-title">Details</h2>
              <p className="details-text" style={{ whiteSpace: 'pre-line' }}>{product.description.long}</p>
            </div>
          )}
          {product.usage?.length > 0 && (
            <div className="info-block">
              <h2 className="section-title">Usage</h2>
              {product.usage.map((item, i) => <div className="list-item" key={i}>{item}</div>)}
            </div>
          )}
          {(product.highlights?.length > 0 || product.shelfLife || product.storageInstructions) && (
            <div className="spec-table">
              {product.highlights?.length > 0 && (
                <div className="spec-row">
                  <span className="spec-label">Product Highlights</span>
                  <span className="spec-value text-right">
                    {product.highlights.map((h, i) => (
                      <React.Fragment key={i}>{h}{i < product.highlights.length - 1 && <br />}</React.Fragment>
                    ))}
                  </span>
                </div>
              )}
              {product.shelfLife && (
                <div className="spec-row">
                  <span className="spec-label">Shelf Life</span>
                  <span className="spec-value">{product.shelfLife}</span>
                </div>
              )}
              {product.storageInstructions && (
                <div className="spec-row no-border">
                  <span className="spec-label">Storage Instructions</span>
                  <span className="spec-value">{product.storageInstructions}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <ReviewsSection />
    </main>
  );
}
