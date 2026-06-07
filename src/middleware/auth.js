const config = require('../config/env');

function authMiddleware(req, res, next) {
  if (!config.apiKey) return next();

  const key = req.headers['x-api-key'];
  if (!key || key !== config.apiKey) {
    return res.status(401).json({ error: 'Unauthorized', message: 'x-api-key header required' });
  }
  next();
}

module.exports = authMiddleware;
