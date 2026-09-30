const rateLimit = require("express-rate-limit");

const make = (windowMs, limit, message, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
    ...extra,
  });

// 10 failed logins per IP per 15 minutes (successful logins don't count)
const loginLimiter = make(
  15 * 60 * 1000,
  10,
  "Too many login attempts. Please try again in 15 minutes.",
  { skipSuccessfulRequests: true }
);

// 20 signups per IP per hour
const signupLimiter = make(
  60 * 60 * 1000,
  20,
  "Too many signups from this network. Please try again later."
);

module.exports = { loginLimiter, signupLimiter };