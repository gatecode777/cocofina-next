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

    // Images - store filenames only
    images: [
      {
        type: String,
      },
    ],

    thumbnail: {
      type: String,
    },

    // Product Descriptions
    description: {
      short: {
        type: String,
        maxlength: 200,
      },
      long: {
        type: String,
      },
    },

    // Weight/size variants
    variants: [variantSchema],

    // Product usage
    usage: [
      {
        type: String,
        trim: true,
      },
    ],

    // Highlights
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],

    shelfLife: {
      type: String,
      trim: true,
    },

    storageInstructions: {
      type: String,
      trim: true,
    },

    delivery: {
      type: String,
      trim: true,
    },

    stockStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Limited Stock"],
      default: "In Stock",
    },

    // SEO
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },

    isComingSoon: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({
  name: "text",
  "description.short": "text",
  "description.long": "text",
});

productSchema.index({ category: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ status: 1, stockStatus: 1 });

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Generate slug when name changes
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Auto-set thumbnail
  if (this.images && this.images.length > 0 && !this.thumbnail) {
    this.thumbnail = this.images[0];
  }

});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;