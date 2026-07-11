// src/app/sitemap.js
// Next.js App Router dynamic sitemap generator
// Docs: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

const BASE_URL = 'https://www.cocofinasugar.com';

// Static pages with their priorities and change frequency
const staticPages = [
  { url: '/',                      changeFrequency: 'daily',   priority: 1.0  },
  { url: '/our-products',          changeFrequency: 'daily',   priority: 0.95 },
  { url: '/our-blogs',             changeFrequency: 'weekly',  priority: 0.85 },
  { url: '/benefits',              changeFrequency: 'monthly', priority: 0.80 },
  { url: '/how-its-made',          changeFrequency: 'monthly', priority: 0.75 },
  { url: '/about-us',              changeFrequency: 'monthly', priority: 0.75 },
  { url: '/contact-us',            changeFrequency: 'monthly', priority: 0.70 },
  { url: '/faqs',                  changeFrequency: 'monthly', priority: 0.65 },
  { url: '/recipes/baking-desserts',        changeFrequency: 'monthly', priority: 0.60 },
  { url: '/recipes/breakfast-recipes',      changeFrequency: 'monthly', priority: 0.60 },
  { url: '/recipes/daily-beverages',        changeFrequency: 'monthly', priority: 0.60 },
  { url: '/recipes/everyday-cooking',       changeFrequency: 'monthly', priority: 0.60 },
  { url: '/recipes/indian-sweets',          changeFrequency: 'monthly', priority: 0.60 },
  { url: '/recipes/sauces-homemade-syrups', changeFrequency: 'monthly', priority: 0.60 },
  { url: '/shipping-policy',       changeFrequency: 'yearly',  priority: 0.30 },
  { url: '/refund-policy',         changeFrequency: 'yearly',  priority: 0.30 },
  { url: '/privacy-policy',        changeFrequency: 'yearly',  priority: 0.25 },
  { url: '/terms-and-conditions',  changeFrequency: 'yearly',  priority: 0.25 },
];

export default async function sitemap() {
  // Build static routes
  const staticRoutes = staticPages.map(({ url, changeFrequency, priority }) => ({
    url: `${BASE_URL}${url}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Build dynamic product routes
  let productRoutes = [];
  try {
    await connectDB();
    const products = await Product.find(
      { status: 'active' },
      { slug: 1, _id: 1, updatedAt: 1 }
    ).lean();

    productRoutes = products.map((p) => ({
      url: `${BASE_URL}/products/${p.slug || p._id}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.90,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch products', err.message);
  }

  // Build dynamic blog routes
  let blogRoutes = [];
  try {
    await connectDB();
    const blogs = await Blog.find(
      { status: 'published' },
      { slug: 1, updatedAt: 1 }
    ).lean();

    blogRoutes = blogs.map((b) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt || new Date(),
      changeFrequency: 'monthly',
      priority: 0.70,
    }));
  } catch (err) {
    console.error('Sitemap: failed to fetch blogs', err.message);
  }

  return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
