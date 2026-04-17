// src/app/api/admin/blogs/[id]/toggle-featured/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Blog from '@/models/Blog';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const blog = await Blog.findById(params.id);
    if (!blog) return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    blog.isFeatured = !blog.isFeatured;
    await blog.save();
    return NextResponse.json({ success: true, message: blog.isFeatured ? 'Blog featured' : 'Blog unfeatured', blog });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}