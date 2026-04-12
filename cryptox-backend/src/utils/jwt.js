// src/utils/jwt.js
import jwt from "jsonwebtoken";
import config from "../config/app.js";

/**
 * Sign an access token (short-lived)
 */
export const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/**
 * Sign a refresh token (long-lived)
 */
export const signRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpires });

/**
 * Verify an access token — returns decoded payload or throws
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, config.jwt.secret);

/**
 * Verify a refresh token — returns decoded payload or throws
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, config.jwt.refreshSecret);

/**
 * Build the safe user object returned in every auth response
 */
export const safeUser = (user) => ({
  id:        user.id,
  name:      user.name,
  email:     user.email,
  isAdmin:   user.isAdmin,
  balance:   user.balance,
  portfolio: user.portfolio,
  banned:    user.banned,
  createdAt: user.createdAt,
});
