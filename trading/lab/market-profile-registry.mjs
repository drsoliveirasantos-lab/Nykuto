import { verifyAdmissionReport } from './jeu23-report-validation.mjs';
import { verifyFailureReport } from './jeu26-report-validation.mjs';
import { verifyReentryReport } from './jeu27-report-validation.mjs';
import { verifyProtectionReport } from './jeu28-report-validation.mjs';
import { assessAccountRisk } from './account-risk-supervisor.mjs';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};
export const STRATEGY_OPTIONS = freeze([
  { key: 'base', game: 23, scenario: 'admission-risk150', label: 'Retour admissible · stop initial' },
  { key: 'failure', game: 26, scenario: 'failed-breakout150', label: 'Cassure échouée · retour dans la zone' },
  { key: 'repeat', game: 27, scenario: 'fresh-reentry150', label: 'Retour supplémentaire après sortie' },
  { key: 'protect', game: 28, scenario: 'closed-breakeven150', label: 'Retour admissible · protection après +1R' }
]);
export const MARKET_FOCUSES = freeze([
  { symbol: 'MNQ', focus: 'protect', rationale: 'Une perte évitée de 44 $ ; effet à confirmer sur davantage de trades.' },
  { symbol: 'MES', focus: 'base', rationale: 'Base de comparaison à retravailler : les variantes récentes ne la rendent pas rentable.' },
  { symbol: 'MYM', focus: 'protect', rationale: 'Deux pertes évitées, mais le résultat reste négatif : les entrées demandent encore du travail.' },
  { symbol: 'MGC', focus: 'failure', rationale: 'Famille différente à approfondir : total positif, deuxième fenêtre négative et échantillon insuffisant.' }
]);
const verifiers = { 23: verifyAdmissionReport, 26: verifyFailureReport, 27: verifyReentryReport, 28: verifyProtectionReport };
const verifiedRegistries = new WeakSet();

function view(option, symbol, report) {
  const result = report.results.find(r => r.id === `${symbol}/${option.scenario}`);
  if (!result || result.riskPerTrade !== 150 || result.dailyLoss !== 300) throw new Error('Missing equal-risk candidate');
  const extract = d => ({ trades: d.trades, netUSD: d.net, winRate: d.metrics.win, drawdownUSD: d.drawdown,
    days: { ...d.daily }, meanPerObservedDayUSD: Math.round(d.net / d.daily.observed * 100) / 100 });
  return { ...option, symbol, available: true, status: 'unqualified', executionAllowed: false,
    selectionType: 'research-focus-after-observed-results', report: `jeu${option.game}-report.json`,
    normal: extract(result.diagnostic.normal), stress: extract(result.diagnostic.stress),
    passedChecks: result.checks.filter(c => c.pass).length,
    failedChecks: result.checks.filter(c => !c.pass).map(c => c.label),
    windows: result.windows.map(w => ({ start: w.start, end: w.end, observed: w.scored, expected: w.expected,
      normalNetUSD: w.diagnostic.normal.net, stressNetUSD: w.diagnostic.stress.net })),
    confirmed: result.confirmed, developmentPassed: result.researchPassed };
}

// Missing/damaged reports disable the affected alternative, without silently
// replacing a market's focus or hiding valid reports for other markets.
export async function createMarketProfileRegistry(buffers) {
  const entries = await Promise.all(STRATEGY_OPTIONS.map(async option => {
    try {
      const report = await verifiers[option.game](buffers?.[option.game]);
      const views = MARKET_FOCUSES.map(m => view(option, m.symbol, report));
      return [option.key, views];
    } catch { return [option.key, null]; }
  }));
  const available = new Map(entries);
  const registry = freeze({ schema: 'market-research-profiles-v1', researchOnly: true, executionAllowed: false,
    historicalTrials: 65, newTrials: 0, independentConfirmations: 0,
    markets: MARKET_FOCUSES.map(m => ({ ...m, executionStrategyId: null,
      alternatives: STRATEGY_OPTIONS.map(option => available.get(option.key)?.find(v => v.symbol === m.symbol)
        ?? { ...option, symbol: m.symbol, available: false, status: 'unavailable', executionAllowed: false }) })) });
  verifiedRegistries.add(registry);
  return registry;
}

export function selectResearchProfile(registry, symbol, strategyKey) {
  if (!verifiedRegistries.has(registry)) throw new Error('Unverified profile registry');
  const market = registry.markets.find(m => m.symbol === symbol);
  const chosen = market?.alternatives.find(a => a.key === (strategyKey ?? market.focus));
  if (!chosen) throw new Error('Unknown market or strategy');
  return chosen;
}

export function inspectProfileIntent(registry, symbol, strategyKey, state, intent) {
  const profile = selectResearchProfile(registry, symbol, strategyKey);
  if (intent?.symbol !== symbol) return { executionAllowed: false, reason: 'profile-market-mismatch', risk: null };
  const risk = assessAccountRisk(state, intent);
  return { executionAllowed: false, reason: profile.available ? 'research-profile-unqualified' : 'research-profile-unavailable',
    profileId: `${symbol}/${profile.key}`, risk };
}
