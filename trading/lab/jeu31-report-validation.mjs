import { JEU31_REPORT as pin } from './jeu31-public.mjs';
const cents = n => Math.round(n * 100) / 100;
const sum = (rows, key) => cents(rows.reduce((n, r) => n + (r[key] ?? 0), 0));
export async function verifyMarketFilters(buffer) {
  if (buffer.byteLength !== pin.bytes || !globalThis.crypto?.subtle) throw Error('Unverifiable filters report');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(n => n.toString(16).padStart(2, '0')).join('');
  if (sha !== pin.sha256) throw Error('Filters fingerprint mismatch');
  const r = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  if (r.schema !== pin.schema || r.freezeSha256 !== pin.freezeSha256 || r.prePerformanceCommit !== pin.prePerformanceCommit
    || r.confirmed !== false || r.independent !== false || r.executionAllowed !== false || r.selection.id !== null
    || r.configurationCount !== 70 || r.newConfigurations !== 3 || r.audit.passed !== true || r.audit.baselineRuns !== 10) throw Error('Invalid research state');
  const expected = ['jan-apr/diagnostic', 'jan-feb/diagnostic', 'mar-apr/diagnostic', 'august/diagnostic', 'august/account'];
  if (JSON.stringify(r.views.map(v => v.id + '/' + v.mode)) !== JSON.stringify(expected)) throw Error('Missing replay view');
  let trades = 0;
  for (const v of r.views) {
    if (JSON.stringify(v.variants.map(x => x.id)) !== JSON.stringify(['baseline', 'mes-rsi', 'mgc-morning', 'combined'])) throw Error('Missing variant');
    if (v.coverage.expected !== v.coverage.scored + v.coverage.missing.length) throw Error('Invalid coverage');
    for (const variant of v.variants) for (const cost of ['normal', 'stress']) {
      const x = variant.costs[cost], baseline = v.variants[0].costs[cost], d = x.comparison;
      if (x.executionAllowed !== false || x.wins + x.losses + x.flat !== x.count || cents(x.gross - x.fees) !== x.net
        || !Number.isFinite(x.drawdown) || x.drawdown < 0 || cents(x.balance - 25000) !== x.net) throw Error('Invalid replay totals');
      if (x.contributions.length !== 4 || new Set(x.contributions.map(m => m.symbol)).size !== 4
        || sum(x.contributions, 'count') !== x.count || sum(x.contributions, 'net') !== x.net) throw Error('Market totals mismatch');
      for (const key of ['daily', 'weeks']) if (sum(x.calendar[key], 'net') !== x.net || sum(x.calendar[key], 'trades') !== x.count) throw Error('Calendar mismatch');
      if (x.calendar.daily.length !== v.coverage.expected || (v.id === 'august' && x.calendar.weeks.length !== 5)) throw Error('Calendar incomplete');
      if (d.common + d.removed.count !== baseline.count || d.common + d.added.count !== x.count
        || cents(d.added.net - d.removed.net + d.commonNetChange) !== d.delta || cents(x.net - baseline.net) !== d.delta) throw Error('Trade attribution mismatch');
      for (const a of [d.removed, d.added]) if (a.wins + a.losses + a.flat !== a.count) throw Error('Outcome attribution mismatch');
      if (x.sourceCandidates - x.filteredCandidates !== Object.values(x.filterRejections).reduce((a, b) => a + b, 0)) throw Error('Filter refusals mismatch');
      trades += x.count;
    }
  }
  if (trades !== r.audit.executedTrades || r.evaluations.length !== 3 || r.evaluations.some(e => e.confirmed !== false
    || e.executionAllowed !== false || e.diagnosticImprovementPassed !== e.checks.every(c => c.pass))) throw Error('Invalid evaluation');
  return r;
}
