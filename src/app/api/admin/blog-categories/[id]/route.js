// src/app/api/admin/blog-categories/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Blog from '@/models/Blog';
import BlogCategory from '@/models/BlogCategory';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const cat = await BlogCategory.findById(params.id);
    if (!cat) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    const { name, description, order, isActive } = await request.json();
    if (name !== undefined)        cat.name        = name.trim();
    if (description !== undefined) cat.description = description.trim();
    if (order !== undefined)       cat.order       = parseInt(order);
    if (isActive !== undefined)    cat.isActive    = Boolean(isActive);
    await cat.save();
    return NextResponse.json({ success: true, message: 'Category updated', category: cat });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Category name already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const count = await Blog.countDocuments({ category: params.id });
    if (count > 0) return NextResponse.json({ success: false, message: `Cannot delete — ${count} blog(s) use this category` }, { status: 400 });
    const cat = await BlogCategory.findByIdAndDelete(params.id);
    if (!cat) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}