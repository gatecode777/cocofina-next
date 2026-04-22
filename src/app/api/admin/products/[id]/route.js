// src/app/api/admin/products/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import Product from '@/models/Product';

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

// GET /api/admin/products/:id
export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const product = await Product.findById(params.id).populate('category', 'name slug').lean();
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/admin/products/:id  (multipart/form-data)
export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

    const existingProduct = await Product.findById(params.id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    let productData;
    try {
      productData = JSON.parse(formData.get('productData') || '{}');
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid product data' },
        { status: 400 }
      );
    }

    // Slug update
    if (productData.name && productData.name !== existingProduct.name) {
      productData.slug = await ensureUniqueSlug(
        generateSlug(productData.name),
        params.id
      );
    }

    // Image handling
    const keepExisting = formData.get('keepExistingImages') === 'true';
    const newImageFiles = formData.getAll('images').filter(f => f instanceof File);
    const newFilenames = await Promise.all(
      newImageFiles.map(f => saveFile(f, 'products'))
    );

    let finalImages = keepExisting ? [...(existingProduct.images || [])] : [];

    if (!keepExisting && existingProduct.images?.length) {
      for (const fn of existingProduct.images) {
        if (!newFilenames.includes(fn)) {
          await deleteFile(fn, 'products');
        }
      }
    }

    finalImages = [...finalImages, ...newFilenames].slice(0, 4);

    productData.images = finalImages;
    productData.thumbnail = finalImages[0] || existingProduct.thumbnail || '';

    // ✅ UPDATE WITHOUT SAVE
    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: productData },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    return NextResponse.json({
      success: true,
      product: updatedProduct
    });

  } catch (err) {
    console.error('admin updateProduct error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/:id
export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    for (const fn of (product.images || [])) await deleteFile(fn, 'products');
    await Product.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}