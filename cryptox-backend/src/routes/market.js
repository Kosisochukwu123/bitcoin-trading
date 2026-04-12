// src/routes/market.js
import { Router } from "express";
import MarketController from "../controllers/marketController.js";

const router = Router();

/**
 * @route  GET /api/market
 * @desc   Get all coins with live prices
 * @access Public
 */
router.get("/", MarketController.getAll);

/**
 * @route  GET /api/market/snapshot
 * @desc   Live price snapshot (for polling)
 * @access Public
 */
router.get("/snapshot", MarketController.snapshot);

/**
 * @route  GET /api/market/:coinId
 * @desc   Get a single coin by ID (e.g. BTC, ETH)
 * @access Public
 */
router.get("/:coinId", MarketController.getOne);

export default router;
