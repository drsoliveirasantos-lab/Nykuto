import { PROJECT_STATUS as status } from './status-data.mjs';

const byId = id => document.getElementById(id);
const number = new Intl.NumberFormat('fr-FR');
const percent = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const decimal = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const date = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function text(tag, value, className = '') {
  const element = document.createElement(tag);
  element.textContent = value;
  if (className) element.className = className;
  return element;
}

function formattedDate(value) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) ? date.format(parsed) : value;
}

function pct(value) {
  return `${percent.format(value)} %`;
}

function ev(value) {
  return `${value >= 0 ? '+' : ''}${decimal.format(value)} R`;
}

function renderSync() {
  const grid = byId('syncGrid');
  for (const item of status.sync) {
    const article = text('article', '', 'sync-card');
    article.dataset.state = item.state;
    const head = text('div', '', 'sync-card-head');
    head.append(text('h4', item.label), text('span', ({ synced: 'À jour', implemented: 'Implémenté', external: 'Externe', pending: 'En attente' })[item.state] || item.state, `tracker-chip is-${item.state}`));
    article.append(head, text('p', item.detail));
    grid.append(article);
  }
}

function renderSnapshot() {
  byId('updatedAt').textContent = formattedDate(status.updatedAt);
  byId('evidenceThrough').textContent = formattedDate(status.evidenceThrough);
  byId('branchState').textContent = `${status.repository.branch} · base ${status.repository.reviewedBaseRevision}`;
  byId('pineVersion').textContent = status.pine.shortVersion;
  const currentM5=status.currentAudit.history.datasets.find(dataset=>dataset.id==='m5');
  byId('currentBarCount').textContent = `${number.format(currentM5.count)} M5`;
  byId('currentCoverage').textContent = `${number.format(status.currentAudit.history.datasets.find(dataset=>dataset.id==='m1').count)} M1 avec volume`;
  byId('pineMode').textContent = status.pine.mode;
  byId('barCount').textContent = number.format(status.dataset.bars);
  byId('datasetRange').textContent = `${formattedDate(status.dataset.from)} → ${formattedDate(status.dataset.through)}`;
  byId('opportunityCount').textContent = number.format(status.dataset.opportunities);
  byId('baselineTp1').textContent = `TP1 historique ${pct(status.dataset.overallTp1Pct)}`;
}

function renderPine() {
  byId('pineSummary').textContent = `${status.pine.version} · ${status.pine.scanner}. ${status.pine.mode}.`;
  byId('pineFamilies').textContent = status.pine.families.join(' · ');
  const rules = byId('pineRules');
  for (const rule of status.pine.rules) rules.append(text('li', rule));
}

function renderRepositoryResearch() {
  const stack = byId('repositoryResearch');
  for (const item of status.repositoryResearch) {
    const row = text('article', '', 'research-row');
    const head = text('div', '', 'research-row-head');
    const chipState = item.state === 'protocol' ? 'external' : item.state;
    head.append(text('h4', item.label), text('span', item.state === 'protocol' ? 'Protocole' : 'Implémenté', `tracker-chip is-${chipState}`));
    row.append(head, text('p', item.detail));
    stack.append(row);
  }
}

function renderTiers() {
  const body = byId('tierRows');
  let weighted = 0;
  let total = 0;
  for (const tier of status.dataset.tiers) {
    total += tier.n;
    weighted += tier.n * tier.tp1Pct;
    const row = document.createElement('tr');
    row.append(text('th', tier.label), text('td', number.format(tier.n)), text('td', pct(tier.tp1Pct)), text('td', pct((tier.n / status.dataset.opportunities) * 100)));
    row.firstElementChild.scope = 'row';
    body.append(row);
  }
  byId('tierTotal').textContent = number.format(total);
  byId('tierWeightedTp1').textContent = pct(weighted / total);
  byId('validationNote').textContent = `TP1 global annoncé : ${pct(status.dataset.overallTp1Pct)} · bloc de validation 2026 : ${pct(status.dataset.validation2026Tp1Pct)}. Les tiers totalisent ${number.format(total)} opportunités.`;
}

