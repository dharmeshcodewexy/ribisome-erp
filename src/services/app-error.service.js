module.exports = class AppError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.isAppError = true;

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "ERROR";
    //  Error.captureStackTrace(this, this.constructor);
  }
};
