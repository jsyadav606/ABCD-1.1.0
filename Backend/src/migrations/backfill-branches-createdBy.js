import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {}

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const { default: connectDB } = await import("../config/db.js");
const { Branch } = await import("../models/branch.model.js");

async function main() {
  try {
    const fallbackId = "699fd94bcb25173a2d88577a";
    // Allow override via env if desired
    const idStr = process.env.BRANCH_CREATED_BY_ID || fallbackId;
    if (!mongoose.Types.ObjectId.isValid(idStr)) {
      console.error("Invalid ObjectId for createdBy:", idStr);
      process.exit(1);
    }
    const createdById = new mongoose.Types.ObjectId(idStr);

    await connectDB();
    console.log("Connected. Backfilling createdBy for branches missing it...");

    const query = {
      $or: [{ createdBy: { $exists: false } }, { createdBy: null }],
    };

    const preCount = await Branch.countDocuments(query);
    console.log("Branches missing createdBy:", preCount);

    if (preCount > 0) {
      const res = await Branch.updateMany(query, { $set: { createdBy: createdById } });
      console.log("Update result:", res);
    }

    const postCount = await Branch.countDocuments(query);
    console.log("Branches still missing createdBy after update:", postCount);

    await mongoose.connection.close();
    console.log("Backfill done.");
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err.message);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

main();

