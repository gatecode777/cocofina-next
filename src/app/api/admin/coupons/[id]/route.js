// src/app/api/admin/coupons/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { requireAdmin } from '@/lib/auth';
import Coupon from '@/models/Coupon';

export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.coupons?.edit)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();
    const coupon = await Coupon.findById(params.id).lean();
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });

    await logActivity(request, admin, {
      action: 'view',
      module: 'coupons',
      description: `Viewed coupon "${coupon.code}"`,
      targetId: coupon._id,
      targetName: coupon.code,
    });

    return NextResponse.json({ success: true, coupon });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.coupons?.edit)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

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

    await logActivity(request, admin, {
      action: 'edit',
      module: 'coupons',
      description: `Updated coupon "${coupon.code}"`,
      targetId: coupon._id,
      targetName: coupon.code,
    });
    
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

    if (admin.role !== 'super_admin' && !admin.permissions?.coupons?.delete)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();
    const coupon = await Coupon.findByIdAndDelete(params.id);
    if (!coupon) return NextResponse.json({ success: false, message: 'Coupon not found' }, { status: 404 });

    await logActivity(request, admin, {
      action: 'delete',
      module: 'coupons',
      description: `Deleted coupon "${coupon.code}"`,
      targetId: coupon._id,
      targetName: coupon.code,
    });
    
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}