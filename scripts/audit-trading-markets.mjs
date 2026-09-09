import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { inspectOpeningHistory } from '../trading/lab/jeu22-history.mjs';
import { combinedContexts } from '../trading/lab/jeu24-context.mjs';
import { riskFill } from '../trading/lab/jeu23-risk.mjs';
import { closedBreakEven } from '../trading/lab/jeu28-protection.mjs';
import { JEU29_PRODUCTS, JEU29_RISK, JEU29_PROFILES } from '../trading/lab/jeu29-policy.mjs';
import { JEU15_POLICY } from '../trading/lab/jeu15-policy.mjs';
import { entryContext, pathBounds, statistics, summarizeMarket, compareCosts, tradeKey, round } from '../trading/lab/market-diagnostics.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const [sourceDir, archivesDir, outDir, ...extra] = process.argv.slice(2);
assert.ok(!extra.length && [sourceDir, archivesDir, outDir].every(p => p && relative(root, resolve(p)).startsWith('../')), 'Private paths required');
const hash = b => createHash('sha256').update(b).digest('hex');
const freezeBytes = await readFile(resolve(root, 'trading/lab/market-audit-freeze.json')), freeze = JSON.parse(freezeBytes);
for (const [path, sha] of Object.entries(freeze.files)) assert.equal(hash(await readFile(resolve(root, path))), sha, path);
const definitionCommit = execFileSync('git', ['log', '-1', '--format=%H', '--', 'trading/lab/market-audit-freeze.json'], { cwd: root, encoding: 'utf8' }).trim();
assert.match(definitionCommit, /^[0-9a-f]{40}$/);
const manifest = JSON.parse(await readFile(resolve(root, 'trading/lab/market-audit-source.json')));
const publicReports = {};
for (const [path, expected] of Object.entries(manifest.publicFiles)) {
  const raw = await readFile(resolve(root, path)); assert.equal(hash(raw), expected, path);
  publicReports[path] = JSON.parse(raw);
}
const ledger = publicReports['trading/lab/research-ledger.json'];
assert.equal(ledger.configurationCount, 67); assert.equal(ledger.entries.length, 67);
const inventory = ledger.entries.map(entry => {
  const r = publicReports['trading/lab/' + entry.report], x = r.results?.find(x => x.id === entry.id);
  assert.ok(x || entry.game >= 29, 'Unmatched historical trial');
  return { game: entry.game, id: entry.id, report: entry.report, developmentPassed: entry.developmentPassed,
    holdoutStatus: entry.holdoutStatus, holdoutPassed: entry.holdoutPassed, confirmed: entry.confirmed,
    normalTrades: x?.diagnostic.normal.trades ?? r.diagnostic.normal.trades,
    normalNet: x?.diagnostic.normal.net ?? r.diagnostic.normal.net,
    stressNet: x?.diagnostic.stress.net ?? r.diagnostic.stress.net,
    failedChecks: (x?.checks ?? r.checks ?? []).filter(c => !c.pass).map(c => c.label) };
});
async function checked(path, key) { const raw = await readFile(path), m = manifest.inputs[key]; assert.equal(raw.length, m.bytes, key); assert.equal(hash(raw), m.sha256, key); return JSON.parse(raw); }
const bundle = await checked(resolve(sourceDir, 'dataset.json'), 'prices'), mnq = await checked(resolve(sourceDir, 'mnq-dataset.json'), 'mnq');
const dev = await checked(resolve(archivesDir, 'jeu29-private/train-runs-private.json'), 'development');
const august = await checked(resolve(archivesDir, 'jeu30-private/august-runs-private.json'), 'august');
const observed = d => d >= '2026-01-01' && d < '2026-05-01' || d >= '2026-08-01' && d < '2026-09-01';
const sources = new Map(JEU29_PRODUCTS.map(product => {
  const data = inspectOpeningHistory(product.symbol === 'MNQ' ? mnq : bundle.products.find(p => p.symbol === product.symbol), product);
  const bars = data.groups.filter(g => observed(g.start)).flatMap(g => g.candles).sort((a, b) => a.time - b.time);
  return [product.symbol, { product, data, bars, lookup: new Map(bars.map((b, i) => [b.time, i])), contexts: combinedContexts(bars, product) }];
}));
let prefixChecks = 0, executionChecks = 0;
const cached = new Map();
function enrich(t, account) {
  const s = sources.get(t.symbol), start = s.lookup.get(t.entryTime), end = s.lookup.get(t.exitTime);
  assert.ok(Number.isInteger(start) && Number.isInteger(end));
  assert.equal(s.bars[start].open, t.entry); assert.equal(s.bars[start].ticker, t.ticker);
  const closed = s.bars.slice(0, start), dayBars = closed.filter(b => b.day === t.day), ctx = s.contexts.get(t.entryTime);
  if (!cached.has(tradeKey(t))) {
    assert.deepEqual(combinedContexts(closed, s.product).get(t.entryTime), ctx, 'Future bars changed entry context'); prefixChecks++;
    cached.set(tradeKey(t), true);
  }
  const bars = s.bars.slice(start, end + 1), pos = { ...t, stop: t.initialStop, breakEvenAt: null };
  let exitFound = false;
  for (const bar of bars) {
    const closing = bar.minute >= bar.closeMinute - JEU15_POLICY.exitBeforeClose;
    const fill = riskFill(s.product, pos, closing ? { ...bar, high: bar.open, low: bar.open } : bar,
      t.balanceBefore, t.floorBefore ?? 24000, t.dayStart, true, account, JEU29_RISK) || (closing ? { price: bar.open, reason: 'Session close' } : null);
    if (fill) {
      const reason = pos.breakEvenAt !== null && ['Stop', 'Stop gap'].includes(fill.reason)
        ? fill.reason === 'Stop' ? 'Break-even stop' : 'Break-even gap' : fill.reason;
      assert.equal(bar.time, t.exitTime, 'Earlier exit omitted'); assert.equal(fill.price, t.exit); assert.equal(reason, t.reason);
      assert.equal(!!fill.ambiguous, t.ambiguous); assert.equal(pos.breakEvenAt, t.breakEvenAt); exitFound = true; break;
    }
    if (t.strategy === 'protection') { const update = closedBreakEven(pos, bar, s.product); if (update) Object.assign(pos, update); }
  }
  assert.ok(exitFound, 'Recorded exit not reproducible');
  const sign = t.side === 'Long' ? 1 : -1;
  assert.equal(round(sign * (t.exit - t.entry) * s.product.multiplier - t.costDollars, 2), t.netDollars);
  assert.equal(t.netDollars / t.riskDollars, t.resultR); executionChecks++;
  return { ...t, context: entryContext(t, dayBars, ctx), path: pathBounds(t, bars) };
}
const all = [...dev.runs.filter(r => r.period.start === '2026-01-01' && r.period.end === '2026-05-01'), ...august.runs];
const enriched = all.map(r => ({ ...r, rows: r.run.trades.map(t => enrich(t, r.account)) }));
for (const r of enriched) {
  assert.equal(statistics(r.rows).net, r.run.net);
  assert.equal(r.run.days.reduce((n, d) => n + d.trades, 0), r.rows.length);
  assert.equal(round(r.run.days.reduce((n, d) => n + d.net, 0), 2), r.run.net);
}
const windows = [['jan-feb', '2026-01-01', '2026-03-01'], ['mar-apr', '2026-03-01', '2026-05-01'], ['august', '2026-08-01', '2026-09-01']];
const views = [];
for (const [id, start, end] of windows) for (const account of (id === 'august' ? [false, true] : [false])) {
  const costs = {};
  for (const [cost, factor] of [['normal', 1], ['stress', 2]]) {
    const r = enriched.find(r => r.factor === factor && r.account === account && r.period.start <= start && r.period.end >= end);
    const rows = r.rows.filter(t => t.day >= start && t.day < end), decisions = r.run.decisions.filter(d => d.day >= start && d.day < end);
    costs[cost] = { summary: statistics(rows), days: r.run.days.filter(d => d.day >= start && d.day < end).length,
      markets: JEU29_PROFILES.map(p => ({ ...p, ...summarizeMarket(rows.filter(t => t.symbol === p.symbol), decisions.filter(d => d.symbol === p.symbol)) })) };
  }
  const normal = enriched.find(r => r.factor === 1 && r.account === account && r.period.start <= start && r.period.end >= end).rows.filter(t => t.day >= start && t.day < end);
  const stress = enriched.find(r => r.factor === 2 && r.account === account && r.period.start <= start && r.period.end >= end).rows.filter(t => t.day >= start && t.day < end);
  views.push({ id, start, end, mode: account ? 'account' : 'diagnostic', costs,
    costAttribution: { all: compareCosts(normal, stress), markets: JEU29_PROFILES.map(p => ({ symbol: p.symbol,
      ...compareCosts(normal.filter(t => t.symbol === p.symbol), stress.filter(t => t.symbol === p.symbol)) })) } });
}
const primary = enriched.filter(r => !r.account && r.factor === 1).flatMap(r => r.rows);
assert.equal(new Set(primary.map(tradeKey)).size, primary.length, 'Double-counted primary observations');
const report = { schema: 'market-audit-v1', generatedAt: new Date().toISOString(), definitionCommit,
  freezeSha256: hash(freezeBytes), source: manifest, researchOnly: true, executionAllowed: false,
  configurationCount: 67, newStrategyTrials: 0, independentConfirmation: false,
  primary: { observations: primary.length, note: 'Normal-cost diagnostics only; January–April and August are disjoint. Not a continuous five-month account.',
    markets: JEU29_PROFILES.map(p => ({ ...p, ...statistics(primary.filter(t => t.symbol === p.symbol)) })) },
  coverage: Object.fromEntries([...sources].map(([symbol, s]) => [symbol, { complete: s.data.eligible.filter(d => observed(d.date)).length,
    missing: s.data.unavailable.filter(d => observed(d.date)).map(d => d.date) }])),
  inventory,
  audit: { executionChecks, contextPrefixChecks: prefixChecks, historicalTrialsReconciled: inventory.length, passed: true }, views };
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'market-audit-report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ primary: report.primary, audit: report.audit, coverage: report.coverage }));
