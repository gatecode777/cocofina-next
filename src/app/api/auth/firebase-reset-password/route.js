// src/app/api/auth/firebase-reset-password/route.js

export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email address is required' }, { status: 400 });
    }

    // 1. Check if user exists in MongoDB database
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 for security (prevent email enumeration)
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link shortly.'
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA2rKlW6DV4z2hYnWGceVU-ylaxN593XKg";

    // 2. Call Firebase Auth REST API to send Password Reset Email
    let fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requestType: 'PASSWORD_RESET',
        email: email,
      }),
    });

    let fbData = await fbRes.json();

    // 3. If email not found in Firebase Auth (e.g. legacy user created in MongoDB), create Firebase user first
    if (fbData.error && fbData.error.message === 'EMAIL_NOT_FOUND') {
      const tempPass = Math.random().toString(36).slice(-10) + 'A1!';
      await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: tempPass,
          returnSecureToken: true,
        }),
      });

      // Retry sending Password Reset Email via Firebase
      fbRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email: email,
        }),
      });

      fbData = await fbRes.json();
    }

    if (fbData.error) {
      console.error('Firebase sendOobCode error:', fbData.error);
      const msg = fbData.error.message;

      if (msg === 'OPERATION_NOT_ALLOWED') {
        return NextResponse.json({
          success: false,
          message: 'Email/Password sign-in provider is disabled in Firebase Console. Please enable it in Firebase Console -> Authentication -> Sign-in method.'
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        message: fbData.error.message || 'Failed to send password reset email via Firebase.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email address.'
    });
  } catch (err) {
    console.error('firebase-reset-password error:', err);
    return NextResponse.json({
      success: false,
      message: err.message || 'Server error while sending reset email.'
    }, { status: 500 });
  }
}
