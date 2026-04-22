// src/app/api/addresses/[id]/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Address from '@/models/Address';

export async function GET(request, { params }) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    const address = await Address.findOne({ _id: params.id, user: user._id });
    if (!address) return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });
    return NextResponse.json({ success: true, address });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const address = await Address.findOne({ _id: params.id, user: user._id });
    if (!address) return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });

    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = await request.json();

    if (isDefault && !address.isDefault)
      await Address.updateMany({ user: user._id }, { isDefault: false });

    if (label    !== undefined) address.label    = label;
    if (fullName !== undefined) address.fullName = fullName;
    if (phone    !== undefined) address.phone    = phone;
    if (line1    !== undefined) address.line1    = line1;
    if (line2    !== undefined) address.line2    = line2;
    if (city     !== undefined) address.city     = city;
    if (state    !== undefined) address.state    = state;
    if (pincode  !== undefined) address.pincode  = pincode;
    if (isDefault!== undefined) address.isDefault = isDefault;

    await address.save();
    return NextResponse.json({ success: true, message: 'Address updated', address });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const address = await Address.findOneAndDelete({ _id: params.id, user: user._id });
    if (!address) return NextResponse.json({ success: false, message: 'Address not found' }, { status: 404 });

    // Promote next address to default if deleted was default
    if (address.isDefault) {
      const next = await Address.findOne({ user: user._id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    return NextResponse.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to delete address' }, { status: 500 });
  }
}