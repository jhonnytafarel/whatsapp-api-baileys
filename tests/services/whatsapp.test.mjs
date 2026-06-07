import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@whiskeysockets/baileys', () => {
  const mockEv = { on: vi.fn() };
  const mockSock = {
    ev: mockEv,
    user: { id: '5511999999999@s.whatsapp.net' },
    sendMessage: vi.fn(),
    logout: vi.fn(),
  };

  return {
    default: vi.fn(() => mockSock),
    useMultiFileAuthState: vi.fn(() =>
      Promise.resolve({ state: {}, saveCreds: vi.fn() })
    ),
    DisconnectReason: {
      loggedOut: 401,
      connectionClosed: 500,
    },
    fetchLatestBaileysVersion: vi.fn(() =>
      Promise.resolve({ version: [6, 7, 16] })
    ),
    makeWASocket: vi.fn(() => mockSock),
  };
});

const WhatsAppService = (await import('../../src/services/whatsapp.js')).default;

describe('WhatsAppService', () => {
  let service;

  beforeEach(() => {
    service = new WhatsAppService();
  });

  describe('initial state', () => {
    it('starts disconnected', () => {
      const status = service.getStatus();
      expect(status.status).toBe('disconnected');
      expect(status.connected).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('returns correct structure', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('user');
      expect(status).toHaveProperty('connectedAt');
    });
  });

  describe('sendMessage', () => {
    it('throws when not connected', async () => {
      await expect(service.sendMessage('5511999999999', 'Hello')).rejects.toThrow(
        'WhatsApp not connected'
      );
    });
  });

  describe('_onConnectionUpdate', () => {
    it('sets QR code when qr event received', () => {
      service._onConnectionUpdate({ qr: 'qr-data-string' });
      expect(service.qrCodeData).toBe('qr-data-string');
      expect(service.connectionStatus).toBe('qr');
    });

    it('sets connected on open event', () => {
      service.sock = { user: { id: 'test@test' } };
      service._onConnectionUpdate({ connection: 'open' });
      expect(service.connectionStatus).toBe('connected');
      expect(service.connectionInfo).toBeTruthy();
      expect(service.connectionInfo.user.id).toBe('test@test');
    });
  });
});
