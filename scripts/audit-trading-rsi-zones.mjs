import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectOpeningHistory } from '../trading/lab/jeu22-history.mjs';
import { combinedContexts } from '../trading/lab/jeu24-context.mjs';
import { JEU29_PRODUCTS } from '../trading/lab/jeu29-policy.mjs';
import { classifyRsi, summarizeRsi } from '../trading/lab/rsi-zones.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const [sourceDir, archiveDir, outputDir, ...extra] = process.argv.slice(2);
assert.ok(!extra.length && [sourceDir, archiveDir, outputDir].every(p => p && relative(root, resolve(p)).startsWith('../')), 'Private paths required');
const hash = b => createHash('sha256').update(b).digest('hex');
const definitionRaw = await readFile(resolve(root, 'trading/lab/rsi-audit-definition.json')), definition = JSON.parse(definitionRaw);
const frozen = JSON.parse(await readFile(resolve(root, 'trading/lab/market-audit-freeze.json')));
for (const [p, sha] of Object.entries({ ...frozen.files, ...definition.files })) assert.equal(hash(await readFile(resolve(root, p))), sha, p);
const source = JSON.parse(await readFile(resolve(root, 'trading/lab/market-audit-source.json')));
async function checked(path, key) { const raw = await readFile(path), x = source.inputs[key]; assert.equal(raw.length, x.bytes); assert.equal(hash(raw), x.sha256); return JSON.parse(raw); }
const prices = await checked(resolve(sourceDir, 'dataset.json'), 'prices'), mnq = await checked(resolve(sourceDir, 'mnq-dataset.json'), 'mnq');
const dev = await checked(resolve(archiveDir, 'jeu29-private/train-runs-private.json'), 'development');
const aug = await checked(resolve(archiveDir, 'jeu30-private/august-runs-private.json'), 'august');
const contexts = new Map(JEU29_PRODUCTS.map(p => {
  const data = inspectOpeningHistory(p.symbol === 'MNQ' ? mnq : prices.products.find(x => x.symbol === p.symbol), p);
  const bars = data.groups.filter(g => g.start < '2026-05-01' || g.start >= '2026-08-01').flatMap(g => g.candles);
  return [p.symbol, combinedContexts(bars, p)];
}));
const runs = [...dev.runs.filter(r => r.period.start === '2026-01-01' && r.period.end === '2026-05-01'), ...aug.runs].map(r => ({ ...r,
  rows: r.run.trades.map(t => {
    const c = contexts.get(t.symbol).get(t.entryTime), previous = contexts.get(t.symbol).get(t.entryTime - 300);
    assert.ok(c && c.closedAt === t.signalClose && c.sourceTime === t.signalOpen && c.day === t.day && c.ticker === t.ticker);
    const priorRsi = previous?.day === t.day && previous?.ticker === t.ticker ? previous.rsi : null;
    return { ...t, rsiZone: classifyRsi(c.rsi, priorRsi) };
  }) }));
const primary = runs.filter(r => !r.account && r.factor === 1).flatMap(r => r.rows);
const markets = rows => JEU29_PRODUCTS.map(p => ({ symbol: p.symbol, ...summarizeRsi(rows.filter(t => t.symbol === p.symbol)) }));
const windows = [['jan-feb', '2026-01-01', '2026-03-01', false], ['mar-apr', '2026-03-01', '2026-05-01', false],
  ['august', '2026-08-01', '2026-09-01', false], ['august', '2026-08-01', '2026-09-01', true]];
const views = windows.map(([id, start, end, account]) => ({ id, mode: account ? 'account' : 'diagnostic', costs: Object.fromEntries([['normal', 1], ['stress', 2]].map(([cost, factor]) => {
  const r = runs.find(r => r.account === account && r.factor === factor && r.period.start <= start && r.period.end >= end);
  return [cost, { markets: markets(r.rows.filter(t => t.day >= start && t.day < end)) }];
})) }));
const report = { schema: 'rsi-zone-audit-v1', generatedAt: new Date().toISOString(), definitionSha256: hash(definitionRaw),
  sourceSha256: hash(await readFile(resolve(root, 'trading/lab/market-audit-source.json'))),
  parentAuditSha256: hash(await readFile(resolve(root, 'trading/lab/market-audit-report.json'))),
  method: { period: 14, smoothing: 'Wilder', timeframeMinutes: 5, sessions: 'cash-only; gap/roll resets follow Game24',
    oversoldBelow: 30, overboughtAbove: 70, boundaries: '30 and 70 remain middle', event: 'latest closed bar versus preceding closed bar in same session' },
  researchOnly: true, executionAllowed: false, newStrategyTrials: 0, configurationCount: 67,
  primary: { ...summarizeRsi(primary), markets: markets(primary) }, views };
await mkdir(outputDir, { recursive: true });
await writeFile(resolve(outputDir, 'rsi-zone-report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ observations: primary.length, markets: report.primary.markets.map(m => ({ symbol: m.symbol, zones: m.zones.map(z => ({ zone: z.value, n: z.count, wins: z.wins, losses: z.losses, flat: z.flat, net: z.net })), events: m.events.filter(e => e.count).map(e => ({ event: e.value, n: e.count, net: e.net })) })) }));
