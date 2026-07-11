'use client';

import React, { useState } from 'react';
import { getUploadUrl } from '@/lib/imageHelper';

const getImageUrl = (filename) => getUploadUrl(filename, 'products') || '/cocofinaproduct.png';

const ProductGallery = ({ product = {}, images = [], initialImage = '' }) => {
  const [mainImage, setMainImage] = useState(initialImage);
  const [activeThumb, setActiveThumb] = useState(initialImage);
  const hasImages = images.length > 0;

  return (
    <div className="product-gallery">
      {hasImages && (
        <div className="thumbnails">
          {images.map((filename, index) => (
            <img 
              key={index} 
              src={getImageUrl(filename)}
              alt={`${product.name} ${index + 1}`}
              className={activeThumb === filename ? 'active' : ''}
              onClick={() => { setMainImage(filename); setActiveThumb(filename); }}
              onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
            />
          ))}
        </div>
      )}
      <div className="main-image">
        <img 
          src={hasImages ? getImageUrl(mainImage) : '/cocofinaproduct.png'}
          alt={product.name}
          onError={(e) => { e.target.src = '/cocofinaproduct.png'; }}
        />
      </div>
    </div>
  );
};

export default ProductGallery;
