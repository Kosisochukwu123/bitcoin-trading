// src/utils/response.js

/**
 * Send a successful response
 * @param {object} res   - Express response
 * @param {*}      data  - Payload
 * @param {string} message
 * @param {number} status - HTTP status (default 200)
 */
export const ok = (res, data = null, message = "Success", status = 200) =>
  res.status(status).json({ success: true, message, data });

/**
 * Send a created (201) response
 */
export const created = (res, data = null, message = "Created") =>
  res.status(201).json({ success: true, message, data });

/**
 * Send an error response
 * @param {object} res
 * @param {string} message
 * @param {number} status - HTTP status (default 400)
 * @param {*}      errors - Optional validation errors
 */
export const error = (res, message = "An error occurred", status = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

/**
 * 401 Unauthorized
 */
export const unauthorized = (res, message = "Unauthorized") =>
  error(res, message, 401);

/**
 * 403 Forbidden
 */
export const forbidden = (res, message = "Forbidden") =>
  error(res, message, 403);

/**
 * 404 Not Found
 */
export const notFound = (res, message = "Not found") =>
  error(res, message, 404);

/**
 * 500 Internal Server Error
 */
export const serverError = (res, message = "Internal server error") =>
  error(res, message, 500);
