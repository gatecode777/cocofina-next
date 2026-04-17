// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import User from '@/models/User';

const safeUser = (u) => ({ id: u._id, _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', profile: u.profile || '', isVerified: u.isVerified, createdAt: u.createdAt });

export async function POST(request) {
  try {
    await connectDB();
    const { firstName, lastName, email, password, phone } = await request.json();

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password)
      return NextResponse.json({ success: false, message: 'Please fill all required fields' }, { status: 400 });

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) return NextResponse.json({ success: false, message: 'An account with this email already exists' }, { status: 409 });

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone) {
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) return NextResponse.json({ success: false, message: 'This phone number is already registered' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.toLowerCase().trim(), password: hashedPassword, phone: cleanPhone });
    const token = generateToken(user._id);
    return NextResponse.json({ success: true, message: 'Registration successful', token, user: safeUser(user) }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return NextResponse.json({ success: false, message: field === 'email' ? 'Email already registered' : 'Phone already registered' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}