// src/app/api/admin/products/[id]/images/[filename]/route.js
// Deprecated: This route is no longer used.
// Image deletion has been migrated to use query parameters in /api/admin/products/[id]/images/route.js.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ success: false, message: 'This endpoint is deprecated.' }, { status: 410 });
}
