// src/app/api/categories/[id]/image/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { deleteFile } from '@/lib/apiHelpers';
import Category from '@/models/Category';

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const category = await Category.findById(params.id);
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    if (category.image) {
      await deleteFile(category.image, 'categories');
      category.image = '';
      await category.save();
    }
    return NextResponse.json({ success: true, message: 'Image deleted', category });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
