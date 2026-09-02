---
name: express-api-route-standards
description: Enforces code structure, Zod validation, error handling, and response formatting for Express API routes and controllers with role-based access control (v2 router architecture).
---

# Express API Route & Controller Standards

This skill provides mandatory conventions and standard templates for creating or updating Express API routes and controllers with role-based access control.

---

## 1. Directory & File Naming Conventions

All v2 API routes reside within `src/routers/`:

```text
src/routers/
├── <domain>/                     # e.g., public, admin, member, secretary, auth
│   ├── <feature>/                # e.g., payment, member-account, society
│   │   └── <feature>.routes.js   # e.g., payment.routes.js
│   └── <domain>.routes.js        # Main domain route aggregator
└── global.routes.js              # Global v2 router entry point
```

---

## 2. Mandatory Code Structure Template

When creating a new route file (`<feature>.routes.js`), adhere strictly to this pattern:

```javascript
// External dependancies - Start
const featureRouter = require("express").Router({ mergeParams: true });
const { z } = require("zod");
// External dependancies - End

// Internal dependancies - Start
const AppError = require("../../../services/app-error.service");
const validateRequest = require("../../../services/schema-validator-service");
const { Units, Society } = require("../../../database/models");
// Internal dependancies - End

// 1. Define Zod Validation Schemas
const createFeatureSchema = z.object({
    title: z.string({ required_error: "Title is required" }).min(1, "Title cannot be empty"),
    status: z.enum(["active", "inactive"]).optional().default("active"),
});

// 2. Define Route Handlers
featureRouter.get("/", async (req, res, next) => {
    try {
        // Permission check: checkPermission middleware will handle role-based access
        const data = await Units.findAll();

        return res.status(200).json({
            status: "success",
            message: "Features fetched successfully",
            data,
        });
    } catch (error) {
        return next(new AppError(422, error?.errors?.[0]?.message || error.message));
    }
});

featureRouter.post("/", checkPermission("create_feature"), validateRequest(createFeatureSchema), async (req, res, next) => {
    try {
        const { title, status } = req.body;

        // Business logic / database operations
        const newItem = { title, status };

        return res.status(201).json({
            status: "success",
            message: "Feature created successfully",
            data: newItem,
        });
    } catch (error) {
        return next(new AppError(422, error?.errors?.[0]?.message || error.message));
    }
});

// 3. Named Export
module.exports = { featureRouter };
```

---

## 3. Key Conventions Checklist

1. **Router Instantiation**: Always use `express.Router({ mergeParams: true })`.
2. **Imports Organization**: Group imports using comments (`// External dependancies - Start` / `// Internal dependancies - Start`).
3. **Request Validation**:
   - Define input schemas using `zod`.
   - Pass `validateRequest(schema)` as middleware before the route handler.
4. **Error Handling**:
   - Always wrap async logic in `try ... catch`.
   - Pass errors to Express error handling via `next(new AppError(statusCode, message))`.
   - Standard fallback status code for client/validation errors is `422`.
5. **Response Formatting**:
   - Return HTTP 200/201 with standard JSON envelope: `{ status: "success", message: "...", data: ... }`.
6. **Aggregating Sub-Routers**:
   - Register new routers in their parent domain router (e.g., `public.routes.js`, `admin.routes.js`).
