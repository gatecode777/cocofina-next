// src/app/api/admin/products/stats/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Product from '@/models/Product';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const [totalProducts, active, inactive, outOfStock, comingSoon] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: 'inactive' }),
      Product.countDocuments({ stockStatus: 'Out of Stock' }),
      Product.countDocuments({ isComingSoon: true }),
    ]);

    return NextResponse.json({ success: true, stats: { totalProducts, active, inactive, outOfStock, comingSoon } });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
