const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../../logs/morgan");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams with auto-close disabled for better control
const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
  encoding: "utf8",
});

const errorLogStream = fs.createWriteStream(path.join(logsDir, "error.log"), {
  flags: "a",
  encoding: "utf8",
});

const combinedLogStream = fs.createWriteStream(path.join(logsDir, "combined.log"), {
  flags: "a",
  encoding: "utf8",
});

// Custom tokens
morgan.token("timestamp", () => {
  return new Date().toISOString();
});

morgan.token("body", (req) => {
  if (req.body && Object.keys(req.body).length > 0) {
    // Don't log sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "***";
    if (sanitizedBody.token) sanitizedBody.token = "***";
    if (sanitizedBody.new_password) sanitizedBody.new_password = "***";
    if (sanitizedBody.confirm_password) sanitizedBody.confirm_password = "***";
    return JSON.stringify(sanitizedBody);
  }
  return "-";
});

// Custom formats with newline
const devFormat = "[:timestamp] :method :url :status :response-time ms - :res[content-length]\n";

const prodFormat =
  ':timestamp :remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms ":user-agent"\n';

const detailedFormat = ":timestamp :remote-addr :method :url :status :response-time ms :user-agent\n";

// Morgan middleware configurations
const morganLogger = {
  // Development: Colorful console output
  dev: morgan("dev"),

  // Production: Access logs (all requests)
  access: morgan(prodFormat, {
    stream: {
      write: (message) => {
        accessLogStream.write(message);
      },
    },
  }),

  // Error logs (status >= 400)
  error: morgan(prodFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: {
      write: (message) => {
        errorLogStream.write(message);
      },
    },
  }),

  // Combined logs (all requests with details)
  combined: morgan(prodFormat, {
    stream: {
      write: (message) => {
        combinedLogStream.write(message);
      },
    },
  }),

  // Custom format for specific routes
  detailed: morgan(detailedFormat, {
    stream: {
      write: (message) => {
        combinedLogStream.write(message);
      },
    },
  }),
};

// Function to get appropriate logger based on environment
function getMorganMiddleware() {
  const env = process.env.NODE_ENV;

  // console.log(`📊 Morgan logging initialized for environment: ${env}`);
  // console.log(`📁 Logs directory: ${logsDir}`);

  if (env === "production") {
    return [morganLogger.access, morganLogger.error, morganLogger.combined];
  } else if (env === "development") {
    return [
      morganLogger.dev,
      morganLogger.combined, // Also log to file in development
    ];
  } else {
    // Test environment - minimal logging
    return [morganLogger.error];
  }
}

// Graceful cleanup on process exit
process.on("exit", () => {
  accessLogStream.end();
  errorLogStream.end();
  combinedLogStream.end();
});

process.on("SIGINT", () => {
  accessLogStream.end();
  errorLogStream.end();
  combinedLogStream.end();
  process.exit(0);
});

module.exports = {
  morganLogger,
  getMorganMiddleware,
  accessLogStream,
  errorLogStream,
  combinedLogStream,
};
