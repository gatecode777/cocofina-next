// src/app/api/admin/products/[id]/images/[filename]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { deleteFile } from '@/lib/apiHelpers';
import Product from '@/models/Product';

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const product = await Product.findById(params.id);
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });

    product.images = (product.images || []).filter(img => img !== params.filename);
    if (product.thumbnail === params.filename) product.thumbnail = product.images[0] || '';

    await product.save();
    await deleteFile(params.filename, 'products');

    return NextResponse.json({ success: true, message: 'Image deleted', images: product.images });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}