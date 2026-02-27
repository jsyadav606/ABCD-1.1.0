import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {}

const connectDB = async () => {
  try {
    const candidates = [
      process.env.MONGO_URI,
      process.env.MONGO_URI_DIRECT,
      process.env.MONGO_URI_FALLBACK,
    ].filter(Boolean);

    if (candidates.length === 0) {
      throw new Error("No MongoDB URI provided in env");
    }

    let conn = null;
    let lastErr = null;
    for (const uri of candidates) {
      try {
        conn = await mongoose.connect(uri);
        break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!conn) {
      throw lastErr || new Error("Failed to connect to MongoDB");
    }
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
 
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
