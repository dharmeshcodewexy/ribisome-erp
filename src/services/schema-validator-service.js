// External dependencies - Start
// External dependencies - End

// Internal dependencies - Start
const AppError = require("./app-error.service");
// Internal dependencies - End

/**
 * Express middleware to validate request body against Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return next(new AppError(422, "Validation failed", errors));
      }

      req.body = result.data;
      next();
    } catch (error) {
      return next(new AppError(422, "Schema validation error"));
    }
  };
};

/**
 * Express middleware to validate query parameters against Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        return next(new AppError(422, "Query validation failed", errors));
      }

      req.query = result.data;
      next();
    } catch (error) {
      return next(new AppError(422, "Query validation error"));
    }
  };
};

module.exports = validateRequest;
module.exports.validateQuery = validateQuery;
