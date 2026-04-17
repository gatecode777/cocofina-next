// backend/models/Coupon.js
import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: '',
        },

        type: {
            type: String,
            enum: ['flat', 'percentage'],
            required: true,
        },

        value: {
            type: Number,
            required: true,
            min: 0,
        },

        // For percentage coupons — cap the max discount amount
        maxDiscount: {
            type: Number,
            default: null, // null = no cap
        },

        // Minimum cart value required to use the coupon
        minOrderValue: {
            type: Number,
            default: 0,
        },

        // How many times can this coupon be used in total (null = unlimited)
        usageLimit: {
            type: Number,
            default: null,
        },

        // How many times has it been used so far
        usedCount: {
            type: Number,
            default: 0,
        },

        // Per-user usage limit (null = unlimited per user)
        perUserLimit: {
            type: Number,
            default: 1,
        },

        // Date range
        startDate: {
            type: Date,
            default: Date.now,
        },

        expiryDate: {
            type: Date,
            default: null, // null = never expires
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        // Track which users used this coupon
        usedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);

// Virtual: is the coupon currently valid?
couponSchema.virtual('isValid').get(function () {
    const now = new Date();
    if (!this.isActive) return false;
    if (this.startDate && now < this.startDate) return false;
    if (this.expiryDate && now > this.expiryDate) return false;
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return false;
    return true;
});

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;