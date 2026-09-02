// External dependencies - Start
const AppError = require("./app-error.service");
// External dependencies - End

// Internal dependencies - Start
const { UserRole, Role, Permission } = require("../database/models");
// Internal dependencies - End

/**
 * Cache for role permissions to reduce database queries
 * Structure: { roleId: [permission names] }
 */
const permissionCache = new Map();

/**
 * Clear permission cache - useful for testing or after admin changes
 */
const clearPermissionCache = () => {
  permissionCache.clear();
};

/**
 * Get all permissions for a specific role
 * @param {number} roleId
 * @returns {Promise<string[]>} Array of permission names
 */
const getRolePermissions = async (roleId) => {
  if (permissionCache.has(roleId)) {
    return permissionCache.get(roleId);
  }

  const role = await Role.findByPk(roleId, {
    include: {
      model: Permission,
      as: "permissions",
      attributes: ["name"],
      through: { attributes: [] },
    },
  });

  if (!role) {
    return [];
  }

  const permissions = role.permissions.map((p) => p.name);
  permissionCache.set(roleId, permissions);
  return permissions;
};

/**
 * Get all permissions for a user across all their roles
 * @param {number} userId
 * @returns {Promise<string[]>} Array of unique permission names
 */
const getUserPermissions = async (userId) => {
  const userRoles = await UserRole.findAll({
    where: { user_id: userId },
    include: {
      model: Role,
      as: "role",
      include: {
        model: Permission,
        as: "permissions",
        attributes: ["name"],
        through: { attributes: [] },
      },
    },
  });

  const permissionSet = new Set();
  for (const userRole of userRoles) {
    const permissions = userRole.role.permissions.map((p) => p.name);
    permissions.forEach((p) => permissionSet.add(p));
  }

  return Array.from(permissionSet);
};

/**
 * Check if a user has a specific permission
 * @param {number} userId
 * @param {string} permissionName
 * @returns {Promise<boolean>}
 */
const hasPermission = async (userId, permissionName) => {
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permissionName);
};

/**
 * Check if a user has any of the specified permissions
 * @param {number} userId
 * @param {string[]} permissionNames
 * @returns {Promise<boolean>}
 */
const hasAnyPermission = async (userId, permissionNames) => {
  const permissions = await getUserPermissions(userId);
  return permissionNames.some((name) => permissions.includes(name));
};

/**
 * Check if a user has all of the specified permissions
 * @param {number} userId
 * @param {string[]} permissionNames
 * @returns {Promise<boolean>}
 */
const hasAllPermissions = async (userId, permissionNames) => {
  const permissions = await getUserPermissions(userId);
  return permissionNames.every((name) => permissions.includes(name));
};

module.exports = {
  clearPermissionCache,
  getRolePermissions,
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
};
