// src/app/api/blogs/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';
import BlogCategory from '@/models/BlogCategory';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page')     || '1');
    const limit    = parseInt(searchParams.get('limit')    || '9');
    const category = searchParams.get('category') || '';
    const tag      = searchParams.get('tag')      || '';
    const featured = searchParams.get('featured') || '';
    const search   = searchParams.get('search')   || '';

    const filter = { status: 'published' };
    if (featured === 'true') filter.isFeatured = true;
    if (tag)    filter.tags = tag.toLowerCase();
    if (search?.trim()) filter.title = { $regex: search.trim(), $options: 'i' };

    // Category filter — accepts slug or id
    if (category) {
      const cat = await BlogCategory.findOne({ slug: category });
      if (cat) filter.category = cat._id;
      else filter.category = category; // fallback: treat as id
    }

    const skip  = (page - 1) * limit;
    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('category', 'name slug')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip).limit(limit)
      .select('title slug excerpt coverImage coverImageAlt category tags readTime publishedAt author isFeatured views')
      .lean();

    return NextResponse.json({ success: true, blogs, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('public blogs list error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 });
  }
}