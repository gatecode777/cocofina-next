// src/app/api/orders/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Order from '@/models/Order';
import Coupon from '@/models/Coupon';

// PUT /api/orders/:id  — cancel order
export async function PUT(request, { params }) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const order = await Order.findOne({ _id: params.id, user: user._id });
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    if (!['placed', 'confirmed'].includes(order.status))
      return NextResponse.json({ success: false, message: `Cannot cancel an order in "${order.status}" status` }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || body.cancelReason || 'Cancelled by customer';

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    await order.save();

    // Restore coupon usage
    if (order.coupon?.couponId) {
      await Coupon.findByIdAndUpdate(order.coupon.couponId, {
        $inc: { usedCount: -1 }, $pull: { usedBy: user._id },
      });
    }

    return NextResponse.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to cancel order' }, { status: 500 });
  }
}
