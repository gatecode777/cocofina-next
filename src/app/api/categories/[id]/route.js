// src/app/api/categories/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const category = await Category.findById(params.id);
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    const productCount = await Product.countDocuments({ category: category._id, status: 'active' });
    return NextResponse.json({ success: true, category: { ...category.toObject(), productCount } });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const category = await Category.findById(params.id);
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

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
      const body = await request.json();
      name = body.name; description = body.description; order = body.order; isActive = body.isActive;
    }

    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) return NextResponse.json({ success: false, message: 'Category with this name already exists' }, { status: 400 });
      category.name = name;
    }
    if (description !== undefined && description !== null) category.description = description;
    if (order       !== undefined && order !== null)       category.order       = parseInt(order) || 0;
    if (isActive    !== undefined && isActive !== null)    category.isActive    = isActive === 'true' || isActive === true;

    if (imageFile instanceof File) {
      await deleteFile(category.image, 'categories');
      category.image = await saveFile(imageFile, 'categories');
    }

    await category.save();
    return NextResponse.json({ success: true, message: 'Category updated', category });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const category = await Category.findById(params.id);
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) return NextResponse.json({ success: false, message: `Cannot delete. ${productCount} product(s) are using this category.` }, { status: 400 });

    await deleteFile(category.image, 'categories');
    await category.deleteOne();
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete category' }, { status: 500 });
  }
}