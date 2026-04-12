// src/services/tradeService.js
import Trade from "../models/Trade.js";
import User  from "../models/User.js";
import Coin  from "../models/Coin.js";
import db    from "../config/database.js";
import config from "../config/app.js";

const TradeService = {
  /**
   * Execute a trade for a user.
   *
   * Admin overrides (set via AdminService.setOverride):
   *   "none"         → standard behaviour
   *   "force_profit" → user receives 8% bonus coins/value
   *   "force_loss"   → user receives 8% fewer coins/value
   *   "force_fail"   → trade rejected with error
   *
   * Returns the created trade record.
   */
  execute: ({ userId, coinId, type, amount, orderType, limitPrice }) => {
    // 1. Resolve coin
    const coin = Coin.findById(coinId);
    if (!coin) {
      const err = new Error(`Coin '${coinId}' not found`);
      err.status = 404;
      throw err;
    }

    // 2. Determine execution price
    const price =
      orderType === "limit" && limitPrice
        ? parseFloat(limitPrice)
        : coin.price;

    const total = parseFloat((amount * price).toFixed(6));
    const fee   = parseFloat((total * config.trading.feePercent).toFixed(6));

    // 3. Check admin override
    const override = db.overrides[userId] || "none";

    if (override === "force_fail") {
      const err = new Error("Trade failed: Insufficient liquidity");
      err.status = 422;
      throw err;
    }

    // 4. Resolve result type and multiplier
    const resultType =
      override === "force_profit" ? "profit" :
      override === "force_loss"   ? "loss"   : "normal";

    const mult =
      resultType === "profit" ? 1.08 :
      resultType === "loss"   ? 0.92 : 1.0;

    // 5. Validate user has sufficient funds / coins
    const user = User.findById(userId);
    if (!user) throw new Error("User not found");

    if (type === "buy") {
      const cost = total + fee;
      if (user.balance < cost) {
        const err = new Error(`Insufficient balance. Need $${cost.toFixed(2)}, have $${user.balance.toFixed(2)}`);
        err.status = 422;
        throw err;
      }
    } else {
      const holding = user.portfolio[coinId] || 0;
      if (holding < amount) {
        const err = new Error(`Insufficient ${coinId}. Need ${amount}, have ${holding.toFixed(6)}`);
        err.status = 422;
        throw err;
      }
    }

    // 6. Update user balance + portfolio
    if (type === "buy") {
      User.adjustBalance(userId, -(total + fee));
      User.adminSetPortfolio(userId, coinId, amount * mult, "add");
    } else {
      User.adjustBalance(userId, (total * mult) - fee);
      User.adminSetPortfolio(userId, coinId, amount, "subtract");
    }

    // 7. Record trade
    const trade = Trade.create({
      userId,
      coin: coinId,
      type,
      amount,
      price,
      total,
      orderType: orderType || "market",
      resultType,
    });

    // 8. Return trade + updated user (without password)
    const updatedUser = User.findById(userId);
    return { trade, user: User.sanitize(updatedUser) };
  },

  /**
   * Get paginated trade history for a user
   */
  getUserTrades: (userId, { page, limit } = {}) => {
    const all   = Trade.findByUserId(userId);
    const p     = parseInt(page)  || 1;
    const l     = parseInt(limit) || 20;
    const start = (p - 1) * l;
    return {
      data:  all.slice(start, start + l),
      total: all.length,
      page:  p,
      limit: l,
      pages: Math.ceil(all.length / l),
    };
  },
};

export default TradeService;
