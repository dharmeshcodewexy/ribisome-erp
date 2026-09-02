// External dependancies - Start
const staffRouter = require("express").Router({ mergeParams: true });
// External dependancies - End

// Internal dependancies - Start
const { checkPermission, checkRole } = require("../../services/permission-middleware.service");
// Internal dependancies - End

// Staff sub-routers
// const dashboardRouter = require("./dashboard/dashboard.routes");
// const reportsRouter = require("./reports/reports.routes");

// Routes mapping start here

// Protect all staff routes with role check
staffRouter.use(checkRole("staff", "admin", "superadmin"));

// Example: Dashboard route with permission check
// staffRouter.use("/dashboard", dashboardRouter);

// Example: Reports route with permission check
// staffRouter.use("/reports", checkPermission("view_reports"), reportsRouter);

// Routes mapping ends here

module.exports = staffRouter;
