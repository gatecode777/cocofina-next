// src/app/api/categories/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import Category from '@/models/Category';
import Product from '@/models/Product';

// GET /api/categories  — public
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const query = {};
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (isActive !== null && isActive !== undefined) query.isActive = isActive === 'true';

    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });
    const withCount = await Promise.all(categories.map(async cat => {
      const productCount = await Product.countDocuments({ category: cat._id, status: 'active' });
      return { ...cat.toObject(), productCount };
    }));

    return NextResponse.json({ success: true, categories: withCount, total: withCount.length });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/categories — admin only
export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const contentType = request.headers.get('content-type') || '';
    let name, description, order, isActive, imageFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      name = formData.get('name');
      description = formData.get('description');
      order = formData.get('order');
      isActive = formData.get('isActive');
      imageFile = formData.get('image');
    } else {
      const body = await request.json();
      name = body.name; description = body.description; order = body.order; isActive = body.isActive;
    }

    if (!name) return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });

    const existing = await Category.findOne({ name });
    if (existing) return NextResponse.json({ success: false, message: 'Category with this name already exists' }, { status: 400 });

    const catData = {
      name, description: description || '',
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
    };
    if (imageFile instanceof File) catData.image = await saveFile(imageFile, 'categories');

    const category = await Category.create(catData);

    await logActivity(request, admin, {
      action: 'create',
      module: 'categories',
      description: `Created category "${category.name}"`,
      targetId: category._id,
      targetName: category.name,
    });

    return NextResponse.json({ success: true, message: 'Category created', category }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to create category' }, { status: 500 });
  }
}