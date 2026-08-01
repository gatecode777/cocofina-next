import mongoose from "mongoose";

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Convert SRV connection string to direct seedlist with replicaSet for instant Windows connection
function getDirectUri(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return uri;
  try {
    const match = uri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/([^?]*)(.*)$/);
    if (!match) return uri;
    const [, user, pass, host, db, query] = match;
    const baseHost = host.trim();
    const parts = baseHost.split('.');
    const clusterName = parts[0] || 'cluster0';
    const clusterId = parts[1] || 'l7xeac9';
    const domain = baseHost.substring(clusterName.length); // e.g. .l7xeac9.mongodb.net
    
    const hosts = [
      `${clusterName}-shard-00-00${domain}:27017`,
      `${clusterName}-shard-00-01${domain}:27017`,
      `${clusterName}-shard-00-02${domain}:27017`
    ].join(',');

    const replicaSet = `atlas-${clusterId}-shard-0`;
    const cleanQuery = query ? query.replace(/^\?/, '') : '';
    
    return `mongodb://${user}:${pass}@${hosts}/${db}?ssl=true&replicaSet=${replicaSet}&authSource=admin${cleanQuery ? `&${cleanQuery}` : ''}`;
  } catch (err) {
    return uri;
  }
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
      connectTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    };

    // Try standard connection first; if Windows SRV DNS fails or times out, use direct replicaSet connection
    const directUri = getDirectUri(MONGODB_URI);

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .catch((firstErr) => {
        if (firstErr.message && (firstErr.message.includes('querySrv') || firstErr.message.includes('ECONNREFUSED') || firstErr.name === 'MongooseServerSelectionError')) {
          console.warn('MongoDB SRV connection failed. Switching to direct Atlas replica set connection...');
          return mongoose.connect(directUri, opts);
        }
        throw firstErr;
      })
      .then((mongooseInstance) => {
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