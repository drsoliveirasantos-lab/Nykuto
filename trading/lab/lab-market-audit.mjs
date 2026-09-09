import { verifyMarketAudit } from './market-audit-validation.mjs';
import { verifyRsiZones } from './rsi-zone-validation.mjs';
import { MARKET_AUDIT_FINDINGS, AUDIT_REASON_LABELS } from './market-audit-findings.mjs';
const $ = id => document.getElementById('audit' + id);
const num = (n, d = 2) => n === null ? '—' : n === 'Infinity' ? '∞' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const money = n => n === null ? '—' : `${n > 0 ? '+' : ''}${num(n)} $`;
const el = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
const row = (body, values) => { const tr = el('tr', ''); values.forEach(v => tr.append(el('td', String(v)))); body.append(tr); };
const tableIds = ['Overview', 'Outcomes', 'Confirmations', 'Features', 'Groups', 'Refusals', 'CostEffects', 'RsiZones', 'RsiEvents', 'RsiSides'];
const labels = { trend: 'EMA + VWAP alignés au sens', structure: 'Swings confirmés alignés', momentum: 'RSI > 50 à l’achat / < 50 à la vente', volume: 'Volume relatif ≥ 1', pattern: 'Forme directionnelle définie' };
const features = { plannedRiskUSD: 'Risque initial frais compris ($)', costRiskRatio: 'Coûts / risque de prix', netRewardRisk: 'Gain / risque net prévu',
  rangeWidthR: 'Largeur de zone (R)', breakoutDelayMinutes: 'Délai depuis cassure (min)', emaGapR: 'Écart EMA orienté (R)',
  vwapDistanceR: 'Écart VWAP orienté (R)', rsi: 'RSI brut (sens à considérer)', relativeVolume: 'Volume relatif', signalBodyRatio: 'Corps / amplitude du signal' };
