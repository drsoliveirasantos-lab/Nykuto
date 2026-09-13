import { loadSessionHistories } from './session-source.mjs';
import { runSessionComparison, diagnoseTrades } from './session-comparison.mjs';

const el = id => document.getElementById(id);
const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 1 });
const r = value => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${number.format(value)} R` : '—';
let report = null, histories = null;
function row(table, values, total = false) {
  const tr = document.createElement('tr');
  if (total) tr.className = 'iv-total';
  for (const value of values) { const td = document.createElement('td'); td.textContent = value; tr.append(td); }
  table.append(tr);
}
function render(validation, development, diagnosis) {
  el('scControl').textContent = r(validation.control.total);
  el('scCandidate').textContent = r(validation.candidate.total);
  el('scControlNote').textContent = `${validation.control.wins}/${validation.control.count} gagnants · ${percent.format(validation.control.win)}`;
  el('scCandidateNote').textContent = `${validation.candidate.wins}/${validation.candidate.count} gagnants · ${percent.format(validation.candidate.win)}`;
  el('scStress').textContent = r(validation.stress.total);
  el('scVerdict').textContent = validation.gate.status;
  el('scRows').replaceChildren();
  for (const w of [...validation.windows, { label: 'Ensemble 2025', control: validation.control, candidate: validation.candidate }]) {
    for (const [label, stats] of [['Avec nuits', w.control], ['Sans nuit', w.candidate]]) {
      row(el('scRows'), [w.label, label, stats.count, stats.win === null ? '—' : percent.format(stats.win), r(stats.exp), r(stats.total), r(-stats.dd), r(stats.worst)], w.label === 'Ensemble 2025');
    }
  }
  el('scChecks').replaceChildren(...validation.gate.checks.map(check => { const item = document.createElement('li'); item.textContent = `${check.pass ? 'Satisfait' : 'Non satisfait'} — ${check.label}`; return item; }));
  const delta = validation.candidate.total - validation.control.total;
  el('scInterpretation').textContent = validation.candidate.total < 0
    ? `La version sans nuit reste déficitaire (${r(validation.candidate.total)}). Écart avec la stratégie d’origine : ${r(delta)}. Cette modification ne valide pas la rentabilité.`
    : `La version sans nuit totalise ${r(validation.candidate.total)}. Écart avec la stratégie d’origine : ${r(delta)}. Verdict selon l’ensemble des critères : ${validation.gate.status}.`;
  const ci = validation.candidate.winInterval;
  el('scUncertainty').textContent = ci ? `Réussite sans nuit : ${percent.format(validation.candidate.win)} ; intervalle descriptif à 95 % : ${percent.format(ci[0])} à ${percent.format(ci[1])}. Cette estimation suppose des trades indépendants et ne mesure pas la rentabilité future.` : 'Échantillon insuffisant pour estimer la réussite.';
  el('scRisk').textContent = `Pire trade observé : ${r(validation.control.worst)} avec nuits, ${r(validation.candidate.worst)} sans nuit. Positions conservées la nuit : ${validation.control.overnight} contre ${validation.candidate.overnight}. Ces valeurs simulées ne sont pas un plafond de perte garanti.`;
  el('scDevelopment').textContent = `Sur janvier–juin 2026, déjà utilisés pour choisir cette hypothèse : ${r(development.control.total)} avec nuits (${percent.format(development.control.win)} de réussite), contre ${r(development.candidate.total)} sans nuit (${percent.format(development.candidate.win)}). Cette comparaison est exploratoire et ne compte pas pour le verdict.`;
  el('scDiagnosis').replaceChildren();
  diagnosis.forEach(stats => row(el('scDiagnosis'), [stats.label, stats.count, stats.win === null ? '—' : percent.format(stats.win), r(stats.total), r(stats.exp)]));
  el('scCoverage').replaceChildren(...validation.quality.map(q => { const li = document.createElement('li'); li.textContent = `${q.label} : ${q.sessions} séances complètes, ${q.bars} bougies.`; return li; }));
  el('scProvenance').textContent = `Alpaca SIP · ${histories.validation.metadata.bars} bougies, ${histories.validation.metadata.sessions} séances avec préparation ; ${validation.warmupBars} bougies avant janvier 2025. Calendrier de marché contrôlé, y compris les clôtures anticipées. Empreinte : ${histories.validation.sha256}.`;
  el('scResults').hidden = false;
}

el('scRun').addEventListener('click', async () => {
  if (el('scRun').disabled) return;
  report = null; el('scResults').hidden = true; el('scRun').disabled = true;
  el('scStatus').textContent = 'CALCUL'; el('scStatus').className = 'lab-status active';
  el('scMessage').className = 'iv-message'; el('scMessage').textContent = 'Chargement des historiques et comparaison des deux versions…';
  await new Promise(resolve => setTimeout(resolve, 0));
  try {
    histories ||= await loadSessionHistories();
    const validation = runSessionComparison(histories.validation.candles, histories.validation.calendar, 2025);
    const development = runSessionComparison(histories.development.candles, histories.development.calendar, 2026);
    const diagnosis = diagnoseTrades(development.windows.flatMap(w => w.controlTrades));
    render(validation, development, diagnosis);
    report = { calculatedAt: new Date().toISOString(), source: { validation: histories.validation.metadata, validationSha256: histories.validation.sha256, developmentSha256: histories.development.sha256 }, validation, development, diagnosis };
    el('scStatus').textContent = 'TERMINÉ';
    el('scMessage').textContent = `${validation.gate.status}. Comparaison 2025 terminée ; les résultats 2026 restent exploratoires. Paper Bot et Shadow : OFF.`;
  } catch (error) {
    el('scResults').hidden = true; el('scStatus').textContent = 'À RELANCER'; el('scStatus').className = 'lab-status warning';
    el('scMessage').className = 'iv-message is-error'; el('scMessage').textContent = error.message || 'Le test n’a pas pu être calculé.';
  } finally { el('scRun').disabled = false; }
});

el('scExport').addEventListener('click', () => {
  if (!report) return;
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, (_key, value) => value === Infinity ? 'Infinity' : value, 2)], { type: 'application/json' }));
  const a = document.createElement('a'); a.href = url; a.download = 'nykuto-jeu05-resultats.json'; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
});
