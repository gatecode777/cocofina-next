'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const getImageSrc = (product) => {
  if (product.images?.length)
    return `/uploads/products/${product.images[0]}`;
  if (product.thumbnail)
    return `/uploads/products/${product.thumbnail}`;
  return '/cocofinaproduct.png';
};

const getLowestVariant = (product) => {
  if (!product.variants?.length) return null;
  return product.variants.reduce(
    (min, v) => (v.price < min.price ? v : min),
    product.variants[0]
  );
};

const ProductCard = ({ product }) => {
  const router = useRouter();
  const imageSrc = getImageSrc(product);
  const lowestVar = getLowestVariant(product);
  const isComingSoon = product.isComingSoon;
  const isOutOfStock = product.stockStatus === 'Out of Stock';
  const isLimitedStock = product.stockStatus === 'Limited Stock';

  const variantWeights = product.variants?.map((v) => v.weight) || [];
  const [selectedVariant, setSelectedVariant] = useState(lowestVar);

  return (
    <div className="cf-product-card">
      <div className="cf-card-header-brown" style={{ position: 'relative' }}>
        <img
          src={imageSrc || '/cocofinaproduct.png'}
          alt={product.name}
          className="cf-product-image"
          onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
          style={isComingSoon || isOutOfStock ? { opacity: 0.7, filter: 'grayscale(25%)' } : {}}
        />
        {isComingSoon && (
          <span className="cf-coming-soon-badge">⏳ Coming Soon</span>
        )}
        {isOutOfStock && !isComingSoon && (
          <span className="cf-out-of-stock-badge">🚫 Out of Stock</span>
        )}
        {isLimitedStock && !isComingSoon && (
          <span className="cf-limited-stock-badge">⚠️ Limited Stock</span>
        )}
      </div>

      <div className="cf-card-body">
        <h3 className="cf-product-name">{product.name}</h3>

        {variantWeights.length > 1 && !isComingSoon && (
          <div className="cf-variant-buttons">
            {product.variants.map((v) => (
              <button
                key={v.weight}
                className={`cf-variant-btn ${selectedVariant?.weight === v.weight ? 'active' : ''}`}
                onClick={() => setSelectedVariant(v)}
              >
                {v.weight}
              </button>
            ))}
          </div>
        )}

        {product.description?.short && (
          <p className="cf-product-desc">{product.description.short}</p>
        )}

        <div className="cf-card-footer">
          <div className="cf-price-block">
            {isComingSoon ? (
              <span className="cf-price" style={{ color: '#f97316', fontSize: '14px', fontWeight: 600 }}>Available Soon</span>
            ) : selectedVariant ? (
              <span className="cf-price">₹{selectedVariant.price}/-</span>
            ) : (
              <span className="cf-price" style={{ color: '#999' }}>Price unavailable</span>
            )}
          </div>
          <button
            className="cf-order-btn"
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

const ProductsSection = ({ products = [] }) => {
  return (
    <section className="cf-products-section">
      <div className="cf-container">
        <div className="cf-products-title-area">
          <h2 className="cf-products-main-title">Our Products</h2>
          <div className="cf-title-underline-center"></div>
        </div>

        {products.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            No products available yet.
          </p>
        ) : (
          <div className="cf-products-grid">
            {products.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
