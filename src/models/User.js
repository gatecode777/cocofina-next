// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,       // unique index
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,       // was 8, signup form allows 6
      select: false,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
      // sparse: allows multiple documents with no phone (empty string)
      // unique only applies when phone is actually set
    },

    profile: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    loginToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Virtual full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ── Indexes ────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });

// Unique phone — sparse so that empty/missing phones don't conflict
// Only non-empty phone values must be unique
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { phone: { $gt: "" } }, // only index non-empty strings
  }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;