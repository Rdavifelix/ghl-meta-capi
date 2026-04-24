require('dotenv').config();

// Remove tabs/spaces invisíveis que Railway pode inserir nos nomes das variáveis
Object.keys(process.env).forEach(key => {
  const clean = key.trim();
  if (clean !== key) {
    if (!process.env[clean]) process.env[clean] = process.env[key];
    delete process.env[key];
  }
});

const express = require('express');
const webhookRouter = require('./routes/webhook');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/debug/env', (_req, res) => {
  const allKeys = Object.keys(process.env).filter(k => !['PATH','HOME','USER','SHELL','PWD'].includes(k));
  res.json({
    META_PIXEL_ID: process.env.META_PIXEL_ID || 'NAO_DEFINIDO',
    META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? '✓ definido' : 'NAO_DEFINIDO',
    META_API_VERSION: process.env.META_API_VERSION || 'NAO_DEFINIDO',
    EVENT_SOURCE_URL: process.env.EVENT_SOURCE_URL || 'NAO_DEFINIDO',
    todas_as_chaves: allKeys,
  });
});
app.use('/webhook', webhookRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Servidor rodando na porta ${PORT}`);
});
