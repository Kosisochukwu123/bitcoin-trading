// src/controllers/portfolioController.js
import PortfolioService from "../services/portfolioService.js";
import { ok } from "../utils/response.js";

const PortfolioController = {
  /**
   * GET /api/portfolio
   * Returns full portfolio summary for the authenticated user
   */
  getSummary: (req, res, next) => {
    try {
      const summary = PortfolioService.getSummary(req.user.id);
      return ok(res, summary, "Portfolio fetched");
    } catch (err) {
      next(err);
    }
  },
};

export default PortfolioController;
