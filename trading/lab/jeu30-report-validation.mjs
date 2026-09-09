import { AUGUST_REPORT as p } from './jeu30-public.mjs';
const cents = n => Math.round(n * 100) / 100;
export async function verifyAugustReport(buffer) {
  if (buffer.byteLength !== p.bytes || !globalThis.crypto?.subtle) throw new Error('Unverifiable report');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(n => n.toString(16).padStart(2, '0')).join('');
  if (sha !== p.sha256) throw new Error('Report fingerprint mismatch');
  const r = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  if (r.schema !== p.schema || r.freezeSha256 !== p.freezeSha256 || r.protocolSha256 !== p.protocolSha256 || r.prePerformanceCommit !== p.prePerformanceCommit
    || r.policy.from !== '2026-08-01' || r.policy.end !== '2026-09-01' || r.policy.economicRulesChanged !== false
    || ['independent', 'confirmed', 'executionAllowed', 'paperEnabled', 'shadowEnabled', 'brokerEnabled', 'liveFeed'].some(k => r.policy[k] !== false)
    || r.confirmed !== false || r.executionAllowed !== false || r.audit.passed !== true || r.selection.id !== null
    || r.selection.attempted !== 1 || r.selection.cumulativeAttempts !== 67 || r.holdout.status !== 'evaluated-by-request' || r.holdout.qualified !== false
    || r.coverage.scored + r.coverage.missing.length !== r.coverage.expected || (r.coverage.missing.length && r.account !== null)) throw new Error('Invalid August research state');
  for (const mode of ['diagnostic', 'account']) {
    if (r[mode] === null) continue;
    for (const cost of ['normal', 'stress']) {
      const x = r[mode][cost], rows = x.calendar.daily, weeks = x.calendar.weeks, known = rows.filter(d => d.net !== null);
      if (x.executionAllowed !== false || !Number.isInteger(x.trades) || x.trades < 0 || x.metrics.count !== x.trades
        || rows.length !== r.coverage.expected || new Set(rows.map(d => d.day)).size !== rows.length
        || rows.some((d, i) => d.day < r.policy.from || d.day >= r.policy.end || (i && d.day <= rows[i - 1].day))
        || x.daily.observed !== known.length || known.reduce((n, d) => n + d.trades, 0) !== x.trades
        || cents(known.reduce((n, d) => n + d.net, 0)) !== x.net || cents(weeks.reduce((n, w) => n + (w.net ?? 0), 0)) !== x.net
        || cents(x.balance - 25000) !== x.net || x.daily.positive + x.daily.negative + x.daily.flatActive + x.daily.noTrade !== known.length)
        throw new Error('Invalid August totals');
      let cumulative = 0;
      for (const d of rows) {
        if (d.net === null) { if (!['missing-data', 'stopped-target', 'stopped-breach'].includes(d.state) || d.trades !== null) throw new Error('Unknown day replaced with zero'); continue; }
        cumulative = cents(cumulative + d.net);
        if (d.trades < 0 || d.trades > 2 || !Number.isInteger(d.trades) || d.cumulative !== cumulative || cents(d.balance - 25000) !== cumulative
          || cents(d.contributions.reduce((n, c) => n + c.net, 0)) !== d.net) throw new Error('Invalid continuous daily balance');
      }
      if (new Set(weeks.map(w => w.week)).size !== weeks.length || weeks.reduce((n, w) => n + w.expectedSessions, 0) !== rows.length) throw new Error('Invalid weeks');
      for (const w of weeks) {
        const same = rows.filter(d => d.week === w.week), scored = same.filter(d => d.net !== null);
        if (same.length !== w.expectedSessions || scored.length !== w.simulatedSessions || (scored.length ? cents(scored.reduce((n, d) => n + d.net, 0)) : null) !== w.net
          || w.cumulative !== (scored.at(-1)?.cumulative ?? null)) throw new Error('Weekly reconciliation failed');
      }
      if (cents(x.contributions.reduce((n, c) => n + c.net, 0)) !== x.net || x.contributions.reduce((n, c) => n + c.trades, 0) !== x.trades
        || x.trades + Object.values(x.denied).reduce((n, v) => n + v, 0) !== x.signalCount) throw new Error('Invalid market totals');
    }
  }
  return r;
}
