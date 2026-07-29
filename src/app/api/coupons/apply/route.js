// src/app/api/coupons/apply/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Coupon from '@/models/Coupon';

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { code, cartTotal } = await request.json();
    if (!code) return NextResponse.json({ success: false, message: 'Coupon code is required' }, { status: 400 });

    let coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });

    if (!coupon) {
      const codeUpper = code.trim().toUpperCase();
      if (codeUpper === 'COCO10') {
        coupon = { code: 'COCO10', type: 'percentage', value: 10, maxDiscount: 100, minOrderValue: 299, isActive: true, usedBy: [] };
      } else if (codeUpper === 'HEALTHY50') {
        coupon = { code: 'HEALTHY50', type: 'flat', value: 50, minOrderValue: 499, isActive: true, usedBy: [] };
      } else if (codeUpper === 'WELCOME100') {
        coupon = { code: 'WELCOME100', type: 'flat', value: 100, minOrderValue: 999, isActive: true, usedBy: [] };
      }
    }

    if (!coupon) return NextResponse.json({ success: false, message: 'Invalid coupon code' }, { status: 400 });

    const now = new Date();
    if (coupon.expiryDate && now > new Date(coupon.expiryDate))
      return NextResponse.json({ success: false, message: 'Coupon has expired' }, { status: 400 });
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit)
      return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 });
    if (cartTotal < (coupon.minOrderValue || 0))
      return NextResponse.json({ success: false, message: `Minimum order of ₹${coupon.minOrderValue} required for promo code "${coupon.code}"` }, { status: 400 });

    const usedByUser = coupon.usedBy.filter(id => id.toString() === user._id.toString()).length;
    if (usedByUser >= (coupon.perUserLimit || 1))
      return NextResponse.json({ success: false, message: 'You have already used this coupon' }, { status: 400 });

    let discount = coupon.type === 'flat'
      ? Math.min(coupon.value, cartTotal)
      : (cartTotal * coupon.value) / 100;
    if (coupon.type === 'percentage' && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.round(discount);

    return NextResponse.json({ success: true, message: 'Coupon applied!', discount, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount } });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to apply coupon' }, { status: 500 });
  }
}
