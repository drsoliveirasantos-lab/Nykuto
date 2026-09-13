import { loadSixMonths } from './six-months-source.mjs';
import { runSixMonths } from './mnq-six-months.mjs';
const $ = id => document.getElementById(id);
const number = (n, digits = 2) => n === null ? '—' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
const r = n => `${n > 0 ? '+' : ''}${number(n)} R`;
const node = (tag, text, className) => { const n = document.createElement(tag); n.textContent = text; if (className) n.className = className; return n; };
let running = false;
async function run() {
  if (running) return; running = true; $('sixRun').disabled = true; $('sixResults').hidden = true;
  $('sixStatus').textContent = 'Vérification…'; $('sixMessage').textContent = 'Chargement et contrôle des données, puis calcul de la stratégie.';
  try {
    const result = runSixMonths(await loadSixMonths());
    if (!result.calculated) {
      const missing = result.quality.groups.flatMap(g => [...g.quality.missingPriceDays, ...g.quality.missingScheduleDays].map(d => `${g.ticker} : ${d}`));
      throw new Error(`Données incomplètes. ${[...new Set(missing)].join(' · ')}`);
    }
    $('sixStatus').textContent = result.status;
    $('sixStatus').className = `lab-status ${result.checks.every(c => c.pass) ? 'planned' : 'warning'}`;
    $('sixMessage').textContent = result.checks.every(c => c.pass) ? 'Les critères chiffrés passent sur cet historique. Les périodes ne sont pas entièrement indépendantes ; le bot reste désactivé.' : `${result.normal.total > 0 ? 'Le total est positif, mais certains' : 'Certains'} critères fixés avant le test ne sont pas satisfaits. Le bot reste désactivé.`;
    $('sixCount').textContent = String(result.normal.count);
    $('sixWins').textContent = `${result.normal.wins} gagnantes · ${number(result.normal.win * 100, 1)} %`;
    $('sixNet').textContent = r(result.normal.total); $('sixStress').textContent = r(result.stress.total);
    $('sixDrawdown').textContent = `${number(result.normal.dd)} R`;
    $('sixRows').replaceChildren();
    for (const period of result.windows) {
      const tr = document.createElement('tr');
      for (const value of [period.label, String(period.normal.count), `${period.normal.wins} / ${period.normal.count}`, r(period.normal.total), r(period.stress.total), number(period.normal.pf, 3)]) tr.append(node('td', value));
      $('sixRows').append(tr);
    }
    const tr = document.createElement('tr');
    for (const value of ['Ensemble des périodes', String(result.normal.count), `${result.normal.wins} / ${result.normal.count}`, r(result.normal.total), r(result.stress.total), number(result.normal.pf, 3)]) tr.append(node('td', value));
    $('sixRows').append(tr);
    $('sixChecks').replaceChildren(...result.checks.map(c => node('li', `${c.pass ? 'Satisfait' : 'Non satisfait'} — ${c.label}`, c.pass ? 'r-positive' : 'r-negative')));
    $('sixQuality').textContent = `${result.quality.sessions} séances évaluées · ${result.quality.bars.toLocaleString('fr-FR')} bougies, préparation comprise · prix et horaires complets pour les trois contrats.`;
    const failed = result.checks.filter(c => !c.pass).map(c => c.label.toLowerCase());
    $('sixNext').textContent = failed.length ? `À résoudre : ${failed.join(' ; ')}. Ces résultats ne justifient pas le passage au bot en argent fictif. Le Jeu 08 reste une collecte séparée.` : 'La prochaine étape exige encore une confirmation indépendante et des contrôles d’exécution. Le Jeu 08 reste une collecte séparée.';
    $('sixResults').hidden = false;
  } catch (error) { $('sixStatus').textContent = 'Non calculé'; $('sixMessage').textContent = `${error.message} Aucun résultat remplacé par des données supposées.`; }
  finally { running = false; $('sixRun').disabled = false; }
}
$('sixRun').addEventListener('click', run);
run();
