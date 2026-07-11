// src/app/api/auth/change-password/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import User from '@/models/User';

export async function PUT(request) {
  try {
    const { user: authUser, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword)
      return NextResponse.json({ success: false, message: 'Please provide current and new password' }, { status: 400 });
    if (newPassword.length < 6)
      return NextResponse.json({ success: false, message: 'New password must be at least 6 characters' }, { status: 400 });

    const user = await User.findById(authUser._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
