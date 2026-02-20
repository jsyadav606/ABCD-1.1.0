import { User } from "../models/user.model.js";
import { Role } from "../models/role.model.js";
import { Branch } from "../models/branch.model.js";
import { UserLogin } from "../models/userLogin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

// =====================================================
// HELPER FUNCTION: Create UserLogin with username generation
// =====================================================
const createUserLoginCredentials = async (userId, userName, providedLoginId = null) => {
  try {
    const defaultPlain = process.env.DEFAULT_PASSWORD || "12345678";
    let baseUsername = null;

    // Determine username: use provided loginId or generate from name
    if (providedLoginId) {
      baseUsername = String(providedLoginId).toLowerCase().trim();
    } else if (userName) {
      // generate from name: first.last (lowercase)
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

  console.log('📥 createUser called with payload:', payload);
  console.log('✓ userId:', payload.userId);
  console.log('✓ name:', payload.name);
  console.log('✓ organizationId:', payload.organizationId);

  if (!payload.userId || !payload.name || !payload.organizationId) {
    console.error('❌ Missing required fields');
    throw new apiError(400, "userId, name and organizationId are required");
  }

  // Prevent client from forcing fields we manage server-side
  const toCreate = {
    userId: payload.userId,
    name: payload.name,
    designation: payload.designation || payload.designation || "NA",
    department: payload.department || "NA",
    email: payload.email || null,
    phone_no: payload.phone_no || null,
    role: payload.role || "user",
    roleId: payload.roleId || null,
    permissions: payload.permissions || [],
    reportingTo: payload.reportingTo || null,
    organizationId: payload.organizationId,
    branchId: payload.branchId || [],
    canLogin: payload.canLogin === true,
    isActive: payload.isActive !== false,
    isBlocked: payload.isBlocked === true,
    createdBy: payload.createdBy || null,
  };

  const user = await User.create(toCreate);

  // If canLogin is enabled during creation, automatically create UserLogin credentials
  if (payload.canLogin === true) {
    try {
      await createUserLoginCredentials(user._id, user.name, payload.loginId);
    } catch (loginError) {
      // Log error but don't fail user creation
      console.error("Warning: Failed to create login credentials:", loginError.message);
    }
  }

  return res.status(201).json(new apiResponse(201, user, "User created successfully"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).lean();
  
  if (!user) {
    throw new apiError(404, "User not found");
  }
  
  return res.status(200).json(new apiResponse(200, user, "User retrieved successfully"));
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || 1, 10), 1);
  const limit = Math.max(parseInt(req.query.limit || 25, 10), 1);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.canLogin !== undefined) filter.canLogin = req.query.canLogin === "true";
  if (req.query.organizationId) filter.organizationId = req.query.organizationId;

  if (req.query.q) {
    const q = req.query.q.trim();
    filter.$or = [
      { name: new RegExp(q, "i") },
      { userId: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    User.countDocuments(filter),
  ]);

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

  // Validate input
  if (enable === undefined || enable === null) {
    throw new apiError(400, "Enable flag is required (true/false)");
  }

  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
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
        const loginResult = await createUserLoginCredentials(user._id, user.name, loginId);
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

  const user = await User.findById(id);
  
  if (!user) {
    throw new apiError(404, "User not found");
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

  if (roleId) {
    const found = await Role.findById(roleId);
    if (!found) {
      throw new apiError(400, "Role not found");
    }
    user.roleId = roleId;
    user.role = found.name || role || user.role;
  } else if (role) {
    user.role = role;
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
    const roles = await Role.find({}, "name displayName description category").lean().sort({ priority: -1 });
    
    console.log(`📊 Found ${roles.length} roles in database`);
    
    if (!roles || roles.length === 0) {
      console.log('⚠️ No roles found in database');
      return res.status(200).json(new apiResponse(200, [], "No roles found"));
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

  let filter = { isActive: true };
  if (organizationId) {
    filter.organizationId = organizationId;
  }

  const branches = await Branch.find(filter, "name code address").lean();
  
  if (!branches || branches.length === 0) {
    return res.status(200).json(new apiResponse(200, [], "No branches found"));
  }

  const formattedBranches = branches.map((branch) => ({
    _id: branch._id,
    name: branch.name,
    code: branch.code,
    address: branch.address,
  }));

  return res.status(200).json(new apiResponse(200, formattedBranches, "Branches retrieved successfully"));
});

// Change user password
export const changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  console.log('🔐 changeUserPassword called for userId:', id);

  if (!newPassword || newPassword.trim().length < 6) {
    throw new apiError(400, "Password must be at least 6 characters long");
  }

  // Find user
  const user = await User.findById(id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  // Check if user has login credentials
  let userLogin = await UserLogin.findOne({ user: id });
  if (!userLogin) {
    throw new apiError(400, "User does not have login credentials. Enable login first.");
  }

  // Update password in UserLogin model
  userLogin.password = newPassword.trim();
  userLogin.forcePasswordChange = false; // User has now changed password
  await userLogin.save();

  console.log('✅ Password changed successfully for user:', user.name);

  return res.status(200).json(new apiResponse(200, { success: true, message: `Password changed for ${user.name}` }, "Password changed successfully"));
});

export default {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  toggleCanLogin,
  toggleIsActive,
  changeUserRole,
  softDeleteUser,
  restoreUser,
  deleteUserPermanent,
  getRolesForDropdown,
  getBranchesForDropdown,
  changeUserPassword,
};
