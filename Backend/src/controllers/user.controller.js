import { User } from "../models/user.model.js";
import { Role } from "../models/role.model.js";
import { Branch } from "../models/branch.model.js"; 
import { UserLogin } from "../models/userLogin.model.js";
import { Organization } from "../models/organization.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

// =====================================================
// HELPER FUNCTION: Check hierarchical access (reporting chain)
// =====================================================
const isInReportingChain = async (targetUserId, managerUserId, maxDepth = 20) => {
  if (!targetUserId || !managerUserId) return false;
  let currentId = targetUserId;
  let depth = 0;
  // Traverse reportingTo upwards until null or maxDepth
  while (currentId && depth < maxDepth) {
    const doc = await User.findById(currentId).select("reportingTo").lean();
    if (!doc || !doc.reportingTo) break;
    if (String(doc.reportingTo) === String(managerUserId)) return true;
    currentId = doc.reportingTo;
    depth += 1;
  }
  return false;
};

const createUserLoginCredentials = async (userId, userName, providedLoginId = null) => {
  try {
    const defaultPlain = process.env.DEFAULT_PASSWORD || "12345678";
    let baseUsername = null;

    if (providedLoginId) {
      baseUsername = String(providedLoginId).toLowerCase().trim();
      const existing = await UserLogin.findOne({ username: baseUsername });
      if (existing) {
        throw new apiError(409, "Login ID already exists");
      }
      const login = new UserLogin({
        user: userId,
        username: baseUsername,
        password: defaultPlain,
        forcePasswordChange: true,
      });
      await login.save();
      return { success: true, username: baseUsername, login };
    } else if (userName) {
      const parts = userName.trim().toLowerCase().split(/\s+/);
      if (parts.length === 1) baseUsername = parts[0];
      else baseUsername = `${parts[0]}.${parts[parts.length - 1]}`;
    } else {
      baseUsername = String(userId).toLowerCase();
    }

    // sanitize username (allow alphanum and dots and @ and - _)
    baseUsername = baseUsername.replace(/[^a-z0-9@._\-]/g, "");

    // Check for existing username and add numeric suffix if needed
    let username = baseUsername;
    let suffix = 0;
    while (await UserLogin.findOne({ username })) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    // Create UserLogin with hashed password
    const login = new UserLogin({
      user: userId,
      username,
      password: defaultPlain,
      forcePasswordChange: true,
    });

    await login.save();
    return { success: true, username, login };
  } catch (error) {
    throw new apiError(500, `Failed to create login credentials: ${error.message}`);
  }
};

const hasUserAccess = async (reqUser, targetUser) => {
  const roleName = (reqUser?.role || "").replace(/ /g, "_");
  const isSuper = roleName === "super_admin";
  if (isSuper) return true;
  if (!targetUser) return false;

  // Self access
  if (String(targetUser._id) === String(reqUser._id)) return true;

  // Hierarchy access (any level of reporting)
  if (await isInReportingChain(targetUser._id, reqUser._id)) return true;

  // Branch overlap access (any intersection)
  const reqBranchIds = Array.isArray(reqUser?.branchId)
    ? reqUser.branchId.map((b) => (typeof b === "object" && b?._id ? String(b._id) : String(b)))
    : [];
  const targetIds = Array.isArray(targetUser?.branchId)
    ? targetUser.branchId.map((b) => (typeof b === "object" && b?._id ? String(b._id) : String(b)))
    : [];
  if (reqBranchIds.length > 0 && targetIds.some((id) => reqBranchIds.includes(String(id)))) {
    return true;
  }

  return false;
};

// Controller function names:
// - createUser
// - getUserById
// - listUsers
// - updateUser
// - toggleCanLogin
// - toggleIsActive
// - changeUserRole
// - softDeleteUser
// - restoreUser
// - deleteUserPermanent

