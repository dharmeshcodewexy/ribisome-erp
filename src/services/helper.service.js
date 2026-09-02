/**
 * Helper Service - Utility Functions
 *
 * This service provides middleware and utility helpers for the Express application.
 * Originally contained 48 functions; cleaned up to keep only actively used ones.
 */

/**
 * Skips a middleware for specified routes
 * @function skipFor
 * @description Middleware wrapper that skips the provided middleware if the request path matches
 * any of the excluded paths. Used for authentication bypass on public routes.
 *
 * @param {Function} middleware - Middleware function to conditionally skip
 * @param {string[]} paths - Array of paths where middleware should be skipped
 * @returns {Function} Express middleware function
 *
 * @example
 * app.use(skipFor(authorize, ['/auth', '/health']))
 */
const skipFor = (middleware, paths) => (req, res, next) =>
  paths.some((element) => req.path === element || req.path.startsWith(element + "/"))
    ? next()
    : middleware(req, res, next);

module.exports = {
  skipFor,
};
