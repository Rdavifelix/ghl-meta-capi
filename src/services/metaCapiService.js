const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { hashField } = require('../utils/hash');

function normalizePhone(phone) {
  if (!phone) return undefined;
  // Remove tudo que não for dígito (inclusive o +)
  return phone.replace(/\D/g, '');
}

async function sendEvent(leadData, qualificationResult) {
  const {
    META_PIXEL_ID,
    META_ACCESS_TOKEN,
    META_API_VERSION = 'v18.0',
    EVENT_SOURCE_URL,
  } = process.env;

  const eventId = uuidv4();
  const eventTime = Math.floor(Date.now() / 1000);

  const qualified = qualificationResult.qualified;
  const eventName = qualified ? 'Lead_qualificado_geral' : 'Lead';

  // Dados de localização vêm dentro de body.location no payload real do GHL
  const loc = leadData.location || {};
  const attribution = leadData.attributionSource || {};

  const userData = {};

  // PII — hasheados
  if (leadData.email)        userData.em      = [hashField(leadData.email)];
  if (leadData.phone)        userData.ph      = [hashField(normalizePhone(leadData.phone))];
  if (leadData.first_name)   userData.fn      = hashField(leadData.first_name);
  if (leadData.last_name)    userData.ln      = hashField(leadData.last_name);
  const city    = loc.city    || leadData.city;
  const state   = loc.state   || leadData.state;
  const country = leadData.country || loc.country;
  const zip     = loc.postalCode  || leadData.postalCode;
  if (city)    userData.ct      = hashField(city);
  if (state)   userData.st      = hashField(state);
  if (country) userData.country = hashField(country);
  if (zip)     userData.zp      = hashField(zip);

  // Dados de browser/sessão — NÃO hasheados, melhoram o match quality
  if (attribution.fbc)       userData.fbc                = attribution.fbc;
  if (attribution.fbp)       userData.fbp                = attribution.fbp;
  if (attribution.ip)        userData.client_ip_address  = attribution.ip;
  if (attribution.userAgent) userData.client_user_agent  = attribution.userAgent;

  const customData = { ...qualificationResult.data };
  if (qualified) customData.lead_score = 'qualificado';

  // URL da fonte: preferência para a URL da última atribuição, depois a env var
  const eventSourceUrl =
    attribution.url || EVENT_SOURCE_URL || undefined;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  // Inclui test_event_code se definido — necessário para aparecer no "Eventos de Teste" do Meta
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events`;

  const response = await axios.post(url, payload, {
    params: { access_token: META_ACCESS_TOKEN },
    headers: { 'Content-Type': 'application/json' },
  });

  return { eventId, eventName, metaResponse: response.data };
}

module.exports = { sendEvent };
