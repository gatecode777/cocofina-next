// backend/models/Blog.js
import mongoose from 'mongoose';

// ── Content block schema (for rich structured content) ────────────────────────
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['paragraph', 'heading', 'subheading', 'bullet_list', 'numbered_list',
           'quote', 'image', 'table', 'divider', 'callout'],
    required: true,
  },
  // For paragraph, heading, subheading, quote, callout
  text: { type: String, default: '' },
  // For lists
  items: [{ type: String }],
  // For image
  imageFile:  { type: String, default: '' }, // filename in uploads/blogs/
  imageAlt:   { type: String, default: '' },
  imageCaption: { type: String, default: '' },
  // For table
  tableHeaders: [{ type: String }],
  tableRows: [[{ type: String }]],
}, { _id: false });

// ── Main Blog schema ──────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema(
  {
    // ── Basic info ─────────────────────────────────────────────────────────
    title: {
      type:     String,
      required: true,
      trim:     true,
    },
    slug: {
      type:      String,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    excerpt: {
      type:    String,
      trim:    true,
      default: '',  // short summary shown on listing cards
    },
    coverImage: {
      type:    String,
      default: '',  // filename stored in uploads/blogs/
    },
    coverImageAlt: {
      type:    String,
      default: '',
    },

    // ── Categorisation ─────────────────────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'BlogCategory',
      default: null,
    },
    tags: [{ type: String, trim: true, lowercase: true }],

    // ── Rich structured content blocks ─────────────────────────────────────
    // Admins build the article from ordered blocks (paragraphs, headings,
    // lists, tables, images, quotes, callouts, dividers).
    content: [contentBlockSchema],

    // ── Writer / Author info (snapshot — not a ref so past blogs aren't
    //    affected if admin profile changes) ──────────────────────────────
    author: {
      name:        { type: String, default: '' },
      image:       { type: String, default: '' }, // filename in uploads/profiles/
      designation: { type: String, default: '' },
    },

    // ── Reading metadata ────────────────────────────────────────────────────
    readTime: {
      type:    Number,
      default: 5,    // minutes
    },

    // ── Publication ─────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type:    Boolean,
      default: false,
    },

    // ── Stats ────────────────────────────────────────────────────────────────
    views: {
      type:    Number,
      default: 0,
    },

    // ── SEO ──────────────────────────────────────────────────────────────────
    seo: {
      metaTitle:       { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      metaKeywords:    { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// ── Indexes ────────────────────────────────────────────────────────────────────
blogSchema.index({ slug:       1 });
blogSchema.index({ status:     1 });
blogSchema.index({ category:   1 });
blogSchema.index({ isFeatured: 1 });
blogSchema.index({ publishedAt:-1 });
blogSchema.index({ tags:        1 });

// ── Auto-generate slug + publishedAt ─────────────────────────────────────────
blogSchema.pre('save', function (next) {
  // Slug from title
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  // Auto-set publishedAt when first published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

// ── Auto-estimate read time ────────────────────────────────────────────────────
blogSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordCount = this.content.reduce((total, block) => {
      const text = block.text || block.items?.join(' ') || '';
      return total + text.split(/\s+/).filter(Boolean).length;
    }, 0);
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
});

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

export default Blog;