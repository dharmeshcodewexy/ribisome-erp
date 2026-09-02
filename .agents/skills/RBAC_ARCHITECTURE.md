# RBAC Architecture Diagram

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS TABLE                              │
│  (id, fullname, email, password, role_id, ...)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ (foreign key)
                         │ 1-to-many
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      USER_ROLES TABLE (Junction)                │
│  (id, user_id, role_id, assigned_at, assigned_by, is_primary)  │
└────────┬────────────────────────────────────────────┬───────────┘
         │                                            │
         │ many-to-1                                 │ many-to-1
         │                                            │
         ▼                                            ▼
    ┌──────────────┐                        ┌──────────────────┐
    │ ROLES TABLE  │                        │  ROLES TABLE     │
    │ (id, name)   │                        │  (referred to by) │
    └──────┬───────┘                        └──────────────────┘
           │ 1-to-many
           │
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                ROLE_PERMISSIONS TABLE (Junction)                │
│  (id, role_id, permission_id, created_at)                      │
└────────┬──────────────────────────────────┬─────────────────────┘
         │                                  │
         │ many-to-1                       │ many-to-1
         │                                  │
         ▼                                  ▼
    ┌──────────────┐                  ┌──────────────────┐
    │ ROLES TABLE  │                  │ PERMISSIONS TABLE│
    │ (id, name)   │                  │ (id, name,       │
    │              │                  │  module, ...)    │
    └──────────────┘                  └──────────────────┘
```

---

## Data Flow: Permission Check

```
Request arrives at route
         │
         ▼
┌─────────────────────────────────────────┐
│  checkPermission("create_user")         │
│  OR checkRole("admin")                  │
│  Express Middleware                     │
└──────────────┬──────────────────────────┘
               │
               ▼
         ┌───────────────────────────────┐
         │ Extract userId from           │
         │ res.locals.login_id           │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────┐
         │ Check Permission Cache               │
         │ (in-memory Map)                       │
         └───────────┬───────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
    CACHE HIT               CACHE MISS
        │                         │
        │                    ▼────────────────────────┐
        │                    │ Query Database:       │
        │                    │ UserRole.findAll()    │
        │                    │ + Role.include()      │
        │                    │ + Permission.include()│
        │                    └────────┬───────────────┘
        │                             │
        │                    ▼────────────────────────┐
        │                    │ Build permission set   │
        │                    │ Aggregate across roles │
        │                    │ Cache in Map           │
        │                    └────────┬───────────────┘
        │                             │
        └─────────────────┬───────────┘
                          │
                          ▼
            ┌──────────────────────────────┐
            │ Check: user.permissions      │
            │ includes "create_user"?      │
            └──────────┬───────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
       YES                            NO
        │                             │
        │                             ▼
        │                  ┌──────────────────────┐
        │                  │ AppError 403:        │
        │                  │ "Insufficient        │
        │                  │  permissions"        │
        │                  └──────────────────────┘
        │
        ▼
    next() → Route Handler
