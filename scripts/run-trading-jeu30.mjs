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
import { simulateAugustPortfolio } from '../trading/lab/jeu30-engine.mjs';
import { calendarBreakdown } from '../trading/lab/jeu30-calendar.mjs';
import { JEU30_POLICY as P, JEU29_PROFILES as PROFILES, JEU29_PRODUCTS as PRODUCTS } from '../trading/lab/jeu30-policy.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
const [sourceDir, outDir, ...extra] = process.argv.slice(2);
const root = fileURLToPath(new URL('../', import.meta.url)), hash = b => createHash('sha256').update(b).digest('hex');
const serialize = v => JSON.stringify(v, (_, x) => x === Infinity ? 'Infinity' : x, 2) + '\n', cents = n => Math.round(n * 100) / 100;
if (extra.length || ![sourceDir, outDir].every(d => d && relative(root, resolve(d)).startsWith('../'))) throw new Error('Two private paths required; August only');
const freezePath = 'trading/lab/jeu30-freeze.json', freezeRaw = await readFile(resolve(root, freezePath)), freeze = JSON.parse(freezeRaw);
for (const [path, sha] of Object.entries(freeze.files)) assert.equal(hash(await readFile(resolve(root, path))), sha, 'Frozen dependency changed: ' + path);
const prePerformanceCommit = execFileSync('git', ['log', '-1', '--format=%H', '--', freezePath], { cwd: root, encoding: 'utf8' }).trim();
assert.match(prePerformanceCommit, /^[a-f0-9]{40}$/); assert.equal(hash(execFileSync('git', ['show', prePerformanceCommit + ':' + freezePath], { cwd: root })), hash(freezeRaw));
for (const f of ['report.json', 'august-runs-private.json']) {
  try { await access(resolve(outDir, f)); throw new Error('Existing output must not be overwritten: ' + f); }
  catch (e) { if (e.code !== 'ENOENT') throw e; }
}
const source = JSON.parse(await readFile(resolve(root, 'trading/lab/jeu30-source.json')));
const raw = await readFile(resolve(sourceDir, 'dataset.json')), mnqRaw = await readFile(resolve(sourceDir, 'mnq-dataset.json'));
assert.equal(raw.length, source.bytes); assert.equal(hash(raw), source.sha256);
assert.equal(mnqRaw.length, source.mnqBytes); assert.equal(hash(mnqRaw), source.mnqSha256);
const bundle = JSON.parse(raw), mnq = JSON.parse(mnqRaw), expected = historyCalendar(P.from, P.end);
const markets = PROFILES.map(profile => {
  const product = PRODUCTS.find(p => p.symbol === profile.symbol);
  return { ...profile, product, data: inspectOpeningHistory(profile.symbol === 'MNQ' ? mnq : bundle.products.find(p => p.symbol === profile.symbol), product) };
});
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
const privateRuns = [];
function run(factor, account) {
  const period = { start: P.from, end: P.end }, value = simulateAugustPortfolio(streams, period, factor, account);
  for (const d of value.days) {
    const end = new Date(Date.parse(d.day + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
    const prefix = simulateAugustPortfolio(streams.map(s => ({ ...s, candles: s.candles.filter(b => b.day <= d.day),
      signals: new Map([...s.signals].filter(([, v]) => v.day <= d.day)) })), { ...period, end }, factor, account);
    assert.deepEqual(prefix.trades, value.trades.filter(t => t.day <= d.day));
    assert.deepEqual(prefix.days, value.days.filter(x => x.day <= d.day));
    assert.deepEqual(prefix.decisions, value.decisions.filter(x => x.day <= d.day)); audit.replayPrefixes++;
  }
  let previous = null; const used = new Set();
  for (const t of value.trades) {
    assert.ok(t.day >= P.from && t.day < P.end && common.has(t.day));
    assert.ok(!previous || t.entryTime >= previous.exitTime + 300);
    const key = t.day + '/' + t.symbol + '/' + t.side; assert.ok(!used.has(key)); used.add(key);
    assert.ok(t.riskDollars + t.costDollars <= P.riskPerTrade + 1e-7); assert.equal(t.signalClose, t.entryTime);
    const p = PRODUCTS.find(p => p.symbol === t.symbol), sign = t.side === 'Long' ? 1 : -1;
    assert.equal(cents(sign * (t.exit - t.entry) * p.multiplier - t.costDollars), t.netDollars);
    previous = t; audit.trades++;
  }
  const contributions = PROFILES.map(m => {
    const trades = value.trades.filter(t => t.symbol === m.symbol);
    return { ...m, trades: trades.length, net: cents(trades.reduce((n, t) => n + t.netDollars, 0)),
      fees: cents(trades.reduce((n, t) => n + t.costDollars, 0)), ...value.byMarket[m.symbol] };
  });
  const calendar = calendarBreakdown(value, expected, missing.map(d => d.day));
  const signalCount = contributions.reduce((n, c) => n + c.signals, 0);
  assert.equal(signalCount, value.trades.length + Object.values(value.denied).reduce((n, v) => n + v, 0));
  assert.equal(cents(contributions.reduce((n, c) => n + c.net, 0)), value.net);
  privateRuns.push({ period, factor, account, run: value });
  return { status: value.status, terminalDay: value.terminalDay, net: value.net, balance: value.balance, floor: value.floor,
    trades: value.trades.length, drawdown: value.drawdown, metrics: metrics(value.trades), fees: cents(contributions.reduce((n, c) => n + c.fees, 0)),
    daily: value.daily, dailyMean: value.days.length ? cents(value.net / value.days.length) : null,
    contributions, signalCount, denied: value.denied, calendar, executionAllowed: false };
}
const diagnostic = { normal: run(1, false), stress: run(2, false) };
const account = missing.length ? null : { normal: run(1, true), stress: run(2, true) };
audit.passed = true;
const report = { schema: 'jeu30-report-v1', protocol: P.version, generatedAt: new Date().toISOString(), prePerformanceCommit,
  freezeSha256: hash(freezeRaw), protocolSha256: freeze.files['trading/lab/JEU30_PROTOCOL.md'], source, policy: P, profiles: PROFILES,
  coverage: { expected: expected.length, scored: eligible.length, missing }, diagnostic, account,
  selection: { id: null, attempted: 1, cumulativeAttempts: 67 },
  holdout: { status: 'evaluated-by-request', consumed: { start: P.from, end: P.end }, qualified: false },
  confirmed: false, executionAllowed: false, audit };
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'report.json'), serialize(report), { flag: 'wx' });
await writeFile(resolve(outDir, 'august-runs-private.json'), serialize({ schema: 'jeu30-private-v1', source, prePerformanceCommit,
  freezeSha256: hash(freezeRaw), runs: privateRuns }), { flag: 'wx' });
console.log(serialize({ coverage: report.coverage, modes: Object.fromEntries(Object.entries({ diagnostic, account }).map(([mode, costs]) => [mode,
  costs && Object.fromEntries(Object.entries(costs).map(([cost, x]) => [cost, { status: x.status, net: x.net, trades: x.trades, drawdown: x.drawdown,
    daily: x.daily, weeks: x.calendar.weeks, contributions: x.contributions }]))])), audit }));
