import React from 'react';
import BlogsView from '@/components/blog/BlogsView';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import BlogCategory from '@/models/BlogCategory';
import '@/styles/blogs.css';

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Coconut Sugar Blog – Recipes, Health Tips & Nutrition | Cocofina',
  description: 'Read expert articles on coconut sugar health benefits, cooking and baking recipes, nutritional tips, and the science behind natural sweeteners on the Cocofina blog.',
  keywords: [
    'coconut sugar blog',
    'coconut sugar recipes',
    'natural sweetener health tips',
    'coconut sugar baking',
    'low GI diet blog',
    'healthy cooking blog India',
    'sugar substitute recipes',
  ],
  alternates: { canonical: 'https://www.cocofinasugar.com/our-blogs' },
  openGraph: {
    title: 'Cocofina Blog – Coconut Sugar Recipes, Health & Nutrition Tips',
    description: 'Explore articles on the health benefits of coconut sugar, delicious recipes, and tips for living a naturally sweet and healthy lifestyle.',
    url: 'https://www.cocofinasugar.com/our-blogs',
    type: 'website',
    images: [{ url: 'https://www.cocofinasugar.com/og-image.jpg', width: 1200, height: 630, alt: 'Cocofina Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cocofina Blog – Coconut Sugar Health & Recipes',
    description: 'Discover coconut sugar recipes, health benefits and nutrition tips on the Cocofina blog.',
    images: ['https://www.cocofinasugar.com/og-image.jpg'],
  },
};

async function getBlogsData() {
  try {
    await connectDB();
    const categories = await BlogCategory.find({ isActive: true }).lean();
    
    const query = { status: 'published' };
    const totalBlogs = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .populate('category', 'name slug')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(6)
      .lean();

    return {
      initialCategories: JSON.parse(JSON.stringify(categories)),
      initialBlogs: JSON.parse(JSON.stringify(blogs)),
      initialTotalCount: totalBlogs,
    };
  } catch (err) {
    console.error('getBlogsData SSR connection error:', err);
    return {
      initialCategories: [],
      initialBlogs: [],
      initialTotalCount: 0,
    };
  }
}

export default async function Page() {
  const { initialCategories, initialBlogs, initialTotalCount } = await getBlogsData();

  return (
    <BlogsView 
      initialCategories={initialCategories}
      initialBlogs={initialBlogs}
      initialTotalCount={initialTotalCount}
    />
  );
}
