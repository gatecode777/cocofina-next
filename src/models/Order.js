// backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  variantWeight: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],

    shippingAddress: {
      fullName: String, phone: String,
      line1: String, line2: String,
      city: String, state: String,
      pincode: String, label: String,
    },

    // Pricing breakdown
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },   // coupon discount amount
    total: { type: Number, required: true }, // after discount

    // Coupon snapshot (captured at order time)
    coupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
      code: { type: String, default: null },
      type: { type: String, default: null },   // 'flat' | 'percentage'
      value: { type: Number, default: null },   // original coupon value
      discount: { type: Number, default: null },   // actual ₹ discount applied
    },

    shippingMethod: { type: String, enum: ['free', 'express'], default: 'free' },
    paymentMethod: { type: String, enum: ['cod', 'prepaid'], default: 'cod' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },

    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },

    notes: { type: String, default: '' },
    placedAt: { type: Date, default: Date.now },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate readable order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    const pad = String(count + 1).padStart(6, '0');
    this.orderNumber = `CF-${pad}-${Date.now().toString().slice(-4)}`;
  }
  // next(); // ← was missing in original — caused silent hangs
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;