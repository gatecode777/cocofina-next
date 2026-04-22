// src/app/api/reset-password/verify/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import OTP from '@/models/OTP';
import ResetToken from '@/models/ResetToken';

export async function POST(request) {
  try {
    await connectDB();
    const { email, otp } = await request.json();

    if (!email || !otp)
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 });

    const record = await OTP.findOne({
      email:     email.toLowerCase(),
      otp,
      type:      'password_reset',
      isUsed:    false,
      expiresAt: { $gt: new Date() },
    });

    if (!record)
      return NextResponse.json({ success: false, message: 'Invalid or expired OTP. Please try again.' }, { status: 400 });

    // Track attempts — lock after 5 failures
    record.attempts = (record.attempts || 0) + 1;
    if (record.attempts >= 5) {
      await OTP.deleteOne({ _id: record._id });
      return NextResponse.json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' }, { status: 400 });
    }

    // Mark OTP as used
    record.isUsed = true;
    await record.save();

    // Generate a short-lived reset token (15 min)
    const resetToken = crypto.randomBytes(32).toString('hex');
    await ResetToken.create({
      email:     email.toLowerCase(),
      token:     resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    return NextResponse.json({ success: true, message: 'OTP verified successfully', resetToken });
  } catch (err) {
    console.error('verifyOTP error:', err);
    return NextResponse.json({ success: false, message: 'Failed to verify OTP' }, { status: 500 });
  }
}