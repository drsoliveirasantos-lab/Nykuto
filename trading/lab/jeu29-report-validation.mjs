import { PORTFOLIO_REPORT as p } from './jeu29-public.mjs';
const near = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-7;
const count = n => Number.isSafeInteger(n) && n >= 0;
export async function verifyPortfolioReport(buffer) {
  if (buffer.byteLength !== p.bytes || !globalThis.crypto?.subtle) throw new Error('Unverifiable report');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(n => n.toString(16).padStart(2, '0')).join('');
  if (sha !== p.sha256) throw new Error('Report fingerprint mismatch');
  const r = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  if (r.schema !== p.schema || r.freezeSha256 !== p.freezeSha256 || r.protocolSha256 !== p.protocolSha256
    || r.prePerformanceCommit !== p.prePerformanceCommit || r.confirmed !== false || r.executionAllowed !== false
    || ['independent', 'confirmed', 'executionAllowed', 'brokerEnabled', 'paperEnabled', 'shadowEnabled', 'liveFeed'].some(k => r.policy[k] !== false)
    || r.audit.passed !== true || r.selection.id !== null || r.selection.attempted !== 1 || r.selection.cumulativeAttempts !== 66
    || r.holdout.status !== 'not-opened' || r.windows.length !== 2 || r.checks.length !== 8
    || r.researchPassed !== r.checks.every(c => c.pass) || r.policy.tieBreak !== 'MES,MGC,MNQ,MYM'
    || r.policy.riskPerTrade !== 150 || r.policy.dailyLoss !== 300 || r.policy.maxPositions !== 1 || r.policy.maxTradesPerDay !== 2)
    throw new Error('Invalid portfolio research state');
  if (r.coverage.expected !== r.coverage.scored + r.coverage.missing.length
    || new Set(r.coverage.missing.map(d => d.day)).size !== r.coverage.missing.length
    || r.windows.reduce((n, w) => n + w.scored, 0) !== r.coverage.scored) throw new Error('Invalid coverage');
  const verify = d => {
    if (!count(d.trades) || d.executionAllowed !== false || !near(d.net, d.balance - 25000)
      || d.daily.observed !== d.daily.positive + d.daily.negative + d.daily.flatActive + d.daily.noTrade
      || d.metrics.count !== d.trades || d.trades > 2 * d.daily.observed || d.contributions.length !== 4
      || d.contributions.map(c => c.symbol).join(',') !== r.policy.tieBreak) throw new Error('Invalid portfolio totals');
    if (!near(d.contributions.reduce((n, c) => n + c.net, 0), d.net)
      || !near(d.contributions.reduce((n, c) => n + c.fees, 0), d.fees)
      || d.contributions.reduce((n, c) => n + c.trades, 0) !== d.trades
      || d.contributions.reduce((n, c) => n + c.signals, 0) !== d.signalCount
      || d.trades + Object.values(d.denied).reduce((n, v) => n + v, 0) !== d.signalCount) throw new Error('Invalid contribution reconciliation');
    for (const c of d.contributions) if (c.signals !== c.trades + Object.values(c.denied).reduce((n, v) => n + v, 0)) throw new Error('Invalid market decisions');
  };
  for (const cost of ['normal', 'stress']) {
    verify(r.diagnostic[cost]);
    if (r.diagnostic[cost].daily.observed !== r.coverage.scored) throw new Error('Unknown days counted');
    for (const w of r.windows) {
      if (w.complete !== (w.scored === w.expected) || (!w.complete && w.account !== null)) throw new Error('Invalid account coverage');
      verify(w.diagnostic[cost]); if (w.account) verify(w.account[cost]);
    }
  }
  return r;
}
