
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Helper function to return safe user data (no sensitive info)
const safeUser = (user) => ({
  id: user._id,
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone || '',
  profile: user.profile || '',
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

// POST /api/users/google-login
export async function POST(request) {
  try {
    await connectDB();
    
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, message: 'Google token is required' },
        { status: 400 }
      );
    }

    // Verify the Google token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError);
      return NextResponse.json(
        { success: false, message: 'Invalid Google token' },
        { status: 400 }
      );
    }

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture, email_verified } = payload;

    if (!email_verified) {
      return NextResponse.json(
        { success: false, message: 'Email not verified with Google' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        firstName: given_name || '',
        lastName: family_name || '',
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-16), // Random password (user will login via Google only)
        profile: picture || '',
        isVerified: true,
        isActive: true,
      });
    } else if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Your account is disabled. Please contact admin.' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Update login token (optional - if you have this field in your model)
    // user.loginToken = token;
    // await user.save({ validateBeforeSave: false });

    return NextResponse.json({
      success: true,
      message: 'Google login successful',
      token,
      user: safeUser(user),
    });
    
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json(
      { success: false, message: 'Google authentication failed' },
      { status: 500 }
    );
  }
}
