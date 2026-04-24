require('dotenv').config();

const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/debug/env', (_req, res) => res.json({
  META_PIXEL_ID: process.env.META_PIXEL_ID || 'NAO_DEFINIDO',
  META_API_VERSION: process.env.META_API_VERSION || 'NAO_DEFINIDO',
  EVENT_SOURCE_URL: process.env.EVENT_SOURCE_URL || 'NAO_DEFINIDO',
  META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? '✓ definido' : 'NAO_DEFINIDO',
}));
app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Servidor rodando na porta ${PORT}`);
});
