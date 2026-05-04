// src/app/api/admin/logs/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    // Only super_admin can read logs
    if (admin.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page')    || '1');
    const limit    = parseInt(searchParams.get('limit')   || '30');
    const adminId  = searchParams.get('adminId')  || '';
    const module   = searchParams.get('module')   || '';
    const action   = searchParams.get('action')   || '';
    const search   = searchParams.get('search')   || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo   = searchParams.get('dateTo')   || '';

    const filter = {};
    if (adminId)  filter.admin  = adminId;
    if (module)   filter.module = module;
    if (action)   filter.action = action;
    if (search?.trim()) filter.$or = [
      { description: { $regex: search.trim(), $options: 'i' } },
      { targetName:  { $regex: search.trim(), $options: 'i' } },
      { adminName:   { $regex: search.trim(), $options: 'i' } },
      { path:        { $regex: search.trim(), $options: 'i' } },
    ];
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip  = (page - 1) * limit;
    const total = await ActivityLog.countDocuments(filter);
    const logs  = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit)
      .lean();

    // Get unique admins for filter dropdown
    const admins = await ActivityLog.distinct('admin');
    const adminList = await ActivityLog.aggregate([
      { $group: { _id: '$admin', name: { $first: '$adminName' }, email: { $first: '$adminEmail' } } },
      { $sort: { name: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      adminList,
    });
  } catch (err) {
    console.error('GET logs error:', err);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE — clear all logs (super_admin only)
export async function DELETE(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    if (admin.role !== 'super_admin')
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId') || '';

    const filter = adminId ? { admin: adminId } : {};
    const result = await ActivityLog.deleteMany(filter);

    return NextResponse.json({ success: true, message: `Cleared ${result.deletedCount} logs` });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}