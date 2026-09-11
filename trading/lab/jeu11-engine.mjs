import { inspectConfirmation } from './mnq-confirmation.mjs';
import { contextFor } from './validation-engine.mjs?v=2';
import { PRODUCTS, simulateMarket } from './market-comparison.mjs';
import { confluenceFeatures, signalChecks, confluenceMetrics } from './confluence-engine.mjs';
import { CONFLUENCE_VARIANTS } from './confluence-policy.mjs';
import { JEU11_POLICY as policy, JEU11_DAYS as days, JEU11_EVENTS as events } from './jeu11-policy.mjs';

export function inspectJeu11(bundle) {
  if (!bundle || bundle.schema !== 'jeu11-data-v1' || bundle.protocol !== policy.version || bundle.ticker !== policy.ticker || bundle.expiry !== policy.expiry || bundle.paginationComplete !== true || !Array.isArray(bundle.calendar) || bundle.calendar.length !== days.length || bundle.calendar.some((s, i) => s.date !== days[i] || s.open !== `${s.date}T09:30:00` || s.close !== `${s.date}T16:00:00`)) throw new Error('Jeu 11 : contrat, pagination ou calendrier invalide.');
  return inspectConfirmation({ ...bundle, schema: 'jeu07-data-v1' }, { ...policy, calendarDays: days, earlyCloses: {} });
}
export function simulateJeu11(candles, variant, factor) {
  const context = contextFor(candles), features = confluenceFeatures(candles, events);
  return simulateMarket(candles, context, { label: policy.label, start: Date.parse(`${policy.start}T00:00:00Z`) / 1000, end: Date.parse(`${policy.end}T00:00:00Z`) / 1000 }, PRODUCTS.find(p => p.symbol === 'MNQ'), factor, policy.ticker, { acceptSignal: (side, i) => signalChecks(features[i], side, variant.filters).every(c => c.pass) });
}
export function runJeu11(bundle) {
  const { quality, ready, candles } = inspectJeu11(bundle);
  if (!ready) return { protocol: policy.version, quality, calculated: false, variants: [], status: 'Données incomplètes', paperEnabled: false };
  const variants = CONFLUENCE_VARIANTS.map(variant => {
    const trades = simulateJeu11(candles, variant, 1), stressTrades = simulateJeu11(candles, variant, 2);
    const normal = confluenceMetrics(trades), stress = confluenceMetrics(stressTrades);
    const checks = [
      { id: 'windows', label: 'Trois fenêtres distinctes de deux mois', pass: false },
      { id: 'total', label: 'Au moins 40 trades au total', pass: normal.count >= 40 },
      { id: 'window', label: 'Au moins 12 trades dans cette fenêtre', pass: normal.count >= 12 },
      { id: 'positive', label: 'Résultat positif dans cette fenêtre', pass: normal.total > 0 },
      { id: 'pf', label: 'Profit factor ≥ 1,10 avant arrondi', pass: normal.pf !== null && normal.pf >= 1.1 },
      { id: 'dd', label: 'Drawdown réalisé ≤ 8 R', pass: normal.dd <= 8 },
      { id: 'stress', label: 'Résultat positif à coûts doublés', pass: stress.total > 0 }
    ];
    return { ...variant, normal, stress, trades, stressTrades, checks, status: checks.slice(1).every(c => c.pass) ? 'Confirmation incomplète' : 'Non confirmé' };
  });
  return { protocol: policy.version, quality, calculated: true, variants, events, status: 'Confirmation incomplète', paperEnabled: false };
}
