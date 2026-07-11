// src/app/api/auth/profile-image/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { deleteFile } from '@/lib/apiHelpers';
import User from '@/models/User';

const safeUser = (u) => ({ id: u._id, _id: u._id, firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone || '', profile: u.profile || '', isVerified: u.isVerified, createdAt: u.createdAt });

export async function DELETE(request) {
  try {
    const { user: authUser, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const user = await User.findById(authUser._id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    if (user.profile) {
      await deleteFile(user.profile, 'profiles');
      user.profile = '';
      await user.save();
    }

    return NextResponse.json({ success: true, message: 'Profile image deleted', user: safeUser(user) });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
