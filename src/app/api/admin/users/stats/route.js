
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import User from '@/models/User';

export async function GET(request) {
  try {
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();

    // Dates
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    // Queries
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      newUsersThisMonth,
      newUsersLastMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
      User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfMonth },
      }),
    ]);

    // Calculations
    const inactiveUsers = totalUsers - activeUsers;

    const growthPercentage =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        inactiveUsers,
        newUsersThisMonth,
        growthPercentage: parseFloat(growthPercentage.toFixed(2)),
      },
    });
  } catch (err) {
    console.error('Get user stats error:', err);

    return NextResponse.json(
      {
        success: false,
        message: 'Server error',
        error: err.message,
      },
      { status: 500 }
    );
  }
}