const exits = { Stop: 'Stop', Target: 'Objectif', 'Break-even stop': 'Protection à zéro', 'Session close': 'Clôture de séance' };
let report = null, rsiReport = null, loading = false;
function clear() { tableIds.forEach(id => $(id).replaceChildren()); ['Summary', 'Finding', 'Sample'].forEach(id => { $(id).textContent = ''; }); }
function show() {
  if (!report) return;
  const v = report.views.find(v => v.id + '/' + v.mode === $('View').value), cost = $('Costs').value;
  if (!v || !['normal', 'stress'].includes(cost)) return;
  const m = v.costs[cost].markets.find(m => m.symbol === $('Market').value); if (!m) return;
  clear(); const s = m.total;
  for (const symbol of ['MES', 'MGC', 'MNQ', 'MYM']) {
    const a = report.views.filter(v => v.mode === 'diagnostic').map(v => v.costs[cost].markets.find(m => m.symbol === symbol).total);
    row($('Overview'), [symbol, ...a.map(x => `${money(x.net)} · ${x.count} trades`)]);
  }
  $('Summary').textContent = `${m.symbol} : ${s.count} trades, ${money(s.net)}, ${s.winRate === null ? '—' : num(s.winRate * 100, 1) + ' %'} gagnants. Espérance : ${money(s.averageNet)} par trade ; ${num(s.expectancyR)} R. PF USD : ${num(s.profitFactorUSD)} ; PF R : ${num(s.profitFactorR)}.`;
  $('Sample').textContent = `${v.costs[cost].days} séances communes observées. ${m.signals} signaux : ${m.admitted} admis, ${m.refused} refusés. Les refus indiquent le premier motif, sans résultat hypothétique. Sans le meilleur trade observé : ${money(s.netWithoutBestTrade)} (mesure de concentration).`;
  $('Finding').textContent = MARKET_AUDIT_FINDINGS[m.symbol];
  for (const c of m.classes) row($('Outcomes'), [{ win: 'Gagnants', loss: 'Perdants', flat: 'À zéro' }[c.outcome], c.count,
    money(c.outcome === 'win' ? s.averageWin : c.outcome === 'loss' ? s.averageLoss === null ? null : -s.averageLoss : c.count ? 0 : null),
    `${c.path.oneRConfirmed} / ${c.path.oneRUnknown} / ${c.path.oneRNotReached}`, c.path.closedOneRBeforeExit,
    c.count ? `${num(c.path.meanMfeLowerR)}–${num(c.path.meanMfeUpperR)}` : '—',
    c.count ? `${num(c.path.meanMaeLowerR)}–${num(c.path.meanMaeUpperR)}` : '—', c.path.protectionActivated]);
  const rsi = rsiReport.views.find(x => x.id === v.id && x.mode === v.mode).costs[cost].markets.find(x => x.symbol === m.symbol);
  const zones = { oversold: 'Survente : RSI < 30', middle: 'Intermédiaire : 30 ≤ RSI ≤ 70', overbought: 'Surachat : RSI > 70', unknown: 'RSI inconnu' };
  const events = { 'leave-oversold': 'Remontée depuis < 30 vers ≥ 30', 'leave-overbought': 'Repli depuis > 70 vers ≤ 70', none: 'Aucune sortie de zone', unknown: 'Franchissement inconnu' };
  for (const g of rsi.zones) row($('RsiZones'), [zones[g.value], g.count, g.wins, g.losses, g.flat, money(g.net)]);
  for (const g of rsi.events) row($('RsiEvents'), [events[g.value], g.count, g.wins, g.losses, g.flat, money(g.net)]);
  for (const side of rsi.bySide) for (const g of side.zones) row($('RsiSides'), [side.side === 'Long' ? 'Achat' : 'Vente', zones[g.value], g.count, g.wins, g.losses, money(g.net)]);
  const win = m.classes.find(c => c.outcome === 'win'), loss = m.classes.find(c => c.outcome === 'loss');
  const check = a => `${a.yes}/${a.yes + a.no} connus · ${a.unknown} inconnus`;
  for (const k of Object.keys(labels)) row($('Confirmations'), [labels[k], check(win.checks[k]), check(loss.checks[k])]);
  const feature = x => `${num(x.mean)} / ${num(x.median)} · n=${x.known}, ?=${x.missing}`;
  for (const [k, label] of Object.entries(features)) row($('Features'), [label, feature(win.features[k]), feature(loss.features[k])]);
  const weekdays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  for (const [label, groups] of [['Sens', m.bySide], ['Heure NY', m.byHour], ['Jour', m.byWeekday], ['Sortie', m.byExit]])
    for (const g of groups) row($('Groups'), [label, label === 'Jour' ? weekdays[g.value] : exits[g.value] || ({ Long: 'Achat', Short: 'Vente' })[g.value] || g.value, g.count, money(g.net), g.winRate === null ? '—' : num(g.winRate * 100, 1) + ' %']);
  for (const d of m.refusals) row($('Refusals'), [AUDIT_REASON_LABELS[d.reason] || d.reason, d.count]);
  const a = v.costAttribution.markets.find(x => x.symbol === m.symbol);
  for (const [label, value] of [['Frais supplémentaires des entrées communes', a.matchedFeesEffect], ['Sorties brutes des entrées communes', a.matchedGrossEffect],
    ['Retrait des trades présents seulement aux coûts initiaux', a.removedNormalEffect], ['Ajout des trades présents seulement aux coûts doublés', a.addedStressEffect], ['Écart net total doublés − initiaux', a.delta]]) row($('CostEffects'), [label, money(value)]);
  $('Results').hidden = false;
}
async function load() {
  if (loading) return; loading = true; report = null; rsiReport = null; clear(); $('Results').hidden = true;
  ['Retry', 'Market', 'View', 'Costs'].forEach(id => { $(id).disabled = true; }); $('Status').textContent = 'Vérification de l’audit…';
  try {
    const res = await fetch('./market-audit-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable');
    report = await verifyMarketAudit(await res.arrayBuffer());
    const rsiResponse = await fetch('./rsi-zone-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!rsiResponse.ok || !rsiResponse.headers.get('Content-Type')?.includes('application/json')) throw new Error('RSI unavailable');
    rsiReport = await verifyRsiZones(await rsiResponse.arrayBuffer(), report); show(); $('Status').textContent = 'Audit descriptif · bot non qualifié';
    ['Market', 'View', 'Costs'].forEach(id => { $(id).disabled = false; });
  } catch { report = null; rsiReport = null; clear(); $('Results').hidden = true; $('Status').textContent = 'Audit indisponible. Revérifie pour réessayer.'; }
  finally { loading = false; $('Retry').disabled = false; }
}
['Market', 'View', 'Costs'].forEach(id => $(id).addEventListener('change', show)); $('Retry').addEventListener('click', load); load();
