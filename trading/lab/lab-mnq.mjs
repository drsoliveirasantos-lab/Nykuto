import { loadConfirmation } from './mnq-source.mjs?v=3';
import { runRetest } from './mnq-retest.mjs';
import { RETEST_SOURCE } from './retest-source.mjs';

const el = id => document.getElementById(id);
const node = (tag, text) => { const e = document.createElement(tag); e.textContent = text; return e; };
const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const r = value => Number.isFinite(value) ? `${value > 0 ? '+' : ''}${number.format(value)} R` : '—';
let bundle = null;
el('mnqRun').addEventListener('click', async () => {
  if (el('mnqRun').disabled) return;
  el('mnqRun').disabled = true; el('mnqResults').hidden = true; el('mnqPerformance').hidden = true;
  el('mnqStatus').textContent = 'VÉRIFICATION'; el('mnqMessage').className = 'iv-message';
  el('mnqMessage').textContent = 'Vérification des prix, des séances et des horaires futures…';
  try {
    bundle ||= await loadConfirmation(fetch, RETEST_SOURCE, '/api/lab/jeu07b');
    const result = runRetest(bundle), q = result.quality;
    el('mnqQuality').replaceChildren();
    for (const [label, value, detail] of [
      ['Prix historiques', `${q.priceSessions} / ${q.expectedSessions} séances`, `${number.format(q.bars)} bougies contrôlées`],
      ['Préparation', `${q.warmup} bougies`, '220 bougies minimum avant juillet'],
      ['Horaires futures documentés', `${q.scheduleSessions} / ${q.expectedSessions} séances`, `${q.missingScheduleDays.length} séances encore à vérifier`],
      ['Période étudiée', `${q.scoredSessions} séances`, '1–24 juillet 2026 · diagnostic court']
    ]) { const card = node('article', ''); card.append(node('h4', label), node('p', value), node('small', detail)); el('mnqQuality').append(card); }
    el('mnqMissing').replaceChildren();
    for (const day of q.missingScheduleDays) el('mnqMissing').append(node('li', day));
    el('mnqMissingDetails').hidden = !q.missingScheduleDays.length;
    el('mnqResults').hidden = false;
    el('mnqStatus').textContent = result.status.toLocaleUpperCase('fr-FR');
    if (!result.calculated) {
      el('mnqMessage').textContent = `Contrôle terminé : ${q.scheduleSessions} séance(s) documentée(s), ${q.missingScheduleDays.length} horaires encore manquants. Aucun résultat de trading calculé. Les bots restent désactivés.`;
    } else {
      el('mnqMessage').textContent = `Calcul terminé : ${result.normal.count} transactions. Ce test court ne suffit pas à confirmer la stratégie ; les bots restent désactivés.`;
      el('mnqNumbers').replaceChildren();
      for (const [label, value] of [['Transactions', result.normal.count], ['Résultat net', r(result.normal.total)], ['R moyen', r(result.normal.exp)], ['Baisse réalisée max.', r(-result.normal.dd)], ['Coûts doublés', r(result.stress.total)], ['Pire transaction', r(result.normal.worst)]]) {
        const tr = node('tr', ''); tr.append(node('th', label), node('td', value)); el('mnqNumbers').append(tr);
      }
      el('mnqChecks').replaceChildren();
      result.checks.forEach(check => el('mnqChecks').append(node('li', `${check.pass ? 'Satisfait' : 'Non satisfait'} — ${check.label}`)));
      el('mnqPerformance').hidden = false;
    }
    el('mnqRun').textContent = 'Recalculer le Jeu 07';
  } catch (error) {
    bundle = null; el('mnqStatus').textContent = 'INDISPONIBLE'; el('mnqMessage').className = 'iv-message is-error'; el('mnqMessage').textContent = error.message;
  } finally { el('mnqRun').disabled = false; }
});
