import mongoose from "mongoose";

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

// ✅ Fix: Explicitly declare `global.mongoose`
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn; // ✅ Return cached connection if exists

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI!, {
        dbName: "RateMyCitra",
        bufferCommands: false,
      })
      .then((m) => m.connection);
  }

  cached.conn = await cached.promise;
  global.mongoose = cached; // ✅ Assign back to `global.mongoose`

  return cached.conn;
}
