# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This backend implements a multi-role permission-based system supporting three core roles:
- **Superadmin**: Full system access
- **Admin**: Limited administrative capabilities
- **Staff**: Restricted access for general operations

The system is built with:
- **Models**: `Role`, `Permission`, `UserRole` with many-to-many relationships
- **Middleware**: `checkPermission()` and `checkRole()` for route protection
- **Service**: Permission checker with caching for performance

---

## Database Schema

### Tables

#### `roles`
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE,
  description TEXT,
  status ENUM('active', 'inactive'),
  created_at DATETIME,
  updated_at DATETIME
)
```

#### `permissions`
```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE,
  description TEXT,
  module VARCHAR(50),
  status ENUM('active', 'inactive'),
  created_at DATETIME,
  updated_at DATETIME
)
```

#### `role_permissions` (junction table)
```sql
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT FOREIGN KEY REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT FOREIGN KEY REFERENCES permissions(id) ON DELETE CASCADE,
  created_at DATETIME,
  UNIQUE(role_id, permission_id)
)
```

#### `user_roles` (junction table)
```sql
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE,
  role_id INT FOREIGN KEY REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at DATETIME,
  assigned_by INT FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at DATETIME,
  updated_at DATETIME,
  UNIQUE(user_id, role_id)
)
```

---

## Default Roles and Permissions

### Superadmin
Has access to ALL permissions:
- `create_user`, `read_user`, `update_user`, `delete_user`
- `manage_roles`, `assign_roles`
- `manage_permissions`
- `view_reports`, `export_reports`
- `manage_settings`, `view_logs`

### Admin
Has permissions for:
- `create_user`, `read_user`, `update_user`
- `view_reports`, `export_reports`
- `manage_settings`, `view_logs`

### Staff
Has read-only permissions:
- `read_user`
- `view_reports`
- `view_logs`

---

## Core Services

### 1. Permission Checker Service
**File**: `src/services/permission-checker.service.js`

```javascript
const { hasPermission, hasAnyPermission, hasAllPermissions } = require("./permission-checker.service");

// Check single permission
const canCreate = await hasPermission(userId, "create_user");

// Check if user has ANY of the permissions (OR logic)
const canEditOrDelete = await hasAnyPermission(userId, ["update_user", "delete_user"]);

// Check if user has ALL permissions (AND logic)
const canManage = await hasAllPermissions(userId, ["create_user", "assign_roles"]);
```

**Features**:
- In-memory cache for role permissions (reduces DB queries)
- `clearPermissionCache()` for testing or admin changes
- User permissions aggregated across all their roles

### 2. Permission Middleware Service
**File**: `src/services/permission-middleware.service.js`

#### `checkPermission(permissions, mode)`
Protects routes with permission checks.

```javascript
// Single permission
router.post("/users", checkPermission("create_user"), handler);

// Multiple permissions with AND logic (default)
router.put("/users/:id", checkPermission(["update_user", "assign_roles"]), handler);

// Multiple permissions with OR logic
router.get("/reports", checkPermission(["view_reports", "export_reports"], "any"), handler);
```

#### `checkRole(...allowedRoles)`
Restricts routes to specific roles.

```javascript
// Allow only superadmin and admin
router.delete("/roles", checkRole("superadmin", "admin"), handler);

// Allow multiple roles
router.get("/settings", checkRole("superadmin", "admin", "staff"), handler);
```

---

## Usage Examples

### 1. Protecting Admin Routes

**File**: `src/routers/admin/admin.routes.js`

```javascript
const adminRouter = require("express").Router();
const { checkRole } = require("../../services/permission-middleware.service");
const usersRouter = require("./users/users.routes");

// Protect all admin routes with role check
adminRouter.use(checkRole("superadmin", "admin"));

// Sub-routes
adminRouter.use("/users", usersRouter);

module.exports = adminRouter;
```

### 2. Individual Route Protection

**File**: `src/routers/admin/users/users.routes.js`

```javascript
const { checkPermission } = require("../../../services/permission-middleware.service");
const usersRouter = require("express").Router();

// Get all users - read permission required
usersRouter.get("/", checkPermission("read_user"), async (req, res, next) => {
  // Handler logic
});

// Create user - create permission required
usersRouter.post("/", checkPermission("create_user"), validateRequest(schema), async (req, res, next) => {
  // Handler logic
});

// Update user - update permission required
usersRouter.put("/:id", checkPermission("update_user"), validateRequest(schema), async (req, res, next) => {
  // Handler logic
});

// Delete user - delete permission required
usersRouter.delete("/:id", checkPermission("delete_user"), async (req, res, next) => {
  // Handler logic
});

module.exports = usersRouter;
```

### 3. Staff Routes with Permission Checks

**File**: `src/routers/staff/staff.routes.js`

```javascript
const staffRouter = require("express").Router();
const { checkRole, checkPermission } = require("../../services/permission-middleware.service");

