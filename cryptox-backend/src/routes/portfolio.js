// src/routes/portfolio.js
import { Router } from "express";
import PortfolioController from "../controllers/portfolioController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

/**
 * @route  GET /api/portfolio
 * @desc   Get full portfolio summary for the authenticated user
 *         (holdings, valuations, allocations, trade stats)
 * @access Private
 */
router.get("/", PortfolioController.getSummary);

export default router;
