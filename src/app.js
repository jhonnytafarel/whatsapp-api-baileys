const express = require('express');
const swaggerUi = require('swagger-ui-express');
const specs = require('./config/swagger');
const createRoutes = require('./routes');
const authMiddleware = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const config = require('./config/env');
const logger = require('./config/logger');

function createApp(whatsAppService) {
  const app = express();

  app.use(express.json());

  if (config.apiKey) {
    logger.info('API key authentication enabled');
  }

  // Global middleware
  app.use('/api', rateLimiter, authMiddleware);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Routes
  app.use('/', createRoutes(whatsAppService));

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
