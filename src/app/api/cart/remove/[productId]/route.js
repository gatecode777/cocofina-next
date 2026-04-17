// src/app/api/cart/remove/[productId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Cart from '@/models/Cart';

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const variantWeight = searchParams.get('variantWeight') || '';

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

    cart.items = cart.items.filter(
      i => !(i.product.toString() === params.productId && i.variantWeight === variantWeight)
    );
    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name slug images thumbnail variants stockStatus status' });

    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    return NextResponse.json({ success: true, message: 'Item removed', cart, count });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to remove item' }, { status: 500 });
  }
}