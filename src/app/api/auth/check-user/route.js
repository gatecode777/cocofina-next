// src/app/api/auth/check-user/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const { email, phone } = await request.json();

    if (email?.trim()) {
      const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingEmail) {
        return NextResponse.json({ success: false, message: 'An account with this email address already exists.' }, { status: 409 });
      }
    }

    if (phone?.trim()) {
      const cleanPhone = phone.replace(/\D/g, '');
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return NextResponse.json({ success: false, message: 'This phone number is already registered.' }, { status: 409 });
      }
    }

    return NextResponse.json({ success: true, message: 'Email and phone are available.' });
  } catch (err) {
    console.error('check-user error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
