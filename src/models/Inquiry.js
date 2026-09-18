// src/models/Inquiry.js
import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^(\+?[0-9]{1,4}[- ]?)?[0-9]{10,13}$/, 'Please enter a valid 10 to 13 digit phone number'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      default: 'General Inquiry',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'in_progress', 'resolved', 'archived'],
      default: 'new',
      index: true,
    },
    source: {
      type: String,
      enum: ['home_page', 'contact_page', 'wholesale', 'other'],
      default: 'home_page',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ email: 1 });
inquirySchema.index({ status: 1, createdAt: -1 });

// Ensure hot-reloading doesn't retain stale model in development
if (mongoose.models.Inquiry) {
  delete mongoose.models.Inquiry;
}

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
