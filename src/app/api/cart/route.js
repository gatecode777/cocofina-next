// src/app/api/cart/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

const populateCart = (cart) =>
  cart.populate({ path: 'items.product', select: 'name slug images thumbnail variants stockStatus status' });

// GET /api/cart
export async function GET(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    let cart = await Cart.findOne({ user: user._id });
    if (!cart) return NextResponse.json({ success: true, cart: { items: [] }, count: 0 });

    await populateCart(cart);

    // Remove stale items
    const validItems = cart.items.filter(i => i.product && i.product.status === 'active');
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    return NextResponse.json({ success: true, cart, count });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch cart' }, { status: 500 });
  }
}
