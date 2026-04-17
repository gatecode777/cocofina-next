// src/app/api/admin/users/[id]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';

// GET /api/admin/users/:id
export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const user = await User.findById(params.id).select('-password -loginToken');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/admin/users/:id
export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const body = await request.json();
    const { firstName, lastName, email, phone, isActive, isVerified } = body;

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
      user.email = email;
    }

    if (firstName  !== undefined) user.firstName  = firstName;
    if (lastName   !== undefined) user.lastName   = lastName;
    if (phone      !== undefined) user.phone      = phone;
    if (isActive   !== undefined) user.isActive   = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();
    return NextResponse.json({ success: true, message: 'User updated', user });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users/:id
export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const user = await User.findByIdAndDelete(params.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}