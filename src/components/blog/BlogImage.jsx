'use client';

import React from 'react';

/** Cover image for the blog hero — falls back to /Blog1.jpg on error */
export function BlogCoverImage({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => { e.target.src = '/Blog1.jpg'; }}
    />
  );
}

/** Inline content-block image — hides itself on error */
export function BlogBlockImage({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}

/** Related article card image — falls back to /Blog1.jpg on error */
export function BlogRelatedImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => { e.target.src = '/Blog1.jpg'; }}
    />
  );
}

/** Author profile image — hides itself on error */
export function BlogAuthorImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}
