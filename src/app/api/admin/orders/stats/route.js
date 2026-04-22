// src/app/api/admin/orders/stats/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const [total, placed, confirmed, processing, shipped, delivered, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'placed' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const revenue = revenueResult[0]?.total || 0;

    const pendingPayment = await Order.countDocuments({
      paymentMethod: 'cod', paymentStatus: 'pending',
      status: { $in: ['placed', 'confirmed', 'processing', 'shipped'] },
    });

    return NextResponse.json({ success: true, stats: { total, placed, confirmed, processing, shipped, delivered, cancelled, revenue, pendingPayment } });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to get stats' }, { status: 500 });
  }
}