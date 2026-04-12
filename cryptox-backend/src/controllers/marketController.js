// src/controllers/marketController.js
import Coin          from "../models/Coin.js";
import PriceService  from "../services/priceService.js";
import { ok, error } from "../utils/response.js";

const MarketController = {
  /**
   * GET /api/market
   * Returns all coins with live prices
   */
  getAll: (_req, res) => {
    const coins = Coin.findAll();
    return ok(res, coins, "Market data fetched");
  },

  /**
   * GET /api/market/:coinId
   * Returns a single coin
   */
  getOne: (req, res) => {
    const coin = Coin.findById(req.params.coinId.toUpperCase());
    if (!coin) return error(res, `Coin '${req.params.coinId}' not found`, 404);
    return ok(res, coin, "Coin fetched");
  },

  /**
   * GET /api/market/snapshot
   * Alias — same as getAll, useful for polling clients
   */
  snapshot: (_req, res) => {
    const snapshot = PriceService.getSnapshot();
    return ok(res, snapshot, "Price snapshot");
  },
};

export default MarketController;
