// src/models/Product.js
import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  weight: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  oldPrice: {
    type: Number,
    min: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    images:    [{ type: String }],
    thumbnail: { type: String },

    description: {
      short: { type: String, maxlength: 200 },
      long:  { type: String },
    },

    variants: [variantSchema],

    usage:    [{ type: String, trim: true }],
    highlights: [{ type: String, trim: true }],

    shelfLife:            { type: String, trim: true },
    storageInstructions:  { type: String, trim: true },
    delivery:             { type: String, trim: true },

    // ── Shipping dimensions (required for Shiprocket) ─────────────────────────
    // These are the PACKAGE dimensions of the product, not the product itself.
    // Shiprocket uses these to calculate volumetric weight and assign couriers.
    shipping: {
      length: { type: Number, default: 10, min: 0 },  // cm
      breadth:{ type: Number, default: 10, min: 0 },  // cm
      height: { type: Number, default: 10, min: 0 },  // cm
      weight: { type: Number, default: 0.5, min: 0 }, // kg (dead weight)
    },

    stockStatus: {
      type:    String,
      enum:    ["In Stock", "Out of Stock", "Limited Stock"],
      default: "In Stock",
    },

    seo: {
      metaTitle:       String,
      metaDescription: String,
      keywords:        [String],
    },

    status: {
      type:    String,
      enum:    ["active", "inactive", "draft"],
      default: "active",
    },

    isComingSoon: {
      type:    Boolean,
      default: false,
    },

    sortOrder: {
      type:    Number,
      default: 10000,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", "description.short": "text", "description.long": "text" });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ status: 1, stockStatus: 1 });

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  if (this.images?.length > 0 && !this.thumbnail) {
    this.thumbnail = this.images[0];
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;