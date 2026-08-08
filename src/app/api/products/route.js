// src/app/api/products/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page')     || '1');
    const limit    = parseInt(searchParams.get('limit')    || '12');
    const search   = searchParams.get('search')   || '';
    const category = searchParams.get('category') || '';

    const filter = { status: 'active' };
    if (search.trim()) filter.$or = [
      { name:                { $regex: search.trim(), $options: 'i' } },
      { 'description.short': { $regex: search.trim(), $options: 'i' } },
    ];
    if (category) filter.category = category;

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(limit).lean();

    return NextResponse.json({ success: true, products, totalProducts: total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    console.error('public getProducts error:', err);
    return NextResponse.json({ success: false, message: 'Failed to fetch products' }, { status: 500 });
  }
}