export const createUser = asyncHandler(async (req, res) => {
  const payload = req.body;

  if (process.env.NODE_ENV === 'development') {
    console.log('📥 createUser called with payload:', payload);
    console.log('✓ name:', payload.name);
    console.log('✓ organizationId:', payload.organizationId);
  }

  const orgId = payload.organizationId || req.user?.organizationId || null;

  if (!payload.name || !orgId) {
    console.error('❌ Missing required fields');
    throw new apiError(400, "name and organizationId are required");
  }

  if (!payload.gender || !["Male", "Female", "Other"].includes(payload.gender)) {
    throw new apiError(400, "gender is required and must be one of: Male, Female, Other");
  }

  // Atomically bump userSequence respecting configurable start (settings.userIdSequenceStart, default 21000)
  // Use MongoDB pipeline update in a single findOneAndUpdate call for thread-safety.
  const org = await Organization.findOneAndUpdate(
    { _id: orgId },
    [
      { $set: { settings: { $ifNull: ["$settings", {}] } } },
      {
        $set: {
          userSequence: {
            $cond: [
              { $lt: ["$userSequence", { $ifNull: ["$settings.userIdSequenceStart", 21000] }] },
              { $add: [{ $ifNull: ["$settings.userIdSequenceStart", 21000] }, 1] },
              { $add: ["$userSequence", 1] }
            ]
          }
        }
      }
    ],
    { new: true, projection: { userSequence: 1, settings: 1 }, updatePipeline: true }
  );

  if (!org) {
    throw new apiError(404, "Organization not found");
  }

  const seqId = org.userSequence;
  const prefix = (org.settings && typeof org.settings.userIdPrefix === "string" && org.settings.userIdPrefix.trim())
    ? org.settings.userIdPrefix.trim()
    : "U";
  const generatedUserId = `${prefix}${String(seqId)}`;

  const assignedBranches = Array.isArray(payload.assignedBranches)
    ? payload.assignedBranches
    : Array.isArray(payload.branchId)
    ? payload.branchId
    : [];
  const primaryBranchId = payload.primaryBranchId || (assignedBranches.length > 0 ? assignedBranches[0] : null);

  // Prevent client from forcing fields we manage server-side
  const toCreate = {
    userId: generatedUserId,
    seqId,
    name: payload.name,
    designation: payload.designation || "NA",
    department: payload.department || "NA",
    gender: payload.gender,
    dob: payload.dob ? new Date(payload.dob) : (payload.dateOfBirth ? new Date(payload.dateOfBirth) : null),
    dateOfJoining: payload.dateOfJoining ? new Date(payload.dateOfJoining) : null,
    email: payload.email || null,
    personalEmail: payload.personalEmail || null,
    phone_no: payload.phone_no || null,
    roleId: null,
    permissions: [],
    reportingTo: payload.reportingTo || null,
    organizationId: orgId,
    branchId: assignedBranches,
    primaryBranchId,
    assignedBranches,
    canLogin: false,
    isActive: payload.isActive !== false,
    isBlocked: payload.isBlocked === true,
    remarks: payload.remarks != null && payload.remarks !== '' ? String(payload.remarks).trim() : '',
    createdBy: payload.createdBy || null,
  };

  // Assign default "user" role
  try {
    const userRole = await Role.findOne({ name: "user", isDeleted: false });
    if (userRole) {
      toCreate.roleId = userRole._id;
    } else {
      // Fallback: try to find any role if "user" not found (should not happen if seeded)
      console.warn("⚠️ Default 'user' role not found, assigning first available role");
      const anyRole = await Role.findOne({ isDeleted: false }).sort({ priority: 1 });
      if (anyRole) toCreate.roleId = anyRole._id;
    }
  } catch (err) {
    console.error("❌ Failed to assign default role:", err);
  }

  const user = await User.create(toCreate);
  console.log(`🆔 User created with userId=${user.userId}, seqId=${user.seqId}, org=${orgId}`);

  // canLogin is always false on creation now, so no need to create credentials here.
  // Admin must enable login explicitly later.

  return res.status(201).json(new apiResponse(201, user, "User created successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userDoc = await User.findById(id).populate('roleId branchId').lean();
  const user = userDoc ? { ...userDoc, role: userDoc.roleId?.displayName || userDoc.roleId?.name || null } : null;
  
  if (!user) {
    throw new apiError(404, "User not found");
  }
  
  const targetUserForAccess = await User.findById(id).select("branchId reportingTo").lean();
  if (!(await hasUserAccess(req.user, { ...targetUserForAccess, _id: id }))) {
    throw new apiError(404, "User not found");
  }
  
  return res.status(200).json(new apiResponse(200, user, "User retrieved successfully"));
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || 1, 10), 1);
  const limit = Math.max(parseInt(req.query.limit || 25, 10), 1);
  const skip = (page - 1) * limit;

  if (process.env.NODE_ENV === 'development') {
    console.log("🔍 listUsers: Request User Role:", req.user?.role);
    console.log("🔍 listUsers: Request User Org:", req.user?.organizationId);
  }

  const filter = {};
  // Support filtering by role name or roleId
  if (req.query.role) {
    const roleQuery = req.query.role;
    // If looks like an ObjectId, use directly
    if (/^[0-9a-fA-F]{24}$/.test(roleQuery)) {
      filter.roleId = roleQuery;
    } else {
      const found = await Role.findOne({ name: roleQuery, isDeleted: false }).select("_id");
      if (found) filter.roleId = found._id;
    }
  }
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.canLogin !== undefined) filter.canLogin = req.query.canLogin === "true";
  if (req.query.organizationId) filter.organizationId = req.query.organizationId;

  // Branch scope: non-super users should ONLY see users whose branches are a subset of the viewer's branches
  const roleName = String(req.user?.role || "").toLowerCase();
  const isSuper = roleName === "super_admin" || roleName === "super admin";
  const isEnterprise = roleName === "enterprise_admin" || roleName === "enterprise admin";
  
  if (!isSuper) {
    // Restrict organization for non-super roles
    if (isEnterprise && req.user?.organizationId) {
      filter.organizationId = req.user.organizationId;
      if (process.env.NODE_ENV === 'development') {
        console.log("🔍 listUsers: Enterprise Admin Org Filter:", filter.organizationId);
      }
    } else {
      // Branch/Standard users: strictly subset branch visibility
      if (req.user?.organizationId) {
        filter.organizationId = req.user.organizationId;
      }
      const viewerBranches = Array.isArray(req.user?.branchId)
        ? req.user.branchId.map((b) => (b && b._id ? b._id : b))
        : [];

      if (viewerBranches.length === 0) {
        filter._id = req.user._id;
      } else {
        const branchOverlap = { branchId: { $in: viewerBranches } };
        if (filter.$and) filter.$and.push(branchOverlap);
        else filter.$and = [branchOverlap];
      }
    }
  }

  // Handle Search Query (merged with existing filter)
  if (req.query.q) {
    const q = req.query.q.trim();
    const searchCondition = {
      $or: [
        { name: new RegExp(q, "i") },
        { userId: new RegExp(q, "i") },
        { email: new RegExp(q, "i") },
        { personalEmail: new RegExp(q, "i") },
      ]
    };
    
    if (filter.$or) {
      filter.$and = [
        { $or: filter.$or },
        searchCondition
      ];
      delete filter.$or;
    } else if (filter.$and) {
      filter.$and.push(searchCondition);
    } else {
      filter.$or = searchCondition.$or;
    }
  }

  const [itemsRaw, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('roleId branchId').lean(),
    User.countDocuments(filter),
  ]);

  // Map role name for compatibility with frontend which expects `role` string
  const items = itemsRaw.map((it) => ({
    ...it,
    role: it.roleId?.displayName || it.roleId?.name || null,
  }));

  return res.status(200).json(new apiResponse(200, { items, meta: { page, limit, total } }, "Users retrieved successfully"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payload = { ...req.body };

  console.log('📝 UPDATE USER - Request received');
  console.log('🔑 User ID:', id);
  console.log('📦 Initial payload:', payload);

  // Prevent direct overwrite of login-related flags without using specific endpoints
  delete payload.canLogin;
  delete payload.isActive;

  console.log('📦 Payload after removing protected fields:', payload);

  const existing = await User.findById(id).select('branchId').lean();
  if (!existing) {
    throw new apiError(404, "User not found");
  }
  const targetUserForAccess = await User.findById(id).select("branchId reportingTo").lean();
  if (!(await hasUserAccess(req.user, { ...targetUserForAccess, _id: id }))) {
    throw new apiError(403, "Forbidden");
  }

  const user = await User.findByIdAndUpdate(id, payload, { new: true }).populate('roleId branchId');
  
  if (!user) {
    console.log('❌ User not found with ID:', id);
    throw new apiError(404, "User not found");
  }
  
  console.log('✅ User updated successfully:', {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.roleId?.name,
    branches: user.branchId?.map(b => b.name),
  });

  return res.status(200).json(new apiResponse(200, user, "User updated successfully"));
});

