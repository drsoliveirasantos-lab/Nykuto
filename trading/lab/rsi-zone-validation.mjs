import { RSI_ZONE_REPORT as p } from './rsi-zone-public.mjs';
const cents = n => Math.round(n * 100) / 100;
export async function verifyRsiZones(buffer, parent) {
  if (buffer.byteLength !== p.bytes || !globalThis.crypto?.subtle) throw new Error('Unverifiable RSI report');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buffer))].map(n => n.toString(16).padStart(2, '0')).join('');
  if (sha !== p.sha256) throw new Error('RSI fingerprint mismatch');
  const r = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  if (r.schema !== p.schema || r.parentAuditSha256 !== p.parentAuditSha256 || r.definitionSha256 !== p.definitionSha256
    || r.sourceSha256 !== p.sourceSha256 || r.executionAllowed !== false || r.newStrategyTrials !== 0 || r.configurationCount !== 67
    || r.method.period !== 14 || r.method.timeframeMinutes !== 5 || r.method.oversoldBelow !== 30 || r.method.overboughtAbove !== 70
    || r.primary.total.count !== parent.primary.observations || r.views.length !== parent.views.length) throw new Error('Invalid RSI audit state');
  const validate = m => {
    for (const groups of [m.zones, m.events, m.bySide.flatMap(s => s.zones)]) {
      if (groups.reduce((n, g) => n + g.count, 0) !== m.total.count || cents(groups.reduce((n, g) => n + g.net, 0)) !== m.total.net
        || groups.some(g => g.count !== g.wins + g.losses + g.flat || !Number.isSafeInteger(g.count) || g.count < 0)) throw new Error('RSI group reconciliation failed');
    }
  };
  validate(r.primary); r.primary.markets.forEach(validate);
  for (const v of r.views) {
    const pv = parent.views.find(pv => pv.id === v.id && pv.mode === v.mode); if (!pv) throw new Error('Unknown RSI view');
    for (const cost of ['normal', 'stress']) {
      const ms = v.costs[cost].markets;
      if (ms.length !== 4 || new Set(ms.map(m => m.symbol)).size !== 4) throw new Error('Missing RSI market');
      for (const m of ms) { validate(m); const pm = pv.costs[cost].markets.find(pm => pm.symbol === m.symbol);
        if (!pm || pm.total.count !== m.total.count || pm.total.net !== m.total.net) throw new Error('Mismatched RSI observations'); }
    }
  }
  return r;
}
