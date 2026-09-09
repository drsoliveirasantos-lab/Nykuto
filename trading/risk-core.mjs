// Cash units only: all prices and reference capital must use the same currency.
export function numericInput(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function calculateCashRisk(values) {
  const [capital, risk, entry, stop, target] = ['capital','risk','entry','stop','target'].map(k => numericInput(values[k]));
  const validRisk = capital !== null && capital > 0 && risk !== null && risk > 0 && risk <= 100;
  const riskAmount = validRisk ? capital * (risk / 100) : null;
  const side = values.side === 'Short' ? 'Short' : 'Long';
  const stopValid = entry > 0 && stop > 0 && (side === 'Long' ? stop < entry : stop > entry);
  const targetValid = entry > 0 && target > 0 && (side === 'Long' ? target > entry : target < entry);
  const distance = stopValid ? Math.abs(entry - stop) : null;
  const rawUnits = riskAmount !== null && distance !== null ? riskAmount / distance : null;
  const units = rawUnits !== null && Number.isFinite(rawUnits) && Number.isFinite(rawUnits * entry) ? rawUnits : null;
  const ratio = stopValid && targetValid ? Math.abs(target - entry) / distance : null;
  return { riskAmount, units, notional: units === null ? null : units * entry,
    stopPct: distance === null ? null : distance / entry * 100, ratio,
    message: !validRisk ? 'Renseigne un capital positif et un risque entre 0 et 100 % (0 exclu).'
      : !stopValid ? (side === 'Long' ? 'Pour un achat : stop positif sous le prix d’entrée.' : 'Pour une vente à découvert : stop au-dessus du prix d’entrée.')
      : !targetValid ? (side === 'Long' ? 'Place l’objectif au-dessus du prix d’entrée.' : 'Place l’objectif positif sous le prix d’entrée.') : 'Hypothèse : prix en euros, 1 € par point et par unité. Hors frais et glissement.' };
}