function renderTimePace() {
  byId('timePaceStatus').textContent = status.timePace.status;
  const rules = byId('timePaceRules');
  for (const rule of status.timePace.rules) rules.append(text('span', rule));
  const rows = byId('timePaceRows');
  for (const result of status.timePace.results) {
    const row = document.createElement('tr');
    row.append(text('th', result.tier), text('td', result.period), text('td', number.format(result.n)), text('td', pct(result.tp1Pct)), text('td', pct(result.tp2Pct)), text('td', pct(result.tp3Pct)), text('td', ev(result.ev1R)), text('td', ev(result.ev2R)), text('td', ev(result.ev3R)));
    row.firstElementChild.scope = 'row';
    rows.append(row);
  }
  const decisions = byId('timePaceDecisions');
  for (const decision of status.timePace.decisions) decisions.append(text('li', decision));
}

function renderNextTest() {
  byId('nextTestLabel').textContent = status.nextTest.label;
  byId('nextTestBlocker').textContent = status.nextTest.blocker;
  byId('nextTestDedupe').textContent = status.nextTest.dedupeRule;
  const steps = byId('nextTestSteps');
  status.nextTest.steps.forEach((step, index) => {
    const item = text('li', '');
    item.append(text('span', String(index + 1).padStart(2, '0')), text('p', step));
    steps.append(item);
  });
}

function renderBoundaries() {
  const list = byId('boundaryList');
  for (const boundary of status.boundaries) list.append(text('li', boundary));
}

function renderFailedIntegrity() {
  byId('failedDiagnosis').textContent = status.failedIntegrity.diagnosis;
  byId('failedCoverage').textContent = `${number.format(status.failedIntegrity.sourceBars)} bougies M5 exploratoires seulement ; le contrôle officiel doit être refait sur les ${number.format(status.failedIntegrity.officialBarsRequired)} bougies canoniques.`;
  const rows = byId('failedRows');
  for (const variant of status.failedIntegrity.variants) {
    const row = document.createElement('tr');
    const validation = variant.note ? `${pct(variant.validationPct)} · ${variant.note}` : pct(variant.validationPct);
    row.append(text('th', variant.label), text('td', number.format(variant.n)), text('td', pct(variant.tp1Pct)), text('td', pct(variant.devPct)), text('td', validation));
    row.firstElementChild.scope = 'row';
    rows.append(row);
  }
  for (const state of status.failedIntegrity.proposedStates) byId('failedStates').append(text('span', state));
  for (const check of status.failedIntegrity.checks) byId('failedChecks').append(text('span', check));
}

function renderTimeline() {
  const list = byId('timeline');
  for (const entry of status.timeline) {
    const item = text('li', '');
    const body = text('div', '');
    body.append(text('h4', entry.title), text('p', entry.detail));
    item.append(text('time', formattedDate(entry.date)), body);
    list.append(item);
  }
}

function renderSources() {
  const list = byId('sourceList');
  for (const source of status.sources) {
    const item = document.createElement('li');
    if (source.href) {
      const link = text('a', source.label);
      link.href = source.href;
      item.append(link);
    } else {
      item.append(text('span', source.label));
    }
    if (source.detail) item.append(text('small', source.detail));
    list.append(item);
  }
}

function validateStatus() {
  const tierTotal = status.dataset.tiers.reduce((sum, tier) => sum + tier.n, 0);
  if (status.schema !== 'nykuto-trading-project-status-v1') throw new Error('Unsupported status schema');
  if (tierTotal !== status.dataset.opportunities) throw new Error('Tier census mismatch');
  if (status.nextTest.steps.length !== 8) throw new Error('Incomplete union checklist');
  if (status.pine.executionAllowed !== false) throw new Error('Execution boundary mismatch');
}

try {
  validateStatus();
  renderSnapshot();
  renderSync();
  renderPine();
  renderRepositoryResearch();
  renderTiers();
  renderTimePace();
  renderNextTest();
  renderBoundaries();
  renderFailedIntegrity();
  renderTimeline();
  renderSources();
} catch (error) {
  byId('trackerError').hidden = false;
  document.documentElement.dataset.statusError = 'true';
}
