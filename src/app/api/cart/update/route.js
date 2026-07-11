// src/app/api/cart/update/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Cart from '@/models/Cart';

export async function PUT(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { productId, variantWeight, quantity } = await request.json();
    if (!productId || !variantWeight || quantity === undefined)
      return NextResponse.json({ success: false, message: 'productId, variantWeight and quantity are required' }, { status: 400 });
    if (quantity < 1)
      return NextResponse.json({ success: false, message: 'Quantity must be at least 1' }, { status: 400 });

    const cart = await Cart.findOne({ user: user._id });
    if (!cart) return NextResponse.json({ success: false, message: 'Cart not found' }, { status: 404 });

    const item = cart.items.find(
      i => i.product.toString() === productId && i.variantWeight === variantWeight
    );
    if (!item) return NextResponse.json({ success: false, message: 'Item not in cart' }, { status: 404 });

    item.quantity = parseInt(quantity);
    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name slug images thumbnail variants stockStatus status' });

    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    return NextResponse.json({ success: true, cart, count });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to update cart' }, { status: 500 });
  }
}
