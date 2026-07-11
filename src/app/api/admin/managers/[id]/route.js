// src/app/api/admin/managers/[id]/route.js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Admin from '@/models/Admin';

const superOnly = (admin) => {
  if (admin.role !== 'super_admin')
    return NextResponse.json({ success: false, message: 'Only super admin can do this' }, { status: 403 });
  return null;
};

export async function GET(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    const denied = superOnly(admin);
    if (denied) return denied;
    await connectDB();
    const target = await Admin.findById(params.id).select('-password -loginToken').lean();
    if (!target) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    return NextResponse.json({ success: true, admin: target });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    const denied = superOnly(admin);
    if (denied) return denied;
    await connectDB();

    const target = await Admin.findById(params.id);
    if (!target) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    if (target.role === 'super_admin')
      return NextResponse.json({ success: false, message: 'Cannot modify another super admin' }, { status: 403 });

    const { fullName, email, role, permissions, isActive, newPassword } = await request.json();

    if (fullName)  target.fullName  = fullName.trim();
    if (email)     target.email     = email.toLowerCase().trim();
    if (role && role !== 'super_admin') target.role = role;
    if (permissions !== undefined) target.permissions = { ...target.permissions.toObject(), ...permissions };
    if (isActive !== undefined) target.isActive = isActive;
    if (newPassword) {
      if (newPassword.length < 8)
        return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 });
      target.password = await bcrypt.hash(newPassword, 10);
    }

    await target.save();
    const safe = target.toObject();
    delete safe.password; delete safe.loginToken;
    return NextResponse.json({ success: true, message: 'Admin updated', admin: safe });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    const denied = superOnly(admin);
    if (denied) return denied;
    await connectDB();

    const target = await Admin.findById(params.id);
    if (!target) return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 });
    if (target.role === 'super_admin')
      return NextResponse.json({ success: false, message: 'Cannot delete a super admin' }, { status: 403 });

    await Admin.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Admin deleted' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
