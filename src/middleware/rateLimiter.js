const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', retryAfter: `${config.rateLimit.windowMs / 1000}s` },
});

module.exports = rateLimiter;
