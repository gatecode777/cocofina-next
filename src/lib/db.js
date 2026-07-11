// src/lib/db.js
// Singleton MongoDB connection — reused across hot reloads in dev
import mongoose from "mongoose";
import dns from "node:dns/promises";

try {
  dns.setServers(["1.1.1.1"]);
} catch (dnsErr) {
  console.warn("Warning: Could not set DNS servers:", dnsErr.message);
}

// In development, store the connection on the global object so it
// survives hot module replacement (Next.js re-imports modules on change)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cocofina";

  if (!process.env.MONGODB_URI) {
    console.warn("Warning: MONGODB_URI is not defined in environment variables. Falling back to local MongoDB: mongodb://127.0.0.1:27017/cocofina");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB connected");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }

  return cached.conn;
}