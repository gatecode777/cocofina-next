// src/app/api/admin/blogs/stats/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Blog from '@/models/Blog';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;
    await connectDB();

    const [total, published, drafts, archived, featured, totalViewsResult] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.countDocuments({ status: 'archived' }),
      Blog.countDocuments({ isFeatured: true }),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    return NextResponse.json({
      success: true,
      stats: { total, published, drafts, archived, featured, totalViews: totalViewsResult[0]?.total || 0 },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}