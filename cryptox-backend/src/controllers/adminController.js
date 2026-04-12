// src/controllers/adminController.js
import AdminService  from "../services/adminService.js";
import Trade         from "../models/Trade.js";
import { ok, error } from "../utils/response.js";

const AdminController = {
  // ── PLATFORM STATS ───────────────────────────────────────────

  /**
   * GET /api/admin/stats
   */
  getStats: (_req, res, next) => {
    try {
      const stats = AdminService.getStats();
      return ok(res, stats, "Stats fetched");
    } catch (err) {
      next(err);
    }
  },

  // ── USER MANAGEMENT ─────────────────────────────────────────

  /**
   * GET /api/admin/users
   * All regular users with stats
   */
  getUsers: (_req, res, next) => {
    try {
      const users = AdminService.getAllUsers();
      return ok(res, users, "Users fetched");
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/users/:userId
   */
  getUser: (req, res, next) => {
    try {
      const user = AdminService.getUser(req.params.userId);
      if (!user) return error(res, "User not found", 404);
      return ok(res, user, "User fetched");
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/users/:userId/balance
   * Body: { amount, mode }   mode: "add" | "subtract" | "set"
   */
  updateBalance: (req, res, next) => {
    try {
      const { userId } = req.params;
      const { amount, mode } = req.body;
      const user = AdminService.updateBalance(userId, parseFloat(amount), mode);
      return ok(res, user, `Balance ${mode === "add" ? "credited" : mode === "subtract" ? "debited" : "set"} successfully`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/users/:userId/portfolio
   * Body: { coinId, amount, mode }
   */
  updatePortfolio: (req, res, next) => {
    try {
      const { userId } = req.params;
      const { coinId, amount, mode } = req.body;
      const user = AdminService.updatePortfolio(userId, coinId, parseFloat(amount), mode);
      return ok(res, user, `Portfolio updated — ${mode} ${amount} ${coinId}`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/users/:userId/reset
   * Resets balance to $10,000 and clears portfolio + trade history
   */
  resetUser: (req, res, next) => {
    try {
      const result = AdminService.resetUser(req.params.userId);
      return ok(res, result, "User account reset successfully");
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/users/:userId/ban
   * Body: { banned: true | false }
   */
  setBanned: (req, res, next) => {
    try {
      const { userId } = req.params;
      const banned = Boolean(req.body.banned);
      const user = AdminService.setBanned(userId, banned);
      return ok(res, user, `User ${banned ? "banned" : "unbanned"} successfully`);
    } catch (err) {
      next(err);
    }
  },

  // ── TRADE OVERRIDES ─────────────────────────────────────────

  /**
   * PATCH /api/admin/users/:userId/override
   * Body: { override }  "none" | "force_profit" | "force_loss" | "force_fail"
   */
  setOverride: (req, res, next) => {
    try {
      const result = AdminService.setOverride(req.params.userId, req.body.override);
      return ok(res, result, `Override set to '${req.body.override}'`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/overrides
   * Returns all active overrides { [userId]: override }
   */
  getOverrides: (_req, res) => {
    return ok(res, AdminService.getOverrides(), "Overrides fetched");
  },

  // ── TRADE HISTORY ────────────────────────────────────────────

  /**
   * GET /api/admin/trades?page=1&limit=50
   */
  getTrades: (req, res, next) => {
    try {
      const result = Trade.paginate(req.query);
      return ok(res, result, "Trades fetched");
    } catch (err) {
      next(err);
    }
  },

  // ── PRICE CONTROL ────────────────────────────────────────────

  /**
   * PATCH /api/admin/coins/:coinId/price
   * Body: { price }
   */
  setCoinPrice: (req, res, next) => {
    try {
      const coin = AdminService.setCoinPrice(req.params.coinId, parseFloat(req.body.price));
      return ok(res, coin, `${req.params.coinId} price updated to $${req.body.price}`);
    } catch (err) {
      next(err);
    }
  },
};

export default AdminController;
