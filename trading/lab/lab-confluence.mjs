import { loadSixMonths } from './six-months-source.mjs';
import { runConfluence } from './confluence-engine.mjs';
import { EVENT_SOURCES } from './confluence-policy.mjs';
const $ = id => document.getElementById(id);
const n = (value, digits = 2) => value === null ? '—' : value === Infinity ? '∞' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
const r = value => value === null ? '—' : `${value > 0 ? '+' : ''}${n(value)} R`;
const make = (tag, text) => { const node = document.createElement(tag); node.textContent = text; return node; };
const row = (target, values) => { const tr = document.createElement('tr'); for (const value of values) tr.append(make('td', value)); target.append(tr); };
const when = time => new Intl.DateTimeFormat('fr-FR', { timeZone: 'America/New_York', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(time * 1000));
let report = null, running = false;
function detail() {
  if (!report) return;
  const v = report.variants.find(v => v.id === $('confluenceVariant').value);
  $('confluenceDetailTitle').textContent = v.label;
  $('confluenceChecks').replaceChildren(...v.checks.map(c => make('li', `${c.pass ? 'Satisfait' : 'Non satisfait'} — ${c.label}`)));
  $('confluenceDelta').textContent = `Moyenne par transaction : ${r(v.normal.exp)}. Écart avec la référence : ${r(v.deltaExpectancy)}. Ce diagnostic sur des dates déjà vues ne valide pas une stratégie.`;
  $('confluencePeriods').replaceChildren();
  for (const w of v.windows) row($('confluencePeriods'), [w.label, String(w.normal.count), r(w.normal.total), r(w.stress.total)]);
  $('confluenceSides').replaceChildren();
  for (const s of v.normal.bySide) row($('confluenceSides'), [s.side === 'Long' ? 'Long · hausse' : 'Short · baisse', String(s.count), s.win === null ? '—' : `${n(s.win * 100, 1)} %`, r(s.total)]);
  $('confluenceDecisions').replaceChildren();
  for (const d of v.decisions) {
    const tr = document.createElement('tr');
    tr.append(make('td', `${when(d.time)} · ${d.ticker}`), make('td', d.side), make('td', d.executed ? 'Entrée simulée' : d.accepted ? 'Accepté, puis annulé avant entrée' : 'Refusé'));
    const td = document.createElement('td'), disclosure = document.createElement('details');
    disclosure.append(make('summary', d.checks.length ? d.checks.filter(c => !c.pass).map(c => c.label).join(' ; ') || 'Toutes les confirmations demandées passent' : 'Croisement EMA + ADX suffisant'));
    const f = d.feature;
    disclosure.append(make('p', `Tendance 1 h : ${f.trend || 'indéterminée'}. Englobante : ${f.candle || 'absente'}. Volume relatif : ${n(f.volumeRatio)}. Événements recensés : ${f.events.join(', ') || 'aucun de ces trois types'}.`));
    disclosure.append(make('p', 'Le croisement EMA et l’ADX sont requis dans toutes les versions. Seuls les filtres de la version choisie peuvent refuser ce signal.'));td.append(disclosure);tr.append(td);$('confluenceDecisions').append(tr);
  }
  $('confluenceDecisionCount').textContent = `${v.decisions.length} signaux examinés · ${v.decisions.filter(d => d.executed).length} entrées simulées. Horaires New York, à la clôture de la bougie signal ; seuls les signaux évalués lorsque les freins et la position le permettent sont listés.`;
}
async function run() {
  if (running) return; running = true; report = null; $('confluenceRun').disabled = true; $('confluenceResults').hidden = true;
  $('confluenceStatus').textContent = 'Calcul en cours'; $('confluenceMessage').textContent = 'Contrôle de l’historique, puis simulation des huit versions avec deux hypothèses de frais.';
  try {
    const result = runConfluence(await loadSixMonths());
    if (!result.calculated) throw new Error('Les données ne permettent pas de calculer le test.');
    report = result;
    $('confluenceRows').replaceChildren(); $('confluenceVariant').replaceChildren();
    for (const v of report.variants) {
      row($('confluenceRows'), [v.label, String(v.normal.count), v.normal.win === null ? '—' : `${n(v.normal.win * 100, 1)} %`, r(v.normal.total), r(v.stress.total), n(v.normal.pf, 3), `${n(v.normal.dd)} R`, v.status]);
      const option = make('option', v.label); option.value = v.id; $('confluenceVariant').append(option);
    }
    const candidates = report.variants.filter(v => v.checks.every(c => c.pass));
    $('confluenceStatus').textContent = 'Exploratoire · bot OFF';
    $('confluenceMessage').textContent = candidates.length ? 'Des versions passent les critères sur ces dates déjà vues. Il faut les confirmer sur des données indépendantes avant de progresser.' : 'Aucune version ne satisfait tous les critères. Certains filtres améliorent le total, mais cela ne suffit pas à valider le bot.';
    const volume = report.variants.find(v => v.id === 'volume'), events = report.variants.find(v => v.id === 'events'), combined = report.variants.find(v => v.id === 'combined');
    $('confluenceVolume').textContent = `${volume.normal.count} trades · ${r(volume.normal.total)}`;
    $('confluenceEvents').textContent = `${events.normal.count} trades · ${r(events.normal.total)}`;
    $('confluenceCombined').textContent = `${combined.normal.count} trades`;
    $('confluenceCombinedNote').textContent = combined.normal.count ? 'La combinaison reste à comparer aux filtres séparés.' : 'Empiler les quatre filtres élimine toutes les entrées.';
    $('confluenceEventsList').replaceChildren();
    for (const e of report.events) { const li = make('li', `${e.day} · ${e.type}${e.scoredSession ? '' : ' · déjà hors séance cash'} · `), a = make('a', 'source officielle'); a.href = EVENT_SOURCES[e.type]; a.target = '_blank'; a.rel = 'noopener noreferrer'; li.append(a); $('confluenceEventsList').append(li); }
    const long = report.variants.find(v => v.id === 'long'), short = report.variants.find(v => v.id === 'short');
    $('confluenceSpeed').textContent = `Simulations séparées : long seul ${r(long.normal.total)} sur ${long.normal.count} trades, short seul ${r(short.normal.total)} sur ${short.normal.count} trades. Durée médiane : ${n(long.normal.medianMinutes, 1)} min et ${n(short.normal.medianMinutes, 1)} min. Une durée plus courte comprend aussi les pertes ; elle ne prouve pas qu’on gagne plus vite. Résolution de 15 min : une sortie dans la bougie d’entrée compte 0 min.`;
    $('confluenceQuality').textContent = `${report.quality.sessions} séances évaluées · ${report.quality.bars.toLocaleString('fr-FR')} bougies préparation comprise · huit versions fixées avant leur calcul. Aucun achat ni ordre.`;
    detail(); $('confluenceResults').hidden = false;
  } catch (error) { $('confluenceStatus').textContent = 'Non calculé'; $('confluenceMessage').textContent = error.message; }
  finally { running = false; $('confluenceRun').disabled = false; }
}
$('confluenceRun').addEventListener('click', run); $('confluenceVariant').addEventListener('change', detail); run();
