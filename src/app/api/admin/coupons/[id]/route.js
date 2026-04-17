// src/app/api/admin/coupons/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Coupon from '@/models/Coupon';

export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const coupon = await Coupon.findById(params.id).lean();
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const coupon = await Coupon.findById(params.id);
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });

    const body = await request.json();
    const fields = ['description', 'type', 'value', 'maxDiscount', 'minOrderValue',
                    'usageLimit', 'perUserLimit', 'startDate', 'expiryDate', 'isActive'];
    for (const f of fields) {
      if (body[f] !== undefined) coupon[f] = body[f];
    }
    if (body.code) coupon.code = body.code.trim().toUpperCase();

    await coupon.save();
    return NextResponse.json({ success: true, message: 'Coupon updated', coupon });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Code already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(params.id);
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}