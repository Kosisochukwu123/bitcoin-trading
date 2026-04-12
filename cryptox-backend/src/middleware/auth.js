// src/middleware/auth.js
import { verifyAccessToken } from "../utils/jwt.js";
import { unauthorized, forbidden } from "../utils/response.js";
import db from "../config/database.js";

/**
 * authenticate
 * Verifies the Bearer JWT and attaches req.user (full user object from DB).
 * Rejects banned users.
 */
export const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized(res, "No token provided");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    const user    = db.users.find(u => u.id === decoded.id);

    if (!user) return unauthorized(res, "User not found");
    if (user.banned) return forbidden(res, "Your account has been suspended");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return unauthorized(res, "Token expired — please refresh");
    }
    return unauthorized(res, "Invalid token");
  }
};

/**
 * requireAdmin
 * Must be used AFTER authenticate.
 * Blocks non-admin users from admin-only routes.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return forbidden(res, "Admin access required");
  }
  next();
};
