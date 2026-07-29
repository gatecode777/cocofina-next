// src/app/api/reset-password/resend/route.js

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
  const mailHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const mailPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const mailSecure = process.env.SMTP_SECURE === 'true';

  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: mailSecure,
    auth: { user: mailUser, pass: mailPass },
    tls: {
      rejectUnauthorized: false
    }
  });

  await transporter.sendMail({
    from:    `"Cocofina" <${mailUser}>`,
    to:      email,
    subject: 'Your New Password Reset OTP - Cocofina',
    html: `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#3b2a1a,#5a3e28);padding:32px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">Cocofina</h1>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#1a1a1a;margin:0 0 8px;">New OTP Requested</h2>
          <p style="color:#555;margin:0 0 24px;">Hi ${firstName || 'there'},<br/>Here is your new OTP. It expires in <strong>10 minutes</strong>.</p>
          <div style="background:#faf7f4;border:2px dashed #c8b89a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <div style="font-size:42px;font-weight:800;letter-spacing:10px;color:#3b2a1a;font-family:monospace;">${otp}</div>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">Never share this OTP with anyone.</p>
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

    if (!user)
      return NextResponse.json({ success: true, message: 'If your email is registered, you will receive a new OTP' });

    const recent = await OTP.findOne({
      email,
      type:      'password_reset',
      createdAt: { $gt: new Date(Date.now() - 2 * 60 * 1000) },
    });
    if (recent)
      return NextResponse.json({ success: false, message: 'Please wait before requesting another OTP' }, { status: 429 });

    await OTP.deleteMany({ email, type: 'password_reset', isUsed: false });

    const otp       = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({ email, otp, type: 'password_reset', expiresAt });
    await sendOTPEmail(email, otp, user.firstName);

    return NextResponse.json({ success: true, message: 'New OTP sent successfully' });
  } catch (err) {
    console.error('resendOTP error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to resend OTP. Please try again.' }, { status: 500 });
  }
}
