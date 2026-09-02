// External dependencies
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const http = require("http");
require("dotenv").config();

// Environment config
if (process.env.NODE_ENV === "development") require("dotenv").config({ path: [".env.development"] });
else if (process.env.NODE_ENV === "production") require("dotenv").config({ path: [".env.production"] });
else if (process.env.NODE_ENV === "test") require("dotenv").config({ path: [".env.test"] });

const os = require("os");
const path = require("path");
const cluster = require("cluster");

// Internal dependencies
const appRouter = require("./app.router");
const { envs } = require("./services/environment.service");
const errorHandler = require("./services/error-handler.service");
const { authorize } = require("./services/auth.service");
const { skipFor } = require("./services/helper.service");
const { providers } = require("./services/providers.service");
const { sequelize } = require("./database/models");
const { getMorganMiddleware } = require("./services/logger/morgan.service");
const { logger } = require("./services/logger/winston.service");
const { threatBlockerMiddleware } = require("./services/threat-blocker.service");

// App Initializations
const app = express();

// Trust nginx proxy so req.ip returns the real client IP via X-Forwarded-For
app.set("trust proxy", 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [envs.front_end_url];

const server = http.createServer(app);

// Global rate limiter — throttles scanners and brute-force regardless of URL
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).end(),
});
app.use(globalRateLimiter);

// Apply Morgan middleware based on environment
const morganMiddlewares = getMorganMiddleware();
morganMiddlewares.forEach((middleware) => app.use(middleware));

app.use(threatBlockerMiddleware);

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, originalUrl: url } = req;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get("User-Agent");

    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

    const start = Date.now();
    res.on("finish", () => {
      console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${Date.now() - start}ms`);
    });

    next();
  });
}

// Middlewares
// `verify` stashes the raw request bytes on req.rawBody — needed by the Razorpay
// webhook handler, which verifies its signature over the raw (unparsed) body.
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

// Single CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Flutter mobile apps often send no origin (null)
      // This is normal behavior for mobile HTTP requests
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      // Block other origins
      console.warn(`🚨 CORS BLOCKED: ${origin}`);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-town-manage-refresher"],
  })
);
app.options("*", cors());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc:
          process.env.NODE_ENV === "production"
            ? ["'self'", envs.front_end_url]
            : ["'self'", "http://localhost:3000", envs.front_end_url],
      },
    },
    // Enhanced security headers
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: { action: "deny" },
    xssFilter: true,
    referrerPolicy: { policy: "same-origin" },
  })
);
app.use(compression());

// Hide server information
app.disable("x-powered-by");

// Serve static files from /uploads — after helmet so uploaded files (which may
// include untrusted user content) still get CSP/nosniff/frameguard headers.
// CORP is relaxed to cross-origin here since the frontend lives on a different
// subdomain and needs to embed these files directly (<img>, downloads, etc).
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "..", "uploads"))
);

app.use(skipFor(authorize, providers.public_routes));

// Route mappings
app.use(appRouter);
app.use(errorHandler);

const numOfCores = os.availableParallelism();

// Graceful shutdown handling
const gracefulShutdown = (server, sequelize) => {
  return async (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

    // Set a timeout for force shutdown if graceful shutdown takes too long
    const forceShutdownTimeout = setTimeout(() => {
      console.error("❌ Graceful shutdown timeout. Force shutting down...");
      process.exit(1);
    }, 30000); // 30 seconds timeout

    server.close(async (err) => {
      clearTimeout(forceShutdownTimeout);

      if (err) {
        console.error("❌ Error closing HTTP server:", err);
        return process.exit(1);
      }

      console.log("✅ HTTP server closed.");

      try {
      
        // Close database connection
        if (sequelize) {
          await sequelize.close();
          console.log("✅ Database connection closed.");
        }

        // Add any other cleanup operations here

        // console.log('✅ Graceful shutdown completed.');
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    });

    // Stop accepting new connections
    console.log("🛑 Server stopped accepting new connections.");
  };
};

// Async function to start the server
async function startServer() {
  try {
    // Start the server FIRST for faster perceived startup
    server.listen(envs.port, () => {
      logger.info("🚀 Server started successfully, Listening on port " + envs.port);
    });

    // Register graceful shutdown handlers
    const shutdownHandler = gracefulShutdown(server, sequelize);
    process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
    process.on("SIGINT", () => shutdownHandler("SIGINT"));
    process.on("SIGUSR2", () => shutdownHandler("SIGUSR2")); // For nodemon restart

    // Handle uncaught exceptions and unhandled rejections
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      shutdownHandler("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      // Log only — do not shut down the server for async rejections
    });

    // logger.info('✅ Graceful shutdown handlers registered.');
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Server instantiation with cluster
if (envs.use_cluster_module === "true" && cluster.isPrimary) {
  console.log(`🚀 Primary process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numOfCores; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    if (signal) {
      console.warn(`❌ Worker ${worker.process.pid} was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.warn(`❌ Worker ${worker.process.pid} exited with error code: ${code}`);
    } else {
      console.log(`✅ Worker ${worker.process.pid} success!`);
    }

    // Restart worker if it wasn't an intentional shutdown
    if (!worker.exitedAfterDisconnect) {
      console.log("🔄 Starting a new worker...");
      cluster.fork();
    }
  });

  // Graceful shutdown for primary process
  process.on("SIGTERM", () => {
    console.log("🔄 Primary process received SIGTERM. Shutting down workers...");
    cluster.disconnect(() => {
      console.log("✅ All workers disconnected. Shutting down primary process.");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("🔄 Primary process received SIGINT. Shutting down workers...");
    cluster.disconnect(() => {
      console.log("✅ All workers disconnected. Shutting down primary process.");
      process.exit(0);
    });
  });
} else {
  // Worker process or single process mode
  console.log(`🚀 Worker process ${process.pid} is starting...`);
  startServer();
}

module.exports = server;
