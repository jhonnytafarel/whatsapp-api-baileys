const config = require('./config/env');
const logger = require('./config/logger');
const createApp = require('./app');
const WhatsAppService = require('./services/whatsapp');

const whatsAppService = new WhatsAppService();
const app = createApp(whatsAppService);

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'WhatsApp API started');
  logger.info(`Docs: http://localhost:${config.port}/docs`);
  logger.info(`QR:   http://localhost:${config.port}/qr/html`);
});

// Start WhatsApp connection
whatsAppService.connect();

// Graceful shutdown
function shutdown(signal) {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(async () => {
    await whatsAppService.disconnect();
    process.exit(0);
  });

  // Force exit after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { app, whatsAppService, server };
