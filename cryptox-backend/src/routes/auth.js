// src/routes/auth.js
import { Router } from "express";
import AuthController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { validate, registerRules, loginRules } from "../middleware/validate.js";

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Create a new user account
 * @access Public
 */
router.post(
  "/register",
  authLimiter,
  registerRules,
  validate,
  AuthController.register
);

/**
 * @route  POST /api/auth/login
 * @desc   Login with email + password, returns tokens
 * @access Public
 */
router.post(
  "/login",
  authLimiter,
  loginRules,
  validate,
  AuthController.login
);

/**
 * @route  POST /api/auth/refresh
 * @desc   Exchange a refresh token for a new access token
 * @access Public (token-protected)
 * @body   { refreshToken }
 */
router.post("/refresh", AuthController.refresh);

/**
 * @route  POST /api/auth/logout
 * @desc   Invalidate refresh token
 * @access Public
 * @body   { refreshToken }
 */
router.post("/logout", AuthController.logout);

/**
 * @route  GET /api/auth/me
 * @desc   Get the currently authenticated user's profile
 * @access Private
 */
router.get("/me", authenticate, AuthController.me);

export default router;
