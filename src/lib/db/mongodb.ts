import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

const cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn; // Return cached connection

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI!, {
        // REMOVE useNewUrlParser and useUnifiedTopology, they are no longer needed
        dbName: "RateMyCitra",
      })
      .then((mongoose) => mongoose);

    cached.conn = await cached.promise;
  }

  return cached.conn;
}
