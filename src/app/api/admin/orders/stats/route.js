// src/app/api/admin/orders/stats/route.js
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.orders?.view)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();

    const [
      total, placed, confirmed, processing,
      shipped, delivered, cancelled,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'placed'      }),
      Order.countDocuments({ status: 'confirmed'   }),
      Order.countDocuments({ status: 'processing'  }),
      Order.countDocuments({ status: 'shipped'     }),
      Order.countDocuments({ status: 'delivered'   }),
      Order.countDocuments({ status: 'cancelled'   }),
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    return NextResponse.json({
      success: true,
      stats: {
        total, placed, confirmed, processing,
        shipped, delivered, cancelled, revenue,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/orders/stats error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Server error' }, { status: 500 });
  }
}
