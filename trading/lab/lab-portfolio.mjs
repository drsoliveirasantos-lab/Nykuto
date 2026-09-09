import { verifyPortfolioReport } from './jeu29-report-validation.mjs';
const $ = id => document.getElementById('portfolio' + id);
const num = (n, decimals = 2) => n === null ? '—' : n === 'Infinity' ? '∞' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
const money = n => `${n > 0 ? '+' : ''}${num(n)} $`;
const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
const row = (body, values) => { const tr = node('tr', ''); for (const v of values) tr.append(node('td', String(v))); body.append(tr); };
const tables = ['Summary', 'Contributions', 'Activity', 'Windows', 'Refusals', 'Checks'];
const reasons = { occupied: 'Compte déjà occupé', simultaneous: 'Autre signal simultané admis', dailyEntries: 'Deux entrées déjà utilisées',
  dailyBrake: 'Frein quotidien', tradeRisk: 'Risque par trade trop élevé', dailyBudget: 'Budget quotidien insuffisant',
  floorReserve: 'Réserve du seuil insuffisante', sideLimit: 'Sens déjà utilisé sur ce marché', netReward: 'Gain potentiel net insuffisant',
  invalidStop: 'Stop non admissible', returnedInside: 'Retour dans la zone', outsideRange: 'Entrée hors de la zone' };
let report = null, loading = false;
function clear() { for (const name of tables) $(name).replaceChildren(); $('Coverage').textContent = ''; }
function show() {
  if (!report || !['normal', 'stress'].includes($('Costs').value)) return;
  clear(); const cost = $('Costs').value, d = report.diagnostic[cost];
  for (const [key, label] of [['normal', 'Initiaux'], ['stress', 'Doublés']]) {
    const x = report.diagnostic[key]; row($('Summary'), [label, x.trades, money(x.net), money(x.drawdown), `${num(x.metrics.win * 100, 1)} %`, num(x.metrics.pf, 2), num(x.metrics.dd, 2)]);
  }
  for (const c of d.contributions) row($('Contributions'), [c.symbol, c.trades, money(c.net), money(c.fees), c.signals, c.signals - c.trades]);
  row($('Activity'), [d.daily.observed, d.daily.positive, d.daily.negative, d.daily.flatActive, d.daily.noTrade, money(d.dailyMean), money(d.daily.worst)]);
  for (const w of report.windows) row($('Windows'), [w.start < '2026-03-01' ? 'Janvier–février' : 'Mars–avril', `${w.scored}/${w.expected}`,
    w.diagnostic[cost].trades, money(w.diagnostic[cost].net), num(w.diagnostic[cost].metrics.total, 2),
    w.account ? w.account[cost].status === 'breached' ? 'Seuil franchi' : w.account[cost].status === 'targetMet' ? 'Objectif atteint' : 'Objectif non atteint' : 'Non évaluable']);
  for (const [reason, count] of Object.entries(d.denied)) row($('Refusals'), [reasons[reason] || reason, count]);
  for (const check of report.checks) $('Checks').append(node('li', `${check.pass ? 'Réussi' : 'Échec'} : ${check.label}.`));
  $('Coverage').textContent = `${report.coverage.scored}/${report.coverage.expected} séances communes observées. Séances exclues : ${report.coverage.missing.map(x => `${x.day} (${x.markets.join(', ')})`).join(' ; ') || 'aucune'}. Elles ne sont pas comptées comme des jours sans trade.`;
}
async function load() {
  if (loading) return; loading = true; report = null; clear();
  $('Results').hidden = true; $('Retry').disabled = true; $('Costs').disabled = true;
  $('Status').textContent = 'Vérification du bilan…'; $('Message').textContent = 'Lecture du rapport du compte commun.';
  try {
    const res = await fetch('./jeu29-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable');
    report = await verifyPortfolioReport(await res.arrayBuffer()); show();
    $('Status').textContent = 'Portefeuille non qualifié';
    $('Message').textContent = `${report.checks.filter(c => !c.pass).length} critères en échec sur 8. Les profils restent en recherche ; aucun ordre autorisé.`;
    $('Results').hidden = false; $('Costs').disabled = false;
  } catch {
    report = null; clear(); $('Results').hidden = true; $('Status').textContent = 'Bilan indisponible';
    $('Message').textContent = 'Le rapport n’a pas pu être vérifié. Revérifie le bilan pour réessayer.';
  } finally { loading = false; $('Retry').disabled = false; }
}
$('Costs').addEventListener('change', show); $('Retry').addEventListener('click', load); load();
