
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Coupon from '@/models/Coupon';

// GET /api/coupons/available?cartTotal=XXX
export async function GET(request) {
  try {
    await connectDB();

    // ✅ Get query param
    const { searchParams } = new URL(request.url);
    const cartTotal = parseFloat(searchParams.get('cartTotal')) || 0;

    const now = new Date();

    let all = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
    }).lean();

    if (!all || all.length === 0) {
      all = [
        {
          _id: 'default-coco10',
          code: 'COCO10',
          description: '10% OFF on all orders above ₹299',
          type: 'percentage',
          value: 10,
          maxDiscount: 100,
          minOrderValue: 299,
          isActive: true,
        },
        {
          _id: 'default-healthy50',
          code: 'HEALTHY50',
          description: 'Flat ₹50 OFF on orders above ₹499',
          type: 'flat',
          value: 50,
          minOrderValue: 499,
          isActive: true,
        },
        {
          _id: 'default-welcome100',
          code: 'WELCOME100',
          description: 'Flat ₹100 OFF on orders above ₹999',
          type: 'flat',
          value: 100,
          minOrderValue: 999,
          isActive: true,
        },
      ];
    }

    const valid = all.filter((c) => {
      if (c.expiryDate && now > new Date(c.expiryDate)) return false;
      if (c.usageLimit !== null && c.usageLimit !== undefined && c.usedCount >= c.usageLimit) return false;
      return true;
    });

    const result = valid.map((c) => {
      const eligible = cartTotal >= c.minOrderValue;

      let previewDiscount = 0;

      if (eligible && cartTotal > 0) {
        previewDiscount =
          c.type === 'flat'
            ? Math.min(c.value, cartTotal)
            : (cartTotal * c.value) / 100;

        if (c.type === 'percentage' && c.maxDiscount) {
          previewDiscount = Math.min(previewDiscount, c.maxDiscount);
        }

        previewDiscount = Math.round(previewDiscount);
      }

      return {
        _id: c._id,
        code: c.code,
        description: c.description,
        type: c.type,
        value: c.value,
        maxDiscount: c.maxDiscount,
        minOrderValue: c.minOrderValue,
        expiryDate: c.expiryDate,
        eligible,
        previewDiscount,
        label:
          c.type === 'flat'
            ? `₹${c.value} off`
            : `${c.value}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ''}`,
        reason: !eligible ? `Min order ₹${c.minOrderValue} required` : null,
      };
    });

    // ✅ Sort (same logic)
    result.sort(
      (a, b) =>
        b.eligible - a.eligible || b.previewDiscount - a.previewDiscount
    );

    // ✅ Response
    return NextResponse.json({
      success: true,
      coupons: result,
    });

  } catch (err) {
    console.error('getAvailableCoupons error:', err);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
