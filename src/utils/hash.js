const crypto = require('crypto');

function hashField(value) {
  if (!value) return undefined;
  const normalized = String(value).toLowerCase().trim();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

module.exports = { hashField };
