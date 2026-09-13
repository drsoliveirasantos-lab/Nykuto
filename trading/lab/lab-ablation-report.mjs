import { verifyAblationReport } from './jeu17-report-validation.mjs';
const $ = id => document.getElementById(id);
const number = (n, d = 2) => n === null ? '—' : n === 'Infinity' ? '∞' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const cash = n => `${n > 0 ? '+' : ''}${number(n)} $`;
const R = n => `${n > 0 ? '+' : ''}${number(n)} R`;
const node = (tag, text) => { const n = document.createElement(tag); n.textContent = text; return n; };
function row(parent, cells) { const tr = node('tr', ''); for (const text of cells) tr.append(node('td', text)); parent.append(tr); }
const state = { breached: 'Compte perdu dans la simulation', targetMet: 'Objectif atteint · indicatif', incomplete: 'Objectif non atteint sur la période' };
let report;
function show() {
  if (!report) return;
  const factor = $('ablationCosts').value, s = report.results.find(s => s.id === $('ablationScenario').value), d = s.diagnostic[factor];
  $('ablationNet').textContent = cash(d.net);
  $('ablationGross').textContent = `${cash(d.grossDollars)} avant coûts − ${number(d.feesDollars)} $ de coûts`;
  $('ablationTrades').textContent = `${d.trades} trades`;
  $('ablationDaily').textContent = `${d.daily.positive} jours positifs · ${d.daily.negative} négatifs · ${d.daily.noTrade} sans trade`;
  $('ablationWorst').textContent = cash(d.daily.worst);
  $('ablationDD').textContent = `Drawdown réalisé : ${number(d.drawdown)} $ · ${number(d.metrics.dd)} R`;
  $('ablationComparison').replaceChildren();
  for (const r of report.results) { const a = r.diagnostic[factor]; row($('ablationComparison'), [r.label, String(a.trades), cash(a.net), R(a.metrics.total), number(a.dollarPF, 3), number(a.metrics.pf, 3)]); }
  $('ablationEffects').replaceChildren();
  for (const effect of report.effects) { const e = effect[factor]; row($('ablationEffects'), [effect.label, cash(e.netDollars), cash(e.grossDollars), cash(e.feesDollars), String(e.trades)]); }
  $('ablationActivity').textContent = `Séances à 0 trade : ${d.daily.noTrade} ; à 1 : ${d.frequency[1]} ; à 2 : ${d.frequency[2]} ; à 3 : ${d.frequency[3]}. Gain moyen d’un trade gagnant : ${cash(d.averageWin)} ; perte moyenne d’un perdant : ${cash(d.averageLoss)}. Win rate : ${number(d.metrics.win * 100, 1)} %.`;
  const x = d.denied;
  $('ablationRejected').textContent = `${d.signalCount} signaux examinés à plat ; refus pour risque : ${x.tradeRisk}, absence de pivot intact : ${x.missingPivot}, open au-delà du pivot : ${x.invalidPivot}, marge nette insuffisante : ${x.netReward}, budget journalier : ${x.dailyBudget}, réserve MLL : ${x.floorReserve}. Ces refus ne sont pas des trades.`;
  $('ablationExits').textContent = `${d.exits.Target || 0} sorties Target ; ${d.exits.Stop || 0} sorties Stop ; ${d.exits['Session close'] || 0} sorties avant clôture. ${d.ambiguous} bougie(s) de sortie ambiguë.`;
  $('ablationAccounts').replaceChildren(); $('ablationWindows').replaceChildren();
  for (const w of s.windows) {
    const label = `${w.start} → ${w.end} exclu`;
    if (!w.complete) { row($('ablationAccounts'), [label, `${w.scored}/${w.expected}`, 'Données incomplètes', '—', '—']); continue; }
    const a = w[factor], wd = w.diagnostic[factor];
    row($('ablationAccounts'), [label, `${w.scored}/${w.expected}`, state[a.status], String(a.trades), cash(a.net)]);
    row($('ablationWindows'), [label, String(wd.metrics.count), cash(wd.netDollars), R(wd.metrics.total)]);
  }
  $('ablationChecks').replaceChildren(...s.checks.map(c => node('li', `${c.pass ? 'Satisfait' : 'Non satisfait'} — ${c.label}`)));
  $('ablationReadiness').replaceChildren(...report.readiness.map(r => node('li', `À réaliser — ${r.label}`)));
}
async function load() {
  try {
    const res = await fetch('./jeu17-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable');
    report = await verifyAblationReport(await res.arrayBuffer());
    $('ablationStatus').textContent = 'Non confirmé';
    $('ablationMessage').textContent = 'Sur cet historique, le stop pivot dégrade le résultat. Le filtre de marge limite certaines pertes, mais aucune des quatre configurations ne satisfait les critères.';
    $('ablationFreshness').textContent = `Même historique déjà examiné : ${report.coverage.first} → ${report.coverage.last}, ${report.coverage.scoredSessions} séances évaluables. Aucun flux actuel ajouté.`;
    $('ablationAudit').textContent = `${report.audit.signalPrefixes} contrôles des signaux par préfixes ; ${report.audit.pivotPrefixes} contrôles des pivots ; ${report.audit.accountPrefixes} comparaisons de comptes par préfixes ; ${report.audit.trades} trades audités, dont ${report.audit.ablationPivots} pivots et ${report.audit.legacyTrades} reproductions de trades de référence. Les fenêtres et coûts réutilisent les mêmes observations.`;
    $('ablationResults').hidden = false; show();
  } catch {
    report = null; $('ablationStatus').textContent = 'Bilan indisponible'; $('ablationResults').hidden = true;
    $('ablationMessage').textContent = 'Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';
  }
}
$('ablationCosts').addEventListener('change', show);
$('ablationScenario').addEventListener('change', show);
load();
