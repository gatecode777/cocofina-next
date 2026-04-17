// src/lib/auth.js
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

// ── Generate token ────────────────────────────────────────────────────────────
export const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// ── Verify token from Authorization header ────────────────────────────────────
export const verifyToken = (request) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// ── Middleware: require user auth ─────────────────────────────────────────────
// Usage in route: const { user, error } = await requireUser(request)
export const requireUser = async (request) => {
  const { connectDB } = await import('./db');
  const User = (await import('../models/User')).default;

  const decoded = verifyToken(request);
  if (!decoded) {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    };
  }

  await connectDB();
  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return {
      user: null,
      error: NextResponse.json({ success: false, message: 'User not found or disabled' }, { status: 401 }),
    };
  }

  return { user, error: null };
};

// ── Middleware: require admin auth ────────────────────────────────────────────
export const requireAdmin = async (request) => {
  const { connectDB } = await import('./db');
  const Admin = (await import('../models/Admin')).default;

  const decoded = verifyToken(request);
  if (!decoded) {
    return {
      admin: null,
      error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    };
  }

  await connectDB();
  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    return {
      admin: null,
      error: NextResponse.json({ success: false, message: 'Admin not found or disabled' }, { status: 401 }),
    };
  }

  return { admin, error: null };
};