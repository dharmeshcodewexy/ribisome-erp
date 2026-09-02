// External dependencies - Start
// External dependencies - End

// Internal dependencies - Start
const AppError = require("./app-error.service");
const { hasPermission, hasAnyPermission, hasAllPermissions } = require("./permission-checker.service");
// Internal dependencies - End

/**
 * Middleware to check if user has a specific permission
 * Use: router.post("/users", checkPermission("create_user"), handler)
 * @param {string|string[]} permissions - Single permission name or array of names
 * @param {string} mode - "all" (AND logic) or "any" (OR logic). Default: "all"
 * @returns {Function} Express middleware
 */
const checkPermission = (permissions, mode = "all") => {
  return async (req, res, next) => {
    try {
      const userId = res.locals.login_id || res.locals.accessID;

      if (!userId) {
        return next(new AppError(403, "User ID not found in request context"));
      }

      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

      let hasAccess;
      if (mode === "any") {
        hasAccess = await hasAnyPermission(userId, permissionArray);
      } else {
        hasAccess = await hasAllPermissions(userId, permissionArray);
      }

      if (!hasAccess) {
        const permissionText = permissionArray.join(", ");
        return next(
          new AppError(
            403,
            `Insufficient permissions. Required: ${permissionText}`
          )
        );
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return next(new AppError(500, "Permission verification failed"));
    }
  };
};

/**
 * Middleware to restrict access to specific roles
 * Use: router.delete("/users/:id", checkRole("superadmin", "admin"), handler)
 * @param {...string} allowedRoles - Role names that have access
 * @returns {Function} Express middleware
 */
const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = res.locals.login_id || res.locals.accessID;
      const userRoleId = res.locals.login_role_id;

      if (!userId || !userRoleId) {
        return next(new AppError(403, "User role info not found in request context"));
      }

      // roles are already available in res.locals if authorize middleware ran
      const { UserRole, Role } = require("../database/models");

      const userRoles = await UserRole.findAll({
        where: { user_id: userId },
        include: {
          model: Role,
          as: "role",
          attributes: ["name"],
        },
      });

      const userRoleNames = userRoles.map((ur) => ur.role.name);
      const hasAccess = userRoleNames.some((role) => allowedRoles.includes(role));

      if (!hasAccess) {
        return next(
          new AppError(
            403,
            `Access denied. Required roles: ${allowedRoles.join(", ")}`
          )
        );
      }

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return next(new AppError(500, "Role verification failed"));
    }
  };
};

module.exports = {
  checkPermission,
  checkRole,
};
