import { loadMarketHistory } from './market-source.mjs';
import { runMarketComparison, MARKET_POLICY } from './market-comparison.mjs';

const el = id => document.getElementById(id);
const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
const r = value => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${number.format(value)} R` : '—';
const win = value => value === null ? '—' : percent.format(value);
const node = (tag, text, className) => { const result = document.createElement(tag); if (text !== undefined) result.textContent = text; if (className) result.className = className; return result; };
let history = null, report = null;

function row(table, values, total = false) {
  const tr = node('tr', undefined, total ? 'iv-total' : undefined);
  values.forEach(value => tr.append(node('td', value)));
  table.append(tr);
}
function chart(products) {
  const svg = el('mcChart'), ns = 'http://www.w3.org/2000/svg';
  const start = Date.parse(MARKET_POLICY.start) / 1000, end = Date.parse(MARKET_POLICY.end) / 1000;
  const curves = products.map(product => {
    let total = 0;
    return [[start, 0], ...product.trades.map(t => [t.exitTime, total += t.resultR]), [end, total]];
  });
  const values = curves.flatMap(points => points.map(p => p[1]));
  const low = Math.floor(Math.min(-1, ...values)), high = Math.ceil(Math.max(1, ...values));
  const x = time => 10 + (time - start) / (end - start) * 880;
  const y = value => 15 + (high - value) / (high - low) * 210;
  svg.replaceChildren();
  const add = (tag, attrs, text) => { const element = document.createElementNS(ns, tag); for (const [k, v] of Object.entries(attrs)) element.setAttribute(k, String(v)); if (text) element.textContent = text; svg.append(element); return element; };
  add('title', {}, `Résultat cumulé de juillet à décembre 2025, de ${r(low)} à ${r(high)}.`);
  add('desc', {}, products.map(p => `${p.symbol} termine à ${r(p.normal.total)}.`).join(' '));
  for (const value of [low, 0, high]) add('line', { x1: 10, x2: 890, y1: y(value), y2: y(value), stroke: value === 0 ? '#8095af' : '#24374d', 'stroke-dasharray': value === 0 ? '5 5' : 'none', 'vector-effect': 'non-scaling-stroke' });
  const colors = ['#53d8ac', '#65baff', '#dfb5ff'];
  curves.forEach((points, i) => {
    let d = `M ${x(points[0][0])} ${y(points[0][1])}`;
    for (const point of points.slice(1)) d += ` H ${x(point[0])} V ${y(point[1])}`;
    add('path', { d, fill: 'none', stroke: colors[i], 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' });
  });
  let scale = document.getElementById('mcChartScale');
  if (!scale) { scale = node('p', undefined, 'iv-meta'); scale.id = 'mcChartScale'; svg.after(scale); }
  scale.textContent = `De juillet à décembre 2025 · échelle verticale : ${r(low)} à ${r(high)} · ligne pointillée : zéro.`;
}
function render(result) {
  el('mcSummary').replaceChildren(); el('mcTotals').replaceChildren(); el('mcPeriods').replaceChildren(); el('mcChecks').replaceChildren();
  for (const p of result.products) {
    const card = node('article');
    card.append(node('h4', p.label), node('p', r(p.normal.total), p.normal.total > 0 ? 'metric-positive' : 'metric-negative'), node('small', `${p.normal.count} transactions · ${win(p.normal.win)} gagnantes`), node('small', p.gate.status));
    el('mcSummary').append(card);
    row(el('mcTotals'), [p.symbol, p.normal.count, win(p.normal.win), r(p.normal.exp), r(p.normal.total), p.normal.pf === Infinity ? '∞' : p.normal.pf === null ? '—' : number.format(p.normal.pf), r(-p.normal.dd), r(p.stress.total)], true);
    const box = node('div'), checks = node('ul');
    box.append(node('h5', p.symbol));
    p.gate.checks.forEach(check => checks.append(node('li', `${check.pass ? 'Satisfait' : 'Non satisfait'} — ${check.label}`)));
    box.append(checks); el('mcChecks').append(box);
  }
  for (let i = 0; i < 3; i += 1) for (const p of result.products) {
    const w = p.windows[i];
    row(el('mcPeriods'), [w.label, p.symbol, w.normal.count, win(w.normal.win), r(w.normal.exp), r(w.normal.total), w.normal.maxLosingStreak]);
  }
  const positive = result.products.filter(p => p.normal.total > 0);
  const candidates = result.products.filter(p => p.gate.status === 'Piste à examiner');
  el('mcInterpretation').textContent = candidates.length
    ? `${candidates.map(p => p.symbol).join(', ')} passe(nt) les critères de recherche de cet échantillon. Cela ne suffit pas à conclure à une rentabilité future.`
    : positive.length
      ? `Résultat global positif pour ${positive.map(p => p.symbol).join(', ')}, mais aucun marché ne passe tous les critères. Les périodes déficitaires restent visibles ci-dessous.`
      : 'Les trois marchés sont déficitaires sur cet échantillon. Augmenter le nombre de transactions ne corrige pas un résultat moyen négatif.';
  chart(result.products);
  el('mcProvenance').textContent = `Alpaca SIP pour SPY, Massive pour les contrats MES et MNQ. 13 440 bougies, préparation incluse ; 128 séances évaluées par marché. Horaires des futures contrôlés face au calendrier actions sur les 148 séances de l’historique. Règles fixées avant le calcul. Empreinte de l’historique : ${history.sha256}.`;
  el('mcCoverage').replaceChildren();
  for (const p of result.products) {
    const intervals = p.quality.map(q => `${q.label} : ${q.sessions} séances`).join(' ; ');
    el('mcCoverage').append(node('li', `${p.symbol} — ${intervals}. Préparation séparée : ${p.preparation.map(g => `${g.ticker}, ${g.warmup} bougies`).join(' ; ')}.`));
  }
  el('mcResults').hidden = false;
}

el('mcRun').addEventListener('click', async () => {
  if (el('mcRun').disabled) return;
  el('mcRun').disabled = true; el('mcResults').hidden = true; report = null;
  el('mcStatus').textContent = 'CALCUL'; el('mcStatus').className = 'lab-status active';
  el('mcMessage').className = 'iv-message'; el('mcMessage').textContent = 'Chargement des prix vérifiés et calcul des trois marchés…';
  await new Promise(resolve => setTimeout(resolve, 0));
  try {
    history ||= await loadMarketHistory();
    const result = runMarketComparison(history);
    render(result);
    report = { calculatedAt: new Date().toISOString(), source: history.metadata, sha256: history.sha256, ...result };
    el('mcStatus').textContent = 'TERMINÉ';
    el('mcMessage').textContent = 'Comparaison terminée. Coûts simples et doublés recalculés ; Paper Bot et Shadow restent désactivés.';
    el('mcRun').textContent = 'Relancer le Jeu 06';
  } catch (error) {
    history = null; el('mcResults').hidden = true;
    el('mcStatus').textContent = 'À RELANCER'; el('mcStatus').className = 'lab-status warning';
    el('mcMessage').className = 'iv-message is-error'; el('mcMessage').textContent = error.message || 'Le calcul n’a pas pu être terminé.';
  } finally { el('mcRun').disabled = false; }
});
el('mcExport').addEventListener('click', () => {
  if (!report) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, (_key, value) => value === Infinity ? 'Infinity' : value, 2)], { type: 'application/json' }));
  const a = node('a'); a.href = url; a.download = 'nykuto-jeu06-resultats.json'; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});
