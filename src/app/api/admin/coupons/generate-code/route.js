
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import Coupon from '@/models/Coupon';

// Helper to generate random coupon code
const generateCode = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// GET /api/admin/coupons/generate-code
export async function GET(request) {
  try {
    // ✅ Protect route
    const { admin, error } = await requireAdmin(request);
    if (error) return error;

    await connectDB();
    
    let code, attempts = 0;

    do {
      code = generateCode();
      const existing = await Coupon.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    return NextResponse.json({ success: true, code });

  } catch (err) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate code' 
      },
      { status: 500 }
    );
  }
}