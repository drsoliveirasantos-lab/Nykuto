import { verifyMarketFilters } from './jeu31-report-validation.mjs';
const $ = id => document.getElementById('filters' + id);
const num = (n, d = 2) => n === null ? '—' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const money = n => n === null ? '—' : `${n > 0 ? '+' : ''}${num(n)} $`;
const el = (tag, text) => { const n = document.createElement(tag); n.textContent = String(text); return n; };
const row = (id, values) => { const tr = el('tr', ''); values.forEach(v => tr.append(el('td', v))); $(id).append(tr); };
const tables = ['Overview', 'Markets', 'Changes', 'Weeks', 'Days', 'Checks', 'Refusals'];
const states = { positive: 'Positive', negative: 'Négative', 'flat-active': 'À zéro', 'no-trade': 'Sans trade', 'missing-data': 'Données absentes', 'stopped-target': 'Après objectif', 'stopped-breach': 'Après arrêt' };
const reasons = { 'mes-overbought-long': 'MES : achat en surachat', 'mes-oversold-short': 'MES : vente en survente', 'mes-rsi-unknown': 'MES : RSI inconnu', 'mgc-after-11': 'MGC : entrée à partir de 11 h NY' };
let report = null, loading = false;
function clear() { tables.forEach(id => $(id).replaceChildren()); ['Summary', 'Sample', 'Attribution'].forEach(id => { $(id).textContent = ''; }); }
function show() {
  if (!report) return;
  const view = report.views.find(v => v.id + '/' + v.mode === $('View').value), cost = $('Costs').value;
  const variant = view?.variants.find(v => v.id === $('Variant').value);
  if (!variant || !['normal', 'stress'].includes(cost)) return;
  clear(); const x = variant.costs[cost], c = x.comparison;
  for (const v of view.variants) { const s = v.costs[cost]; row('Overview', [v.label, s.count, money(s.net), money(s.comparison.delta), money(s.drawdown), num(s.winRate * 100, 1) + ' %']); }
  $('Summary').textContent = `${variant.label} : ${x.count} trades, ${x.wins} gagnants, ${x.losses} perdants et ${x.flat} à zéro. Net ${money(x.net)} ; solde ${money(x.balance)}. Août reste perdant dans les trois variantes ; aucune n’est qualifiée.`;
  $('Sample').textContent = `${view.coverage.scored}/${view.coverage.expected} séances complètes communes ; ${x.daily.observed} séances simulées. Coûts ${cost === 'normal' ? 'initiaux' : 'doublés'}. ${view.mode === 'account' ? 'Compte 25K continu : ' + ({ incomplete: 'objectif non atteint', targetMet: 'objectif atteint', breached: 'seuil franchi' }[x.status] || x.status) : 'Diagnostic : seuil et objectif de compte ignorés'}.`;
  for (const m of x.contributions) row('Markets', [m.symbol, m.count, m.wins, m.losses, money(m.net), money(m.fees)]);
  for (const [label, a] of [['Trades de référence retirés', c.removed], ['Nouveaux trades admis', c.added]]) row('Changes', [label, a.count, a.wins, a.losses, a.flat, money(a.net)]);
  $('Attribution').textContent = `${c.common} entrées communes, dont ${c.changedCommonExits} sorties modifiées. Écart net = nouveaux trades (${money(c.added.net)}) − trades retirés (${money(c.removed.net)}) + changement des entrées communes (${money(c.commonNetChange)}) = ${money(c.delta)}.`;
  for (const w of x.calendar.weeks) row('Weeks', [`${w.first} → ${w.last}`, `${w.simulatedSessions}/${w.expectedSessions}`, w.trades ?? '—', money(w.net), money(w.cumulative)]);
  for (const d of x.calendar.daily) row('Days', [d.day, d.trades ?? '—', money(d.net), money(d.cumulative), states[d.state] || d.state]);
  const evaluation = report.evaluations.find(e => e.id === variant.id);
  if (evaluation) for (const check of evaluation.checks) row('Checks', [check.label, check.pass ? 'Respecté' : 'Échec']);
  else row('Checks', ['Référence historique conservée pour comparaison', 'Non qualifiée']);
  for (const [reason, n] of Object.entries(x.filterRejections)) row('Refusals', [reasons[reason] || reason, n]);
  if (!Object.keys(x.filterRejections).length) row('Refusals', ['Aucun candidat refusé par ces filtres', 0]);
  $('Results').hidden = false;
}
async function load() {
  if (loading) return; loading = true; report = null; clear(); $('Results').hidden = true;
  ['Retry', 'View', 'Variant', 'Costs'].forEach(id => { $(id).disabled = true; }); $('Status').textContent = 'Vérification des tests…';
  try {
    const res = await fetch('./jeu31-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!res.ok || !res.headers.get('Content-Type')?.includes('application/json')) throw Error('Unavailable');
    report = await verifyMarketFilters(await res.arrayBuffer()); show(); $('Status').textContent = '40 scénarios · bot non qualifié';
    ['View', 'Variant', 'Costs'].forEach(id => { $(id).disabled = false; });
  } catch { report = null; clear(); $('Results').hidden = true; $('Status').textContent = 'Tests indisponibles. Revérifie pour réessayer.'; }
  finally { loading = false; $('Retry').disabled = false; }
}
['View', 'Variant', 'Costs'].forEach(id => $(id).addEventListener('change', show)); $('Retry').addEventListener('click', load); load();
