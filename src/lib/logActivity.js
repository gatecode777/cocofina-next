// src/lib/logActivity.js
import { connectDB } from '@/lib/db';
import ActivityLog from '@/models/ActivityLog';

export async function logActivity(request, admin, details) {
  try {
    await connectDB();

    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';

    const ua   = request.headers.get('user-agent') || '';
    let path   = '';
    try { path = new URL(request.url).pathname; } catch {}

    const doc = {
      admin:        admin._id,
      adminName:    admin.fullName  || '',
      adminEmail:   admin.email     || '',
      adminRole:    admin.role      || '',
      action:       details.action,
      module:       details.module,
      description:  details.description  || '',
      targetId:     details.targetId     ? String(details.targetId) : '',
      targetName:   details.targetName   || '',
      method:       request.method       || '',
      path,
      ipAddress:    ip,
      userAgent:    ua,
      success:      details.success      ?? true,
      errorMessage: details.errorMessage || '',
    };

    await ActivityLog.create(doc);
  } catch (err) {
    // Log the FULL error so we can see what's actually wrong
    console.error('[logActivity] failed:', err.message, '| details:', JSON.stringify(details));
  }
}