// src/app/api/admin/inquiries/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logActivity';
import Inquiry from '@/models/Inquiry';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || 'all';
    const source = searchParams.get('source')?.trim() || 'all';

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (source && source !== 'all') {
      query.source = source;
    }

    const skip = (page - 1) * limit;

    const [inquiries, totalCount, statsCounts] = await Promise.all([
      Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Inquiry.countDocuments(query),
      Inquiry.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = {
      total: 0,
      new: 0,
      read: 0,
      in_progress: 0,
      resolved: 0,
      archived: 0,
    };

    let totalAll = 0;
    statsCounts.forEach((s) => {
      if (stats[s._id] !== undefined) {
        stats[s._id] = s.count;
      }
      totalAll += s.count;
    });
    stats.total = totalAll;

    await logActivity(request, admin, {
      action: 'view',
      module: 'inquiries',
      description: `Viewed inquiries list (page ${page}, filter: ${status})`,
    });

    return NextResponse.json({
      success: true,
      inquiries,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Error fetching admin inquiries:', err);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching inquiries' },
      { status: 500 }
    );
  }
}
