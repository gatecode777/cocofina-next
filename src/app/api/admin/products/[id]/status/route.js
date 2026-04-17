// src/app/api/admin/products/[id]/status/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Product from '@/models/Product';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { status } = await request.json();
    if (!['active', 'inactive', 'draft'].includes(status))
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });

    const product = await Product.findByIdAndUpdate(params.id, { status }, { new: true });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}