// Toggle canLogin explicitly. Business rule: canLogin can only be true when isActive === true
export const toggleCanLogin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { enable, loginId } = req.body; // enable:boolean, loginId optional (userId/email/username)

  // User cannot change their own canLogin status
  if (req.user?.id && String(req.user.id) === String(id)) {
    throw new apiError(403, "You cannot change your own login status");
  }

  // Validate input
  if (enable === undefined || enable === null) {
    throw new apiError(400, "Enable flag is required (true/false)");
  }

  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (!(await hasUserAccess(req.user, user))) {
    throw new apiError(403, "Forbidden");
  }

  // Check if user is active when trying to enable login
  if (enable && !user.isActive) {
    throw new apiError(400, `Cannot enable login for inactive user. User "${user.name}" must be active first. Please enable user status (isActive) before enabling login.`);
  }

  if (enable) {
    // If a UserLogin already exists for this user, leave it
    let existingLogin = await UserLogin.findOne({ user: user._id });
    if (!existingLogin) {
      // Use helper to create UserLogin with username generation logic
      try {
        const enforcedLoginId = loginId || user.userId;
        const loginResult = await createUserLoginCredentials(user._id, user.name, enforcedLoginId);
        console.log(`✅ Login credentials created for user ${user._id}: username = ${loginResult.username}`);
      } catch (loginError) {
        console.error(`❌ Failed to create login credentials:`, loginError.message);
        throw new apiError(500, `Failed to create login credentials: ${loginError.message}`);
      }
    }

    user.canLogin = true;
  } else {
    // disable login: remove any UserLogin record so credentials no longer work
    const deleteResult = await UserLogin.deleteOne({ user: user._id });
    console.log(`✅ Deleted UserLogin records: ${deleteResult.deletedCount}`);
    user.canLogin = false;
  }

  await user.save();
  
  // Fetch updated user to confirm changes
  const updatedUser = await User.findById(id);
  console.log(`✅ User updated - canLogin is now: ${updatedUser.canLogin}`);
  
  return res.status(200).json(new apiResponse(200, updatedUser, `Login ${enable ? "enabled" : "disabled"} successfully for user ${user.name}`));
});

