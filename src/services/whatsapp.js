const { EventEmitter } = require('events');
const baileys = require('@whiskeysockets/baileys');
const config = require('../config/env');
const logger = require('../config/logger');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = baileys;

class WhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.sock = null;
    this.qrCodeData = null;
    this.connectionStatus = 'disconnected';
    this.connectionInfo = null;
    this._reconnectAttempts = 0;
    this._reconnecting = false;
  }

  async connect() {
    if (this._reconnecting) return;
    this._reconnecting = true;

    try {
      const { version } = await fetchLatestBaileysVersion();
      logger.info({ version: version.join('.') }, 'Baileys version loaded');

      const { state, saveCreds } = await useMultiFileAuthState(config.authDir);

      this.sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: logger.child({ module: 'baileys' }),
        browser: config.baileys.browser,
        markOnlineOnConnect: config.baileys.markOnlineOnConnect,
        keepAliveIntervalMs: config.baileys.keepAliveIntervalMs,
      });

      this.sock.ev.on('creds.update', saveCreds);
      this.sock.ev.on('connection.update', this._onConnectionUpdate.bind(this));

      this.emit('connecting');
    } catch (err) {
      logger.error({ err }, 'Failed to initialize WhatsApp connection');
      this.connectionStatus = 'disconnected';
      this._scheduleReconnect();
    } finally {
      this._reconnecting = false;
    }
  }

  async _onConnectionUpdate(update) {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      this.qrCodeData = qr;
      this.connectionStatus = 'qr';
      logger.info('QR code received');
      this.emit('qr', qr);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;

      logger.warn({ statusCode, isLoggedOut }, 'Connection closed');

      this.qrCodeData = null;
      this.connectionInfo = null;
      this.sock = null;

      if (isLoggedOut) {
        this.connectionStatus = 'logged_out';
        this.emit('logged_out');
      } else {
        this.connectionStatus = 'disconnected';
        this._scheduleReconnect();
      }
    } else if (connection === 'open') {
      this._reconnectAttempts = 0;
      this.connectionStatus = 'connected';
      this.qrCodeData = null;
      this.connectionInfo = {
        user: this.sock.user,
        connectedAt: new Date().toISOString(),
      };
      logger.info({ user: this.sock.user?.id }, 'Connected to WhatsApp');
      this.emit('connected', this.connectionInfo);
    } else if (connection === 'connecting') {
      this.connectionStatus = 'connecting';
      this.emit('connecting');
    }
  }

  _scheduleReconnect() {
    this._reconnectAttempts++;
    const delay = Math.min(
      config.reconnectDelay.initial * Math.pow(2, this._reconnectAttempts - 1),
      config.reconnectDelay.max
    );
    logger.info({ delay, attempt: this._reconnectAttempts }, 'Scheduling reconnect');

    setTimeout(() => {
      this.connectionStatus = 'connecting';
      this.connect();
    }, delay);
  }

  async sendMessage(number, message) {
    if (this.connectionStatus !== 'connected' || !this.sock) {
      throw Object.assign(new Error('WhatsApp not connected'), {
        status: 400,
        expose: true,
        code: 'NOT_CONNECTED',
      });
    }

    const jid = number.includes('@') ? number : `${number}@s.whatsapp.net`;
    const result = await this.sock.sendMessage(jid, { text: message });
    return { messageId: result.key.id, to: number };
  }

  async disconnect() {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
    }
    this.qrCodeData = null;
    this.connectionStatus = 'disconnected';
    this.connectionInfo = null;
    this._reconnectAttempts = 0;
    logger.info('Disconnected from WhatsApp');
  }

  getStatus() {
    return {
      status: this.connectionStatus,
      connected: this.connectionStatus === 'connected',
      user: this.connectionInfo?.user || null,
      connectedAt: this.connectionInfo?.connectedAt || null,
    };
  }
}

module.exports = WhatsAppService;
