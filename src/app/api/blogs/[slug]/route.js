// src/app/api/blogs/[slug]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: params.slug, status: 'published' })
      .populate('category', 'name slug')
      .lean();

    if (!blog)
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });

    // Increment views — fire and forget
    Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

    // Related blogs from same category
    const related = await Blog.find({
      status:   'published',
      _id:      { $ne: blog._id },
      ...(blog.category ? { category: blog.category._id } : {}),
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt coverImage category readTime publishedAt')
      .lean();

    return NextResponse.json({ success: true, blog, related });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch blog' }, { status: 500 });
  }
}
