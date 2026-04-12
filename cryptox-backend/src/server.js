// src/server.js
// ─────────────────────────────────────────────────────────────
//  Entry point — boots the Express server and all services.
//  Run:  npm run dev   (nodemon)
//        npm start     (production)
// ─────────────────────────────────────────────────────────────
import "dotenv/config";
import app          from "./app.js";
import config       from "./config/app.js";
import PriceService from "./services/priceService.js";
import logger       from "./utils/logger.js";

const PORT = config.port;

// ── START HTTP SERVER ────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`═══════════════════════════════════════════`);
  logger.info(`  CryptoX API  —  ${config.nodeEnv.toUpperCase()}`);
  logger.info(`  Listening on http://localhost:${PORT}`);
  logger.info(`  Client origin: ${config.clientUrl}`);
  logger.info(`═══════════════════════════════════════════`);

  // Start live price simulation
  PriceService.start();
});

// ── GRACEFUL SHUTDOWN ────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`\n${signal} received — shutting down gracefully…`);
  PriceService.stop();
  server.close(() => {
    logger.info("HTTP server closed. Bye 👋");
    process.exit(0);
  });
  // Force-quit if server hangs beyond 10s
  setTimeout(() => process.exit(1), 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ── UNHANDLED ERRORS ─────────────────────────────────────────
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

export default server;
