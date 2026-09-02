# Quick Reference Card

**A 5-minute guide to the cleaned-up codebase**

---

## 🚀 Getting Started

```bash
# Install & setup
npm install
npm run db-migrate
npm run db-seed
npm run dev
```

---

## 📁 Project Structure (Clean & Simple)

```
src/
├── server.js                          # Express entry point
├── app.router.js                      # Route aggregator
├── database/
│   ├── models/                        # 5 models (User, Role, Permission, UserRole, etc)
│   ├── migrations/                    # Database schema (4 RBAC tables)
│   └── seeders/                       # Data seeding (default roles)
├── services/                          # Business logic & middleware
│   ├── auth.service.js               # JWT authorization
│   ├── permission-checker.service.js  # Permission utilities
│   ├── permission-middleware.service.js # Permission middleware
│   ├── schema-validator-service.js    # ✨ Zod validation
│   ├── encryption.service.js          # Password hashing
│   ├── environment.service.js         # Config
│   ├── helper.service.js              # Utilities
│   └── email.service.js               # Email sending
└── routers/                        # API routes
    ├── auth/                          # Login/logout (68 lines - simplified)
    ├── admin/                         # Admin domain (role-protected)
    │   └── users/                     # User CRUD example
    ├── staff/                         # Staff domain (role-protected)
    └── global.routes.js               # Route aggregator
```

---

## 🔑 Key Concepts (3 Main Things to Know)

### 1️⃣ RBAC (Role-Based Access Control)

Three default roles:
- **Superadmin** - Full access
- **Admin** - Limited management
- **Staff** - Read-only access

### 2️⃣ Permissions

10 default permissions covering users, roles, reports, and settings.  
Easily add more: `Permission.create({ name: "...", module: "..." })`

### 3️⃣ Middleware

Two middleware functions protect your routes:
```javascript
checkPermission("create_user")        // By permission
checkRole("superadmin", "admin")      // By role
```

---

## 🔐 Common Tasks

### Login User
```javascript
POST /auth/login
Body: { email, password }
```

### Logout User
```javascript
PUT /auth/logout
Header: Authorization: Bearer {token}
```

### Create User
```javascript
POST /admin/users
Header: Authorization: Bearer {token}
Body: { fullname, email, password, role_id }
```

### Check Permissions (Programmatically)
```javascript
const { hasPermission } = require("./permission-checker.service");
const canCreate = await hasPermission(userId, "create_user");
```

### Protect a Route
```javascript
router.post("/resource", checkPermission("create_resource"), handler);
router.delete("/resource/:id", checkRole("superadmin"), handler);
```

---

## 📊 Database Tables

| Table | Purpose | Rows |
|-------|---------|------|
| `users` | User accounts | Flexible |
| `roles` | Role definitions | 3 default (superadmin, admin, staff) |
| `permissions` | Permission definitions | 10 default |
| `user_roles` | User-Role associations | Flexible (users can have multiple roles) |
| `role_permissions` | Role-Permission associations | 20+ associations |

---

## 🧪 Testing Quick Commands

```bash
# Start dev server
npm run dev

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}'

# Test protected route
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer {token}"

# Check permissions
node -e "
  const { hasPermission } = require('./src/services/permission-checker.service');
  hasPermission(1, 'create_user').then(r => console.log(r));
"
```

---

## 🎯 What Got Cleaned Up?

| What | Before | After | Status |
|------|--------|-------|--------|
| **Auth service** | 127 lines | 18 lines | ✅ 86% smaller |
| **Auth routes** | 902 lines | 68 lines | ✅ 92% smaller |
| **Unused imports** | 15+ | 0 | ✅ Removed |
| **Commented code** | 20+ lines | 0 | ✅ Removed |
| **Dead code** | 100+ lines | 0 | ✅ Removed |
| **Non-existent services** | 8+ imports | 0 | ✅ Fixed |

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Setup & overview |
| `RBAC_QUICK_START.md` | RBAC 10-minute guide |
| `ROLE_BASED_ACCESS_CONTROL.md` | Complete RBAC technical guide |
| `RBAC_ARCHITECTURE.md` | RBAC diagrams & flows |
| `CODE_CLEANUP_REPORT.md` | Cleanup details & improvements |
| `FILE_INVENTORY.md` | File-by-file status |
| `IMPLEMENTATION_CHECKLIST.md` | Step-by-step setup checklist |
| `QUICK_REFERENCE.md` | ← You are here |

---

## 🚨 Important Notes

### ✅ Do This
- Use `checkPermission()` and `checkRole()` middleware
- Follow route file patterns (see admin/users/)
- Keep imports organized (External | Internal)
- Use schema validation with Zod
- Add to RBAC system for new permissions

### ❌ Don't Do This
- Don't create routes without permission checks
- Don't import non-existent services
- Don't leave commented code
- Don't mix validation approaches
- Don't bypass authorization middleware

---

## ⚙️ Configuration

### Environment Variables
```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=rbac_db
JWT_SECRET=your_secret_key
```

### Start Commands
```bash
npm run dev              # Development
npm start              # Production
npm run db-migrate     # Run migrations
npm run db-seed        # Run seeders
```

---

## 🔧 Adding a New Route

**Pattern**:
```javascript
// src/routers/{domain}/{resource}/{resource}.routes.js

const router = require("express").Router({ mergeParams: true });
const { checkPermission } = require("../../../services/permission-middleware.service");
const AppError = require("../../../services/app-error.service");
const { Model } = require("../../../database/models");

// Get all
router.get("/", checkPermission("read_resource"), async (req, res, next) => {
  try {
    const data = await Model.findAll();
    res.json({ status: "success", data });
  } catch (error) {
    next(new AppError(500, error.message));
  }
});

// Create
router.post("/", checkPermission("create_resource"), async (req, res, next) => {
  try {
    const data = await Model.create(req.body);
    res.status(201).json({ status: "success", data });
  } catch (error) {
    next(new AppError(500, error.message));
  }
});

module.exports = router;
```

---

## 🆘 Troubleshooting

### "Permission denied" error
- Verify user has role assigned: `UserRole.findOne({ user_id })`
- Verify role has permission: `role_permissions` table
- Check permission name spelling

### "User not found" error
- Verify user exists in database
- Check authorization middleware is running first
- Verify token contains valid user ID

### "Token invalid" error
- Verify token format: `Bearer {token}`
- Verify token is from last login (not expired)
- Check JWT_SECRET env var matches

### Route returns 404
- Verify route middleware order (auth → permission → handler)
- Verify URL matches route path exactly
- Check HTTP method (GET vs POST vs PUT vs DELETE)

---

## 📈 Performance Tips

1. **Permission caching**: Uses in-memory cache (fast)
2. **Database indexes**: All foreign keys indexed
3. **Async/await**: All DB operations are non-blocking
4. **Error handling**: Centralized error middleware

---

## 🎓 Learning Path

1. **Start here**: Read `README.md` (5 min)
2. **Understand RBAC**: Read `RBAC_QUICK_START.md` (10 min)
3. **Learn architecture**: Read `RBAC_ARCHITECTURE.md` (15 min)
4. **Reference**: Keep this file bookmarked
5. **Deep dive**: Read `ROLE_BASED_ACCESS_CONTROL.md` for details

---

## 📞 Quick Links

- **Models**: `src/database/models/`
- **Routes**: `src/routers/`
- **Services**: `src/services/`
- **Migrations**: `src/database/migrations/`
- **Seeds**: `src/database/seeders/`

---

## ✅ Ready?

Everything is clean, documented, and production-ready!

**Next step**: `npm run dev` 🚀
