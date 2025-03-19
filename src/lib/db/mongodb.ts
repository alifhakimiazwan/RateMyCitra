import mongoose from "mongoose";

interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongoose || {
  conn: null,
  promise: null,
};

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
  globalThis.mongoose = cached; // ✅ Assign back to `globalThis.mongoose`

  return cached.conn;
}
