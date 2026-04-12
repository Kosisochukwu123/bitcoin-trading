// src/routes/index.js
// ─────────────────────────────────────────────────────────────
//  Central router — mounts all sub-routers under /api
// ─────────────────────────────────────────────────────────────
import { Router } from "express";
import authRoutes      from "./auth.js";
import tradeRoutes     from "./trades.js";
import marketRoutes    from "./market.js";
import portfolioRoutes from "./portfolio.js";
import adminRoutes     from "./admin.js";

const router = Router();

// Health-check — no auth required
router.get("/health", (_req, res) =>
  res.json({
    success: true,
    message: "CryptoX API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
);

// Mount routers
router.use("/auth",      authRoutes);
router.use("/trades",    tradeRoutes);
router.use("/market",    marketRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/admin",     adminRoutes);

export default router;
