import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {}

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const connect = async () => {
  const { default: connectDB } = await import("../config/db.js");
  await connectDB();
};

const { Branch } = await import("../models/branch.model.js");

const deriveCode = (s) => {
  const base = String(s || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .toUpperCase();
  return base || "BRANCH";
};

const normalize = (v) => (v == null ? "" : String(v).trim());

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Missing MONGO_URI in environment. Please set it in .env");
      process.exit(1);
    }

    await connect();
    console.log("Connected to MongoDB");

    const branches = await Branch.find({}).lean();
    console.log(`Found ${branches.length} branches to migrate`);

    // Track per-organization used codes to avoid duplicates
    const usedCodesByOrg = new Map();
    for (const b of branches) {
      const orgKey = String(b.organizationId || "none");
      if (!usedCodesByOrg.has(orgKey)) usedCodesByOrg.set(orgKey, new Set());
      const used = usedCodesByOrg.get(orgKey);
      const existingCode =
        b.branchCode ||
        (b.code ? String(b.code).toUpperCase() : null) ||
        null;
      if (existingCode) used.add(existingCode);
    }

    const ops = [];
    let updatedCount = 0;

    for (const b of branches) {
      const orgKey = String(b.organizationId || "none");
      const used = usedCodesByOrg.get(orgKey) || new Set();

      const next = {};

      // branchName
      const currentName = b.branchName || b.name || "";
      if (!b.branchName && currentName) {
        next.branchName = currentName;
      }

      // branchCode
      let desiredCode =
        b.branchCode ||
        (b.code ? String(b.code).toUpperCase() : null) ||
        deriveCode(currentName);
      desiredCode = desiredCode.toUpperCase();

      if (!used.has(desiredCode) || String(b.branchCode) === desiredCode) {
        // ok
      } else {
        // dedupe
        let i = 1;
        let candidate = `${desiredCode}-${i}`;
        while (used.has(candidate)) {
          i += 1;
          candidate = `${desiredCode}-${i}`;
        }
        desiredCode = candidate;
      }
      if (desiredCode !== b.branchCode) {
        next.branchCode = desiredCode;
        used.add(desiredCode);
      }

      // type default
      if (!b.type) next.type = "SUB";

      // status from isActive
      if (!b.status) {
        const status =
          b.isActive === false ? "INACTIVE" : "ACTIVE";
        next.status = status;
      }

      // contactInfo
      if (!b.contactInfo) {
        next.contactInfo = { email: "", phone: "" };
      } else {
        next["contactInfo.email"] = normalize(b.contactInfo.email || b.contactInfo?.email);
        next["contactInfo.phone"] = normalize(b.contactInfo.phone || b.contactInfo?.phone);
      }

      // address
      if (!b.address || typeof b.address === "string") {
        const line1 = typeof b.address === "string" ? b.address : "";
        next.address = {
          line1: normalize(line1),
          line2: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        };
      } else {
        // ensure defaults exist
        next["address.line1"] = normalize(b.address.line1 || "");
        next["address.line2"] = normalize(b.address.line2 || "");
        next["address.city"] = normalize(b.address.city || "");
        next["address.state"] = normalize(b.address.state || "");
        next["address.pincode"] = normalize(b.address.pincode || "");
        next["address.country"] = normalize(b.address.country || "India");
      }

      // geoLocation
      if (!b.geoLocation) {
        next.geoLocation = { latitude: undefined, longitude: undefined };
      }

      // settings
      if (!b.settings) {
        next.settings = { allowAssetTransfer: true, allowUserTransfer: true };
      }

      // isDeleted default false
      if (b.isDeleted == null) {
        next.isDeleted = false;
      }

      // Backward-compatible fields for older UI (optional)
      if (b.name !== (next.branchName || b.branchName)) {
        next.name = next.branchName || b.branchName || b.name || "";
      }
      if (b.code !== (next.branchCode || b.branchCode)) {
        next.code = (next.branchCode || b.branchCode || b.code || "").toLowerCase();
      }

      // Build update op if there is any field to set
      if (Object.keys(next).length > 0) {
        ops.push({
          updateOne: {
            filter: { _id: b._id },
            update: { $set: next },
          },
        });
        updatedCount += 1;
      }
    }

    if (ops.length === 0) {
      console.log("Nothing to migrate.");
    } else {
      console.log(`Applying ${ops.length} updates...`);
      const res = await Branch.bulkWrite(ops, { ordered: false });
      console.log("Bulk update result:", res.result || res);
      console.log(`Updated ${updatedCount} branches.`);
    }

    await mongoose.connection.close();
    console.log("Migration completed.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

main();

