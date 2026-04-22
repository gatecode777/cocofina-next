// src/app/api/addresses/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Address from '@/models/Address';

// GET /api/addresses
export async function GET(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    const addresses = await Address.find({ user: user._id }).sort({ isDefault: -1, createdAt: -1 });
    return NextResponse.json({ success: true, addresses });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch addresses' }, { status: 500 });
  }
}

// POST /api/addresses
export async function POST(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = await request.json();

    // Validate required fields
    for (const [field, value] of Object.entries({ fullName, phone, line1, city, state, pincode })) {
      if (!value?.trim()) return NextResponse.json({ success: false, message: `${field} is required` }, { status: 400 });
    }

    if (isDefault) await Address.updateMany({ user: user._id }, { isDefault: false });

    const count = await Address.countDocuments({ user: user._id });
    const setDefault = isDefault || count === 0;

    const address = await Address.create({
      user: user._id, label: label || 'Home',
      fullName, phone, line1, line2: line2 || '',
      city, state, pincode, isDefault: setDefault,
    });

    return NextResponse.json({ success: true, message: 'Address created', address }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to create address' }, { status: 500 });
  }
}