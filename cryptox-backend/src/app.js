// src/app.js
// ─────────────────────────────────────────────────────────────
//  Express application factory.
//  Separated from server.js so it can be imported by tests.
// ─────────────────────────────────────────────────────────────
import express  from "express";
import cors     from "cors";
import helmet   from "helmet";
import morgan   from "morgan";
import config   from "./config/app.js";
import routes   from "./routes/index.js";
import errorHandler, { notFoundHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();

// ── SECURITY HEADERS ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── REQUEST LOGGING ──────────────────────────────────────────
if (config.nodeEnv !== "test") {
  app.use(morgan(config.nodeEnv === "development" ? "dev" : "combined"));
}

// ── BODY PARSING ─────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── GLOBAL RATE LIMIT ────────────────────────────────────────
app.use("/api", apiLimiter);

// ── ROUTES ───────────────────────────────────────────────────
app.use("/api", routes);

// ── ROOT ─────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name:        "CryptoX Trading Platform API",
    version:     "1.0.0",
    description: "School project — demo crypto trading backend",
    docs:        "See README.md for full API reference",
    endpoints: {
      health:    "GET  /api/health",
      auth:      "POST /api/auth/register  |  POST /api/auth/login",
      market:    "GET  /api/market",
      trades:    "POST /api/trades  |  GET /api/trades",
      portfolio: "GET  /api/portfolio",
      admin:     "GET  /api/admin/stats  (admin token required)",
    },
  });
});

// ── 404 ──────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use(errorHandler);

export default app;
