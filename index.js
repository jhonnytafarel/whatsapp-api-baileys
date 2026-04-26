const express = require('express');
const bodyParser = require('body-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const QRCode = require('qrcode');
const baileys = require('@whiskeysockets/baileys');
const P = require('pino');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = baileys;

const app = express();
app.use(bodyParser.json());

let sock = null;
let qrCodeData = null;
let connectionStatus = 'disconnected';
let connectionInfo = null;

const logger = P({ level: 'silent' });

async function connectToWhatsApp() {
  try {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`[INFO] Baileys version: ${version.join('.')}`);

    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: ['Chrome (Linux)', '', ''],
      markOnlineOnConnect: true,
      keepAliveIntervalMs: 30000,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCodeData = qr;
        connectionStatus = 'qr';
        console.log('[QR] QR Code recebido!');
      }

      console.log('[CONN] Update:', { connection, hasQr: !!qr });

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[CONN] Fechada. StatusCode: ${statusCode}, reconnect: ${shouldReconnect}`);

        qrCodeData = null;
        connectionStatus = 'disconnected';
        connectionInfo = null;
        sock = null;

        if (shouldReconnect) {
          connectionStatus = 'connecting';
          setTimeout(connectToWhatsApp, 5000);
        }
      } else if (connection === 'open') {
        connectionStatus = 'connected';
        qrCodeData = null;
        connectionInfo = {
          user: sock.user,
          connectedAt: new Date().toISOString(),
        };
        console.log(`[CONN] Conectado como ${sock.user?.id || 'unknown'}`);
      } else if (connection === 'connecting') {
        connectionStatus = 'connecting';
      }
    });
  } catch (err) {
    console.error('[ERRO] Falha ao iniciar:', err.message);
    connectionStatus = 'disconnected';
    setTimeout(connectToWhatsApp, 10000);
  }
}

connectToWhatsApp();

// ============ SWAGGER ============
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WhatsApp API',
      version: '1.0.0',
      description:
        'API simples para envio de mensagens WhatsApp usando Baileys. Apenas 1 usuario.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./index.js'],
};
const specs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));

// ============ ROTAS ============

/**
 * @openapi
 * /:
 *   get:
 *     summary: Pagina inicial com link para docs
 */
app.get('/', (req, res) => {
  res.json({ message: 'WhatsApp API', docs: '/docs', status: '/status', qr: '/qr' });
});

/**
 * @openapi
 * /status:
 *   get:
 *     summary: Status da conexao WhatsApp
 *     responses:
 *       200:
 *         description: Retorna o status atual
 */
app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    connected: connectionStatus === 'connected',
    user: connectionInfo?.user || null,
    connectedAt: connectionInfo?.connectedAt || null,
  });
});

/**
 * @openapi
 * /qr:
 *   get:
 *     summary: QR Code para conectar o WhatsApp (base64 PNG)
 *     responses:
 *       200:
 *         description: Imagem base64 do QR Code
 *       404:
 *         description: Nenhum QR Code disponivel no momento
 */
app.get('/qr', async (req, res) => {
  if (!qrCodeData) {
    return res.status(404).json({
      message:
        connectionStatus === 'connected'
          ? 'Ja conectado!'
          : 'Nenhum QR Code disponivel. Aguarde...',
      status: connectionStatus,
    });
  }
  try {
    const dataUrl = await QRCode.toDataURL(qrCodeData, { width: 400 });
    res.json({ qr: dataUrl, status: connectionStatus });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar QR Code', details: err.message });
  }
});

/**
 * @openapi
 * /qr/html:
 *   get:
 *     summary: Pagina HTML com o QR Code
 *     responses:
 *       200:
 *         description: Pagina HTML renderizavel
 */
app.get('/qr/html', async (req, res) => {
  if (!qrCodeData) {
    return res.send(`
      <html>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif">
          <div style="text-align:center">
            <h2>${connectionStatus === 'connected' ? 'Conectado!' : 'Carregando QR Code...'}</h2>
            <p>Status: ${connectionStatus}</p>
            ${connectionStatus !== 'connected' ? '<meta http-equiv="refresh" content="3">' : ''}
          </div>
        </body>
      </html>
    `);
  }
  const dataUrl = await QRCode.toDataURL(qrCodeData, { width: 400 });
  res.send(`
    <html>
      <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f0f0f0">
        <div style="text-align:center;background:white;padding:40px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h2>Escaneie com o WhatsApp</h2>
          <img src="${dataUrl}" alt="QR Code" style="margin:20px 0" />
          <p>Status: ${connectionStatus}</p>
          <meta http-equiv="refresh" content="5">
        </div>
      </body>
    </html>
  `);
});

/**
 * @openapi
 * /send:
 *   post:
 *     summary: Enviar mensagem de texto
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
 *                 description: Numero com DDI e DDD (ex 5511999999999)
 *               message:
 *                 type: string
 *                 description: Texto da mensagem
 *     responses:
 *       200:
 *         description: Mensagem enviada
 *       400:
 *         description: Erro de validacao
 *       500:
 *         description: Erro ao enviar
 */
app.post('/send', async (req, res) => {
  const { number, message } = req.body;
  if (!number || !message) {
    return res.status(400).json({ error: 'Campos "number" e "message" sao obrigatorios' });
  }
  if (connectionStatus !== 'connected') {
    return res.status(400).json({ error: 'WhatsApp nao esta conectado', status: connectionStatus });
  }
  try {
    const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    const result = await sock.sendMessage(jid, { text: message });
    res.json({ success: true, messageId: result.key.id, to: number });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem', details: err.message });
  }
});

/**
 * @openapi
 * /disconnect:
 *   post:
 *     summary: Desconectar e limpar sessao
 */
app.post('/disconnect', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    qrCodeData = null;
    connectionStatus = 'disconnected';
    connectionInfo = null;
    res.json({ success: true, message: 'Desconectado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp API rodando em http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
  console.log(`QR Code: http://localhost:${PORT}/qr/html`);
});
