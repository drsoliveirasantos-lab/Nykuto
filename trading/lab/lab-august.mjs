import { verifyAugustReport } from './jeu30-report-validation.mjs';
const $ = id => document.getElementById('august' + id);
const num = (n, decimals = 2) => n === null ? '—' : n === 'Infinity' ? '∞' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
const money = n => n === null ? '—' : `${n > 0 ? '+' : ''}${num(n)} $`;
const date = d => d.slice(8, 10) + '/' + d.slice(5, 7);
const node = (tag, text) => { const el = document.createElement(tag); el.textContent = text; return el; };
const row = (body, values) => { const tr = node('tr', ''); for (const v of values) tr.append(node('td', String(v))); body.append(tr); };
const states = { positive: 'Positive', negative: 'Négative', 'flat-active': 'Active à zéro', 'no-trade': 'Sans trade',
  'missing-data': 'Données absentes', 'stopped-target': 'Arrêt après objectif', 'stopped-breach': 'Arrêt après seuil' };
const reasons = { occupied: 'Compte occupé', netReward: 'Gain potentiel net insuffisant', dailyEntries: 'Deux entrées déjà utilisées',
  sideLimit: 'Sens déjà utilisé', simultaneous: 'Autre signal simultané admis', tradeRisk: 'Plafond par trade',
  dailyBudget: 'Budget quotidien', dailyBrake: 'Frein quotidien', floorReserve: 'Réserve du seuil' };
let report = null, loading = false;
function clear() { for (const id of ['Summary', 'Weeks', 'Days', 'Contributions', 'Refusals']) $(id).replaceChildren(); $('Activity').textContent = ''; }
function show() {
  if (!report || !['account', 'diagnostic'].includes($('Mode').value) || !['normal', 'stress'].includes($('Costs').value)) return;
  clear(); const mode = $('Mode').value, costs = report[mode];
  if (!costs) { $('Results').hidden = true; $('Message').textContent = 'Compte non évaluable : données incomplètes. Le diagnostic reste consultable dans le menu.'; return; }
  const cost = $('Costs').value, x = costs[cost];
  for (const [key, label] of [['normal', 'Initiaux'], ['stress', 'Doublés']]) {
    const a = costs[key]; row($('Summary'), [label, a.trades, money(a.net), money(a.balance), money(a.drawdown),
      a.metrics.win === null ? '—' : `${num(a.metrics.win * 100, 1)} %`, mode === 'diagnostic' ? 'Diagnostic' : a.status === 'breached' ? 'Seuil franchi' : a.status === 'targetMet' ? 'Objectif atteint' : 'Objectif non atteint']);
  }
  for (const w of x.calendar.weeks) row($('Weeks'), [w.first === w.last ? `${date(w.first)} · partielle` : `${date(w.first)}–${date(w.last)}`,
    `${w.simulatedSessions}/${w.expectedSessions}`, w.trades ?? '—', money(w.net), money(w.cumulative), money(w.balance)]);
  for (const d of x.calendar.daily) row($('Days'), [date(d.day), d.trades ?? '—', money(d.net), money(d.cumulative), money(d.balance), states[d.state] || d.state]);
  for (const c of x.contributions) row($('Contributions'), [c.symbol, c.trades, money(c.net), money(c.fees)]);
  for (const [key, n] of Object.entries(x.denied)) row($('Refusals'), [reasons[key] || key, n]);
  $('Activity').textContent = `${x.daily.observed} séances simulées : ${x.daily.positive} positives, ${x.daily.negative} négatives, ${x.daily.flatActive} actives à zéro et ${x.daily.noTrade} sans trade. Moyenne : ${money(x.dailyMean)} par séance simulée ; pire séance : ${money(x.daily.worst)}.`;
  $('Message').textContent = `${report.coverage.scored}/${report.coverage.expected} séances communes vérifiées. Les règles sont celles du Jeu 29, sans ajustement après lecture d’août. Le bot reste non qualifié.`;
  $('Results').hidden = false;
}
async function load() {
  if (loading) return; loading = true; report = null; clear(); $('Results').hidden = true;
  for (const id of ['Retry', 'Mode', 'Costs']) $(id).disabled = true;
  $('Status').textContent = 'Vérification du bilan…'; $('Message').textContent = 'Lecture du rapport d’août.';
  try {
    const res = await fetch('./jeu30-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw new Error('Unavailable');
    report = await verifyAugustReport(await res.arrayBuffer()); show(); $('Status').textContent = 'Août évalué · bot non qualifié';
    $('Mode').disabled = false; $('Costs').disabled = false;
  } catch {
    report = null; clear(); $('Results').hidden = true; $('Status').textContent = 'Bilan indisponible';
    $('Message').textContent = 'Les résultats n’ont pas pu être vérifiés. Revérifie le bilan pour réessayer.';
  } finally { loading = false; $('Retry').disabled = false; }
}
$('Mode').addEventListener('change', show); $('Costs').addEventListener('change', show); $('Retry').addEventListener('click', load); load();
