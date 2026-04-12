// src/middleware/validate.js
import { body, param, validationResult } from "express-validator";
import { error } from "../utils/response.js";

/**
 * validate
 * Run after express-validator chains.
 * Returns 422 with field errors if validation fails.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, "Validation failed", 422, errors.array());
  }
  next();
};

// ── AUTH ────────────────────────────────────────────────────
export const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters"),

  body("email")
    .trim()
    .isEmail().withMessage("Valid email required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── TRADE ────────────────────────────────────────────────────
export const tradeRules = [
  body("coinId")
    .notEmpty().withMessage("coinId is required")
    .isString().withMessage("coinId must be a string")
    .isUppercase().withMessage("coinId must be uppercase e.g. BTC"),

  body("type")
    .isIn(["buy", "sell"]).withMessage("type must be 'buy' or 'sell'"),

  body("amount")
    .isFloat({ gt: 0 }).withMessage("amount must be a positive number"),

  body("orderType")
    .optional()
    .isIn(["market", "limit", "stop_limit"]).withMessage("Invalid orderType"),

  body("limitPrice")
    .optional()
    .isFloat({ gt: 0 }).withMessage("limitPrice must be a positive number"),
];

// ── ADMIN: FUND USER ─────────────────────────────────────────
export const fundBalanceRules = [
  param("userId").notEmpty().withMessage("userId param is required"),

  body("amount")
    .isFloat({ gt: 0 }).withMessage("amount must be a positive number"),

  body("mode")
    .isIn(["add", "subtract", "set"]).withMessage("mode must be add | subtract | set"),
];

export const fundPortfolioRules = [
  param("userId").notEmpty().withMessage("userId param is required"),

  body("coinId")
    .notEmpty().withMessage("coinId is required")
    .isUppercase().withMessage("coinId must be uppercase"),

  body("amount")
    .isFloat({ gt: 0 }).withMessage("amount must be a positive number"),

  body("mode")
    .isIn(["add", "subtract", "set"]).withMessage("mode must be add | subtract | set"),
];

// ── ADMIN: PRICE ─────────────────────────────────────────────
export const priceRules = [
  param("coinId").notEmpty().withMessage("coinId param is required"),

  body("price")
    .isFloat({ gt: 0 }).withMessage("price must be a positive number"),
];

// ── ADMIN: OVERRIDE ──────────────────────────────────────────
export const overrideRules = [
  param("userId").notEmpty().withMessage("userId param is required"),

  body("override")
    .isIn(["none", "force_profit", "force_loss", "force_fail"])
    .withMessage("override must be none | force_profit | force_loss | force_fail"),
];
