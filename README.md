# WhatsApp API (Baileys)

API simples em Node.js para 1 usuario conectar WhatsApp e enviar mensagens.

## Instalar
```bash
npm install
```

## Rodar
```bash
npm start
# ou para auto-reload:
npm run dev
```

## Endpoints
- `GET /` - Info
- `GET /status` - Status da conexao
- `GET /qr` - QR Code em base64 (JSON)
- `GET /qr/html` - Pagina HTML com QR Code
- `POST /send` - Enviar mensagem `{ "number": "5511999999999", "message": "Ola" }`
- `POST /disconnect` - Desconectar

## Swagger
Acesse `http://localhost:3000/docs`

## Como usar
1. Rode `npm start`
2. Abra `http://localhost:3000/qr/html` no navegador
3. Escaneie o QR Code com o WhatsApp no celular
4. Pronto! Use `POST /send` para enviar mensagens
