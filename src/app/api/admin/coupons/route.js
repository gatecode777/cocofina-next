// src/app/api/admin/coupons/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import Coupon from '@/models/Coupon';

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// GET /api/admin/coupons
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page')   || '1');
    const limit  = parseInt(searchParams.get('limit')  || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const filter = {};
    if (search.trim()) filter.$or = [
      { code:        { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
    if (status === 'active')   filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const skip  = (page - 1) * limit;
    const total = await Coupon.countDocuments(filter);
    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    const now = new Date();
    const enriched = coupons.map(c => ({
      ...c,
      isExpired:   c.expiryDate ? now > new Date(c.expiryDate) : false,
      isExhausted: c.usageLimit !== null && c.usedCount >= c.usageLimit,
    }));

    await logActivity(request, admin, {
      action: 'view',
      module: 'coupons',
      description: `Viewed coupons (page ${page})`,
    });

    return NextResponse.json({ success: true, coupons: enriched, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch coupons' }, { status: 500 });
  }
}

// POST /api/admin/coupons
export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    let { code, description, type, value, maxDiscount, minOrderValue,
          usageLimit, perUserLimit, startDate, expiryDate, isActive } = await request.json();

    if (!code?.trim()) code = generateCode();
    code = code.trim().toUpperCase();

    if (!type || !['flat', 'percentage'].includes(type))
      return NextResponse.json({ success: false, message: 'Type must be "flat" or "percentage"' }, { status: 400 });
    if (value === undefined || parseFloat(value) < 0)
      return NextResponse.json({ success: false, message: 'Value must be a positive number' }, { status: 400 });
    if (type === 'percentage' && parseFloat(value) > 100)
      return NextResponse.json({ success: false, message: 'Percentage cannot exceed 100%' }, { status: 400 });

    const existing = await Coupon.findOne({ code });
    if (existing) return NextResponse.json({ success: false, message: `Code "${code}" already exists` }, { status: 409 });

    const coupon = await Coupon.create({
      code, description: description || '', type,
      value:         parseFloat(value),
      maxDiscount:   maxDiscount   ? parseFloat(maxDiscount)   : null,
      minOrderValue: minOrderValue ? parseFloat(minOrderValue) : 0,
      usageLimit:    usageLimit    ? parseInt(usageLimit)      : null,
      perUserLimit:  perUserLimit  ? parseInt(perUserLimit)    : 1,
      startDate:     startDate     || null,
      expiryDate:    expiryDate    || null,
      isActive:      isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json({ success: true, message: 'Coupon created', coupon }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Coupon code already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Failed to create coupon' }, { status: 500 });
  }
}