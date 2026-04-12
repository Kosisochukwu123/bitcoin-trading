// src/utils/logger.js
// Simple console logger. Swap for Winston/Pino in production.

const timestamp = () => new Date().toISOString();

const logger = {
  info:  (...args) => console.log(`[${timestamp()}] INFO  `, ...args),
  warn:  (...args) => console.warn(`[${timestamp()}] WARN  `, ...args),
  error: (...args) => console.error(`[${timestamp()}] ERROR `, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[${timestamp()}] DEBUG `, ...args);
    }
  },
};

export default logger;
