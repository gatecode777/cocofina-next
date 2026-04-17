// src/app/api/addresses/[id]/default/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Address from '@/models/Address';

export async function PUT(request, { params }) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    await Address.updateMany({ user: user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: params.id, user: user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Default address updated', address });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}