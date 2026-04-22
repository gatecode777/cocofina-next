// src/app/api/auth/logout/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import User from '@/models/User';

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    await User.findByIdAndUpdate(user._id, { loginToken: null });
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}