// Guarded research-only derivative; the frozen Game45 file is NEVER edited.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {confidenceSizedTerms} from './jeu37-risk.mjs';
import {PROFIT_STUDY, profitStudyProfile, plannedNetTarget} from './profit-study-policy.mjs';
export function profitStudyTerms(signal, entry, time, product, factor, cap, variantId) {
  const profile = profitStudyProfile(variantId);
  const result = confidenceSizedTerms(signal, entry, time, product, factor, cap);
  if (result.terms && product.symbol === 'MNQ' &&
      plannedNetTarget(result.terms, product.multiplier) < profile.minimumNetTargetUSD)
    return {blocked: 'netTargetBelow100'};
  return result;
}
function replaceOnce(source, before, after) {
  if (source.split(before).length !== 2) throw Error('Frozen engine marker missing or repeated');
  return source.replace(before, after);
}
let modulePromise;
export async function loadProfitStudyEngine() {
  if (modulePromise) return modulePromise;
  const bytes = readFileSync(new URL('./jeu45-engine.mjs', import.meta.url));
  const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
  if (blob !== PROFIT_STUDY.sourceEngineBlob) throw Error('Game45 source identity changed; refuse experiment');
  let source = bytes.toString('utf8');
  source = replaceOnce(source,
    "if (!Array.isArray(streams) || streams.length !== 4 || new Set(streams.map(s => s.symbol)).size !== 4)",
    "if (!Array.isArray(streams) || !((streams.length === 1 && streams[0].symbol === 'MNQ') || (streams.length === 4 && new Set(streams.map(s => s.symbol)).size === 4)))");
  source = replaceOnce(source, "const ordered = JEU29_PROFILES.map(profile => {",
    "const ordered = (streams.length === 1 ? JEU29_PROFILES.filter(p => p.symbol === 'MNQ') : JEU29_PROFILES).map(profile => {");
  source = replaceOnce(source, "profileId = 'fixed100', timeExitSymbol = null) {",
    "profileId = 'fixed100', timeExitSymbol = null, experimentId = 'reference100') {\n  const experiment = profitStudyProfile(experimentId);");
  source = replaceOnce(source, 'dailyLoss:profile.dailyLoss,riskPerTrade:profile.maxRisk',
    'dailyLoss:200,riskPerTrade:experiment.maxRiskUSD');
  source = replaceOnce(source,
    "const requestedRiskUSD=s.symbol==='MGC'?100:desiredRisk(s.symbol,confidence,profileId);",
    "const requestedRiskUSD=s.symbol==='MNQ'?experiment.maxRiskUSD:s.symbol==='MGC'?100:desiredRisk(s.symbol,confidence,profileId);");
  source = replaceOnce(source,
    'const decision = confidenceSizedTerms(signal, bar.open, bar.time, s.product, costFactor, cap);',
    'const decision = profitStudyTerms(signal, bar.open, bar.time, s.product, costFactor, cap, experimentId);');
  // Data-URL module imports resolve to the exact repository files, not the network.
  source = source.replace(/from '(\.\/[^']+)'/g, (_, relative) => `from '${new URL(relative, import.meta.url).href}'`);
  source = `import {profitStudyProfile} from '${new URL('./profit-study-policy.mjs', import.meta.url).href}';\n` +
    `import {profitStudyTerms} from '${import.meta.url}';\n` + source;
  modulePromise = import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  return modulePromise;
}
