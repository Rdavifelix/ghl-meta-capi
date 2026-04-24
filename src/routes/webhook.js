const express = require('express');
const { isQualified } = require('../services/qualificationService');
const { sendEvent } = require('../services/metaCapiService');

const router = express.Router();

router.post('/ec-caue-kpi', async (req, res) => {
  const timestamp = new Date().toISOString();

  const secret = process.env.WEBHOOK_SECRET;
  if (secret && req.headers['x-webhook-secret'] !== secret) {
    console.warn(`[${timestamp}] Webhook rejeitado — secret inválido`);
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  // GHL envia um array com um único objeto: [{headers, params, query, body, ...}]
  const raw = Array.isArray(req.body) ? req.body[0] : req.body;
  const body = raw.body || raw;

  console.log(`[${timestamp}] Webhook recebido — contact_id: ${body.contact_id || 'n/a'}`);

  let result;
  try {
    const qualification = isQualified(body);
    const { eventId, eventName, metaResponse } = await sendEvent(body, qualification);

    result = {
      status: 'ok',
      qualified: qualification.qualified,
      event_sent: eventName,
      event_id: eventId,
      meta: metaResponse,
    };

    console.log(
      `[${timestamp}] Evento enviado — ${eventName} | qualified: ${qualification.qualified} | event_id: ${eventId}`
    );
  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    console.error(`[${timestamp}] Erro ao enviar evento:`, errorDetail);
    return res.status(200).json({
      status: 'error',
      message: 'Falha ao enviar evento para o Meta',
      detail: errorDetail,
    });
  }

  return res.status(200).json(result);
});

module.exports = router;
