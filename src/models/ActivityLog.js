// src/models/ActivityLog.js
import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    admin: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Admin',
      required: true,
    },
    adminName:  { type: String, default: '' },
    adminEmail: { type: String, default: '' },
    adminRole:  { type: String, default: '' },

    action: {
      type:     String,
      enum:     ['view', 'create', 'edit', 'delete', 'login', 'logout',
                 'toggle_status', 'publish', 'archive', 'export', 'other'],
      required: true,
    },

    module: {
      type:     String,
      enum:     ['dashboard', 'users', 'products', 'categories', 'blogCategories',
                 'orders', 'coupons', 'blogs', 'managers', 'auth', 'other'],
      required: true,
    },

    description: { type: String, default: '' },
    targetId:    { type: String, default: '' },
    targetName:  { type: String, default: '' },
    method:      { type: String, default: '' },
    path:        { type: String, default: '' },
    ipAddress:   { type: String, default: '' },
    userAgent:   { type: String, default: '' },
    success:     { type: Boolean, default: true },
    errorMessage:{ type: String, default: '' },
  },
  { timestamps: true }
);

activityLogSchema.index({ admin:     1, createdAt: -1 });
activityLogSchema.index({ module:    1, createdAt: -1 });
activityLogSchema.index({ action:    1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ── Delete cached model so schema changes (like enum updates) take effect
//    immediately in Next.js dev hot-reload without restarting the server ───────
if (mongoose.models.ActivityLog) {
  delete mongoose.models.ActivityLog;
}

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;