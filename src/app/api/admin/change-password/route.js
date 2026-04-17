// src/app/api/admin/change-password/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Admin from '@/models/Admin';

export async function PUT(request) {
  try {
    const { admin: authAdmin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword)
      return NextResponse.json({ success: false, message: 'Please provide current and new password' }, { status: 400 });
    if (newPassword.length < 8)
      return NextResponse.json({ success: false, message: 'New password must be at least 8 characters' }, { status: 400 });

    const admin = await Admin.findById(authAdmin._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 401 });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    return NextResponse.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}