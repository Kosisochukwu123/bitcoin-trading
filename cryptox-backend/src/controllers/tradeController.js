// src/controllers/tradeController.js
import TradeService from "../services/tradeService.js";
import Trade        from "../models/Trade.js";
import { ok, error } from "../utils/response.js";

const TradeController = {
  /**
   * POST /api/trades
   * Body: { coinId, type, amount, orderType?, limitPrice? }
   */
  execute: (req, res, next) => {
    try {
      const { coinId, type, amount, orderType, limitPrice } = req.body;
      const result = TradeService.execute({
        userId:     req.user.id,
        coinId,
        type,
        amount:     parseFloat(amount),
        orderType,
        limitPrice: limitPrice ? parseFloat(limitPrice) : null,
      });
      return ok(res, result, `${type === "buy" ? "Buy" : "Sell"} order executed`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/trades
   * Query: ?page=1&limit=20
   * Returns authenticated user's trade history
   */
  getMyTrades: (req, res, next) => {
    try {
      const result = TradeService.getUserTrades(req.user.id, req.query);
      return ok(res, result, "Trades fetched");
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/trades/:id
   * Returns a single trade (must belong to user, or user is admin)
   */
  getOne: (req, res) => {
    const trade = Trade.findById(req.params.id);
    if (!trade) return error(res, "Trade not found", 404);
    if (trade.userId !== req.user.id && !req.user.isAdmin)
      return error(res, "Forbidden", 403);
    return ok(res, trade, "Trade fetched");
  },
};

export default TradeController;
