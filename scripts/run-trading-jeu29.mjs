import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { inspectOpeningHistory } from '../trading/lab/jeu22-history.mjs';
import { admissionSignals } from '../trading/lab/jeu23-signals.mjs';
import { failedBreakoutSignals } from '../trading/lab/jeu26-signals.mjs';
import { simulatePortfolio } from '../trading/lab/jeu29-engine.mjs';
import { JEU29_POLICY as P, JEU29_PROFILES, JEU29_PRODUCTS } from '../trading/lab/jeu29-policy.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
const [sourceDir, outDir, ...extra] = process.argv.slice(2);
const root = fileURLToPath(new URL('../', import.meta.url)), hash = b => createHash('sha256').update(b).digest('hex');
if (extra.length || ![sourceDir, outDir].every(d => d && relative(root, resolve(d)).startsWith('../'))) throw new Error('Two private paths required; development only');
const freezePath = 'trading/lab/jeu29-freeze.json', freezeRaw = await readFile(resolve(root, freezePath)), freeze = JSON.parse(freezeRaw);
for (const [path, sha] of Object.entries(freeze.files)) assert.equal(hash(await readFile(resolve(root, path))), sha, 'Frozen dependency changed: ' + path);
const prePerformanceCommit = execFileSync('git', ['log', '-1', '--format=%H', '--', freezePath], { cwd: root, encoding: 'utf8' }).trim();
assert.match(prePerformanceCommit, /^[a-f0-9]{40}$/);
assert.equal(hash(execFileSync('git', ['show', prePerformanceCommit + ':' + freezePath], { cwd: root })), hash(freezeRaw));
for (const f of ['report.json', 'train-runs-private.json']) {
  try { await access(resolve(outDir, f)); throw new Error('Existing experiment output must not be overwritten: ' + f); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
}
const source = JSON.parse(await readFile(resolve(root, 'trading/lab/jeu29-source.json')));
const raw = await readFile(resolve(sourceDir, 'dataset.json')), mnqRaw = await readFile(resolve(sourceDir, 'mnq-dataset.json'));
assert.equal(raw.length, source.bytes); assert.equal(hash(raw), source.sha256);
assert.equal(mnqRaw.length, source.mnqBytes); assert.equal(hash(mnqRaw), source.mnqSha256);
const bundle = JSON.parse(raw), mnq = JSON.parse(mnqRaw);
const markets = JEU29_PROFILES.map(profile => {
  const product = JEU29_PRODUCTS.find(p => p.symbol === profile.symbol);
  return { ...profile, product, data: inspectOpeningHistory(profile.symbol === 'MNQ' ? mnq : bundle.products.find(p => p.symbol === profile.symbol), product) };
});
const expected = historyCalendar(P.from, P.trainEnd);
const missing = expected.flatMap(day => {
  const absent = markets.filter(m => !m.data.eligible.some(d => d.date === day.date)).map(m => m.symbol);
  return absent.length ? [{ day: day.date, markets: absent }] : [];
});
const eligible = expected.filter(d => !missing.some(m => m.day === d.date)).map(d => d.date), common = new Set(eligible);
const audit = { signalPrefixes: 0, replayPrefixes: 0, trades: 0, passed: false };
const streams = markets.map(m => {
  const candles = [], signals = new Map(), generator = m.strategy === 'failure' ? failedBreakoutSignals : admissionSignals;
  for (const group of m.data.groups) {
    if (!common.has(group.start)) continue;
    const bars = group.candles, full = generator(bars, m.product);
    for (let n = 1; n <= bars.length; n++) {
      assert.deepEqual([...generator(bars.slice(0, n), m.product)], [...full].filter(([t]) => t <= bars[n - 1].time + 300)); audit.signalPrefixes++;
    }
    candles.push(...bars); for (const [t, s] of full) { assert.ok(!signals.has(t)); signals.set(t, s); }
  }
  return { symbol: m.symbol, candles: candles.sort((a, b) => a.time - b.time), signals };
});
const cents = n => Math.round(n * 100) / 100, serialize = v => JSON.stringify(v, (_, x) => x === Infinity ? 'Infinity' : x, 2) + '\n';
const privateRuns = [];
function summarize(run) {
  const contributions = markets.map(m => {
    const trades = run.trades.filter(t => t.symbol === m.symbol), n = cents(trades.reduce((a, t) => a + t.netDollars, 0));
    return { symbol: m.symbol, strategy: m.strategy, trades: trades.length, net: n,
      fees: cents(trades.reduce((a, t) => a + t.costDollars, 0)), ...run.byMarket[m.symbol] };
  });
  assert.equal(cents(contributions.reduce((a, c) => a + c.net, 0)), run.net);
  assert.equal(cents(run.days.reduce((a, d) => a + d.net, 0)), run.net);
  const signalCount = contributions.reduce((a, c) => a + c.signals, 0);
  assert.equal(signalCount, run.trades.length + Object.values(run.denied).reduce((a, n) => a + n, 0));
  return { status: run.status, terminalDay: run.terminalDay, trades: run.trades.length, net: run.net,
    balance: run.balance, floor: run.floor, drawdown: run.drawdown, metrics: metrics(run.trades),
    fees: cents(contributions.reduce((a, c) => a + c.fees, 0)), daily: run.daily,
    dailyMean: run.days.length ? cents(run.net / run.days.length) : null,
    activeDailyMean: run.days.some(d => d.trades) ? cents(run.net / run.days.filter(d => d.trades).length) : null,
    signalCount, denied: run.denied, ambiguous: run.ambiguous, contributions, executionAllowed: false };
}
function run(period, factor, account) {
  const value = simulatePortfolio(streams, period, factor, account);
  for (const d of value.days) {
    assert.ok(d.trades <= 2);
    const end = new Date(Date.parse(d.day + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
    const prefix = simulatePortfolio(streams.map(s => ({ ...s, candles: s.candles.filter(b => b.day <= d.day),
      signals: new Map([...s.signals].filter(([, v]) => v.day <= d.day)) })), { ...period, end }, factor, account);
    assert.deepEqual(prefix.trades, value.trades.filter(t => t.day <= d.day));
    assert.deepEqual(prefix.days, value.days.filter(x => x.day <= d.day));
    assert.deepEqual(prefix.decisions, value.decisions.filter(x => x.day <= d.day)); audit.replayPrefixes++;
  }
  let previous = null; const used = new Set();
  for (const t of value.trades) {
    assert.ok(common.has(t.day)); assert.ok(!previous || t.entryTime >= previous.exitTime + 300);
    assert.ok(!used.has(t.day + '/' + t.symbol + '/' + t.side)); used.add(t.day + '/' + t.symbol + '/' + t.side);
    assert.ok(t.riskDollars + t.costDollars <= P.riskPerTrade + 1e-7);
    assert.equal(t.signalClose, t.entryTime); assert.equal(t.signalOpen, t.entryTime - 300);
    const p = JEU29_PRODUCTS.find(p => p.symbol === t.symbol), sign = t.side === 'Long' ? 1 : -1;
    assert.equal(cents(sign * (t.exit - t.entry) * p.multiplier - t.costDollars), t.netDollars);
    if (t.breakEvenAt !== null) assert.ok(t.breakEvenAt >= t.entryTime + 300 && t.breakEvenAt <= t.exitTime);
    previous = t; audit.trades++;
  }
  privateRuns.push({ period, factor, account, run: value }); return summarize(value);
}
const diagnostic = { normal: run({ start: P.from, end: P.trainEnd }, 1, false), stress: run({ start: P.from, end: P.trainEnd }, 2, false) };
const windows = [{ start: P.from, end: '2026-03-01' }, { start: '2026-03-01', end: P.trainEnd }].map(w => {
  const count = historyCalendar(w.start, w.end).length, scored = eligible.filter(d => d >= w.start && d < w.end).length, complete = count === scored;
  return { ...w, expected: count, scored, complete,
    diagnostic: { normal: run(w, 1, false), stress: run(w, 2, false) },
    account: complete ? { normal: run(w, 1, true), stress: run(w, 2, true) } : null };
});
const checks = [
  { id: 'coverage', label: 'Deux fenêtres entièrement couvertes', pass: windows.every(w => w.complete) },
  { id: 'count', label: 'Au moins 40 trades au total', pass: diagnostic.normal.trades >= P.minimumTrades },
  { id: 'windowCount', label: 'Au moins 12 trades par fenêtre', pass: windows.every(w => w.diagnostic.normal.trades >= P.minimumWindowTrades) },
  { id: 'positive', label: 'Chaque fenêtre positive en R et USD', pass: windows.every(w => w.diagnostic.normal.net > 0 && w.diagnostic.normal.metrics.total > 0) },
  { id: 'pf', label: 'Profit factor R au moins 1,10', pass: diagnostic.normal.metrics.pf !== null && diagnostic.normal.metrics.pf >= P.minimumPF },
  { id: 'dd', label: 'Drawdown réalisé au plus 8 R', pass: diagnostic.normal.metrics.dd <= P.maxDrawdownR },
  { id: 'stress', label: 'Total positif en R et USD avec coûts doublés', pass: diagnostic.stress.net > 0 && diagnostic.stress.metrics.total > 0 },
  { id: 'account', label: 'Aucun seuil franchi dans deux comptes complets', pass: windows.every(w => w.complete && w.account.normal.status !== 'breached' && w.account.stress.status !== 'breached') }
];
audit.passed = true;
const report = { schema: 'jeu29-report-v1', protocol: P.version, generatedAt: new Date().toISOString(),
  prePerformanceCommit, freezeSha256: hash(freezeRaw), protocolSha256: freeze.files['trading/lab/JEU29_PROTOCOL.md'], source,
  policy: P, profiles: JEU29_PROFILES, coverage: { expected: expected.length, scored: eligible.length, missing },
  diagnostic, windows, checks, researchPassed: checks.every(c => c.pass),
  selection: { id: null, attempted: 1, cumulativeAttempts: 66 }, holdout: { status: 'not-opened', reason: 'Research portfolio diagnostic only; reserve excluded by protocol' },
  confirmed: false, executionAllowed: false, audit };
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'report.json'), serialize(report), { flag: 'wx' });
await writeFile(resolve(outDir, 'train-runs-private.json'), serialize({ schema: 'jeu29-private-v1', source,
  prePerformanceCommit, freezeSha256: hash(freezeRaw), runs: privateRuns }), { flag: 'wx' });
console.log(serialize({ coverage: report.coverage, normal: diagnostic.normal, stress: diagnostic.stress,
  windows: windows.map(w => ({ start: w.start, normal: w.diagnostic.normal.net, stress: w.diagnostic.stress.net, coverage: w.scored + '/' + w.expected })),
  failed: checks.filter(c => !c.pass).map(c => c.id), audit }));
