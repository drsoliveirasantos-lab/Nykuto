// One maintained development entry point, reusing the frozen Game45 mechanism.
// The reference, both cost paths and native market preparation are mandatory.
import { inspectOpeningHistory } from './jeu22-history.mjs';
import { JEU29_PRODUCTS, JEU29_PROFILES } from './jeu29-policy.mjs';
import { JEU40_MONTHS } from './jeu40-policy.mjs';
import { coverage40 } from './jeu40-diagnostic.mjs';
import { historyCalendar } from './jeu14-policy.mjs';
import { contexts40, filtered40 } from './jeu41-preparation.mjs';
import { simulateConfidencePortfolio } from './jeu45-engine.mjs';
import { compareExecutionDiagnostics } from './research-execution-diagnostics.mjs';
import { loadMnqResearchStream } from './mnq-data.mjs';

export const RESEARCH_BOT = Object.freeze({
  version: 'research-bot-evidence-v1', reference: 'jeu40-fixed100',
  candidate: 'mnq-time-exit30', candidateStatus: 'development-only',
  candidateSource: 'jeu45', riskMaximumUSD: 100, dailyLossUSD: 200, targetR: 2,
  timeExitSymbol: 'MNQ', timeExitMinutes: 30,
  periodScope: 'already-observed-January-August-2026',
  historicalMnqSource: 'mnq1-tradingview-rth-m5-2026-05-25_2026-09-10',
  selection: null, confirmed: false, executionAllowed: false,
});

// Repository-owned MNQ historical input for new research runs. This is deliberately
// separate from the frozen archived fixtures used to reproduce Games 40-46.
export function loadResearchBotMnqHistory() {
  return loadMnqResearchStream();
}

// Lower-level seam for already prepared streams; research callers should use
// compareResearchBotMonth so the original MES/MGC filters cannot be forgotten.
export function comparePreparedResearchBot(streams, contexts, period) {
  return Object.fromEntries([['normal', 1], ['stress', 2]].map(([cost, factor]) => {
    const reference = simulateConfidencePortfolio(streams, contexts, period, factor, 'fixed100', null);
    const candidate = simulateConfidencePortfolio(streams, contexts, period, factor, 'fixed100', 'MNQ');
    return [cost, { factor, reference, candidate,
      diagnostics: compareExecutionDiagnostics(reference.trades, candidate.trades) }];
  }));
}

export function compareResearchBotMonth(bundle, mnq, monthId) {
  const month = JEU40_MONTHS.find(m => m.id === monthId);
  if (!month) throw Error('An existing development month is required; future confirmation needs its own protocol');
  const markets = JEU29_PROFILES.map(profile => {
    const product = JEU29_PRODUCTS.find(p => p.symbol === profile.symbol);
    const input = profile.symbol === 'MNQ' ? mnq : bundle.products.find(p => p.symbol === profile.symbol);
    return { ...profile, product, data: inspectOpeningHistory(input, product) };
  });
  const coverage = coverage40(markets, month);
  if (!coverage.available) throw Error('No complete common sessions');
  const missing = new Set(coverage.missing.map(d => d.day));
  const available = historyCalendar(month.start, month.end).filter(d => !missing.has(d.date));
  const contexts = contexts40(markets, month);
  const prepared = filtered40(markets, contexts, month, available);
  return { profile: RESEARCH_BOT, month: month.id, coverage,
    existingFilterDecisions: prepared.decisions,
    costs: comparePreparedResearchBot(prepared.streams, contexts, { start: month.start, end: month.end }) };
}
