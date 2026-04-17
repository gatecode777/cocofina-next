// src/app/api/blogs/categories/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import BlogCategory from '@/models/BlogCategory';

export async function GET() {
  try {
    await connectDB();
    const cats = await BlogCategory.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    const withCount = await Promise.all(cats.map(async c => ({
      ...c,
      blogCount: await Blog.countDocuments({ category: c._id, status: 'published' }),
    })));
    return NextResponse.json({ success: true, categories: withCount });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 });
  }
}