// Protect all staff routes with role check
staffRouter.use(checkRole("staff", "admin", "superadmin"));

// Example: View reports
staffRouter.get("/reports", checkPermission("view_reports"), async (req, res, next) => {
  // Handler logic
});

// Example: Export reports (admin and superadmin only)
staffRouter.post("/reports/export", checkPermission("export_reports"), async (req, res, next) => {
  // Handler logic
});

module.exports = staffRouter;
```

---

## User Assignment

### Assigning Roles to Users

```javascript
const { UserRole, Role } = require("../database/models");

// Assign a role to user
await UserRole.create({
  user_id: userId,
  role_id: roleId,
  assigned_at: new Date(),
  assigned_by: adminUserId,
  is_primary: true, // Primary role for token generation
});
```

### Multiple Roles for a User

A user can have multiple roles. The `is_primary` flag indicates which role should be used for token generation.

```javascript
// User has multiple roles
const userRoles = await UserRole.findAll({
  where: { user_id: userId },
  include: {
    model: Role,
    as: "role",
    attributes: ["name"],
  },
});

// Permissions are aggregated across all roles
const allPermissions = await getUserPermissions(userId);
```

---

## Database Migrations

Run migrations in order:

```bash
# Create roles table
npm run db-migrate

# Create permissions table
npm run db-migrate

# Create role_permissions junction
npm run db-migrate

# Create user_roles junction
npm run db-migrate
```

## Seed Data

Default roles and permissions are seeded via:
**File**: `src/database/seeders/20260902120000-seed-roles-permissions.js`

Run seeds:
```bash
npm run db-seed
```

---

## Adding New Permissions

1. **Create Permission** in database:
```javascript
const { Permission } = require("../database/models");

await Permission.create({
  name: "manage_audit_logs",
  description: "Access and manage system audit logs",
  module: "audit",
  status: "active",
});
```

2. **Assign to Role**:
```javascript
const { Role, Permission } = require("../database/models");

const role = await Role.findOne({ where: { name: "admin" } });
const permission = await Permission.findOne({ where: { name: "manage_audit_logs" } });

await role.addPermission(permission);
```

3. **Clear Cache**:
```javascript
const { clearPermissionCache } = require("./permission-checker.service");
clearPermissionCache(); // Forces re-fetch on next check
```

4. **Use in Routes**:
```javascript
router.get("/audit-logs", checkPermission("manage_audit_logs"), handler);
```

---

## Adding New Roles

```javascript
const { Role } = require("../database/models");

const newRole = await Role.create({
  name: "manager",
  description: "Department manager with supervisory access",
  status: "active",
});

// Assign permissions to the role
const permission1 = await Permission.findOne({ where: { name: "read_user" } });
const permission2 = await Permission.findOne({ where: { name: "view_reports" } });

await newRole.addPermissions([permission1, permission2]);
```

---

## Error Handling

### Permission Denied Response

When a user lacks required permissions:

```json
{
  "status": "error",
  "message": "Insufficient permissions. Required: create_user, assign_roles",
  "statusCode": 403
}
```

### Role Denied Response

When a user doesn't have the required role:

```json
{
  "status": "error",
  "message": "Access denied. Required roles: superadmin, admin",
  "statusCode": 403
}
```

---

## Testing

Clear permission cache during tests:

```javascript
const { clearPermissionCache } = require("../services/permission-checker.service");

beforeEach(() => {
  clearPermissionCache();
});
```

---

## Performance Considerations

1. **Permission Caching**: Role permissions are cached in-memory
2. **Database Indexes**: `user_roles`, `role_permissions` tables have indexes on foreign keys
3. **Batch Operations**: Use `addPermissions([perm1, perm2])` for bulk assignments

---

## Future Enhancements

1. **Permission Scopes**: Add resource-level permissions (e.g., "edit_own_profile")
2. **Temporal Permissions**: Time-based role assignments
3. **Audit Logging**: Track permission changes and access attempts
4. **UI/UX**: Admin panel for role and permission management
5. **API Docs**: Auto-generate permission requirements in OpenAPI specs

---

## Quick Reference

| Task | Code |
|------|------|
| Check single permission | `await hasPermission(userId, "create_user")` |
| Check any permission | `await hasAnyPermission(userId, ["read", "write"])` |
| Check all permissions | `await hasAllPermissions(userId, ["read", "admin"])` |
| Protect by permission | `router.post("/", checkPermission("create"), handler)` |
| Protect by role | `router.delete("/", checkRole("admin"), handler)` |
| Assign role | `UserRole.create({ user_id, role_id, is_primary: true })` |
| Clear cache | `clearPermissionCache()` |

---

## Support

For issues or questions, refer to:
- Database Models: `src/database/models/`
- Services: `src/services/permission-*.service.js`
- Route Examples: `src/routers/admin/`, `src/routers/staff/`
