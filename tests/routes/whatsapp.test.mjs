import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import createApp from '../../src/app.js';
import { MockWhatsAppService } from '../helpers/setup.mjs';

describe('WhatsApp Routes', () => {
  let service;
  let app;

  beforeEach(() => {
    service = new MockWhatsAppService();
    app = createApp(service);
  });

  describe('GET /', () => {
    it('returns API info', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('WhatsApp API');
      expect(res.body.version).toBe('1.1.0');
    });
  });

  describe('GET /status', () => {
    it('returns disconnected status by default', async () => {
      const res = await request(app).get('/status');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('disconnected');
      expect(res.body.connected).toBe(false);
    });

    it('returns connected status', async () => {
      service.connectionStatus = 'connected';
      service.connectionInfo = {
        user: { id: '5511999999999@s.whatsapp.net' },
        connectedAt: new Date().toISOString(),
      };
      const res = await request(app).get('/status');
      expect(res.status).toBe(200);
      expect(res.body.connected).toBe(true);
      expect(res.body.user.id).toContain('@s.whatsapp.net');
    });
  });

  describe('GET /qr', () => {
    it('returns 404 when no QR code', async () => {
      const res = await request(app).get('/qr');
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('No QR code yet');
    });

    it('returns QR code when available', async () => {
      service.qrCodeData = 'test-qr-data';
      const res = await request(app).get('/qr');
      expect(res.status).toBe(200);
      expect(res.body.qr).toBeTruthy();
      expect(typeof res.body.qr).toBe('string');
    });
  });

  describe('POST /send', () => {
    it('returns 400 for missing fields', async () => {
      const res = await request(app).post('/send').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 when not connected', async () => {
      const res = await request(app)
        .post('/send')
        .send({ number: '5511999999999', message: 'Hello' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('WhatsApp not connected');
    });

    it('sends message when connected', async () => {
      service.connectionStatus = 'connected';
      const res = await request(app)
        .post('/send')
        .send({ number: '5511999999999', message: 'Hello' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.messageId).toBe('mock-id-123');
    });
  });

  describe('POST /disconnect', () => {
    it('disconnects successfully', async () => {
      const res = await request(app).post('/disconnect');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
