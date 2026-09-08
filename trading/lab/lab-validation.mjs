import { MAX_BYTES, parseCandles } from './validation-data.mjs';
import { runValidation } from './validation-engine.mjs';

const byId = id => document.getElementById(id);
const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
const r = value => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${number.format(value)} R` : '—';
const pf = value => value === Infinity ? '∞' : Number.isFinite(value) ? number.format(value) : '—';
let dataset = null, report = null, revision = 0;

function message(text, error = false) {
  byId('ivMessage').textContent = text;
  byId('ivMessage').className = `iv-message${error ? ' is-error' : ''}`;
}
function status(text, className = 'off') {
  byId('ivStatus').textContent = text;
  byId('ivStatus').className = `lab-status ${className}`;
}
function resetResults() {
  report = null;
  byId('ivResults').hidden = true;
  byId('ivRows').replaceChildren();
  byId('ivChecks').replaceChildren();
}

byId('ivFile').addEventListener('change', async event => {
  const current = ++revision;
  dataset = null; resetResults(); byId('ivRun').disabled = true;
  const file = event.target.files?.[0];
  if (!file) { status('DONNÉES REQUISES'); message('En attente d’un historique indépendant.'); return; }
  status('LECTURE'); message('Vérification du fichier…');
  try {
    if (file.size > MAX_BYTES) throw new Error('Fichier trop volumineux (12 Mo maximum).');
    const text = await file.text();
    const parsed = parseCandles(text);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    if (current !== revision) return;
    dataset = { ...parsed, filename: file.name, sha256: [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('') };
    status('PRÊT', 'active');
    message(`${number.format(parsed.candles.length)} bougies lues. ${parsed.duplicateCount} doublon(s) identique(s) écarté(s). ${parsed.symbolVerified ? 'Colonne symbol : SPY.' : 'Actif déclaré : SPY (pas de colonne symbol pour le vérifier).'} Lance le test pour vérifier la couverture des trois périodes.`);
    byId('ivRun').disabled = false;
  } catch (error) {
    if (current !== revision) return;
    status('FICHIER À VÉRIFIER', 'warning'); message(error.message || 'Lecture impossible.', true);
  }
});

function render(result) {
  byId('ivBaseline').textContent = `${r(result.baseline.exp)} / trade`;
  byId('ivFiltered').textContent = `${r(result.filtered.exp)} / trade`;
  byId('ivBaselineNote').textContent = `${result.baseline.wins} gagnants sur ${result.baseline.count} trades`;
  byId('ivFilteredNote').textContent = `${result.filtered.wins} gagnants sur ${result.filtered.count} trades`;
  byId('ivStress').textContent = `${r(result.stress.exp)} / trade`;
  byId('ivVerdict').textContent = result.gate.status;
  const table = byId('ivRows');
  for (const window of [...result.windows, { label: 'Ensemble', baseline: result.baseline, filtered: result.filtered }]) {
    for (const [label, stats] of [['EMA seule', window.baseline], ['EMA + No-range', window.filtered]]) {
      const row = document.createElement('tr');
      if (window.label === 'Ensemble') row.className = 'iv-total';
      const values = [window.label, label, stats.count, stats.win === null ? '—' : `${stats.wins}/${stats.count} · ${percent.format(stats.win)}`, r(stats.exp), r(stats.total), pf(stats.pf), r(-stats.dd)];
      values.forEach((value, i) => {
        const cell = document.createElement('td'); cell.textContent = value;
        if (i === 4 && Number.isFinite(stats.exp)) cell.className = stats.exp > 0 ? 'metric-positive' : stats.exp < 0 ? 'metric-negative' : '';
        row.append(cell);
      });
      table.append(row);
    }
  }
  const interval = result.filtered.winInterval;
  byId('ivUncertainty').textContent = interval ? `Taux de réussite filtré : ${percent.format(result.filtered.win)}. Intervalle indicatif à 95 % : ${percent.format(interval[0])} à ${percent.format(interval[1])} (Wilson). Il suppose des trades indépendants, ce qui peut ne pas être le cas ; il ne mesure pas la rentabilité future.` : 'Aucun trade filtré : taux de réussite non calculable.';
  byId('ivChecks').replaceChildren(...result.gate.checks.map(check => {
    const item = document.createElement('li'); item.textContent = `${check.pass ? 'Satisfait' : 'Non satisfait'} — ${check.label}`; return item;
  }));
  byId('ivProvenance').textContent = `Fichier : ${result.source.filename}. ${result.source.symbolVerified ? 'Symbole SPY vérifié dans la colonne du fichier.' : 'SPY déclaré, sans vérification indépendante du symbole.'} ${result.warmupBars} bougies avant janvier pour les indicateurs. ${result.excludedBars} bougies hors séance ou hors période écartées. SHA-256 : ${result.source.sha256}.`;
  byId('ivCoverage').replaceChildren(...result.quality.map(q => {
    const item = document.createElement('li'); item.textContent = `${q.label} : ${q.bars} bougies, ${q.sessions} séances observées, du ${new Date(q.first * 1000).toISOString().slice(0, 10)} au ${new Date(q.last * 1000).toISOString().slice(0, 10)}.`; return item;
  }));
  byId('ivResults').hidden = false;
}

byId('ivRun').addEventListener('click', async () => {
  if (!dataset || byId('ivRun').disabled) return;
  resetResults(); byId('ivRun').disabled = true; byId('ivFile').disabled = true;
  status('CALCUL'); message('Calcul des deux variantes et du scénario à coûts doublés…');
  // Yield once so the busy state is painted; all computations remain in this tab.
  await new Promise(resolve => setTimeout(resolve, 0));
  try {
    const result = runValidation(dataset.candles);
    result.source = { filename: dataset.filename, sha256: dataset.sha256, symbolVerified: dataset.symbolVerified, duplicateCount: dataset.duplicateCount };
    result.calculatedAt = new Date().toISOString();
    render(result); report = result;
    status('TERMINÉ', 'active'); message(`${result.gate.status}. Trois périodes évaluées séparément. Paper Bot et Shadow restent désactivés.`);
  } catch (error) {
    resetResults(); status('DONNÉES INSUFFISANTES', 'warning'); message(error.message || 'Le test n’a pas pu être calculé.', true);
  } finally { byId('ivRun').disabled = false; byId('ivFile').disabled = false; }
});

byId('ivExport').addEventListener('click', () => {
  if (!report) return;
  const blob = new Blob([JSON.stringify(report, (_key, value) => value === Infinity ? 'Infinity' : value, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'nykuto-jeu04-resultats.json';
  document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});
