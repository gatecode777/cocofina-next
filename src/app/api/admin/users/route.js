// src/app/api/admin/users/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import User from '@/models/User';

// GET /api/admin/users — list + stats
export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const verified = searchParams.get('verified') || 'all';

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (status !== 'all') query.isActive = status === 'active';
    if (verified !== 'all') query.isVerified = verified === 'verified';

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -loginToken')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit);

    await logActivity(request, admin, {
      action: 'view',
      module: 'users',
      description: `Viewed user list (page ${page})`,
    });

    return NextResponse.json({ success: true, users, totalUsers: total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}