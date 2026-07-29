import mongoose from "mongoose";

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

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB connected successfully");
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