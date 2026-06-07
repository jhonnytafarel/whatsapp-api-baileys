const pino = require('pino');
const config = require('./env');

const logger = pino({
  level: config.logLevel,
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
  redact: ['auth_info', 'password', 'key'],
});

module.exports = logger;
