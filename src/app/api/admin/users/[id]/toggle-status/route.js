// src/app/api/admin/users/[id]/toggle-status/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import User from '@/models/User';

export async function PUT(request, { params }) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    if (admin.role !== 'super_admin' && !admin.permissions?.users?.edit)
      return NextResponse.json({ success: false, message: 'Permission denied' }, { status: 403 });

    await connectDB();
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    user.isActive = !user.isActive;
    await user.save();

    await logActivity(request, admin, {
      action: 'toggle_status',
      module: 'users',
      description: `${user.isActive ? 'Activated' : 'Deactivated'} user "${user.firstName} ${user.lastName}"`,
      targetId: user._id,
      targetName: `${user.firstName} ${user.lastName}`,
    });
    
    return NextResponse.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { _id: user._id, isActive: user.isActive } });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}