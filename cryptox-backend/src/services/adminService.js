// src/services/adminService.js
import User  from "../models/User.js";
import Trade from "../models/Trade.js";
import Coin  from "../models/Coin.js";
import db    from "../config/database.js";

const AdminService = {
  // ── USER MANAGEMENT ─────────────────────────────────────────

  /**
   * Get all regular (non-admin) users with stats
   */
  getAllUsers: () => {
    const coins = Coin.findAll();
    return User.findRegular().map(u => {
      const { password, ...safe } = u;
      const portVal = Object.entries(u.portfolio || {}).reduce((sum, [id, amt]) => {
        const coin = coins.find(c => c.id === id);
        return sum + (coin ? coin.price * amt : 0);
      }, 0);
      const tradeCount = Trade.findByUserId(u.id).length;
      return { ...safe, portfolioValue: portVal, tradeCount, override: db.overrides[u.id] || "none" };
    });
  },

  /**
   * Get single user with full stats
   */
  getUser: (userId) => {
    const user = User.findById(userId);
    if (!user) return null;
    const { password, ...safe } = user;
    const coins  = Coin.findAll();
    const portVal = Object.entries(user.portfolio || {}).reduce((sum, [id, amt]) => {
      const coin = coins.find(c => c.id === id);
      return sum + (coin ? coin.price * amt : 0);
    }, 0);
    const trades = Trade.findByUserId(userId);
    return {
      ...safe,
      portfolioValue: portVal,
      tradeCount:     trades.length,
      recentTrades:   trades.slice(0, 10),
      override:       db.overrides[userId] || "none",
    };
  },

  /**
   * Credit / debit / set a user's USDT balance
   * mode: "add" | "subtract" | "set"
   */
  updateBalance: (userId, amount, mode) => {
    const user = User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (user.isAdmin) {
      const err = new Error("Cannot modify admin balance");
      err.status = 403;
      throw err;
    }
    const updated = User.adminSetBalance(userId, amount, mode);
    const { password, ...safe } = updated;
    return safe;
  },

  /**
   * Grant / remove / set crypto in a user's portfolio
   * mode: "add" | "subtract" | "set"
   */
  updatePortfolio: (userId, coinId, amount, mode) => {
    const user = User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    const coin = Coin.findById(coinId);
    if (!coin) {
      const err = new Error(`Coin '${coinId}' not found`);
      err.status = 404;
      throw err;
    }
    const updated = User.adminSetPortfolio(userId, coinId, amount, mode);
    const { password, ...safe } = updated;
    return safe;
  },

  /**
   * Reset user account to default state
   */
  resetUser: (userId) => {
    const user = User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    const deleted = Trade.deleteByUserId(userId);
    const reset   = User.reset(userId);
    delete db.overrides[userId];
    const { password, ...safe } = reset;
    return { user: safe, tradesDeleted: deleted };
  },

  /**
   * Ban or unban a user
   */
  setBanned: (userId, banned) => {
    const user = User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (user.isAdmin) {
      const err = new Error("Cannot ban an admin account");
      err.status = 403;
      throw err;
    }
    const updated = User.setBanned(userId, banned);
    const { password, ...safe } = updated;
    return safe;
  },

  // ── TRADE OVERRIDES ─────────────────────────────────────────

  /**
   * Set trade outcome override for a user
   * override: "none" | "force_profit" | "force_loss" | "force_fail"
   */
  setOverride: (userId, override) => {
    const user = User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    db.overrides[userId] = override;
    return { userId, override };
  },

  getOverrides: () => db.overrides,

  // ── PRICE CONTROL ────────────────────────────────────────────

  /**
   * Manually set a coin's price
   */
  setCoinPrice: (coinId, price) => {
    const coin = Coin.findById(coinId);
    if (!coin) {
      const err = new Error(`Coin '${coinId}' not found`);
      err.status = 404;
      throw err;
    }
    return Coin.setPrice(coinId, price);
  },

  // ── PLATFORM STATS ───────────────────────────────────────────

  getStats: () => {
    const tradeStats = Trade.stats();
    const userCount  = User.findRegular().length;
    const activeOvrs = Object.values(db.overrides).filter(v => v && v !== "none").length;
    return { ...tradeStats, userCount, activeOverrides: activeOvrs };
  },
};

export default AdminService;
