// External dependencies - Start
const router = require("express").Router({ mergeParams: true });
// External dependencies - End

// Internal dependencies - Start
const AppError = require("../../services/app-error.service");
const { generateAccessToken } = require("../../services/encryption.service");
const { User, LoginSession } = require("../../database/models");
const { authorize } = require("../../services/auth.service");
// Internal dependencies - End

// POST /login - Simple login with email and password
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError(400, "Email and password required"));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new AppError(401, "Invalid credentials"));
    }

    const token = generateAccessToken({ id: user.id, role_id: user.role_id });

    await LoginSession.create({
      user_id: user.id,
      access_token: token,
      status: "active",
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: { user, token },
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
});

// PUT /logout - Logout user
router.put("/logout", authorize, async (req, res, next) => {
  try {
    const user_id = res.locals.login_id;
    const accessToken = req.headers["authorization"]?.split(" ")[1];

    if (!user_id) return next(new AppError(403, "User not authorized"));

    const session = await LoginSession.findOne({
      where: { user_id, access_token: accessToken, status: "active" },
    });

    if (session) {
      session.status = "logged_out";
      session.logout_at = new Date();
      await session.save();
    }

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
});

module.exports = router;
