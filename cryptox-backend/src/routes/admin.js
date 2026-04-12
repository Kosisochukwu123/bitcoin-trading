// src/routes/admin.js
import { Router } from "express";
import AdminController from "../controllers/adminController.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  validate,
  fundBalanceRules,
  fundPortfolioRules,
  priceRules,
  overrideRules,
} from "../middleware/validate.js";

const router = Router();

// Every admin route requires a valid token AND admin role
router.use(authenticate, requireAdmin);

// ── PLATFORM STATS ───────────────────────────────────────────
/**
 * @route  GET /api/admin/stats
 * @desc   Platform-wide stats (users, trades, volume, overrides)
 * @access Admin
 */
router.get("/stats", AdminController.getStats);

// ── USER MANAGEMENT ─────────────────────────────────────────
/**
 * @route  GET /api/admin/users
 * @desc   All regular users with portfolio values and trade counts
 * @access Admin
 */
router.get("/users", AdminController.getUsers);

/**
 * @route  GET /api/admin/users/:userId
 * @desc   Single user — full detail including recent trades
 * @access Admin
 */
router.get("/users/:userId", AdminController.getUser);

/**
 * @route  PATCH /api/admin/users/:userId/balance
 * @desc   Credit, debit, or set a user's USDT balance
 * @access Admin
 * @body   { amount: number, mode: "add"|"subtract"|"set" }
 */
router.patch(
  "/users/:userId/balance",
  fundBalanceRules,
  validate,
  AdminController.updateBalance
);

/**
 * @route  PATCH /api/admin/users/:userId/portfolio
 * @desc   Grant, remove, or set crypto in a user's portfolio
 * @access Admin
 * @body   { coinId, amount, mode: "add"|"subtract"|"set" }
 */
router.patch(
  "/users/:userId/portfolio",
  fundPortfolioRules,
  validate,
  AdminController.updatePortfolio
);

/**
 * @route  POST /api/admin/users/:userId/reset
 * @desc   Reset user to $10,000 balance, empty portfolio, cleared trades
 * @access Admin
 */
router.post("/users/:userId/reset", AdminController.resetUser);

/**
 * @route  PATCH /api/admin/users/:userId/ban
 * @desc   Ban or unban a user
 * @access Admin
 * @body   { banned: boolean }
 */
router.patch("/users/:userId/ban", AdminController.setBanned);

// ── TRADE OVERRIDES ─────────────────────────────────────────
/**
 * @route  PATCH /api/admin/users/:userId/override
 * @desc   Set a user's trade outcome override
 * @access Admin
 * @body   { override: "none"|"force_profit"|"force_loss"|"force_fail" }
 */
router.patch(
  "/users/:userId/override",
  overrideRules,
  validate,
  AdminController.setOverride
);

/**
 * @route  GET /api/admin/overrides
 * @desc   Get all active override settings
 * @access Admin
 */
router.get("/overrides", AdminController.getOverrides);

// ── TRADE HISTORY ────────────────────────────────────────────
/**
 * @route  GET /api/admin/trades
 * @desc   All platform trades, paginated
 * @access Admin
 * @query  ?page=1&limit=50
 */
router.get("/trades", AdminController.getTrades);

// ── PRICE CONTROL ────────────────────────────────────────────
/**
 * @route  PATCH /api/admin/coins/:coinId/price
 * @desc   Manually set a coin's market price
 * @access Admin
 * @body   { price: number }
 */
router.patch(
  "/coins/:coinId/price",
  priceRules,
  validate,
  AdminController.setCoinPrice
);

export default router;
