// src/app/api/inquiries/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import inquiryEmitter from '@/lib/inquiryEvents';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(\+?[0-9]{1,4}[- ]?)?[0-9]{10,13}$/;

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    let { name, email, phone, subject, message, source } = body;

    name = (name || '').trim();
    email = (email || '').trim().toLowerCase();
    phone = (phone || '').trim();
    subject = (subject || '').trim() || 'General Inquiry';
    message = (message || '').trim();
    source = (source || '').trim() || 'home_page';

    // ── Strict Validation ───────────────────────────────────────────────────
    const errors = {};

    if (!name) {
      errors.name = 'Please provide your full name.';
    } else if (name.length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (/[\d<>{}[\]\\]/.test(name)) {
      errors.name = 'Name should only contain letters and spaces.';
    }

    if (!email) {
      errors.email = 'Please provide your email address.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!phone) {
      errors.phone = 'Please provide your phone/mobile number.';
    } else {
      // Remove spaces or hyphens for regex check
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!PHONE_REGEX.test(cleanPhone)) {
        errors.phone = 'Please enter a valid 10 to 13 digit phone number.';
      }
    }

    if (!message) {
      errors.message = 'Please enter your message or query.';
    } else if (message.length < 10) {
      errors.message = 'Message must be at least 10 characters long.';
    } else if (message.length > 2000) {
      errors.message = 'Message must not exceed 2000 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please resolve the highlighted form errors.',
          errors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Capture metadata
    const ipAddress =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '';
    const userAgent = request.headers.get('user-agent') || '';

    const newInquiry = await Inquiry.create({
      name,
      email,
      phone,
      subject,
      message,
      source,
      status: 'new',
      ipAddress,
      userAgent,
    });

    // Broadcast in real-time to active admin listeners
    try {
      inquiryEmitter.emit('new-inquiry', newInquiry);
    } catch (emitterErr) {
      console.error('Error emitting new-inquiry event:', emitterErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out! Your inquiry has been received. Our team will contact you within 24 hours.',
        inquiry: {
          id: newInquiry._id,
          name: newInquiry.name,
          email: newInquiry.email,
          createdAt: newInquiry.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while submitting your inquiry. Please try again.',
      },
      { status: 500 }
    );
  }
}
