// src/app/api/cart/add/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { productId, variantWeight, quantity = 1 } = await request.json();
    if (!productId || !variantWeight)
      return NextResponse.json({ success: false, message: 'productId and variantWeight are required' }, { status: 400 });

    const product = await Product.findOne({ _id: productId, status: 'active' });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found or unavailable' }, { status: 404 });

    const variant = product.variants.find(v => v.weight === variantWeight);
    if (!variant) return NextResponse.json({ success: false, message: 'Variant not found' }, { status: 404 });
    if (variant.stock !== undefined && variant.stock < quantity)
      return NextResponse.json({ success: false, message: 'Insufficient stock' }, { status: 400 });

    let cart = await Cart.findOne({ user: user._id });
    if (!cart) cart = await Cart.create({ user: user._id, items: [] });

    const existIdx = cart.items.findIndex(
      i => i.product.toString() === productId && i.variantWeight === variantWeight
    );
    if (existIdx >= 0) cart.items[existIdx].quantity += parseInt(quantity);
    else cart.items.push({ product: productId, variantWeight, quantity: parseInt(quantity) });

    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name slug images thumbnail variants stockStatus status' });

    const count = cart.items.reduce((s, i) => s + i.quantity, 0);
    return NextResponse.json({ success: true, message: 'Added to cart', cart, count });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to add to cart' }, { status: 500 });
  }
}
