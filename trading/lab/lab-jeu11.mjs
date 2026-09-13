import { JEU11_SOURCE } from './jeu11-source.mjs';
const $ = id => document.getElementById(id);
const labels = { baseline: 'Référence', trend: 'Trend 1 h', candle: 'Engulfing', volume: 'Volume', events: 'Events', combined: 'Quatre filtres', long: 'Long only', short: 'Short only' };
const number = (v, digits = 2) => v === null ? '—' : v === 'Infinity' ? '∞' : new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
const risk = v => `${v > 0 ? '+' : ''}${number(v)} R`;
const node = (tag, value) => { const element = document.createElement(tag); element.textContent = value; return element; };
async function load() {
  try {
    const response = await fetch('./jeu11-report.json', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Bilan indisponible.');
    const report = await response.json();
    if (report.schema !== 'jeu11-report-v1' || report.protocol !== 'jeu11-v1' || report.dataset?.sha256 !== JEU11_SOURCE.sha256 || report.calculated !== true || report.paperEnabled !== false || report.audit?.passed !== true || report.variants?.length !== 8 || report.variants.some((v, i) => v.id !== Object.keys(labels)[i] || !Number.isInteger(v.normal?.count) || !Number.isFinite(v.normal?.total) || !Number.isFinite(v.stress?.total))) throw new Error('Bilan incomplet.');
    $('jeu11Rows').replaceChildren();
    for (const v of report.variants) {
      const tr = document.createElement('tr');
      for (const value of [labels[v.id], String(v.normal.count), risk(v.normal.total), risk(v.stress.total), number(v.normal.pf, 3), `${number(v.normal.dd)} R`]) tr.append(node('td', value));
      const td = document.createElement('td'), details = document.createElement('details'), list = document.createElement('ul');
      details.append(node('summary', `${v.checks.filter(c => !c.pass).length} non satisfaits`));
      for (const check of v.checks) list.append(node('li', `${check.pass ? 'Satisfait' : 'Non satisfait'} — ${check.label}`));
      details.append(list); td.append(details); tr.append(td); $('jeu11Rows').append(tr);
    }
    const baseline = report.variants[0], volume = report.variants.find(v => v.id === 'volume'), long = report.variants.find(v => v.id === 'long');
    $('jeu11Baseline').textContent = risk(baseline.normal.total);
    $('jeu11BaselineCount').textContent = `${baseline.normal.count} trades · ${baseline.normal.wins} gagnants`;
    $('jeu11Volume').textContent = risk(volume.normal.total);
    $('jeu11Long').textContent = risk(long.normal.total);
    $('jeu11LongCount').textContent = `${long.normal.count} trades · échantillon insuffisant`;
    $('jeu11Status').textContent = 'Non confirmé · bot OFF';
    $('jeu11Message').textContent = 'Aucune version n’est validée. La référence et le filtre Volume perdent sur cette période ; Long only reste positif avec trop peu de trades pour conclure.';
    const q = report.quality, a = report.audit;
    $('jeu11Quality').textContent = `${q.scoredSessions} séances évaluées · ${q.expectedSessions} contrôlées avec préparation · ${q.bars} bougies · ${q.warmup} de préparation · aucun trou détecté.`;
    $('jeu11Audit').textContent = `${a.featurePrefixes} préfixes de bougies vérifiés sans accès au futur ; ${a.sessionComparisons} comparaisons de simulations arrêtées en fin de séance ; ${a.auditedTrades} trades simulés audités en comptant les deux coûts et les variantes. Ils ne représentent pas autant de trades indépendants.`;
    $('jeu11Results').hidden = false;
  } catch {
    $('jeu11Status').textContent = 'Bilan indisponible';
    $('jeu11Message').textContent = 'Le bilan vérifié n’a pas pu être chargé. Recharge la page pour réessayer ; cela ne valide aucune stratégie.';
    $('jeu11Results').hidden = true;
  }
}
load();
