// src/app/api/reset-password/forgot/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import OTP from '@/models/OTP';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, firstName) => {
  const mailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const mailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: mailUser, pass: mailPass },
  });

  await transporter.sendMail({
    from:    `"Cocofina" <${mailUser}>`,
    to:      email,
    subject: 'Your Password Reset OTP - Cocofina',
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#3b2a1a,#5a3e28);padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">Cocofina</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1a1a1a;margin:0 0 8px;">Password Reset</h2>
          <p style="color:#555;margin:0 0 24px;">Hi ${firstName || 'there'},<br/>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#faf7f4;border:2px dashed #c8b89a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:42px;font-weight:800;letter-spacing:10px;color:#3b2a1a;font-family:monospace;">${otp}</div>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">If you didn't request this, you can safely ignore this email.<br/>Never share this OTP with anyone.</p>
        </div>
        <div style="background:#f9f6f3;padding:16px 40px;text-align:center;color:#aaa;font-size:12px;">
          © ${new Date().getFullYear()} Cocofina. All rights reserved.
        </div>
      </div>
    `,
  });
};

export async function POST(request) {
  try {
    await connectDB();
    const body  = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email)
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });

    const user = await User.findOne({ email });

    // Always return 200 for security — don't reveal if email exists
    if (!user)
      return NextResponse.json({ success: true, message: 'If your email is registered, you will receive an OTP' });

    if (!user.isActive)
      return NextResponse.json({ success: false, message: 'Your account is disabled. Please contact support.' }, { status: 403 });

    // Delete any existing unused OTPs
    await OTP.deleteMany({ email, type: 'password_reset', isUsed: false });

    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await OTP.create({ email, otp, type: 'password_reset', expiresAt });
    await sendOTPEmail(email, otp, user.firstName);

    return NextResponse.json({ success: true, message: 'OTP sent successfully to your email' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    return NextResponse.json({ success: false, message: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
