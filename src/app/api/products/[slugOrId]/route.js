// src/app/api/products/[slugOrId]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import Product from '@/models/Product';
import '@/models/Category';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slugOrId } = params;

    // Try by ObjectId first, then by slug
    const isId = mongoose.Types.ObjectId.isValid(slugOrId);
    const filter = isId
      ? { _id: slugOrId, status: 'active' }
      : { slug: slugOrId, status: 'active' };

    const product = await Product.findOne(filter).populate('category', 'name slug').lean();
    
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error('Error fetching product:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch product' }, { status: 500 });
  }
}