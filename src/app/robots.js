// src/app/robots.js
// Next.js App Router robots.txt generator
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

const BASE_URL = 'https://www.cocofinasugar.com';

export default function robots() {
  return {
    rules: [
      {
        // Allow all public-facing pages
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/my-profile',
          '/my-orders',
          '/orders',
          '/addresses',
          '/buynow',
          '/cart',
          '/login',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/verify-otp',
          '/order-success',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
