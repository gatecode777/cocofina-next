// src/app/api/admin/login/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { generateToken } from '@/lib/auth';
import Admin from '@/models/Admin';

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json({ success: false, message: 'Please provide email and password' }, { status: 400 });

    const admin = await Admin.findOne({ email }).select('+password +loginToken');
    if (!admin)
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });

    if (!admin.isActive)
      return NextResponse.json({ success: false, message: 'Your account has been deactivated.' }, { status: 401 });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });

    const token = generateToken(admin._id);
    admin.lastLogin  = new Date();
    admin.loginToken = token;
    await admin.save();

    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData.loginToken;

    // ← 'auth' not 'other', and 'fullName' not 'fullname'
    await logActivity(request, admin, {
      action:      'login',
      module:      'auth',
      description: `${admin.fullName} (${admin.role}) logged in`,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      admin: adminData,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}