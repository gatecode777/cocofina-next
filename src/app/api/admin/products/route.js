// src/app/api/admin/products/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile } from '@/lib/apiHelpers';
import { logActivity } from '@/lib/logActivity';
import Product from '@/models/Product';
import Category from '@/models/Category';

const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ensureUniqueSlug = async (base, excludeId = null) => {
  let slug = base, count = 0;
  while (true) {
    const q = { slug };
    if (excludeId) q._id = { $ne: excludeId };
    if (!(await Product.findOne(q))) break;
    slug = `${base}-${++count}`;
  }
  return slug;
};

// GET /api/admin/products
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'all';

    const filter = {};
    if (search.trim()) filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { 'description.short': { $regex: search.trim(), $options: 'i' } },
    ];
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    await logActivity(request, admin, {
      action: 'view',
      module: 'products',
      description: `Viewed product list (page ${page})`,
    });

    return NextResponse.json({ success: true, products, totalProducts: total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    console.error('admin getProducts error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/products  (multipart/form-data)
export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.products?.create)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();

    const formData = await request.formData();
    let productData;
    try { productData = JSON.parse(formData.get('productData') || '{}'); }
    catch { return NextResponse.json({ success: false, message: 'Invalid product data' }, { status: 400 }); }

    if (!productData.name || !productData.category)
      return NextResponse.json({ success: false, message: 'Name and category are required' }, { status: 400 });
    if (!productData.variants?.length)
      return NextResponse.json({ success: false, message: 'At least one variant is required' }, { status: 400 });

    productData.slug = await ensureUniqueSlug(generateSlug(productData.name));

    // Save uploaded images
    const imageFiles = formData.getAll('images').filter(f => f instanceof File);
    if (imageFiles.length) {
      const filenames = await Promise.all(imageFiles.map(f => saveFile(f, 'products')));
      productData.images = filenames;
      productData.thumbnail = filenames[0];
    }

    const product = await Product.create(productData);
    const populated = await Product.findById(product._id).populate('category', 'name slug');

    await logActivity(request, admin, {
      action: 'create',
      module: 'products',
      description: `Created product "${product.name}"`,
      targetId: product._id,
      targetName: product.name,
    });
    
    return NextResponse.json({ success: true, product: populated }, { status: 201 });
  } catch (err) {
    console.error('admin createProduct error:', err);
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Product already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
