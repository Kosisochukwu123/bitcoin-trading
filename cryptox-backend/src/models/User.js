// src/models/User.js
// ─────────────────────────────────────────────────────────────
//  User model — wraps in-memory DB operations for users.
//  Replace db.users with real ORM calls (Mongoose/Prisma) here.
// ─────────────────────────────────────────────────────────────
import db, { uuid } from "../config/database.js";
import bcrypt from "bcryptjs";
import config from "../config/app.js";

const SALT_ROUNDS = 10;

const User = {
  // ── READ ────────────────────────────────────────────────────

  /** Return all users */
  findAll: () => db.users,

  /** Find by id */
  findById: (id) => db.users.find(u => u.id === id) || null,

  /** Find by email */
  findByEmail: (email) =>
    db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null,

  /** All non-admin users */
  findRegular: () => db.users.filter(u => !u.isAdmin),

  // ── WRITE ───────────────────────────────────────────────────

  /** Create a new user, returns sanitized user (no password) */
  create: async ({ name, email, password }) => {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
      id:        uuid(),
      name:      name.trim(),
      email:     email.toLowerCase().trim(),
      password:  hashed,
      isAdmin:   false,
      balance:   config.trading.startingBalance,
      portfolio: {},
      banned:    false,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return user;
  },

  /** Update arbitrary fields on a user */
  update: (id, fields) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], ...fields };
    return db.users[idx];
  },

  /** Adjust balance by delta (positive = credit, negative = debit) */
  adjustBalance: (id, delta) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const newBalance = Math.max(0, db.users[idx].balance + delta);
    db.users[idx] = { ...db.users[idx], balance: newBalance };
    return db.users[idx];
  },

  /**
   * Admin: set/add/subtract balance
   * mode: "add" | "subtract" | "set"
   */
  adminSetBalance: (id, amount, mode) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const current = db.users[idx].balance;
    let newBalance;
    if (mode === "add")      newBalance = current + amount;
    if (mode === "subtract") newBalance = Math.max(0, current - amount);
    if (mode === "set")      newBalance = amount;
    db.users[idx] = { ...db.users[idx], balance: newBalance };
    return db.users[idx];
  },

  /**
   * Admin: set/add/subtract a coin holding in portfolio
   * mode: "add" | "subtract" | "set"
   */
  adminSetPortfolio: (id, coinId, amount, mode) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const port    = { ...db.users[idx].portfolio };
    const current = port[coinId] || 0;
    if (mode === "add")      port[coinId] = current + amount;
    if (mode === "subtract") port[coinId] = Math.max(0, current - amount);
    if (mode === "set")      port[coinId] = amount;
    db.users[idx] = { ...db.users[idx], portfolio: port };
    return db.users[idx];
  },

  /** Reset user to starting state */
  reset: (id) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = {
      ...db.users[idx],
      balance:   config.trading.startingBalance,
      portfolio: {},
    };
    return db.users[idx];
  },

  /** Toggle banned flag */
  setBanned: (id, banned) => {
    const idx = db.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    db.users[idx] = { ...db.users[idx], banned };
    return db.users[idx];
  },

  // ── AUTH HELPERS ────────────────────────────────────────────

  /** Compare plain password against hash */
  verifyPassword: (plain, hash) => bcrypt.compare(plain, hash),

  /** Strip password from user object */
  sanitize: (user) => {
    const { password, ...safe } = user;
    return safe;
  },
};

export default User;
