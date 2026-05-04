// src/app/api/admin/products/[id]/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import { logActivity } from '@/lib/logActivity';
import Product from '@/models/Product';

const generateSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
    if (!product)
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    await logActivity(request, admin, {
      action:      'view',
      module:      'products',
      description: `Viewed product "${product.name}"`,
      targetId:    product._id,
      targetName:  product.name,
    });

    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/admin/products/:id  (multipart/form-data)
export async function PUT(request, { params }) {
  // Declare outside try so catch block can reference them
  let admin           = null;
  let existingProduct = null;

  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.error;
    admin = authResult.admin;

    await connectDB();

    existingProduct = await Product.findById(params.id);
    if (!existingProduct)
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    const formData = await request.formData();

    let productData;
    try {
      productData = JSON.parse(formData.get('productData') || '{}');
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid product data' }, { status: 400 });
    }

    // Slug update only when name changes
    if (productData.name && productData.name !== existingProduct.name) {
      productData.slug = await ensureUniqueSlug(generateSlug(productData.name), params.id);
    }

    // Image handling
    const keepExisting  = formData.get('keepExistingImages') === 'true';
    const newImageFiles = formData.getAll('images').filter(f => f instanceof File);
    const newFilenames  = await Promise.all(newImageFiles.map(f => saveFile(f, 'products')));

    let finalImages = keepExisting ? [...(existingProduct.images || [])] : [];

    if (!keepExisting && existingProduct.images?.length) {
      for (const fn of existingProduct.images) {
        if (!newFilenames.includes(fn)) await deleteFile(fn, 'products');
      }
    }

    finalImages = [...finalImages, ...newFilenames].slice(0, 4);
    productData.images    = finalImages;
    productData.thumbnail = finalImages[0] || existingProduct.thumbnail || '';

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      { $set: productData },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    // ← 'edit' is the correct enum value (not 'update')
    await logActivity(request, admin, {
      action:      'edit',
      module:      'products',
      description: `Updated product "${updatedProduct.name}"`,
      targetId:    updatedProduct._id,
      targetName:  updatedProduct.name,
    });

    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (err) {
    console.error('admin updateProduct error:', err);

    // Guard: only log if admin + product are available
    if (admin && existingProduct) {
      await logActivity(request, admin, {
        action:       'edit',
        module:       'products',
        description:  `Failed to update product "${existingProduct.name}"`,
        targetId:     existingProduct._id,
        targetName:   existingProduct.name,
        success:      false,
        errorMessage: err.message,
      });
    }

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
    if (!product)
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    const name = product.name; // snapshot before deletion
    for (const fn of (product.images || [])) await deleteFile(fn, 'products');
    await Product.findByIdAndDelete(params.id);

    await logActivity(request, admin, {
      action:      'delete',
      module:      'products',
      description: `Deleted product "${name}"`,
      targetId:    params.id,
      targetName:  name,
    });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}