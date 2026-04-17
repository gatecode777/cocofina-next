// src/app/api/admin/orders/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Order from '@/models/Order';

export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const order = await Order.findById(params.id).populate('user', 'firstName lastName email phone').lean();
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { status, paymentStatus } = await request.json();

    const allowedStatuses = ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const allowedPayment  = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !allowedStatuses.includes(status))
      return NextResponse.json({ success: false, message: `Invalid status "${status}"` }, { status: 400 });
    if (paymentStatus && !allowedPayment.includes(paymentStatus))
      return NextResponse.json({ success: false, message: `Invalid paymentStatus "${paymentStatus}"` }, { status: 400 });

    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });

    if (status) {
      order.status = status;
      if (status === 'confirmed') order.confirmedAt = new Date();
      if (status === 'shipped')   order.shippedAt   = new Date();
      if (status === 'delivered') order.deliveredAt = new Date();
      if (status === 'cancelled') order.cancelledAt = new Date();
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    return NextResponse.json({ success: true, message: 'Order updated', order });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}