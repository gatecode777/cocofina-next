// src/app/api/auth/profile/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import User from '@/models/User';

const safeUser = (u) => ({ id: u._id, _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', profile: u.profile || '', isVerified: u.isVerified, createdAt: u.createdAt });

export async function GET(request) {
  try {
    const { user: authUser, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    const user = await User.findById(authUser._id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, user: safeUser(user) });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { user: authUser, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const user = await User.findById(authUser._id);
    const contentType = request.headers.get('content-type') || '';
    let firstName, lastName, phone, profileFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      firstName   = formData.get('firstName');
      lastName    = formData.get('lastName');
      phone       = formData.get('phone');
      profileFile = formData.get('profile');
    } else {
      const body = await request.json();
      firstName = body.firstName; lastName = body.lastName; phone = body.phone;
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
    if (cleanPhone && cleanPhone !== user.phone) {
      const existing = await User.findOne({ phone: cleanPhone, _id: { $ne: user._id } });
      if (existing) return NextResponse.json({ success: false, message: 'Phone number already used by another account' }, { status: 409 });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName)  user.lastName  = lastName.trim();
    if (phone !== undefined) user.phone = cleanPhone;

    if (profileFile instanceof File) {
      await deleteFile(user.profile, 'profiles');
      user.profile = await saveFile(profileFile, 'profiles');
    }

    await user.save();
    return NextResponse.json({ success: true, message: 'Profile updated', user: safeUser(user) });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ success: false, message: 'Phone number already registered' }, { status: 409 });
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}