// src/app/api/orders/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Coupon from '@/models/Coupon';

// GET /api/orders  — my orders
export async function GET(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page')   || '1');
    const limit  = parseInt(searchParams.get('limit')  || '10');
    const status = searchParams.get('status') || '';

    const filter = { user: user._id };
    if (status) filter.status = status;

    const skip  = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();

    return NextResponse.json({ success: true, orders, totalOrders: total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (err) {
    return NextResponse.json({ success: false, message: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders  — place order
export async function POST(request) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;
    await connectDB();

    const { addressSnapshot, shippingMethod = 'free', paymentMethod = 'cod', notes = '', couponCode = null } = await request.json();

    if (!addressSnapshot?.fullName || !addressSnapshot?.line1)
      return NextResponse.json({ success: false, message: 'Shipping address is required' }, { status: 400 });
    if (!['cod', 'prepaid'].includes(paymentMethod))
      return NextResponse.json({ success: false, message: 'Invalid payment method' }, { status: 400 });

    const cart = await Cart.findOne({ user: user._id }).populate({
      path: 'items.product', select: 'name images thumbnail variants stockStatus status',
    });
    if (!cart || cart.items.length === 0)
      return NextResponse.json({ success: false, message: 'Cart is empty' }, { status: 400 });

    // Build order items
    const orderItems = [];
    for (const item of cart.items) {
      const p = item.product;
      if (!p || p.status !== 'active')
        return NextResponse.json({ success: false, message: `"${p?.name || 'A product'}" is no longer available` }, { status: 400 });
      const variant = p.variants.find(v => v.weight === item.variantWeight);
      if (!variant)
        return NextResponse.json({ success: false, message: `Variant "${item.variantWeight}" not found for "${p.name}"` }, { status: 400 });
      orderItems.push({
        product: p._id, name: p.name, variantWeight: item.variantWeight,
        price: variant.price, quantity: item.quantity, image: p.images?.[0] || p.thumbnail || '',
      });
    }

    const subtotal       = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax            = Math.round(subtotal * 0.05);
    const shippingCharge = shippingMethod === 'express' ? 50 : 0;
    let discount = 0;
    let couponSnap = { couponId: null, code: null, type: null, value: null, discount: null };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (!coupon) return NextResponse.json({ success: false, message: 'Coupon is no longer valid' }, { status: 400 });

      const now = new Date();
      if (coupon.expiryDate && now > coupon.expiryDate)
        return NextResponse.json({ success: false, message: 'Coupon has expired' }, { status: 400 });
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
        return NextResponse.json({ success: false, message: 'Coupon usage limit reached' }, { status: 400 });
      if (subtotal < coupon.minOrderValue)
        return NextResponse.json({ success: false, message: `Min order ₹${coupon.minOrderValue} required` }, { status: 400 });

      const used = coupon.usedBy.filter(id => id.toString() === user._id.toString()).length;
      if (used >= (coupon.perUserLimit || 1))
        return NextResponse.json({ success: false, message: 'You have already used this coupon' }, { status: 400 });

      discount = coupon.type === 'flat'
        ? Math.min(coupon.value, subtotal)
        : (subtotal * coupon.value) / 100;
      if (coupon.type === 'percentage' && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      discount = Math.round(discount);
      couponSnap = { couponId: coupon._id, code: coupon.code, type: coupon.type, value: coupon.value, discount };
      coupon.usedCount += 1;
      coupon.usedBy.push(user._id);
      await coupon.save();
    }

    const total = subtotal + tax + shippingCharge - discount;
    const order = await Order.create({
      user: user._id, items: orderItems, shippingAddress: addressSnapshot,
      subtotal, tax, shippingCharge, discount, total,
      coupon: couponSnap, shippingMethod, paymentMethod,
      paymentStatus: 'pending', status: 'placed', notes, placedAt: new Date(),
    });

    cart.items = [];
    await cart.save();
    await order.populate('user', 'firstName lastName email');

    return NextResponse.json({ success: true, message: 'Order placed successfully!', order }, { status: 201 });
  } catch (err) {
    console.error('createOrder error:', err);
    return NextResponse.json({ success: false, message: err.message || 'Failed to place order' }, { status: 500 });
  }
}