// src/app/api/admin/managers/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Admin from '@/models/Admin';

// GET /api/admin/managers — list all sub-admins
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    if (admin.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Only super admin can manage admins' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page   = parseInt(searchParams.get('page') || '1');
    const limit  = parseInt(searchParams.get('limit') || '20');

    const filter = { _id: { $ne: admin._id } }; // exclude self
    if (search.trim()) filter.$or = [
      { fullName: { $regex: search.trim(), $options: 'i' } },
      { email:    { $regex: search.trim(), $options: 'i' } },
    ];

    const skip  = (page - 1) * limit;
    const total = await Admin.countDocuments(filter);
    const admins = await Admin.find(filter)
      .select('-password -loginToken')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .populate('createdBy', 'fullName email')
      .lean();

    return NextResponse.json({ success: true, admins, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET managers error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST /api/admin/managers — create a new sub-admin
export async function POST(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    if (admin.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Only super admin can create admins' }, { status: 403 });

    await connectDB();
    const { fullName, email, password, role, permissions } = await request.json();

    if (!fullName?.trim() || !email?.trim() || !password)
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
    if (role === 'super_admin')
      return NextResponse.json({ success: false, message: 'Cannot create another super_admin' }, { status: 400 });

    const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return NextResponse.json({ success: false, message: 'An admin with this email already exists' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      fullName:    fullName.trim(),
      email:       email.toLowerCase().trim(),
      password:    hashed,
      role:        role || 'admin',
      permissions: permissions || {},
      createdBy:   admin._id,
      isActive:    true,
    });

    const safe = newAdmin.toObject();
    delete safe.password;
    delete safe.loginToken;

    return NextResponse.json({ success: true, message: 'Admin created successfully', admin: safe }, { status: 201 });
  } catch (err) {
    console.error('POST managers error:', err);
    if (err.code === 11000)
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}