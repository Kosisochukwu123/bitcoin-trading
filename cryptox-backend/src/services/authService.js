// src/services/authService.js
import User from "../models/User.js";
import db from "../config/database.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  safeUser,
} from "../utils/jwt.js";

const AuthService = {
  /**
   * Register a new user
   * Returns { user, accessToken, refreshToken }
   */
  register: async ({ name, email, password }) => {
    // Check duplicate email
    if (User.findByEmail(email)) {
      const err = new Error("Email is already registered");
      err.status = 409;
      throw err;
    }

    const user         = await User.create({ name, email, password });
    const accessToken  = signAccessToken({ id: user.id, isAdmin: user.isAdmin });
    const refreshToken = signRefreshToken({ id: user.id });

    // Store refresh token
    db.refreshTokens[refreshToken] = user.id;

    return { user: User.sanitize(user), accessToken, refreshToken };
  },

  /**
   * Login
   * Returns { user, accessToken, refreshToken }
   */
  login: async ({ email, password }) => {
    const user = User.findByEmail(email);
    if (!user) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    if (user.banned) {
      const err = new Error("Your account has been suspended");
      err.status = 403;
      throw err;
    }

    const valid = await User.verifyPassword(password, user.password);
    if (!valid) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    const accessToken  = signAccessToken({ id: user.id, isAdmin: user.isAdmin });
    const refreshToken = signRefreshToken({ id: user.id });

    db.refreshTokens[refreshToken] = user.id;

    return { user: User.sanitize(user), accessToken, refreshToken };
  },

  /**
   * Refresh access token using a valid refresh token
   */
  refresh: (refreshToken) => {
    if (!refreshToken || !db.refreshTokens[refreshToken]) {
      const err = new Error("Invalid refresh token");
      err.status = 401;
      throw err;
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user    = User.findById(decoded.id);
      if (!user) throw new Error("User not found");

      const newAccess  = signAccessToken({ id: user.id, isAdmin: user.isAdmin });
      const newRefresh = signRefreshToken({ id: user.id });

      // Rotate refresh token
      delete db.refreshTokens[refreshToken];
      db.refreshTokens[newRefresh] = user.id;

      return { accessToken: newAccess, refreshToken: newRefresh };
    } catch {
      const err = new Error("Refresh token expired or invalid — please log in again");
      err.status = 401;
      throw err;
    }
  },

  /**
   * Logout — invalidate refresh token
   */
  logout: (refreshToken) => {
    if (refreshToken && db.refreshTokens[refreshToken]) {
      delete db.refreshTokens[refreshToken];
    }
  },
};

export default AuthService;
