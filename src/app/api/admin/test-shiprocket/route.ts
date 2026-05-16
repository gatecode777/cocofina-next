// src/app/api/admin/test-shiprocket/route.js
// TEMPORARY DEBUG ROUTE — delete after fixing
// Visit: GET /api/admin/test-shiprocket

import { NextResponse } from 'next/server';

export async function GET() {
  const email    = process.env.SHIPROCKET_EMAIL    || '';
  const password = process.env.SHIPROCKET_PASSWORD || '';

  // Show what's actually being read (mask middle of password for safety)
  const maskedPw = password.length > 4
    ? password[0] + '*'.repeat(password.length - 2) + password[password.length - 1]
    : '(too short)';

  // Try the actual login
  let srResult = null;
  try {
    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    srResult = await res.json();
  } catch (err) {
    srResult = { fetchError: err.message };
  }

  return NextResponse.json({
    emailRead:      email,
    passwordLength: password.length,
    passwordMasked: maskedPw,
    passwordFirst4: password.slice(0, 4),
    passwordLast4:  password.slice(-4),
    shiprocketResponse: srResult,
  });
}