
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Coupon from '@/models/Coupon';

// GET /api/coupons/available?cartTotal=XXX
export async function GET(request) {
  try {
    // ✅ Auth (same as your system)
    const { user, error } = await requireUser(request);
    if (error) return error;

    // ✅ DB
    await connectDB();

    // ✅ Get query param
    const { searchParams } = new URL(request.url);
    const cartTotal = parseFloat(searchParams.get('cartTotal')) || 0;

    const now = new Date();

    // ✅ Same as Express
    const all = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
    }).lean();

    const valid = all.filter((c) => {
      if (c.expiryDate && now > new Date(c.expiryDate)) return false;
      if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return false;
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
