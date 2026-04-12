// src/models/Trade.js
import db, { uuid } from "../config/database.js";

const Trade = {
  // ── READ ────────────────────────────────────────────────────

  findAll: () => db.trades,

  findById: (id) => db.trades.find(t => t.id === id) || null,

  findByUserId: (userId) => db.trades.filter(t => t.userId === userId),

  /** Paginate all trades (admin) */
  paginate: ({ page = 1, limit = 50 } = {}) => {
    const total = db.trades.length;
    const start = (page - 1) * limit;
    const data  = db.trades.slice(start, start + limit);
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  },

  /** Aggregate platform volume and trade count */
  stats: () => ({
    totalTrades:  db.trades.length,
    totalVolume:  db.trades.reduce((s, t) => s + t.total, 0),
    buyCount:     db.trades.filter(t => t.type === "buy").length,
    sellCount:    db.trades.filter(t => t.type === "sell").length,
  }),

  // ── WRITE ───────────────────────────────────────────────────

  create: ({ userId, coin, type, amount, price, total, orderType, resultType }) => {
    const trade = {
      id:         uuid(),
      userId,
      coin,
      type,         // "buy" | "sell"
      amount,
      price,
      total,
      orderType:  orderType || "market",
      resultType: resultType || "normal", // "normal" | "profit" | "loss"
      fee:        parseFloat((total * 0.001).toFixed(6)),
      status:     "completed",
      createdAt:  new Date().toISOString(),
    };
    db.trades.unshift(trade);  // newest first
    return trade;
  },

  /** Delete all trades for a user (used in admin reset) */
  deleteByUserId: (userId) => {
    const before = db.trades.length;
    db.trades = db.trades.filter(t => t.userId !== userId);
    return before - db.trades.length; // count deleted
  },
};

export default Trade;
