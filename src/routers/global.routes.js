// External dependencies - Start
const router = require("express").Router({ mergeParams: true });
// External dependencies - End

// Internal dependencies - Start
const AppError = require("../services/app-error.service");
const adminRouter = require("./admin/admin.routes");
const staffRouter = require("./staff/staff.routes");
// Internal dependencies - End

// ### Routes start here

// Health check
router.get("/", (req, res) => res.status(200).send("API working perfectly!"));

// Role-based route groups
router.use("/admin", adminRouter);
router.use("/staff", staffRouter);

// Utility: Generate financial years list
router.get("/financial-years", (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentFyStart = month >= 3 ? year : year - 1;

  const result = [];
  for (let i = 0; i < count; i++) {
    const start = currentFyStart - i;
    const end = start + 1;
    result.push(`${start}-${end}`);
  }

  return res.status(200).json({
    status: "success",
    message: "Financial years fetched successfully",
    data: result,
  });
});

// 404 handler (must be last)
router.all("*", (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

// ### Routes end here

module.exports = router;
