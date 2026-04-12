// src/controllers/authController.js
import AuthService from "../services/authService.js";
import { ok, created, error } from "../utils/response.js";
import { safeUser } from "../utils/jwt.js";
import User from "../models/User.js";

const AuthController = {
  /**
   * POST /api/auth/register
   */
  register: async (req, res, next) => {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register({ name, email, password });
      return created(res, result, "Account created successfully");
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login({ email, password });
      return ok(res, result, "Login successful");
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/refresh
   * Body: { refreshToken }
   */
  refresh: (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken)
        return error(res, "refreshToken is required", 400);
      const tokens = AuthService.refresh(refreshToken);
      return ok(res, tokens, "Token refreshed");
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/logout
   * Body: { refreshToken }
   */
  logout: (req, res) => {
    const { refreshToken } = req.body;
    AuthService.logout(refreshToken);
    return ok(res, null, "Logged out successfully");
  },

  /**
   * GET /api/auth/me   (requires authenticate middleware)
   */
  me: (req, res) => {
    // req.user is attached by authenticate middleware
    // Re-fetch to get latest balance/portfolio
    const user = User.findById(req.user.id);
    return ok(res, User.sanitize(user), "Profile fetched");
  },
};

export default AuthController;