```

---

## Route Protection Examples

```
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS ROUTES                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ router.get("/")                                         │
│   → Public, no auth required                            │
│                                                          │
│ router.post("/users", checkPermission("create_user")) │
│   → Requires create_user permission                    │
│                                                          │
│ router.delete("/roles", checkRole("superadmin"))        │
│   → Requires superadmin role                           │
│                                                          │
│ router.put("/users/:id",                              │
│   checkPermission(["update_user", "assign_roles"])    │
│   → Requires ALL permissions (AND logic)              │
│                                                          │
│ router.get("/reports",                                 │
│   checkPermission(["view_reports", "export_reports"]  │
│   , "any"))                                            │
│   → Requires ANY permission (OR logic)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Permission Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                      PERMISSIONS (10)                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  USERS MODULE (4)           REPORTS MODULE (2)               │
│  ├─ create_user             ├─ view_reports                 │
│  ├─ read_user               └─ export_reports               │
│  ├─ update_user                                              │
│  └─ delete_user             ROLES MODULE (2)                │
│                             ├─ manage_roles                 │
│  PERMISSIONS MODULE (1)     └─ assign_roles                 │
│  └─ manage_permissions                                       │
│                             SYSTEM MODULE (2)               │
│                             ├─ manage_settings              │
│                             └─ view_logs                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │
         │ Assigned to Roles via role_permissions
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                     ROLES (3)                                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  SUPERADMIN (11 perms)         ADMIN (7 perms)              │
│  ├─ create_user                ├─ create_user               │
│  ├─ read_user                  ├─ read_user                │
│  ├─ update_user                ├─ update_user              │
│  ├─ delete_user ✓              ├─ view_reports             │
│  ├─ manage_roles ✓             ├─ export_reports           │
│  ├─ assign_roles ✓             ├─ manage_settings          │
│  ├─ manage_permissions ✓       └─ view_logs                │
│  ├─ view_reports                                            │
│  ├─ export_reports              STAFF (3 perms)            │
│  ├─ manage_settings             ├─ read_user               │
│  └─ view_logs                   ├─ view_reports            │
│                                 └─ view_logs               │
│                                                               │
│  ✓ = Exclusive to superadmin                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
         │
         │ Assigned to Users via user_roles
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                     USERS                                     │
│  (Can have multiple roles - permissions aggregated)          │
└──────────────────────────────────────────────────────────────┘
```

---

## Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS REQUEST                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────────┐
        │  Authorization Middleware                 │
        │  (from auth.service.js)                   │
        │  → Validates JWT token                    │
        │  → Loads user_id into res.locals          │
        └──────────────────────┬───────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  Permission Middleware                    │
        │  (from permission-middleware.service.js)  │
        │  → checkPermission() OR checkRole()       │
        └──────────────────────┬───────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
    ┌─────────────────────────┐   ┌─────────────────────┐
    │ Permission Checker      │   │ Permission Checker  │
    │ Service (check phase)   │   │ Service (check phase)
    │                         │   │                     │
    │ getUserPermissions()    │   │ (already in cache)  │
    │ ├─ Query DB             │   │                     │
    │ ├─ Build perm set       │   │ hasPermission()     │
    │ └─ Cache in memory      │   │ hasAnyPermission()  │
    │                         │   │ hasAllPermissions() │
    └────────┬────────────────┘   └────────┬────────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
                       ┌────┴────┐
                       │          │
                    ALLOW      DENY
                       │          │
                       ▼          ▼
                   next()   AppError(403)
                       │          │
                       ▼          ▼
                  Handler   Error Handler
```

---

## User Role Assignment Flow

```
Admin creates user with role
         │
         ▼
┌─────────────────────────────────────────┐
│  User.create({                          │
│    fullname, email, password, ...       │
│  })                                     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  UserRole.create({                      │
│    user_id: newUser.id,                 │
│    role_id: selectedRoleId,    ◄─ Which role?
│    assigned_by: adminId,                │
│    is_primary: true                     │
│  })                                     │
└──────────────┬──────────────────────────┘
               │
               ▼
User can now access routes permitted for that role!
```

---

## Permission Caching Strategy

```
First Request by User A:
┌──────────────────────────────┐
│ checkPermission("read_user") │
└──────────────┬───────────────┘
               │
               ▼ Cache miss
         Query Database
               │
               ▼
    [admin, read_user, view_reports]
               │
               ▼
    Cache: permissionCache.set(1, [...])


Subsequent Requests by User A:
┌──────────────────────────────┐
│ checkPermission("create_user")
└──────────────┬───────────────┘
               │
               ▼ Cache hit!
    Quick in-memory lookup
               │
               ▼
    Instant permission check (no DB query)


After Admin Changes Permissions:
┌──────────────────────────────┐
│ clearPermissionCache()        │
└──────────────┬───────────────┘
               │
               ▼
    permissionCache.clear()
               │
               ▼
    Next request will re-fetch from DB
```

---

## Integration Points

```
Existing Auth System
         │
         ├─→ JWT Generated (with role info)
         │
         ├─→ authorize() middleware validates token
         │
         └─→ User info stored in res.locals
                  │
                  ├─ login_id (user ID)
                  ├─ login_role_id (primary role)
                  └─ ... other fields

Permission System
         │
         ├─→ checkPermission() uses res.locals.login_id
         │
         ├─→ Queries UserRole + Role + Permission
         │
         └─→ Allows/denies based on permissions
```

---

## Summary

The RBAC system creates a clean, scalable permission model:
- **Flexible**: Supports multiple roles per user
- **Performant**: In-memory permission caching
- **Secure**: Middleware validates at route level
- **Maintainable**: Separate services for concerns
- **Extensible**: Add roles/permissions anytime

See `RBAC_QUICK_START.md` and `ROLE_BASED_ACCESS_CONTROL.md` for implementation details.
