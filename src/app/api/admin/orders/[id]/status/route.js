
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { requireAdmin } from '@/lib/auth';
import Order from '@/models/Order';

// PUT /api/admin/orders/:id/status
export async function PUT(request, { params }) {
  try {
    // 1. Admin auth
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.orders?.edit)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    // 2. Connect DB
    await connectDB();

    // 3. Get body
    const body = await request.json();
    const { status, paymentStatus } = body;

    // 4. Validation
    const allowedStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const allowedPayment = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status "${status}"` },
        { status: 400 }
      );
    }

    if (paymentStatus && !allowedPayment.includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: `Invalid paymentStatus "${paymentStatus}"` },
        { status: 400 }
      );
    }

    // 5. Find order
    const order = await Order.findById(params.id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // 6. Update fields
    if (status) {
      order.status = status;

      if (status === 'confirmed') order.confirmedAt = new Date();
      if (status === 'shipped') order.shippedAt = new Date();
      if (status === 'delivered') order.deliveredAt = new Date();
      if (status === 'cancelled') order.cancelledAt = new Date();
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // 7. Save
    await order.save();

    await logActivity(request, admin, {
      action: 'toggle_status',
      module: 'orders',
      description: `Updated order #${order.orderNumber}`,
      targetId: order._id,
      targetName: `Order #${order.orderNumber}`,
    });

    // 8. Response
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order,
    });

  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to update order' },
      { status: 500 }
    );
  }
}
