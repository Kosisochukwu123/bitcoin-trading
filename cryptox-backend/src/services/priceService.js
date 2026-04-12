// src/services/priceService.js
// ─────────────────────────────────────────────────────────────
//  Simulates live market price ticks every N milliseconds.
//  In production you'd replace this with a real exchange
//  WebSocket feed (Binance WS, CoinGecko, etc.)
// ─────────────────────────────────────────────────────────────
import Coin   from "../models/Coin.js";
import config from "../config/app.js";
import logger from "../utils/logger.js";

let tickInterval = null;

const PriceService = {
  /**
   * Start the background price ticker
   */
  start: () => {
    if (tickInterval) return; // already running
    tickInterval = setInterval(() => {
      Coin.tick();
    }, config.trading.priceTickMs);
    logger.info(`PriceService started — ticking every ${config.trading.priceTickMs}ms`);
  },

  /**
   * Stop the ticker (useful for tests / graceful shutdown)
   */
  stop: () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
      logger.info("PriceService stopped");
    }
  },

  /**
   * Get current snapshot of all coin prices
   */
  getSnapshot: () => Coin.findAll(),
};

export default PriceService;
