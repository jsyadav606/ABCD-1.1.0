import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/user.model.js";
import { Branch } from "../src/models/branch.model.js";
import path from "path";
import { fileURLToPath } from "url";

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const runTest = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not found in .env");
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Setup Test Data
    const prefix = "test_scope_" + Date.now();
    
    // Create Branches
    const b1 = await Branch.create({ name: `${prefix}_B1`, code: "B1", address: "Test", organizationId: new mongoose.Types.ObjectId() });
    const b2 = await Branch.create({ name: `${prefix}_B2`, code: "B2", address: "Test", organizationId: b1.organizationId });
    
    console.log(`✅ Created Branches: B1(${b1._id}), B2(${b2._id})`);

    // Create Users
    // User1: Assigned B1
    const u1 = await User.create({
      userId: `${prefix}_u1`, name: "User One", email: `${prefix}_u1@test.com`,
      organizationId: b1.organizationId, branchId: [b1._id],
      gender: "Male" // required field
    });
    
    // User2: Assigned B1, B2
    const u2 = await User.create({
      userId: `${prefix}_u2`, name: "User Two", email: `${prefix}_u2@test.com`,
      organizationId: b1.organizationId, branchId: [b1._id, b2._id],
      gender: "Male"
    });
    
    // User3: Assigned B2
    const u3 = await User.create({
      userId: `${prefix}_u3`, name: "User Three", email: `${prefix}_u3@test.com`,
      organizationId: b1.organizationId, branchId: [b2._id],
      gender: "Male"
    });

    console.log(`✅ Created Users: U1([B1]), U2([B1, B2]), U3([B2])`);

    // 2. Test Logic Function (Replicating Controller Logic)
    const getVisibleUsers = async (viewerBranches) => {
      const viewerBranchIds = viewerBranches.map(b => b._id);
      
      const filter = {
        organizationId: b1.organizationId,
        // The Logic we implemented:
        branchId: { 
          $in: viewerBranchIds,
          $not: { $elemMatch: { $nin: viewerBranchIds } }
        }
      };
      
      const users = await User.find(filter).select("userId branchId");
      return users.map(u => u.userId);
    };

    // 3. Run Scenarios
    
    // Scenario A: Viewer has B1
    // Expected: See U1. NOT U2 (has B2), NOT U3 (no B1).
    const viewA = await getVisibleUsers([b1]);
    console.log(`\n🔍 Viewer with [B1] sees: ${viewA.join(", ")}`);
    
    const passA = viewA.includes(u1.userId) && !viewA.includes(u2.userId) && !viewA.includes(u3.userId);
    console.log(`Test A (Single Branch Strictness): ${passA ? "✅ PASS" : "❌ FAIL"}`);

    // Scenario B: Viewer has B1, B2
    // Expected: See U1, U2, U3 (all are subsets of {B1, B2})
    const viewB = await getVisibleUsers([b1, b2]);
    console.log(`🔍 Viewer with [B1, B2] sees: ${viewB.join(", ")}`);
    
    const passB = viewB.includes(u1.userId) && viewB.includes(u2.userId) && viewB.includes(u3.userId);
    console.log(`Test B (Multi Branch Access): ${passB ? "✅ PASS" : "❌ FAIL"}`);

    // Scenario C: Viewer has B2
    // Expected: See U3. NOT U1, NOT U2.
    const viewC = await getVisibleUsers([b2]);
    console.log(`🔍 Viewer with [B2] sees: ${viewC.join(", ")}`);
    
    const passC = viewC.includes(u3.userId) && !viewC.includes(u1.userId) && !viewC.includes(u2.userId);
    console.log(`Test C (Different Single Branch): ${passC ? "✅ PASS" : "❌ FAIL"}`);

    // 4. Cleanup
    await User.deleteMany({ organizationId: b1.organizationId });
    await Branch.deleteMany({ organizationId: b1.organizationId });
    console.log("\n🧹 Cleanup done");

    if (passA && passB && passC) {
      console.log("\n🎉 ALL TESTS PASSED: Logic is correct!");
      process.exit(0);
    } else {
      console.error("\n💥 SOME TESTS FAILED");
      process.exit(1);
    }

  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
};

runTest();
