// src/app/api/admin/coupons/[id]/toggle/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Coupon from '@/models/Coupon';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const coupon = await Coupon.findById(params.id);
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });
    coupon.isActive = !coupon.isActive;
    await coupon.save();
    return NextResponse.json({ success: true, message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}`, coupon });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}