// src/app/api/reset-password/reset/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';
import ResetToken from '@/models/ResetToken';

export async function POST(request) {
  try {
    await connectDB();
    const { newPassword, resetToken } = await request.json();

    if (!newPassword)
      return NextResponse.json({ success: false, message: 'New password is required' }, { status: 400 });
    if (newPassword.length < 6)
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
    if (!resetToken)
      return NextResponse.json({ success: false, message: 'Reset token is required' }, { status: 400 });

    // Validate token — must exist and not be expired
    const tokenRecord = await ResetToken.findOne({
      token:     resetToken,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenRecord)
      return NextResponse.json({ success: false, message: 'Reset link has expired. Please request a new one.' }, { status: 400 });

    const user = await User.findOne({ email: tokenRecord.email });
    if (!user)
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Clean up tokens
    await ResetToken.deleteOne({ _id: tokenRecord._id });
    await OTP.deleteMany({ email: tokenRecord.email, type: 'password_reset' });

    return NextResponse.json({ success: true, message: 'Password reset successfully! You can now login.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return NextResponse.json({ success: false, message: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}