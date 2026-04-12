// src/config/app.js
import "dotenv/config";

const config = {
  port:       parseInt(process.env.PORT) || 5000,
  nodeEnv:    process.env.NODE_ENV || "development",
  clientUrl:  process.env.CLIENT_URL || "http://localhost:5173",

  jwt: {
    secret:         process.env.JWT_SECRET         || "cryptox_dev_secret",
    expiresIn:      process.env.JWT_EXPIRES_IN     || "7d",
    refreshSecret:  process.env.JWT_REFRESH_SECRET || "cryptox_refresh_dev",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  },

  trading: {
    startingBalance:   parseFloat(process.env.DEMO_STARTING_BALANCE) || 10000,
    feePercent:        parseFloat(process.env.TRADING_FEE_PERCENT)   || 0.001,
    priceTickMs:       parseInt(process.env.PRICE_TICK_INTERVAL_MS)  || 3000,
  },
};

export default config;
