// src/routes/trades.js
import { Router } from "express";
import TradeController from "../controllers/tradeController.js";
import { authenticate } from "../middleware/auth.js";
import { tradeLimiter } from "../middleware/rateLimiter.js";
import { validate, tradeRules } from "../middleware/validate.js";

const router = Router();

// All trade routes require authentication
router.use(authenticate);

/**
 * @route  POST /api/trades
 * @desc   Execute a buy or sell trade
 * @access Private
 * @body   { coinId, type, amount, orderType?, limitPrice? }
 */
router.post(
  "/",
  tradeLimiter,
  tradeRules,
  validate,
  TradeController.execute
);

/**
 * @route  GET /api/trades
 * @desc   Get authenticated user's trade history (paginated)
 * @access Private
 * @query  ?page=1&limit=20
 */
router.get("/", TradeController.getMyTrades);

/**
 * @route  GET /api/trades/:id
 * @desc   Get a single trade by ID
 * @access Private (own trades only, or admin)
 */
router.get("/:id", TradeController.getOne);

export default router;
