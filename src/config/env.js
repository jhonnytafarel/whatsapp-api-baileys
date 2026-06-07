require('dotenv/config');

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  apiKey: process.env.API_KEY || null,
  authDir: process.env.AUTH_DIR || './auth_info',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 30,
  },
  baileys: {
    browser: (process.env.BAILEYS_BROWSER || 'Chrome (Linux)').split(','),
    markOnlineOnConnect: process.env.BAILEYS_MARK_ONLINE !== 'false',
    keepAliveIntervalMs: parseInt(process.env.BAILEYS_KEEPALIVE_MS, 10) || 30000,
  },
  reconnectDelay: {
    initial: parseInt(process.env.RECONNECT_DELAY_INITIAL, 10) || 5000,
    max: parseInt(process.env.RECONNECT_DELAY_MAX, 10) || 60000,
  },
};

module.exports = config;