// Toggle isActive. Business rule: when disabling isActive, also disable canLogin. Enabling isActive does NOT auto-enable canLogin.
export const toggleIsActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { enable } = req.body; // boolean

  // User cannot change their own isActive status
  if (req.user?.id && String(req.user.id) === String(id)) {
    throw new apiError(403, "You cannot change your own active status");
  }

  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (!(await hasUserAccess(req.user, user))) {
    throw new apiError(403, "Forbidden");
  }

  if (enable) {
    user.isActive = true;
    // do not change canLogin
  } else {
    user.isActive = false;
    // if disabling active, also disable login
    user.canLogin = false;
  }

  await user.save();
  return res.status(200).json(new apiResponse(200, user, `User ${enable ? "activated" : "deactivated"} successfully`));
});

export const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roleId, role } = req.body;

  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (!(await hasUserAccess(req.user, user))) {
    throw new apiError(403, "Forbidden");
  }

  if (roleId) {
    const found = await Role.findById(roleId);
    if (!found) {
      throw new apiError(400, "Role not found");
    }
    user.roleId = roleId;
  } else if (role) {
    // If role name provided, try to resolve to roleId
    const found = await Role.findOne({ name: role, isDeleted: false });
    if (!found) {
      throw new apiError(400, "Role not found by name");
    }
    user.roleId = found._id;
  }

  await user.save();
  return res.status(200).json(new apiResponse(200, user, "User role changed successfully"));
});

export const softDeleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
  }

  user.isActive = false;
  user.canLogin = false;
  user.isBlocked = true;
  // mark createdBy/updatedBy handled elsewhere
  await user.save();
  return res.status(200).json(new apiResponse(200, user, "User soft-deleted (deactivated) successfully"));
});

