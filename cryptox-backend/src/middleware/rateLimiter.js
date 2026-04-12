// src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import { error } from "../utils/response.js";

/**
 * General API limiter — 100 req / 15 min
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    error(res, "Too many requests — slow down and try again later", 429),
});

/**
 * Auth limiter — stricter: 10 attempts / 15 min
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    error(res, "Too many login attempts — try again in 15 minutes", 429),
});

/**
 * Trade limiter — 60 trades / min (prevents flooding)
 */
export const tradeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    error(res, "Trade rate limit exceeded — max 60 trades per minute", 429),
});
