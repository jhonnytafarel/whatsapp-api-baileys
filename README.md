<div align="center">
  <h1>WhatsApp API</h1>
  <p><strong>Envie mensagens do seu sistema com um QR Code.</strong><br />
  <em>Send messages from your system with a single QR scan.</em></p>
  <p>
    <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen" alt="Node" />
    <img src="https://img.shields.io/badge/license-ISC-blue" alt="License" />
    <img src="https://img.shields.io/badge/tests-14%20passed-green" alt="Tests" />
  </p>
  <br />
</div>

---

## 🇧🇷 Português

### O que é?

Uma API pronta para usar que conecta seu sistema ao WhatsApp. Escaneie o **QR Code** uma vez e pronto — sua aplicação pode enviar mensagens via requisições HTTP.

### Para que serve?

- Notificações automáticas (confirmação de pedido, cobrança, avisos)
- Campanhas de marketing com agendamento
- Integração com CRM, ERP ou qualquer sistema
- Chatbots e atendimento automatizado
- Disparo de mensagens internas da empresa

### Funcionalidades

| Funcionalidade | Detalhe |
|---|---|
| ✅ **Conexão via QR Code** | Escaneie uma vez, use para sempre (sessão salva) |
| ✅ **Envio de texto** | `POST /send` com número e mensagem |
| ✅ **Reconexão automática** | Se cair, volta sozinho com backoff inteligente |
| ✅ **Autenticação por chave** | Opcional — proteja sua API com `x-api-key` |
| ✅ **Limitação de taxa** | Evita abusos com rate limiting configurável |
| ✅ **Validação de entradas** | Zod — dados errados são rejeitados antes de processar |
| ✅ **Logs estruturados** | Pino — visualize tudo que acontece |
| ✅ **Desligamento seguro** | Captura SIGTERM/SIGINT, faz logout limpo |
| ✅ **Testado** | 14 testes automatizados (Vitest + Supertest) |
| ✅ **Docker** | Rode em qualquer lugar com um comando |
| ✅ **Swagger UI** | Documentação interativa em `/docs` |

### Começando

```bash
# 1. Clone e instale
git clone https://github.com/jhonnytafarel/whatsapp-api-baileys.git
cd whatsapp-api-baileys
cp .env.example .env
npm install

# 2. Inicie o servidor
npm start

# 3. Abra no navegador
#    http://localhost:3000/qr/html

# 4. Escaneie o QR Code com o WhatsApp do celular
#    (WhatsApp > Menu > WhatsApp Web)

# 5. Envie sua primeira mensagem
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"number": "5511999999999", "message": "Olá, mundo!"}'
```

> ⚡ O servidor recarrega sozinho em desenvolvimento: `npm run dev`

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Informações da API |
| `GET` | `/status` | Status da conexão WhatsApp |
| `GET` | `/qr` | QR Code em base64 (JSON) |
| `GET` | `/qr/html` | Página HTML com o QR Code |
| `POST` | `/send` | Enviar mensagem de texto |
| `POST` | `/disconnect` | Desconectar e limpar sessão |
| `GET` | `/docs` | Documentação Swagger |

#### Exemplo: enviar mensagem

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "message": "Sua fatura vence amanhã!"
  }'
```

Resposta:
```json
{
  "success": true,
  "messageId": "3A...",
  "to": "5511999999999"
}
```

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Inicia o servidor (produção) |
| `npm run dev` | Inicia com reload automático |
| `npm test` | Executa os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Testes com cobertura |

### Variáveis de ambiente

Tudo configurável via `.env`. Arquivo de exemplo incluso (`.env.example`):

```env
PORT=3000
LOG_LEVEL=info
API_KEY=                        # deixe vazio para desabilitar
RATE_LIMIT_MAX=30               # requisições por minuto
BAILEYS_KEEPALIVE_MS=30000      # ping a cada 30s
RECONNECT_DELAY_INITIAL=5000    # 5s → 10s → 20s → ... → 60s
RECONNECT_DELAY_MAX=60000
```

### Docker

```bash
docker build -t whatsapp-api .
docker run -d --name whatsapp-api \
  -p 3000:3000 \
  -v $(pwd)/auth_info:/app/auth_info \
  whatsapp-api
