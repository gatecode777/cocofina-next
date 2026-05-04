// src/app/api/admin/orders/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import Order from '@/models/Order';
import '@/models/User';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page')   || '1');
    const limit  = parseInt(searchParams.get('limit')  || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone':    { $regex: search, $options: 'i' } },
    ];

    const skip  = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    await logActivity(request, admin, {
      action: 'view',
      module: 'orders',
      description: `Viewed orders (page ${page})`,
    });

    return NextResponse.json({ success: true, orders, totalOrders: total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}