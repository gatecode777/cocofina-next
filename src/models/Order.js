// src/models/Order.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:          { type: String, required: true },
  variantWeight: { type: String, default: '' },
  price:         { type: Number, required: true },
  quantity:      { type: Number, required: true, min: 1 },
  image:         { type: String, default: '' },

  // ── Shipping dimension snapshot (from product at order time) ──────────────
  // Snapshotted so Shiprocket payload stays accurate even if product changes later
  shipping: {
    length:  { type: Number, default: 10 },
    breadth: { type: Number, default: 10 },
    height:  { type: Number, default: 10 },
    weight:  { type: Number, default: 0.5 },
  },
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type:   String,
      unique: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: String,
      phone:    String,
      line1:    String,
      line2:    { type: String, default: '' },
      city:     String,
      state:    String,
      pincode:  String,
      label:    { type: String, default: 'Home' },
    },

    subtotal:       { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    total:          { type: Number, default: 0 },

    coupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, default: null },
      code:     { type: String,  default: null },
      type:     { type: String,  default: null },
      value:    { type: Number,  default: null },
      discount: { type: Number,  default: null },
    },

    shippingMethod: { type: String, enum: ['free', 'express'], default: 'free' },
    paymentMethod:  { type: String, enum: ['cod', 'prepaid'],  default: 'cod'  },
    paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },

    status: {
      type:    String,
      enum:    ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },

    notes: { type: String, default: '' },
    cancelReason: { type: String, default: '' },

    // ── Shiprocket integration ────────────────────────────────────────────────
    shiprocket: {
      orderId:    { type: Number,  default: null }, // SR order_id (numeric)
      shipmentId: { type: Number,  default: null }, // SR shipment_id
      status:     { type: String,  default: '' },   // SR status string
      awbCode:    { type: String,  default: '' },   // tracking number
      courierName:{ type: String,  default: '' },
      error:      { type: String,  default: '' },   // if SR creation failed
      createdAt:  { type: Date,    default: null },
    },

    // Timestamps
    placedAt:    { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
    shippedAt:   { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ── Auto-generate order number ─────────────────────────────────────────────────
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CF-${String(count + 1).padStart(6, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

// Delete cached model so schema changes (shiprocket field) take effect on hot reload
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}
const Order = mongoose.model('Order', orderSchema);
export default Order;