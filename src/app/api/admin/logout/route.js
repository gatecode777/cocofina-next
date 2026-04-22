// src/app/api/admin/logout/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Admin from '@/models/Admin';

export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    await Admin.findByIdAndUpdate(admin._id, { loginToken: null });
    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}