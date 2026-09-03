/**
 * @module appRouter
 */

const router = require("express").Router({ mergeParams: true });

// Internal dependencies start here

const authRoutes = require("./routers/auth/auth.routes");
const globalRoutes = require("./routers/global.routes");
// const superAdminRouter = require("./routers/super-admin/super-admin.routes");
const adminRouter = require("./routers/admin/admin.routes");
const staffRouter = require("./routers/staff/staff.routes");
// Internal dependencies end here

// Reserved Routes: parent only: POST, DELETE
// Shared Routes: shared editable with parent and self: PUT, Patch, get by ID
// Protected Routes: non editable shared for parent and sibling level: get listing
// Private Routes: self only: login, forgot-password

// Routes mapping start here

router.use("/auth", authRoutes);

// Role-based route groups
// router.use("/superadmin", superAdminRouter);
router.use("/admin", adminRouter);
router.use("/staff", staffRouter);

// Global routes - Start
router.use(globalRoutes);
// Global routes - End

// Routes mapping ends here

module.exports = router;
