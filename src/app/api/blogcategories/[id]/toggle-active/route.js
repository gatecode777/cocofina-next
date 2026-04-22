// src/app/api/blogcategories/[id]/toggle-active/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import BlogCategory from '@/models/BlogCategory';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const cat = await BlogCategory.findById(params.id);
    if (!cat)
      return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });

    cat.isActive = !cat.isActive;
    await cat.save();

    return NextResponse.json({
      success:  true,
      message:  `Category ${cat.isActive ? 'activated' : 'deactivated'}`,
      category: cat,
    });
  } catch (err) {
    console.error('PUT /api/blogcategories/:id/toggle-active error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}