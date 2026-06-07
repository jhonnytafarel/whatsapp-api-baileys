# WhatsApp API (Baileys)

Production-ready WhatsApp API built with Baileys, Express, and Swagger.

## Features

- QR Code authentication via browser or JSON
- Send text messages
- Connection status monitoring
- Exponential backoff reconnection
- API Key authentication (optional)
- Rate limiting
- Input validation (Zod)
- Structured logging (Pino)
- Graceful shutdown
- Docker support
- Tested (Vitest + Supertest)
- Swagger UI documentation

## Quick Start

```bash
cp .env.example .env
npm install
npm start
```

Open `http://localhost:3000/qr/html` and scan the QR code.

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API info |
| `GET` | `/status` | Connection status |
| `GET` | `/qr` | QR code as base64 JSON |
| `GET` | `/qr/html` | QR code HTML page |
| `POST` | `/send` | Send message |
| `POST` | `/disconnect` | Disconnect |
| `GET` | `/docs` | Swagger UI |

### Send Message

```json
POST /send
{
  "number": "5511999999999",
  "message": "Hello from API!"
}
```

## Authentication

Set `API_KEY` in `.env` to enable key-based auth. Send it as header:

```
x-api-key: your-secret-key
```

## Docker

```bash
docker build -t whatsapp-api .
docker run -p 3000:3000 -v $(pwd)/auth_info:/app/auth_info whatsapp-api
```

## Environment Variables

See [.env.example](.env.example) for all options.

## Architecture

```
src/
  config/         # Environment, logger, swagger
  middleware/     # Auth, validation, rate limiter, error handler
  routes/         # Express route handlers
  services/       # WhatsApp business logic
  app.js          # Express app factory
  server.js       # Entry point with graceful shutdown
tests/
  routes/         # Route integration tests
  services/       # Service unit tests
  helpers/        # Test helpers & mocks
```
