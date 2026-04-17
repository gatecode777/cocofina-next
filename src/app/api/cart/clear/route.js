import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Cart from '@/models/Cart';


// DELETE /api/cart  — clear entire cart
export async function DELETE(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();
    await Cart.findOneAndUpdate({ user: user._id }, { items: [] });
    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to clear cart' }, { status: 500 });
  }
}