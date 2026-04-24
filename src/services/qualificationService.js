const FAIXAS_QUALIFICADAS = [
  'mais de r$100.000',
  'entre r$50.000 a r$100.000',
  'entre r$20.000 a r$40.000',
];

function isQualified(body) {
  // Campo principal no payload real do GHL
  const receitaRaw =
    body['Faixa de FaturamentoN'] ||
    body.customData?.['faixa de faturamento'] ||
    (Array.isArray(body['Faixa de faturamento'])
      ? body['Faixa de faturamento'][0]
      : body['Faixa de faturamento']) ||
    '';

  const receita = String(receitaRaw).toLowerCase().trim();
  const qualified = FAIXAS_QUALIFICADAS.includes(receita);

  return {
    qualified,
    data: {
      faixa_faturamento: receitaRaw,
    },
  };
}

module.exports = { isQualified };
