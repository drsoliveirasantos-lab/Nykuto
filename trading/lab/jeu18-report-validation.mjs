import { JEU18_PUBLIC as expected } from './jeu18-public.mjs';
import { JEU18_POLICY as policy, JEU18_SCENARIOS as scenarios } from './jeu18-policy.mjs';
import { JEU14_SOURCE as source } from './jeu14-source.mjs';

export async function verifyVwapReport(buffer) {
  if (buffer.byteLength !== expected.bytes || !globalThis.crypto?.subtle) throw new Error('Unverifiable report');
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hash = [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
  if (hash !== expected.sha256) throw new Error('Report fingerprint mismatch');
  const v = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer));
  if (v.schema !== expected.schema || v.protocol !== policy.version || v.protocolSha256 !== expected.protocolSha256 || v.freezeSha256 !== expected.freezeSha256 || v.source?.sha256 !== source.sha256 || v.confirmed !== false || v.audit?.passed !== true || v.policy?.brokerEnabled !== false || v.policy?.paperEnabled !== false || v.policy?.liveFeed !== false || v.results?.length !== 2 || v.effects?.length !== 2 || v.coverage?.scoredSessions !== 330 || v.readiness?.some(r => r.ready !== false)) throw new Error('Invalid report');
  if (!Number.isInteger(v.filterSummary?.considered) || v.filterSummary.considered !== v.filterSummary.accepted + v.filterSummary.priceSide + v.filterSummary.unavailable) throw new Error('Invalid filter counts');
  for (const s of scenarios) {
    const r = v.results.find(r => r.id === s.id);
    if (!r || r.confirmed !== false || r.windows?.length !== 8 || r.checks?.length !== 7 || !Number.isFinite(r.diagnostic?.normal?.net) || !Number.isFinite(r.diagnostic?.stress?.net)) throw new Error('Invalid scenario');
  }
  return v;
}
