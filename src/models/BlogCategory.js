import mongoose from 'mongoose';

const blogcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      default: '',
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
blogcategorySchema.index({ isActive: 1 });
blogcategorySchema.index({ order: 1 });

// Generate slug from name before saving
blogcategorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next(); // ← was missing in original
});

const BlogCategory = mongoose.models.BlogCategory || mongoose.model('BlogCategory', blogcategorySchema);

export default BlogCategory;
// module.exports = mongoose.model('BlogCategory', blogcategorySchema); --- IGNORE ---