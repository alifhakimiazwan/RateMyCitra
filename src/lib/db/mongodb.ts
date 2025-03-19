import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn; // Return cached connection

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        // REMOVE useNewUrlParser and useUnifiedTopology, they are no longer needed
        dbName: "RateMyCitra",
      })
      .then((mongoose) => mongoose);

    cached.conn = await cached.promise;
  }

  return cached.conn;
}
