// External dependancies - Start
const adminRouter = require("express").Router({ mergeParams: true });
// External dependancies - End

// Internal dependancies - Start
const { checkRole } = require("../../services/permission-middleware.service");
const usersRouter = require("./users/users.routes");
const categoryMasterRouter = require("./category-master/category-master.routes");
// Internal dependancies - End

// Routes mapping start here

// Protect all admin routes with role check
adminRouter.use(checkRole("superadmin", "admin"));

// Users management route
adminRouter.use("/users", usersRouter);
adminRouter.use("/category-master", categoryMasterRouter);

// Routes mapping ends here

module.exports = adminRouter;
