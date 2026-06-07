const { Router } = require('express');

function createRoutes(whatsAppService) {
  const router = Router();
  const whatsAppRoutes = require('./whatsapp')(whatsAppService);

  /**
   * @openapi
   * /:
   *   get:
   *     summary: API info
   *     security: []
   *     responses:
   *       200:
   *         description: API information
   */
  router.get('/', (req, res) => {
    res.json({
      name: 'WhatsApp API',
      version: '1.1.0',
      docs: '/docs',
      status: '/status',
      qr: '/qr',
    });
  });

  router.use(whatsAppRoutes);

  return router;
}

module.exports = createRoutes;
