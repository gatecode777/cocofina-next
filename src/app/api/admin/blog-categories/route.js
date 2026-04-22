// src/app/api/admin/blog-categories/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Blog from '@/models/Blog';
import BlogCategory from '@/models/BlogCategory';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const cats = await BlogCategory.find().sort({ order: 1, name: 1 }).lean();
    const withCount = await Promise.all(cats.map(async c => ({
      ...c, blogCount: await Blog.countDocuments({ category: c._id, status: 'published' }),
    })));
    return NextResponse.json({ success: true, categories: withCount });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const { name, description, order, isActive } = await request.json();
    if (!name?.trim()) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    const exists = await BlogCategory.findOne({ name: name.trim() });
    if (exists) return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 409 });
    const cat = await BlogCategory.create({
      name: name.trim(), description: description?.trim() || '',
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    return NextResponse.json({ success: true, message: 'Category created', category: cat }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Category already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}