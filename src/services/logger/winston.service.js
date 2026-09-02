const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../../../logs/winston");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom levels and colors
const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: "red", warn: "yellow", info: "green", http: "magenta", debug: "blue" };
winston.addColors(colors);

// Shared JSON format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for dev
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    const cleanMeta = Object.fromEntries(
      Object.entries(meta).filter(([k]) => !["timestamp", "level", "message", "splat"].includes(k))
    );
    if (Object.keys(cleanMeta).length > 0) {
      msg += `\n${JSON.stringify(cleanMeta, null, 2)}`;
    }
    return msg;
  })
);

// Daily rotating transports
const combinedTransport = new DailyRotateFile({
  filename: path.join(logsDir, "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: logFormat,
});

const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
  format: logFormat,
});

// Logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format: logFormat,
  transports: [combinedTransport, errorTransport],
  ...(process.env.NODE_ENV === "production" && {
    exceptionHandlers: [
      new winston.transports.File({ filename: path.join(logsDir, "exceptions.log"), maxsize: 5242880 }),
    ],
    rejectionHandlers: [
      new winston.transports.File({ filename: path.join(logsDir, "rejections.log"), maxsize: 5242880 }),
    ],
  }),
});

// Add console in non-production
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}

// Helpers
logger.logRequest = (req, message = "HTTP Request") => {
  logger.http(message, { method: req.method, url: req.originalUrl, ip: req.ip, userAgent: req.get("user-agent") });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, { stack: error.stack, ...context });
};

// Graceful shutdown
const shutdown = () => {
  logger.end();
  if (process.env.NODE_ENV === "production") {
    process.exit(0);
  }
};

if (process.env.NODE_ENV === "production") {
  process.on("exit", shutdown);
  process.on("SIGINT", shutdown);
}

// console.log(`📊 Winston logging initialized for environment: ${process.env.NODE_ENV}`);
// console.log(`📁 Logs directory: ${logsDir}`);

module.exports = { logger };
