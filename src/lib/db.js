import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cocofina";

  if (!process.env.MONGODB_URI) {
    console.warn("Warning: MONGODB_URI is not defined in environment variables. Falling back to local MongoDB: mongodb://127.0.0.1:27017/cocofina");
  }

  // 1. If connection exists and is fully connected (readyState === 1), return it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. If connection is disconnected (readyState 0 or 3), reset cached promise & conn
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.conn = null;
    cached.promise = null;
  }

  // 3. Create fresh connection promise if missing
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB connected successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB connection error:", error);
    throw error;
  }

  return cached.conn;
}