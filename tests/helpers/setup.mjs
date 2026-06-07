import { EventEmitter } from 'events';

export class MockWhatsAppService extends EventEmitter {
  constructor() {
    super();
    this.sock = null;
    this.qrCodeData = null;
    this.connectionStatus = 'disconnected';
    this.connectionInfo = null;
  }

  async connect() {
    this.connectionStatus = 'connecting';
    return Promise.resolve();
  }

  async sendMessage(number, message) {
    if (this.connectionStatus !== 'connected') {
      throw Object.assign(new Error('WhatsApp not connected'), {
        status: 400,
        expose: true,
        code: 'NOT_CONNECTED',
      });
    }
    return { messageId: 'mock-id-123', to: number };
  }

  async disconnect() {
    this.connectionStatus = 'disconnected';
    this.sock = null;
    this.qrCodeData = null;
    this.connectionInfo = null;
    return Promise.resolve();
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
