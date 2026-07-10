'use client';

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productAPI, cartAPI } from '@/services/api';
import { triggerCartUpdate } from '@/context/CartContext';
import { getUploadUrl } from '@/lib/imageHelper';
import '@/styles/productdetail.css';

const getImageUrl = (filename) => getUploadUrl(filename, 'products');

const ProductSkeleton = () => (
  <div className="product-page-container">
    <div className="product-main-layout">
      <div className="product-gallery">
        <div className="thumbnails">
          {[1, 2, 3, 4].map((i) => <div key={i} className="sp-skel sp-skel-thumb" />)}
        </div>
        <div className="main-image sp-skel sp-skel-main" />
      </div>
      <div className="product-info">
        <div className="sp-skel sp-skel-title" />
        <div className="sp-skel sp-skel-price" />
        <div className="sp-skel sp-skel-variants" />
        <div className="sp-skel sp-skel-desc" />
        <div className="sp-skel sp-skel-desc" style={{ width: '75%' }} />
        <div className="sp-skel sp-skel-buttons" />
      </div>
    </div>
  </div>
);

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
          { avatar: 'https://i.pravatar.cc/100?u=soniya', name: 'Soniya Mathur', stars: 4, date: '24 January, 2023', text: 'I was looking for a healthier alternative to white sugar and Cocofina Coconut Sugar is perfect. It tastes amazing and feels more natural.', images: ['/Review1.jpg', '/Review1.jpg'] },
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

const ProductDetail = () => {
  const params = useParams();
  const router = useRouter();
  const slugOrId = params?.slugOrId;
  const [isMounted, setIsMounted] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [activeThumb, setActiveThumb] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = React.useRef(null);


  useEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    if (!isMounted || !slugOrId) return;
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');

        // Try to fetch product - use the correct API endpoint
        const res = await productAPI.getById(slugOrId);

        if (res.data.success) {
          const p = res.data.product;
          setProduct(p);
          document.title = `${p.name} - Cocofina`;
          const firstImg = p.images?.[0] || p.thumbnail || '';
          setMainImage(firstImg);
          setActiveThumb(firstImg);
          if (p.variants?.length) {
            const lowest = p.variants.reduce((min, v) => (v.price < min.price ? v : min), p.variants[0]);
            setSelectedVariant(lowest);
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slugOrId]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    const token = localStorage.getItem('token');
    if (!token) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      router.push('/login');
      return;
    }
    try {
      setCartLoading(true);
      const res = await cartAPI.addToCart(product._id, 1, selectedVariant.weight);
      if (res.data.success) {
        triggerCartUpdate();
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setShowToast(true);
        toastTimerRef.current = setTimeout(() => setShowToast(false), 2800);
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };


  if (!isMounted || !slugOrId) {
    return <main><ProductSkeleton /></main>;
  }
  
  if (loading) return <main><ProductSkeleton /></main>;

  if (error || !product) {
    return (
      <main>
        <div className="product-page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <h2 style={{ color: '#888' }}>{error || 'Product not found'}</h2>
          <button onClick={() => router.push('/our-products')}
            style={{ marginTop: '20px', padding: '10px 24px', background: '#5a3e28', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  const images = product.images?.length ? product.images : (product.thumbnail ? [product.thumbnail] : []);
  const hasImages = images.length > 0;
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isLimitedStock = product.stockStatus === 'Limited Stock';
  const isComingSoon = product.isComingSoon;

  return (
    <main>
      <div className="product-page-container">
        <nav className="prod-breadcrumb">
          <span className="prod-breadcrumb-link" onClick={() => router.push('/')}>HOME </span>
          <span>&gt;</span>
          <span className="prod-breadcrumb-link" onClick={() => router.push('/our-products')}> OUR PRODUCT </span>
          <span>&gt;</span>
          <span className="current-prod"> {product.name} </span>
        </nav>
 
        <div className="product-main-layout">
          <div className="product-gallery">
            {hasImages && (
              <div className="thumbnails">
                {images.map((filename, index) => (
                  <img key={index} src={getImageUrl(filename)}
                    alt={`${product.name} ${index + 1}`}
                    className={activeThumb === filename ? 'active' : ''}
                    onClick={() => { setMainImage(filename); setActiveThumb(filename); }}
                    onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
                  />
                ))}
              </div>
            )}
            <div className="main-image">
              <img src={hasImages ? getImageUrl(mainImage) : '/cocofinaproduct.png'}
                alt={product.name}
                onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
              />
            </div>
          </div>
 
          <div className="product-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <h1 className="product-title" style={{ margin: 0 }}>{product.name}</h1>
              {isOutOfStock && (
                <span className="detail-out-of-stock-badge">🚫 Out of Stock</span>
              )}
              {isLimitedStock && (
                <span className="detail-limited-stock-badge">⚠️ Limited Stock</span>
              )}
            </div>

            {selectedVariant && (
              <div className="product-price">
                <span className="current-price">₹{selectedVariant.price}</span>
                {selectedVariant.oldPrice && selectedVariant.oldPrice > selectedVariant.price && (
                  <span className="old-price">₹{selectedVariant.oldPrice}</span>
                )}
              </div>
            )}

            {product.variants?.length > 0 && (
              <div className="weight-selector">
                {product.variants.map((v) => (
                  <button key={v.weight}
                    className={`weight-btn ${selectedVariant?.weight === v.weight ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                    disabled={isOutOfStock}
                  >{v.weight}</button>
                ))}
              </div>
            )}

            {product.description?.short && (
              <p className="product-description">{product.description.short}</p>
            )}

            <div className="action-buttons">
              <button className="btn-buy-now" onClick={handleBuyNow} disabled={isOutOfStock || cartLoading}>
                {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
              <button className="btn-add-cart" onClick={handleAddToCart} disabled={isOutOfStock || cartLoading}>
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            <div className="features-bar">
              {product.delivery && (
                <div className="feature-item">
                  <div className="f-icon">🚚</div>
                  <div className="f-text"><strong>Delivery</strong><span>{product.delivery}</span></div>
                </div>
              )}
              <div className="feature-item">
                <div className="f-icon">🏠</div>
                <div className="f-text"><strong>{product.stockStatus || 'In Stock'}</strong></div>
              </div>
              {product.shelfLife && (
                <div className="feature-item">
                  <div className="f-icon">🛡️</div>
                  <div className="f-text"><strong>Best Before</strong><span>{product.shelfLife}</span></div>
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

      <div className={`cart-toast ${showToast ? 'show' : ''}`}>
        <span className="cart-toast-icon">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {product?.name} added to cart!
      </div>
    </main>
  );
};

export default ProductDetail;