export const restoreUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
  }

  user.isActive = true;
  // do not auto-enable canLogin
  user.isBlocked = false;
  await user.save();
  return res.status(200).json(new apiResponse(200, user, "User restored (activated) successfully"));
});

export const deleteUserPermanent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
  }
  
  return res.status(200).json(new apiResponse(200, null, "User permanently deleted successfully"));
});

// Fetch all roles for dropdown (returns id, name, and displayName)
export const getRolesForDropdown = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 getRolesForDropdown called');
    
    // Fetch all roles (both system and custom)
    let roles = await Role.find({}, "name displayName description category").lean().sort({ priority: -1 });
    
    console.log(`📊 Found ${roles.length} roles in database`);
    
    if (!roles || roles.length === 0) {
      console.log('⚠️ No roles found in database — initializing system roles');
      const Organization = (await import("../models/organization.model.js")).Organization;
      const UserModel = (await import("../models/user.model.js")).User;
      
      // Ensure organization exists
      let org = await Organization.findOne({ code: "ABCD" });
      if (!org) {
        org = await Organization.create({
          name: "ABCD",
          code: "ABCD",
          sortName: "ABCD",
          contactInfo: { primaryEmail: "abcd@local" },
          status: "ACTIVE",
          createdBy: seedUser._id,
        });
        console.log("🏗️ Created default organization ABCD");
      }
      
      // Ensure a seed user exists to act as creator
      let seedUser = await UserModel.findOne({ userId: "seed-super-admin", organizationId: org._id });
      if (!seedUser) {
        seedUser = await UserModel.create({
          userId: "seed-super-admin",
          name: "Seed Super Admin",
          organizationId: org._id,
          canLogin: false,
          isActive: true,
        });
        console.log("👤 Created seed user for role initialization");
      }
      
      // Initialize system roles
      await Role.initializeSystemRoles(seedUser._id);
      
      // Re-fetch roles
      roles = await Role.find({}, "name displayName description category").lean().sort({ priority: -1 });
      console.log(`✅ Initialized. Roles now: ${roles.length}`);
    }

    const formattedRoles = roles.map((role) => ({
      _id: role._id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
    }));

    console.log(`✅ Returning ${formattedRoles.length} formatted roles`);
    return res.status(200).json(new apiResponse(200, formattedRoles, "Roles retrieved successfully"));
  } catch (error) {
    console.error('❌ Error in getRolesForDropdown:', error.message);
    throw new apiError(500, `Failed to fetch roles: ${error.message}`);
  }
});

// Fetch all branches for dropdown (returns id, name, code)
export const getBranchesForDropdown = asyncHandler(async (req, res) => {
  const { organizationId } = req.query;

  let filter = { status: "ACTIVE" };
  if (organizationId) {
    filter.organizationId = organizationId;
  }
  
  // Restrict branches to user's assigned branches unless super admin
  const isSuper = req.user?.role === "super_admin";
  const userBranchIds = Array.isArray(req.user?.branchId)
    ? req.user.branchId.map((b) => (typeof b === "object" && b?._id ? b._id : b))
    : [];
  if (!isSuper && userBranchIds.length === 0) {
    return res.status(200).json(new apiResponse(200, [], "No branches found"));
  }
  if (!isSuper && userBranchIds.length > 0) {
    filter._id = { $in: userBranchIds };
  }

  const branches = await Branch.find(filter, "branchName branchCode address").lean();
  
  if (!branches || branches.length === 0) {
    return res.status(200).json(new apiResponse(200, [], "No branches found"));
  }

  const formattedBranches = branches.map((branch) => ({
    _id: branch._id,
    name: branch.branchName,
    code: branch.branchCode,
    address: branch.address?.line1 || "",
  }));

  return res.status(200).json(new apiResponse(200, formattedBranches, "Branches retrieved successfully"));
});

