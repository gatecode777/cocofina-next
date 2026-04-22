// src/app/api/auth/login/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';

const safeUser = (u) => ({ id: u._id, _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', profile: u.profile || '', isVerified: u.isVerified, createdAt: u.createdAt });

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ success: false, message: 'Please provide email and password' }, { status: 400 });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 400 });
    if (!user.isActive) return NextResponse.json({ success: false, message: 'Your account is disabled. Please contact admin.' }, { status: 403 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 400 });

    const token = generateToken(user._id);
    return NextResponse.json({ success: true, message: 'Login successful', token, user: safeUser(user) });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}