# RBAC Quick Start Guide

## 1. Initialize Database

```bash
# Run migrations to create role-based tables
npm run db-migrate

# Seed default roles and permissions
npm run db-seed
```

This creates:
- `roles` table with 3 default roles (superadmin, admin, staff)
- `permissions` table with 10 default permissions
- `role_permissions` associations
- `user_roles` table for user-role assignments

---

## 2. Assign a Role to a User

In your login or user creation endpoint:

```javascript
const { User, UserRole } = require("../database/models");

// Create or find user
const user = await User.create({
  fullname: "John Doe",
  email: "john@example.com",
  password: hashedPassword,
});

// Assign a role
await UserRole.create({
  user_id: user.id,
  role_id: 1, // 1 = superadmin, 2 = admin, 3 = staff
  assigned_at: new Date(),
  assigned_by: 1, // Admin who assigned this
  is_primary: true, // Mark as primary role
});
```

---

## 3. Protect Routes with Permissions

Use the middleware in your route handlers:

```javascript
const { checkPermission, checkRole } = require("../services/permission-middleware.service");

// Protect by permission
router.post("/users", checkPermission("create_user"), createUserHandler);

// Protect by role
router.delete("/roles", checkRole("superadmin"), deleteRoleHandler);

// Multiple permissions (user needs all of them)
router.put("/users/:id", checkPermission(["update_user", "assign_roles"]), updateHandler);

// Multiple roles (user needs one of them)
router.get("/admin", checkRole("superadmin", "admin"), adminDashboard);
```

---

## 4. Test Permission Checks

```javascript
const { hasPermission, hasAnyPermission, hasAllPermissions } = require("../services/permission-checker.service");

// Check if user can create users
const canCreate = await hasPermission(userId, "create_user");

// Check if user can do either action
const canEdit = await hasAnyPermission(userId, ["update_user", "edit_profile"]);

// Check if user can do both actions
const canManage = await hasAllPermissions(userId, ["create_user", "delete_user"]);

console.log(canCreate, canEdit, canManage);
```

---

## 5. Complete Example: User Management Route

```javascript
// src/routers/admin/users/users.routes.js

const express = require("express");
const router = express.Router();
const { checkPermission } = require("../../../services/permission-middleware.service");
const { User, UserRole, Role } = require("../../../database/models");

// GET all users (requires read_user permission)
router.get("/", checkPermission("read_user"), async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: {
        model: UserRole,
        as: "user_roles",
        include: { model: Role, as: "role" },
      },
    });
    res.json({ status: "success", data: users });
  } catch (error) {
    next(error);
  }
});

// POST create user (requires create_user permission)
router.post("/", checkPermission("create_user"), async (req, res, next) => {
  try {
    const { fullname, email, password, role_id } = req.body;

    const user = await User.create({
      fullname,
      email,
      password,
    });

    await UserRole.create({
      user_id: user.id,
      role_id,
      assigned_by: res.locals.login_id,
      is_primary: true,
    });

    res.status(201).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
});

// PUT update user (requires update_user permission)
router.put("/:id", checkPermission("update_user"), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    await user.update(req.body);
    res.json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
});

// DELETE user (requires delete_user permission)
router.delete("/:id", checkPermission("delete_user"), async (req, res, next) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.json({ status: "success", message: "User deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

---

## 6. Default Roles and Their Permissions

### Superadmin
```
✓ create_user
✓ read_user
✓ update_user
✓ delete_user
✓ manage_roles
✓ assign_roles
✓ manage_permissions
✓ view_reports
✓ export_reports
✓ manage_settings
✓ view_logs
```

### Admin
```
✓ create_user
✓ read_user
✓ update_user
✗ delete_user (requires superadmin)
✗ manage_roles (requires superadmin)
✗ assign_roles (requires superadmin)
✗ manage_permissions (requires superadmin)
✓ view_reports
✓ export_reports
✓ manage_settings
✓ view_logs
```

### Staff
```
✓ read_user
✗ create_user (admin only)
✗ update_user (admin only)
✗ delete_user (superadmin only)
✓ view_reports
✗ export_reports (admin only)
✓ view_logs
```

---

## 7. Adding Custom Permissions

```javascript
const { Permission, Role } = require("../database/models");

// Step 1: Create permission
const permission = await Permission.create({
  name: "manage_invoices",
  description: "Create and manage invoices",
  module: "finance",
  status: "active",
});

// Step 2: Assign to roles
const adminRole = await Role.findOne({ where: { name: "admin" } });
await adminRole.addPermission(permission);

// Step 3: Use in routes
router.post("/invoices", checkPermission("manage_invoices"), handler);
```

---

## 8. Common Middleware Patterns

```javascript
// 1. Admin-only route
router.delete("/settings", checkRole("superadmin", "admin"), handler);

// 2. Superadmin-only route
router.post("/roles", checkRole("superadmin"), handler);

// 3. Staff can view, admin can modify
router.get("/reports", checkPermission("view_reports"), getReports);
router.post("/reports", checkPermission("export_reports"), exportReports);

// 4. Cascading permissions
router.put(
  "/users/:id",
  checkPermission(["update_user", "assign_roles"]),
  handler
);
```

---

## 9. Testing Permission Checks

```javascript
// Mock user with specific permissions
const mockUser = {
  id: 1,
  user_roles: [{ role: { name: "admin" } }],
};

// Check if middleware allows access
const { hasPermission } = require("../services/permission-checker.service");
const result = await hasPermission(mockUser.id, "create_user");
console.log(result); // true or false
```

---

## 10. File Structure Reference

```
src/
├── database/
│   ├── models/
│   │   ├── role.model.js           # Role model
│   │   ├── permission.model.js     # Permission model
│   │   ├── user-role.model.js      # UserRole junction
│   │   └── user.model.js           # Updated with role associations
│   ├── migrations/
│   │   ├── 20260902120000-roles.js
│   │   ├── 20260902120100-permissions.js
│   │   ├── 20260902120200-role-permissions.js
│   │   └── 20260902120300-user-roles.js
│   └── seeders/
│       └── 20260902120000-seed-roles-permissions.js
├── routers/
│   ├── admin/
│   │   ├── admin.routes.js
│   │   └── users/
│   │       └── users.routes.js
│   ├── staff/
│   │   └── staff.routes.js
│   └── global.routes.js
└── services/
    ├── permission-checker.service.js     # Utility functions
    └── permission-middleware.service.js  # Express middleware
```

---

## Next Steps

1. Run migrations and seeds
2. Create users and assign roles
3. Protect your existing routes with permissions
4. Test the permission checks
5. Extend with custom permissions as needed

See `ROLE_BASED_ACCESS_CONTROL.md` for detailed documentation.