// Fetch all users for dropdown (returns id, name, userId)
export const getUsersForDropdown = asyncHandler(async (req, res) => {
  const { organizationId, branchId } = req.query;

  let filter = { isActive: true, isBlocked: false };
  if (organizationId) {
    filter.organizationId = organizationId;
  }
  
  // If user is not super admin, apply branch/hierarchy restrictions
  const roleName = String(req.user?.role || "").toLowerCase();
  const isSuper = roleName === "super_admin" || roleName === "super admin";
  
  if (!isSuper) {
    if (req.user?.organizationId) {
      filter.organizationId = req.user.organizationId;
    }
    // Simple visibility for dropdown: show all active users in organization
    // Frontend can filter further if needed.
  }

  const users = await User.find(filter, "name userId designation").lean().sort({ name: 1 });
  
  const formattedUsers = users.map((u) => ({
    _id: u._id,
    name: u.name,
    userId: u.userId,
    designation: u.designation
  }));

  return res.status(200).json(new apiResponse(200, formattedUsers, "Users retrieved successfully"));
});

// Preview next userId without mutating sequence
export const getNextUserId = asyncHandler(async (req, res) => {
  const orgId = req.query.organizationId || req.user?.organizationId || null;
  if (!orgId) {
    throw new apiError(400, "organizationId is required");
  }
  const org = await Organization.findById(orgId).select("userSequence settings");
  if (!org) {
    throw new apiError(404, "Organization not found");
  }
  const start = (org.settings && Number.isFinite(Number(org.settings.userIdSequenceStart)))
    ? Number(org.settings.userIdSequenceStart)
    : 21000;
  const prefix = (org.settings && typeof org.settings.userIdPrefix === "string" && org.settings.userIdPrefix.trim())
    ? org.settings.userIdPrefix.trim()
    : "U";
  const nextNumeric = Math.max(org.userSequence || 0, start) + 1;
  const nextId = `${prefix}${nextNumeric}`;
  return res.status(200).json(new apiResponse(200, { nextId, nextNumeric, prefix, start }, "Next userId preview"));
});

// Change user password
export const changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  console.log('🔐 changeUserPassword called for userId:', id);

  if (!newPassword || !String(newPassword).trim()) {
    throw new apiError(400, "newPassword is required");
  }

  // Find user
  const user = await User.findById(id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  const orgId = user.organizationId;
  if (orgId) {
    const org = await Organization.findById(orgId).select("enabledFeatures settings").lean();
    const enabled = Array.isArray(org?.enabledFeatures) ? org.enabledFeatures : [];
    const policy = org?.settings?.passwordPolicy;
    if (enabled.includes("PASSWORD_POLICY") && policy?.enabled) {
      const pwd = String(newPassword || "").trim();
      const minLength = Number(policy.minLength);
      if (Number.isFinite(minLength) && pwd.length < minLength) {
        throw new apiError(400, `Password must be at least ${minLength} characters long`);
      }
      if (policy.requireUppercase && !/[A-Z]/.test(pwd)) {
        throw new apiError(400, "Password must contain at least one uppercase letter");
      }
      if (policy.requireLowercase && !/[a-z]/.test(pwd)) {
        throw new apiError(400, "Password must contain at least one lowercase letter");
      }
      if (policy.requireNumber && !/[0-9]/.test(pwd)) {
        throw new apiError(400, "Password must contain at least one number");
      }
      if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(pwd)) {
        throw new apiError(400, "Password must contain at least one special character");
      }
    } else {
      if (String(newPassword).trim().length < 6) {
        throw new apiError(400, "Password must be at least 6 characters long");
      }
    }
  } else {
    if (String(newPassword).trim().length < 6) {
      throw new apiError(400, "Password must be at least 6 characters long");
    }
  }

  // Check if user has login credentials
  let userLogin = await UserLogin.findOne({ user: id });
  if (!userLogin) {
    throw new apiError(400, "User does not have login credentials. Enable login first.");
  }

  // Update password in UserLogin model
  userLogin.password = String(newPassword).trim();
  userLogin.forcePasswordChange = false; // User has now changed password
  await userLogin.save();

  console.log('✅ Password changed successfully for user:', user.name);

  return res.status(200).json(new apiResponse(200, { success: true, message: `Password changed for ${user.name}` }, "Password changed successfully"));
});

// Note: Named exports are used by routes; default export removed to avoid ESM interop issues.
