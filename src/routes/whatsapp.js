const { Router } = require('express');
const QRCode = require('qrcode');
const { z } = require('zod');
const validate = require('../middleware/validate');

const sendSchema = z.object({
  number: z.string().min(1, 'Number is required').max(20),
  message: z.string().min(1, 'Message is required').max(4096, 'Message too long'),
});

function createWhatsAppRoutes(whatsAppService) {
  const router = Router();

  /**
   * @openapi
   * /status:
   *   get:
   *     summary: Connection status
   *     security: []
   *     responses:
   *       200:
   *         description: Current connection status
   */
  router.get('/status', (req, res) => {
    res.json(whatsAppService.getStatus());
  });

  /**
   * @openapi
   * /qr:
   *   get:
   *     summary: Get QR code as base64 PNG
   *     security: []
   *     responses:
   *       200:
   *         description: Base64 PNG of QR code
   *       404:
   *         description: No QR code available
   */
  router.get('/qr', async (req, res, next) => {
    const qr = whatsAppService.qrCodeData;
    if (!qr) {
      const status = whatsAppService.getStatus();
      return res.status(404).json({
        message: status.connected ? 'Already connected' : 'No QR code yet. Please wait...',
        status: status.status,
      });
    }
    try {
      const dataUrl = await QRCode.toDataURL(qr, { width: 400 });
      res.json({ qr: dataUrl, status: whatsAppService.connectionStatus });
    } catch (err) {
      next(err);
    }
  });

  /**
   * @openapi
   * /qr/html:
   *   get:
   *     summary: HTML page with QR code
   *     security: []
   *     responses:
   *       200:
   *         description: HTML page
   */
  router.get('/qr/html', async (req, res, next) => {
    const qr = whatsAppService.qrCodeData;
    const status = whatsAppService.getStatus();

    if (!qr) {
      return res.send(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
            <div style="text-align:center">
              <h2>${status.connected ? 'Connected!' : 'Loading QR Code...'}</h2>
              <p>Status: ${status.status}</p>
              ${!status.connected ? '<meta http-equiv="refresh" content="3">' : ''}
            </div>
          </body>
        </html>
      `);
    }

    try {
      const dataUrl = await QRCode.toDataURL(qr, { width: 400 });
      res.send(`
        <html>
          <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f0f0f0">
            <div style="text-align:center;background:white;padding:40px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
              <h2>Scan with WhatsApp</h2>
              <img src="${dataUrl}" alt="QR Code" style="margin:20px 0" />
              <p>Status: ${status.status}</p>
              <meta http-equiv="refresh" content="5">
            </div>
          </body>
        </html>
      `);
    } catch (err) {
      next(err);
    }
  });

  /**
   * @openapi
   * /send:
   *   post:
   *     summary: Send a text message
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [number, message]
   *             properties:
   *               number:
   *                 type: string
   *                 example: "5511999999999"
   *               message:
   *                 type: string
   *                 example: "Hello!"
   *     responses:
   *       200:
   *         description: Message sent
   *       400:
   *         description: Validation error
   */
  router.post('/send', validate(sendSchema), async (req, res, next) => {
    try {
      const { number, message } = req.validatedBody;
      const result = await whatsAppService.sendMessage(number, message);
      res.json({ success: true, ...result });
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ error: err.message });
      next(err);
    }
  });

  /**
   * @openapi
   * /disconnect:
   *   post:
   *     summary: Disconnect and clear session
   *     responses:
   *       200:
   *         description: Disconnected
   */
  router.post('/disconnect', async (req, res, next) => {
    try {
      await whatsAppService.disconnect();
      res.json({ success: true, message: 'Disconnected' });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

module.exports = createWhatsAppRoutes;
