// src/app/api/admin/users/[id]/toggle-status/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    user.isActive = !user.isActive;
    await user.save();
    return NextResponse.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { _id: user._id, isActive: user.isActive } });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}