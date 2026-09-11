import { verifyStructuralReport } from './jeu16-report-validation.mjs';
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
  const factor = $('structuralCosts').value, s = report.results.find(s => s.id === $('structuralScenario').value), d = s.diagnostic[factor];
  $('structuralNet').textContent = cash(d.net);
  $('structuralGross').textContent = `${cash(d.grossDollars)} avant coûts − ${number(d.feesDollars)} $ de coûts`;
  $('structuralTrades').textContent = `${d.trades} trades`;
  $('structuralDaily').textContent = `${d.daily.positive} jours positifs · ${d.daily.negative} négatifs · ${d.daily.noTrade} sans trade`;
  $('structuralWorst').textContent = cash(d.daily.worst);
  $('structuralDD').textContent = `Drawdown réalisé : ${number(d.drawdown)} $ · ${number(d.metrics.dd)} R`;
  $('structuralComparison').replaceChildren();
  for (const r of report.results) { const a = r.diagnostic[factor]; row($('structuralComparison'), [r.label, String(a.trades), cash(a.net), R(a.metrics.total), number(a.dollarPF, 3), number(a.metrics.pf, 3)]); }
  $('structuralActivity').textContent = `Séances à 0 trade : ${d.daily.noTrade} ; à 1 : ${d.frequency[1]} ; à 2 : ${d.frequency[2]} ; à 3 : ${d.frequency[3]}. Gain moyen d’un trade gagnant : ${cash(d.averageWin)} ; perte moyenne d’un perdant : ${cash(d.averageLoss)}. Win rate : ${number(d.metrics.win * 100, 1)} %.`;
  const x = d.denied;
  $('structuralRejected').textContent = `${d.signalCount} signaux examinés à plat ; refus pour risque : ${x.tradeRisk}, absence de pivot intact : ${x.missingPivot}, open au-delà du pivot : ${x.invalidPivot}, marge nette insuffisante : ${x.netReward}, budget journalier : ${x.dailyBudget}, réserve MLL : ${x.floorReserve}. Ces refus ne sont pas des trades.`;
  $('structuralExits').textContent = `${d.exits.Target || 0} sorties Target ; ${d.exits.Stop || 0} sorties Stop ; ${d.exits['Session close'] || 0} sorties avant clôture. ${d.ambiguous} bougie(s) de sortie ambiguë.`;
  $('structuralAccounts').replaceChildren(); $('structuralWindows').replaceChildren();
  for (const w of s.windows) {
    const label = `${w.start} → ${w.end} exclu`;
    if (!w.complete) { row($('structuralAccounts'), [label, `${w.scored}/${w.expected}`, 'Données incomplètes', '—', '—']); continue; }
    const a = w[factor], wd = w.diagnostic[factor];
    row($('structuralAccounts'), [label, `${w.scored}/${w.expected}`, state[a.status], String(a.trades), cash(a.net)]);
    row($('structuralWindows'), [label, String(wd.metrics.count), cash(wd.netDollars), R(wd.metrics.total)]);
  }
  $('structuralChecks').replaceChildren(...s.checks.map(c => node('li', `${c.pass ? 'Satisfait' : 'Non satisfait'} — ${c.label}`)));
  $('structuralReadiness').replaceChildren(...report.readiness.map(r => node('li', `À réaliser — ${r.label}`)));
}
async function load() {
  try {
    const res = await fetch('./jeu16-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable');
    report = await verifyStructuralReport(await res.arrayBuffer());
    $('structuralStatus').textContent = 'Non confirmé';
    $('structuralMessage').textContent = 'Variante non retenue : davantage de trades, mais un résultat inférieur à la référence et négatif avec les deux coûts. Les critères restent inchangés et le bot désactivé.';
    $('structuralFreshness').textContent = `Même historique déjà examiné : ${report.coverage.first} → ${report.coverage.last}, ${report.coverage.scoredSessions} séances évaluables. Aucun flux actuel ajouté.`;
    $('structuralAudit').textContent = `${report.audit.signalPrefixes} contrôles des signaux par préfixes ; ${report.audit.pivotPrefixes} contrôles des pivots ; ${report.audit.accountPrefixes} comparaisons de comptes par préfixes ; ${report.audit.trades} trades audités, dont ${report.audit.structuralPivots} pivots et ${report.audit.legacyTrades} reproductions de trades de référence. Les fenêtres et coûts réutilisent les mêmes observations.`;
    $('structuralResults').hidden = false; show();
  } catch {
    report = null; $('structuralStatus').textContent = 'Bilan indisponible'; $('structuralResults').hidden = true;
    $('structuralMessage').textContent = 'Le rapport n’a pas pu être vérifié. Recharge la page pour réessayer.';
  }
}
$('structuralCosts').addEventListener('change', show);
$('structuralScenario').addEventListener('change', show);
load();
