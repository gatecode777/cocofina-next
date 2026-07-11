// src/app/api/admin/orders/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Order from '@/models/Order';

// GET /api/admin/orders
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.orders?.view)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page')   || '1');
    const limit  = parseInt(searchParams.get('limit')  || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search?.trim()) {
      filter.$or = [
        { orderNumber:                 { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.fullName':  { $regex: search.trim(), $options: 'i' } },
        { 'shippingAddress.phone':     { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      orders,
      total,
      totalOrders: total,
      totalPages:  Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('GET /api/admin/orders error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
