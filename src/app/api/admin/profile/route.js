// src/app/api/admin/profile/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { logActivity } from '@/lib/logActivity';
import { requireAdmin } from '@/lib/auth';
import { saveFile, deleteFile } from '@/lib/apiHelpers';
import Admin from '@/models/Admin';

// GET /api/admin/profile
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();
    const fresh = await Admin.findById(admin._id);

    await logActivity(request, admin, {
      action: 'view',
      module: 'profile',
      description: 'Viewed admin profile',
    });

    return NextResponse.json({ success: true, admin: fresh });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PUT /api/admin/profile  (supports multipart for photo upload)
export async function PUT(request) {
  try {
    const { admin: authAdmin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const admin = await Admin.findById(authAdmin._id);
    const contentType = request.headers.get('content-type') || '';

    let fullName, phone, profileFile;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      fullName    = formData.get('fullName');
      phone       = formData.get('phone');
      profileFile = formData.get('profile');
    } else {
      const body = await request.json();
      fullName = body.fullName;
      phone    = body.phone;
    }

    if (fullName) admin.fullName = fullName.trim();
    if (phone)    admin.phone    = phone.trim();

    if (profileFile && profileFile instanceof File) {
      await deleteFile(admin.profile, 'profiles');
      admin.profile = await saveFile(profileFile, 'profiles');
    }

    await admin.save();
    
    await logActivity(request, admin, {
      action: 'edit',
      module: 'profile',
      description: 'Updated admin profile',
    });

    return NextResponse.json({ success: true, message: 'Profile updated', admin });
  } catch (err) {
    console.error('Admin profile update error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
