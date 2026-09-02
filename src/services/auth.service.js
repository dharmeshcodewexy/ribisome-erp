// External dependencies - Start
const jwt = require("jsonwebtoken");
const { envs } = require("./environment.service");
const AppError = require("./app-error.service");
const { LoginSession, SuperAdmin } = require("../database/models");
const { providers } = require("./providers.service");
// External dependencies - End

const authorize = async (req, res, next) => {
  // console.log("authorize middleware invoked...");

  try {
    // Extract token
    const accessToken = req.headers["authorization"]?.split(" ")[1];
    if (!accessToken) return next(new AppError(403, "Access token is required"));
    // console.log("accessToken", accessToken);

    // Decode & verify JWT
    let decodedToken;
    try {
      decodedToken = jwt.verify(accessToken, envs.jwt.secret);
    } catch (err) {
      return next(new AppError(403, "Invalid or expired token"));
    }

    if (!decodedToken?.id) return next(new AppError(403, "Invalid token payload"));

    const { id, role_id } = decodedToken;

    res.locals.login_id = id;
    res.locals.login_role_id = role_id;

    const loginSession = await LoginSession.findOne({
      where: { user_id: id, access_token: accessToken, status: "active", logout_at: null },
    });

    if (!loginSession) return next(new AppError(401, "Session expired or user logged out"));

    res.locals.loginSession = loginSession;
    next();
  } catch (error) {
    console.error("Authorize middleware error:", error);
    return next(new AppError(500, "Authorization failed"));
  }
};

module.exports = { authorize };
