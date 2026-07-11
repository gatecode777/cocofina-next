// src/app/api/cart/count/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Cart from '@/models/Cart';

export async function GET(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    const cart = await Cart.findOne({ user: user._id });
    const count = cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0;
    return NextResponse.json({ success: true, count });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
