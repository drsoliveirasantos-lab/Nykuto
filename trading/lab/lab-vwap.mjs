import { verifyVwapReport } from './jeu18-report-validation.mjs';
const $ = id => document.getElementById(id);
const number = (n, d = 2) => n === null ? '—' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const cash = n => `${n > 0 ? '+' : ''}${number(n)} $`;
const node = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
function row(parent, cells) { const tr = node('tr', ''); for (const text of cells) tr.append(node('td', text)); parent.append(tr); }
const states = { breached: 'Compte perdu', targetMet: 'Objectif atteint · indicatif', incomplete: 'Objectif non atteint' };
let report;
function show() {
  if (!report) return;
  const cost = $('vwapCosts').value, candidate = report.results.find(r => r.id === 'vwap'), d = candidate.diagnostic[cost];
  $('vwapNet').textContent = cash(d.net);
  $('vwapTrades').textContent = `${d.trades} trades`;
  $('vwapDaily').textContent = `${d.daily.positive} jours positifs · ${d.daily.negative} négatifs · ${d.daily.noTrade} sans trade`;
  $('vwapWorst').textContent = cash(d.daily.worst);
  $('vwapDrawdown').textContent = `Drawdown réalisé : ${number(d.drawdown)} $ · ${number(d.metrics.dd)} R`;
  $('vwapComparison').replaceChildren();
  for (const r of report.results) { const a = r.diagnostic[cost]; row($('vwapComparison'), [r.label, String(a.trades), cash(a.grossDollars), number(a.feesDollars), cash(a.net), number(a.metrics.pf, 3)]); }
  const f = report.filterSummary;
  $('vwapSignals').textContent = `${f.considered} signaux de base sur les séances évaluables : ${f.accepted} du bon côté du VWAP, ${f.priceSide} refusés, ${f.unavailable} sans VWAP disponible. Ce décompte inclut les signaux pendant une position et ne correspond pas au nombre de trades.`;
  $('vwapRefusals').textContent = `Après le filtre, ${d.signalCount} signaux examinés à plat : ${d.denied.tradeRisk} refus pour risque par trade, ${d.denied.netReward} pour marge nette, ${d.denied.dailyBudget} pour budget de journée et ${d.denied.floorReserve} pour réserve du compte.`;
  $('vwapAccounts').replaceChildren();
  for (const w of candidate.windows) {
    if (!w.complete) { row($('vwapAccounts'), [`${w.start} → ${w.end} exclu`, `${w.scored}/${w.expected}`, 'Données incomplètes', '—', '—']); continue; }
    const a = w[cost]; row($('vwapAccounts'), [`${w.start} → ${w.end} exclu`, `${w.scored}/${w.expected}`, states[a.status], String(a.trades), cash(a.net)]);
  }
  $('vwapChecks').replaceChildren(...candidate.checks.map(c => node('li', `${c.pass ? 'Satisfait' : 'Non satisfait'} — ${c.label}`)));
}
async function load() {
  try {
    const res = await fetch('./jeu18-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable');
    report = await verifyVwapReport(await res.arrayBuffer());
    $('vwapStatus').textContent = 'Filtre non retenu';
    $('vwapMessage').textContent = 'Le filtre écarte 147 signaux mais ne change aucun trade exécuté dans les simulations. Aucun gain de performance, aucun modèle confirmé.';
    $('vwapAudit').textContent = `${report.audit.signalPrefixes} préfixes de signaux et ${report.audit.vwapPrefixes} de VWAP vérifiés ; ${report.audit.accountPrefixes} préfixes de comptes ; ${report.audit.vwapTrades} trades VWAP audités et ${report.audit.legacyTrades} reproductions de référence. Les contrôles réutilisent les mêmes observations.`;
    $('vwapResults').hidden = false; show();
  } catch {
    report = null; $('vwapStatus').textContent = 'Bilan indisponible'; $('vwapResults').hidden = true;
    $('vwapMessage').textContent = 'Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';
  }
}
$('vwapCosts').addEventListener('change', show);
load();
