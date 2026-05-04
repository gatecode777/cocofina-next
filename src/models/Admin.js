// src/models/Admin.js
import mongoose from 'mongoose';

// ── Permission definitions ─────────────────────────────────────────────────────
// Each module has: view, create, edit, delete
// super_admin always gets everything regardless of permissions field

const permissionModuleSchema = new mongoose.Schema({
  view:   { type: Boolean, default: false },
  create: { type: Boolean, default: false },
  edit:   { type: Boolean, default: false },
  delete: { type: Boolean, default: false },
}, { _id: false });

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:      String,
      required:  true,
      minlength: 8,
      select:    false,
    },
    role: {
      type:    String,
      enum:    ['super_admin', 'admin', 'moderator'],
      default: 'admin',
    },
    // ── Granular permissions per module ──────────────────────────────────────
    // Ignored for super_admin — they always have full access
    permissions: {
      dashboard:      { type: permissionModuleSchema, default: () => ({ view: true,  create: false, edit: false, delete: false }) },
      users:          { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
      products:       { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
      categories:     { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
      orders:         { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
      coupons:        { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
      blogs:          { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
      blogCategories: { type: permissionModuleSchema, default: () => ({ view: false, create: false, edit: false, delete: false }) },
    },
    profile:    { type: String,  default: '' },
    isActive:   { type: Boolean, default: true },
    lastLogin:  { type: Date },
    loginToken: { type: String, select: false },

    // Track who created this admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Admin',
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

// ── Helper: check if admin can do action on module ─────────────────────────────
adminSchema.methods.can = function (module, action = 'view') {
  if (this.role === 'super_admin') return true;
  return Boolean(this.permissions?.[module]?.[action]);
};

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;