```

### Estrutura do projeto

```
src/
  config/         # Configurações (ambiente, logger, swagger)
  middleware/     # Interceptadores (auth, validação, rate limit)
  routes/         # Rotas da API
  services/       # Lógica do WhatsApp (conexão, envio)
  app.js          # Criação do Express
  server.js       # Ponto de entrada + graceful shutdown
tests/
  routes/         # Testes de integração das rotas
  services/       # Testes de unidade dos serviços
  helpers/        # Mocks e utilitários de teste
```

---

## 🇬🇧 English

### What is it?

A ready-to-use API that connects your system to WhatsApp. **Scan the QR code once** and your application can send messages via HTTP requests forever.

### Why use it?

- Automatic notifications (order confirmations, billing alerts)
- Marketing campaigns with scheduling
- CRM, ERP, or any system integration
- Chatbots and automated customer service
- Internal company announcements

### Features

| Feature | Detail |
|---|---|
| ✅ **QR Code auth** | Scan once, session saved forever |
| ✅ **Send text** | `POST /send` with number and message |
| ✅ **Auto reconnect** | Smart exponential backoff |
| ✅ **API key auth** | Optional — protect your API with `x-api-key` |
| ✅ **Rate limiting** | Configurable request throttling |
| ✅ **Input validation** | Zod — bad data rejected immediately |
| ✅ **Structured logs** | Pino — see everything clearly |
| ✅ **Graceful shutdown** | Handles SIGTERM/SIGINT cleanly |
| ✅ **Tested** | 14 automated tests (Vitest + Supertest) |
| ✅ **Docker** | Run anywhere with one command |
| ✅ **Swagger UI** | Interactive docs at `/docs` |

### Quick start

```bash
# 1. Clone and install
git clone https://github.com/jhonnytafarel/whatsapp-api-baileys.git
cd whatsapp-api-baileys
cp .env.example .env
npm install

# 2. Start the server
npm start

# 3. Open in your browser
#    http://localhost:3000/qr/html

# 4. Scan the QR code with your phone's WhatsApp
#    (WhatsApp > Menu > WhatsApp Web)

# 5. Send your first message
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{"number": "5511999999999", "message": "Hello, world!"}'
```

> ⚡ Dev mode with auto-reload: `npm run dev`

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | API info |
| `GET` | `/status` | WhatsApp connection status |
| `GET` | `/qr` | QR code as base64 (JSON) |
| `GET` | `/qr/html` | QR code HTML page |
| `POST` | `/send` | Send a text message |
| `POST` | `/disconnect` | Disconnect and clear session |
| `GET` | `/docs` | Swagger UI documentation |

#### Example: send a message

```bash
curl -X POST http://localhost:3000/send \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "message": "Your invoice is due tomorrow!"
  }'
```

Response:
```json
{
  "success": true,
  "messageId": "3A...",
  "to": "5511999999999"
}
```

### Available scripts

| Command | Description |
|---|---|
| `npm start` | Start production server |
| `npm run dev` | Start with auto-reload |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

### Environment variables

All configurable via `.env`. Example file included (`.env.example`):

```env
PORT=3000
LOG_LEVEL=info
API_KEY=                        # leave empty to disable
RATE_LIMIT_MAX=30               # requests per minute
BAILEYS_KEEPALIVE_MS=30000      # ping every 30s
RECONNECT_DELAY_INITIAL=5000    # 5s → 10s → 20s → ... → 60s
RECONNECT_DELAY_MAX=60000
```

### Docker

```bash
docker build -t whatsapp-api .
docker run -d --name whatsapp-api \
  -p 3000:3000 \
  -v $(pwd)/auth_info:/app/auth_info \
  whatsapp-api
```

### Project structure

```
src/
  config/         # Configuration (env, logger, swagger)
  middleware/     # Interceptors (auth, validation, rate limit)
  routes/         # API route handlers
  services/       # WhatsApp logic (connect, send)
  app.js          # Express app factory
  server.js       # Entry point + graceful shutdown
tests/
  routes/         # Route integration tests
  services/       # Service unit tests
  helpers/        # Mocks and test utilities
```

---

## 📄 License

ISC
