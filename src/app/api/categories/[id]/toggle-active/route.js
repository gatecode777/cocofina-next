// src/app/api/categories/[id]/toggle-active/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { requireAdmin } from '@/lib/auth';
import Category from '@/models/Category';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const category = await Category.findById(params.id);
    if (!category) return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
    category.isActive = !category.isActive;
    await category.save();

    await logActivity(request, admin, {
      action: 'toggle_status',
      module: 'categories',
      description: `${category.isActive ? 'Activated' : 'Deactivated'} category "${category.name}"`,
      targetId: category._id,
      targetName: category.name,
    });

    return NextResponse.json({ success: true, message: `Category ${category.isActive ? 'activated' : 'deactivated'}`, category });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
