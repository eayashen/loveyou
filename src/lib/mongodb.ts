import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || "nusaiba_you";

let cached = (globalThis as unknown as { mongoose?: { conn: typeof mongoose; promise: Promise<typeof mongoose> | null } }).mongoose;

if (!cached) {
  cached = (globalThis as unknown as { mongoose?: { conn: typeof mongoose; promise: Promise<typeof mongoose> | null } }).mongoose = { conn: null as unknown as typeof mongoose, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: MONGODB_DB,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
