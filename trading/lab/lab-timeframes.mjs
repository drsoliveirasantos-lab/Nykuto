import { JEU12_SOURCE } from './jeu12-source.mjs';
import { JEU12_CONFIGS } from './jeu12-policy.mjs';
const $ = id => document.getElementById(id);
const n = (v, precision = 2) => v === null ? '—' : v === 'Infinity' ? '∞' : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: precision, maximumFractionDigits: precision }).format(v);
const r = v => `${v > 0 ? '+' : ''}${n(v)} R`;
const make = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
let reports;
function row(target, cells) { const tr = document.createElement('tr'); for (const text of cells) tr.append(make('td', text)); target.append(tr); return tr; }
function showGrid() {
  if (!reports) return;
  const report = reports[$('timeframesFamily').value], tf = $('timeframesMinutes').value;
  const visible = report.results.filter(c => tf === 'all' || c.timeframe === Number(tf));
  $('timeframesRows').replaceChildren();
  for (const v of visible) {
    const tr = row($('timeframesRows'), [`${v.timeframe} min`, v.hours.label, v.side === 'Both' ? 'Long + Short' : v.side, String(v.normal.count), r(v.normal.total), r(v.stress.total), n(v.normal.pf, 3), `${n(v.normal.dd)} R`]);
    const td = document.createElement('td'), details = document.createElement('details'), list = document.createElement('ul');
    details.append(make('summary', `${v.checks.filter(c => c.pass).length}/6 historiques`));
    for (const check of v.checks) list.append(make('li', `${check.pass ? 'Satisfait' : 'Non satisfait'} — ${check.label}`));
    details.append(list);
    for (const w of v.windows) details.append(make('p', `${w.start} → ${w.end} exclu : ${w.normal.count} trades, ${r(w.normal.total)} ; coûts doublés ${r(w.stress.total)}.`));
    td.append(details); tr.append(td);
  }
  $('timeframesCount').textContent = `${visible.length} configurations affichées sur les 27 de cette famille. 54 essais au total ; les filtres changent seulement l’affichage.`;
}
async function read(path, schema) {
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Report unavailable');
  const report = await response.json();
  if (report.schema !== schema || report.dataset?.sha256 !== JEU12_SOURCE.sha256 || report.paperEnabled !== false || report.audit?.passed !== true || report.results?.length !== 27 || report.results.some((v, i) => v.id !== JEU12_CONFIGS[i].id || !Number.isInteger(v.normal?.count) || !Number.isFinite(v.normal?.total) || !Number.isFinite(v.stress?.total) || v.windows?.length !== 3 || v.checks?.length !== 6)) throw new Error('Invalid report');
  return report;
}
async function load() {
  try {
    const [cross, pullback] = await Promise.all([read('./jeu12-report.json', 'jeu12-report-v1'), read('./jeu13-report.json', 'jeu13-report-v1')]);
    const candidate = pullback.results.find(v => v.id === pullback.candidateId), control = pullback.control;
    if (!candidate || !candidate.checks.every(c => c.pass) || control.evaluated !== true || control.candidateId !== candidate.id || !Number.isFinite(control.normal?.total) || !Number.isFinite(control.stress?.total)) throw new Error('Incomplete control');
    reports = { cross, pullback };
    $('timeframesNet').textContent = r(candidate.normal.total);
    $('timeframesTrades').textContent = `${candidate.normal.count} trades · trois périodes positives`;
    $('timeframesStress').textContent = r(candidate.stress.total);
    $('timeframesControl').textContent = r(control.normal.total);
    $('timeframesControlCount').textContent = `${control.normal.count} trades · 12 requis pour ce contrôle`;
    $('timeframesStatus').textContent = control.passed ? 'Piste historique · à confirmer' : 'Échantillon à compléter · bot OFF';
    $('timeframesMessage').textContent = `${pullback.results.filter(v => v.checks.every(c => c.pass)).length} configurations Pullback passent les critères sur 2026. La règle de sélection fixée avant le contrôle retient le ${candidate.timeframe} min, ${candidate.hours.label}, ${candidate.side === 'Both' ? 'Long + Short' : candidate.side}.`;
    const outcome = control.passed ? 'Tous les critères de ce contrôle historique sont satisfaits.' : control.normal.count < 12 ? `${control.normal.count} trades restent inférieurs aux 12 exigés.` : 'Au moins un critère de ce contrôle n’est pas satisfait.';
    $('timeframesVerdict').textContent = `La candidate passe les six critères historiques sur 2026. Le contrôle de juin 2025 donne ${r(control.normal.total)} et ${r(control.stress.total)} à coûts doublés. ${outcome} Le bot n’est pas confirmé pour le réel.`;
    $('timeframesPeriods').replaceChildren();
    const labels = ['Janvier–février 2026', 'Avril–mai 2026', 'Juillet–août 2026'];
    candidate.windows.forEach((w, i) => row($('timeframesPeriods'), [labels[i], String(w.normal.count), r(w.normal.total), r(w.stress.total)]));
    row($('timeframesPeriods'), ['Contrôle · juin 2025', String(control.normal.count), r(control.normal.total), r(control.stress.total)]);
    $('timeframesControlChecks').replaceChildren(...control.checks.map(c => make('li', `${c.pass ? 'Satisfait' : 'Non satisfait'} — ${c.label}`)));
    $('timeframesAudit').textContent = '14 238 bougies 5 min vérifiées sur 183 séances avec préparation ; les 4 746 regroupements 15 min reproduisent exactement le précédent historique. 13 284 comparaisons de simulations par fin de séance sur les deux grilles, puis 40 sur le contrôle. Ces recalculs ne sont pas de nouveaux trades indépendants.';
    $('timeframesResults').hidden = false; showGrid();
  } catch {
    reports = null; $('timeframesResults').hidden = true;
    $('timeframesStatus').textContent = 'Bilan indisponible';
    $('timeframesMessage').textContent = 'Le bilan complet n’a pas pu être chargé. Recharge la page pour réessayer ; cela ne valide aucune stratégie.';
  }
}
$('timeframesFamily').addEventListener('change', showGrid);
$('timeframesMinutes').addEventListener('change', showGrid);
load();
