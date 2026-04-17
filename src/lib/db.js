// src/lib/db.js
// Singleton MongoDB connection — reused across hot reloads in dev
import mongoose from "mongoose";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

// In development, store the connection on the global object so it
// survives hot module replacement (Next.js re-imports modules on change)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}