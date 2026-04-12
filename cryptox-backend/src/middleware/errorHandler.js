// src/middleware/errorHandler.js
import logger from "../utils/logger.js";

/**
 * Global error handler — must be registered LAST in Express.
 * Catches anything thrown/passed to next(err).
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} →`, err.message);

  // JWT errors (already handled in auth middleware, but safety net)
  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ success: false, message: "Invalid token" });

  if (err.name === "TokenExpiredError")
    return res.status(401).json({ success: false, message: "Token expired" });

  // Default 500
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches any unmatched routes
 */
export const notFoundHandler = (req, res) =>
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });

export default errorHandler;
