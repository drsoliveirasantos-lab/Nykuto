import { MARKET_AUDIT_REPORT as p } from './market-audit-public.mjs';
const cents = n => Math.round(n * 100) / 100;
export async function verifyMarketAudit(buffer) {
  if (buffer.byteLength !== p.bytes || !globalThis.crypto?.subtle) throw new Error('Unverifiable audit');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(n => n.toString(16).padStart(2, '0')).join('');
  if (sha !== p.sha256) throw new Error('Audit fingerprint mismatch');
  const r = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  if (r.schema !== p.schema || r.freezeSha256 !== p.freezeSha256 || r.definitionCommit !== p.definitionCommit
    || r.executionAllowed !== false || r.researchOnly !== true || r.independentConfirmation !== false
    || r.newStrategyTrials !== 0 || r.configurationCount !== 67 || r.inventory.length !== 67 || r.audit.passed !== true)
    throw new Error('Invalid audit state');
  const checkStats = s => { if (!Number.isSafeInteger(s.count) || s.count < 0 || s.wins + s.losses + s.flat !== s.count
    || !Number.isFinite(s.net) || cents(s.net + s.fees) !== s.gross || (!s.count && s.winRate !== null)) throw new Error('Invalid audit statistics'); };
  if (r.views.length !== 4 || new Set(r.views.map(v => v.id + '/' + v.mode)).size !== 4) throw new Error('Invalid audit views');
  for (const v of r.views) {
    if (!['diagnostic', 'account'].includes(v.mode) || (v.mode === 'account' && v.id !== 'august')) throw new Error('Invalid account window');
    for (const cost of ['normal', 'stress']) {
      const x = v.costs[cost]; checkStats(x.summary);
      if (x.markets.length !== 4 || new Set(x.markets.map(m => m.symbol)).size !== 4
        || cents(x.markets.reduce((n, m) => n + m.total.net, 0)) !== x.summary.net
        || x.markets.reduce((n, m) => n + m.total.count, 0) !== x.summary.count) throw new Error('Market reconciliation failed');
      for (const m of x.markets) {
        checkStats(m.total);
        if (m.signals !== m.admitted + m.refused || m.admitted !== m.total.count
          || m.refusals.reduce((n, d) => n + d.count, 0) !== m.refused || m.classes.reduce((n, c) => n + c.count, 0) !== m.total.count) throw new Error('Invalid audit classes');
        for (const c of m.classes) {
          for (const a of Object.values(c.features)) if (a.known + a.missing !== c.count || (!a.known && a.mean !== null)) throw new Error('Unknown replaced with zero');
          for (const a of Object.values(c.checks)) if (a.yes + a.no + a.unknown !== c.count) throw new Error('Unknown confirmation omitted');
          if (c.path.oneRConfirmed + c.path.oneRUnknown + c.path.oneRNotReached !== c.count) throw new Error('Invalid path bounds');
        }
        for (const group of [m.bySide, m.byHour, m.byWeekday, m.byExit, ...m.byConfirmation.map(c => c.groups)]) {
          group.forEach(checkStats);
          if (group.reduce((n, a) => n + a.count, 0) !== m.total.count || cents(group.reduce((n, a) => n + a.net, 0)) !== m.total.net) throw new Error('Subgroup reconciliation failed');
        }
      }
    }
    for (const a of [v.costAttribution.all, ...v.costAttribution.markets]) if (cents(a.matchedFeesEffect + a.matchedGrossEffect + a.removedNormalEffect + a.addedStressEffect) !== a.delta) throw new Error('Cost attribution failed');
  }
  if (r.primary.markets.reduce((n, m) => n + m.count, 0) !== r.primary.observations) throw new Error('Duplicate primary observations');
  return r;
}
