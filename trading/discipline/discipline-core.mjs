export const PREPARATIONS_KEY = 'nykuto-trading-preparations-v1';
export const TRADES_KEY = 'nykuto-trading-trades-v1';
export const EMOTIONS = Object.freeze({ calm: 'Calme', excited: 'Excité', anxious: 'Inquiet', frustrated: 'Frustré', tired: 'Fatigué', unsure: 'Indécis' });
export function drawdownScenario({ peak, current, riskPct, losses }) {
  if (![peak, current, riskPct, losses].every(Number.isFinite) || peak <= 0 || current < 0 || current > peak || riskPct <= 0 || riskPct > 100 || !Number.isInteger(losses) || losses < 1 || losses > 100) throw new Error('Renseigne des montants cohérents : sommet ≥ capital actuel ≥ 0, risque entre 0 et 100 %, et 1 à 100 pertes.');
  const after = current * (1 - riskPct / 100) ** losses;
  return { loss: peak - current, drawdownPct: 100 * (1 - current / peak), recoveryPct: current > 0 ? 100 * (peak / current - 1) : null, after, additionalLoss: current - after, afterDrawdownPct: 100 * (1 - after / peak), afterRecoveryPct: after > 0 ? 100 * (peak / after - 1) : null };
}
export function preparationReasons(p) {
  const reasons = [];
  if (p.fomo >= 4) reasons.push('Forte peur de rater le mouvement');
  if (p.stress >= 4) reasons.push('Stress élevé déclaré');
  if (p.fatigue >= 4) reasons.push('Fatigue élevée déclarée');
  if (p.revenge) reasons.push('Envie de récupérer une perte');
  if (!p.checks.signal) reasons.push('Déclencheur non défini');
  if (!p.checks.stop) reasons.push('Stop non défini');
  if (!p.checks.size) reasons.push('Taille non calculée');
  if (!p.checks.acceptLoss) reasons.push('Perte prévue non acceptée');
  return reasons;
}
export function validatePreparation(p) {
  if (!p || typeof p.id !== 'string' || !Number.isFinite(Date.parse(p.createdAt)) || typeof p.asset !== 'string' || !p.asset.trim() || p.asset.length > 24 || !['paper', 'manual'].includes(p.mode) || !['Long', 'Short'].includes(p.side) || !EMOTIONS[p.emotion] || !['observe', 'consider'].includes(p.decision) || typeof p.plan !== 'string' || !p.plan.trim() || p.plan.length > 400 || ![p.stress, p.fatigue, p.fomo].every(n => Number.isInteger(n) && n >= 0 && n <= 5) || !p.checks || !['signal', 'stop', 'size', 'acceptLoss'].every(k => typeof p.checks[k] === 'boolean') || typeof p.revenge !== 'boolean') throw new Error('Complète l’actif, ton état et ton scénario avant d’enregistrer.');
  return p;
}
export function journalTrade(p) {
  validatePreparation(p);
  if (!p.result || !Number.isFinite(p.result.r) || !Number.isFinite(Date.parse(p.result.closedAt)) || !EMOTIONS[p.result.emotion] || !['yes', 'partly', 'no'].includes(p.result.followedPlan)) throw new Error('Bilan du trade invalide.');
  return { id: `discipline-${p.id}`, prepId: p.id, createdAt: p.result.closedAt, asset: p.asset, side: p.side, r: p.result.r, setup: p.plan.slice(0, 50), note: (p.result.note || '').slice(0, 300), discipline: { before: p.emotion, after: p.result.emotion, stress: p.stress, fatigue: p.fatigue, fomo: p.fomo, followedPlan: p.result.followedPlan, mode: p.mode, preparedAt: p.createdAt } };
}
export function mergeJournal(trades, p) {
  if (!Array.isArray(trades)) throw new Error('Journal existant illisible : aucune donnée remplacée.');
  const trade = journalTrade(p);
  const existing = trades.find(t => t.id === trade.id || t.prepId === p.id);
  if (existing && JSON.stringify(existing) !== JSON.stringify(trade)) throw new Error('Un bilan différent existe déjà pour cette préparation.');
  return existing ? trades : [...trades, trade];
}
