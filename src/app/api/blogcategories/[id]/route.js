// src/app/api/blogcategories/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import BlogCategory from '@/models/BlogCategory';
import Blog from '@/models/Blog';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const cat = await BlogCategory.findById(params.id).lean();
    if (!cat)
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    const blogCount = await Blog.countDocuments({ category: cat._id, status: 'published' });
    return NextResponse.json({ success: true, category: { ...cat, blogCount } });
  } catch (err) {
    console.error('GET /api/blogcategories/:id error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const cat = await BlogCategory.findById(params.id);
    if (!cat)
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    const contentType = request.headers.get('content-type') || '';
    let name, description, order, isActive, imageFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name        = formData.get('name');
      description = formData.get('description');
      order       = formData.get('order');
      isActive    = formData.get('isActive');
      imageFile   = formData.get('image');
    } else {
      const body  = await request.json();
      name        = body.name;
      description = body.description;
      order       = body.order;
      isActive    = body.isActive;
    }

    // Only update name if it changed — check for conflicts
    if (name !== undefined && name.trim() !== cat.name) {
      const existing = await BlogCategory.findOne({ name: name.trim(), _id: { $ne: params.id } });
      if (existing)
        return NextResponse.json({ success: false, message: 'Category name already exists' }, { status: 409 });
      cat.name = name.trim();
    }

    if (description !== undefined) cat.description = description?.trim() || '';
    if (order       !== undefined) cat.order       = parseInt(order) || 0;
    if (isActive    !== undefined) cat.isActive    = isActive === 'true' || isActive === true;

    if (imageFile instanceof File) {
      await deleteFile(cat.image, 'blogcategories');
      cat.image = await saveFile(imageFile, 'blogcategories');
    }

    await cat.save();
    return NextResponse.json({ success: true, message: 'Category updated', category: cat });
  } catch (err) {
    console.error('PUT /api/blogcategories/:id error:', err);
    if (err.code === 11000)
      return NextResponse.json({ success: false, message: 'Category name already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const count = await Blog.countDocuments({ category: params.id });
    if (count > 0)
      return NextResponse.json(
        { success: false, message: `Cannot delete — ${count} blog(s) use this category` },
        { status: 400 }
      );

    const cat = await BlogCategory.findByIdAndDelete(params.id);
    if (!cat)
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    if (cat.image) await deleteFile(cat.image, 'blogcategories');
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('DELETE /api/blogcategories/:id error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}