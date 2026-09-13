import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectHistory } from '../trading/lab/jeu14-history.mjs';
import { JEU14_SOURCE as source } from '../trading/lab/jeu14-source.mjs';
import { JEU14_WINDOWS, historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { lucidSignals, entryGate, floorAtClose } from '../trading/lab/jeu15-engine.mjs';
import { JEU15_POLICY as riskPolicy } from '../trading/lab/jeu15-policy.mjs';
import { sessionVwapContexts, filterVwapSignals, simulateVwap } from '../trading/lab/jeu18-engine.mjs';
import { JEU18_POLICY as policy, JEU18_SCENARIOS as scenarios } from '../trading/lab/jeu18-policy.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
const [sourceDir, priorDir, outDir] = process.argv.slice(2), root = fileURLToPath(new URL('../', import.meta.url));
if (![sourceDir, priorDir, outDir].every(d => d && relative(root, resolve(d)).startsWith('../'))) throw new Error('Private paths required');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const freezeText = await readFile(resolve(root, 'trading/lab/jeu18-freeze.json'), 'utf8'), freeze = JSON.parse(freezeText);
for (const [path, expected] of Object.entries(freeze.files)) assert.equal(hash(await readFile(resolve(root, path))), expected, `Frozen dependency changed: ${path}`);
const raw = await readFile(resolve(sourceDir, 'dataset.json'));
assert.equal(raw.length, source.bytes); assert.equal(hash(raw), source.sha256);
const oldRaw = await readFile(resolve(priorDir, 'runs-archive.json'));
assert.equal(hash(oldRaw), '0d8b44e9f66200195da17a9ab1062e974ccb9f71447c4288ebf91a9ceee784a1');
const oldRuns = JSON.parse(oldRaw).runs;
const { groups, eligible, expectedSessions, unavailable } = inspectHistory(JSON.parse(raw));
assert.equal(eligible.length, 330);
const allBars = new Map(), candles = [], maps = { reference: new Map(), vwap: new Map() }, filterDecisions = new Map();
const audit = { dependencies: Object.keys(freeze.files).length, signalPrefixes: 0, vwapPrefixes: 0, accountPrefixes: 0, trades: 0, vwapTrades: 0, legacyTrades: 0, passed: false };
for (const g of groups) {
  const plain = lucidSignals(g.candles, 'entry5trend30'), filtered = filterVwapSignals(g.candles, plain);
  for (const [time, d] of filtered.decisions) if (d.day >= g.start && d.day < g.end) { assert.ok(!filterDecisions.has(time)); filterDecisions.set(time, d); }
  for (const b of g.candles) {
    const key = `${g.ticker}/${b.time}`;
    if (allBars.has(key)) assert.deepEqual(allBars.get(key), b); else allBars.set(key, b);
    if (b.day >= g.start && b.day < g.end) candles.push({ ...b, ticker: g.ticker });
  }
  for (let cut = 6; cut <= g.candles.length; cut += 6) {
    const last = g.candles[cut - 1]; if (last.minute !== last.closeMinute - 5) continue;
    const prefix = g.candles.slice(0, cut);
    const prefixSignals = lucidSignals(prefix, 'entry5trend30'), check = filterVwapSignals(prefix, prefixSignals);
    assert.deepEqual([...check.signals], [...filtered.signals].filter(([t]) => t <= last.time + 300)); audit.signalPrefixes++;
    assert.deepEqual([...check.contexts], [...filtered.contexts].filter(([t]) => t <= last.time + 300)); audit.vwapPrefixes++;
  }
  for (const [mode, set] of [['reference', plain], ['vwap', filtered.signals]]) for (const [t, s] of set) if (s.day >= g.start && s.day < g.end) {
    assert.ok(!maps[mode].has(t)); maps[mode].set(t, s);
  }
}
candles.sort((a, b) => a.time - b.time);
assert.equal(new Set(candles.map(b => b.time)).size, candles.length);
assert.equal(new Set(candles.map(b => b.day)).size, eligible.length);
function auditVwap(t) {
  const bars = [...allBars.entries()].filter(([key, b]) => key.startsWith(t.ticker + '/') && b.day === t.day && b.time < t.signalClose).map(([, b]) => b).sort((a, b) => a.time - b.time);
  assert.equal(bars[0].minute, 570); assert.equal(bars.at(-1).time + 300, t.signalClose);
  let volume = 0, numerator = 0;
  for (const [i, b] of bars.entries()) {
    if (i) assert.equal(b.time - bars[i - 1].time, 300);
    volume += b.volume; numerator += (b.high + b.low + b.close) * b.volume;
  }
  assert.ok(volume > 0);
  const sign = t.side === 'Long' ? 1 : -1;
  assert.ok(sign * (3 * bars.at(-1).close * volume - numerator) > 0);
  assert.ok(maps.vwap.has(t.entryTime));
  audit.vwapTrades++;
}
function auditRun(run, scenario, account, factor) {
  let balance = 25000, floor = 24000, previous = -Infinity;
  for (const day of run.days) {
    const ts = run.trades.filter(t => t.day === day.day), dayStart = balance;
    assert.equal(ts.length, day.trades); assert.ok(ts.length <= 3);
    let losses = 0, netR = 0;
    for (const t of ts) {
      assert.ok(t.entryTime > previous); previous = t.exitTime;
      assert.ok(losses < 2 && netR > -2); assert.equal(t.balanceBefore, balance); assert.equal(t.dayStart, dayStart);
      assert.equal(t.costDollars, 3.5 * factor); assert.equal(t.riskDollars, t.risk * 2);
      assert.equal(t.floorBefore, account ? floor : null); assert.ok(t.signalOpen < t.signalClose && t.signalClose === t.entryTime && t.trendClosedAt <= t.entryTime);
      const b = allBars.get(`${t.ticker}/${t.entryTime}`), exit = allBars.get(`${t.ticker}/${t.exitTime}`);
      assert.equal(t.entry, b.open); assert.ok(b.minute < b.closeMinute - 15); assert.ok(exit.minute <= exit.closeMinute - 15);
      assert.equal(entryGate({ balance, floor, dayStart, ...t, guarded: true, account }), null);
      for (const price of [t.entry, t.exit, t.stop, t.target]) assert.equal(price * 4, Math.round(price * 4));
      const sign = t.side === 'Long' ? 1 : -1, net = sign * (t.exit - t.entry) * 2 - t.costDollars;
      assert.equal(net, t.netDollars); assert.ok(Math.abs(net / t.riskDollars - t.resultR) < 1e-10);
      assert.ok(t.targetDistance * 2 - t.costDollars >= t.riskDollars + t.costDollars);
      if (scenario.filter === 'vwap') auditVwap(t);
      balance = Math.round((balance + net) * 100) / 100; assert.equal(t.balanceAfter, balance);
      netR += t.resultR; losses = net < 0 ? losses + 1 : 0;
      if (account && balance <= floor) assert.equal(run.status, 'breached'); audit.trades++;
    }
    assert.equal(day.net, Math.round((balance - dayStart) * 100) / 100); assert.equal(day.balance, balance);
    if (account) floor = floorAtClose(floor, balance); assert.equal(day.floor, account ? floor : null);
  }
  assert.equal(run.balance, balance); assert.equal(run.floor, account ? floor : null);
  if (run.status === 'targetMet') { assert.ok(run.net >= 1250 && run.consistency <= .5 && balance > floor); }
  if (run.status === 'breached') { assert.ok(balance <= floor); assert.equal(run.days.at(-1).day, run.terminalDay); }
}
function describe(ts) {
  const m = metrics(ts), fees = ts.reduce((n, t) => n + t.costDollars, 0), net = ts.reduce((n, t) => n + t.netDollars, 0);
  const wins = ts.filter(t => t.netDollars > 0), losses = ts.filter(t => t.netDollars < 0);
  const positive = wins.reduce((n, t) => n + t.netDollars, 0), negative = -losses.reduce((n, t) => n + t.netDollars, 0);
  const byDay = Object.groupBy(ts, t => t.day), frequency = { 1: 0, 2: 0, 3: 0 }, exits = {};
  for (const list of Object.values(byDay)) frequency[list.length]++;
  for (const t of ts) exits[t.reason] = (exits[t.reason] || 0) + 1;
  return { metrics: m, netDollars: net, grossDollars: net + fees, feesDollars: fees, dollarPF: negative ? positive / negative : positive ? Infinity : null,
    averageWin: wins.length ? positive / wins.length : null, averageLoss: losses.length ? -negative / losses.length : null, frequency, exits };
}
function clean(run) { const { trades, days, ...summary } = run; return { ...summary, trades: trades.length, ...describe(trades) }; }
const bounds = { start: eligible[0].date, end: '2026-09-09' }, results = [], privateRuns = [];
for (const scenario of scenarios) {
  const signals = maps.reference, diagnostic = [1, 2].map(f => simulateVwap(candles, signals, scenario, bounds, f, false));
  for (const [i, run] of diagnostic.entries()) auditRun(run, scenario, false, i + 1);
  if (scenario.id === 'reference') {
    const old = oldRuns.find(x => x.scenario === 'atrNet5' && x.diagnostic).diagnostic;
    for (let i = 0; i < 2; i++) { assert.deepEqual(diagnostic[i], old[i]); audit.legacyTrades += old[i].trades.length; }
  }
  const windows = [];
  for (const w of JEU14_WINDOWS) {
    const expected = historyCalendar(w.start, w.end).length, scored = eligible.filter(d => d.date >= w.start && d.date < w.end).length;
    if (expected !== scored) { windows.push({ start: w.start, end: w.end, complete: false, expected, scored, normal: null, stress: null }); continue; }
    const bars = candles.filter(b => b.day >= w.start && b.day < w.end), pair = [];
    for (const factor of [1, 2]) {
      const run = simulateVwap(bars, signals, scenario, w, factor, true); auditRun(run, scenario, true, factor);
      if (scenario.id === 'reference') {
        const old = oldRuns.find(x => x.scenario === 'atrNet5' && x.window?.start === w.start)[factor === 1 ? 'normal' : 'stress'];
        assert.deepEqual(run, old); audit.legacyTrades += old.trades.length;
      }
      for (let cut = 1; cut <= bars.length; cut++) {
        const last = bars[cut - 1]; if (last.minute !== last.closeMinute - 5) continue;
        const prefix = simulateVwap(bars.slice(0, cut), signals, scenario, w, factor, true);
        assert.deepEqual(prefix.trades, run.trades.filter(t => t.day <= last.day)); assert.deepEqual(prefix.days, run.days.filter(d => d.day <= last.day)); audit.accountPrefixes++;
      }
      pair.push(run);
    }
    windows.push({ start: w.start, end: w.end, complete: true, expected, scored, normal: clean(pair[0]), stress: clean(pair[1]),
      diagnostic: Object.fromEntries(diagnostic.map((d, i) => [i ? 'stress' : 'normal', describe(d.trades.filter(t => t.day >= w.start && t.day < w.end))])) });
    privateRuns.push({ scenario: scenario.id, window: w, normal: pair[0], stress: pair[1] });
  }
  const complete = windows.filter(w => w.complete); assert.equal(complete.length, 5);
  const normal = metrics(diagnostic[0].trades), stress = metrics(diagnostic[1].trades);
  const checks = [
    { id: 'count', label: 'Au moins 40 trades de diagnostic', pass: normal.count >= 40 },
    { id: 'windowCount', label: 'Au moins 12 trades dans chacune des cinq fenêtres complètes', pass: complete.every(w => w.diagnostic.normal.metrics.count >= 12) },
    { id: 'positive', label: 'Chaque fenêtre complète positive en R', pass: complete.every(w => w.diagnostic.normal.metrics.total > 0) },
    { id: 'pf', label: 'Profit factor en R au moins 1,10 avant arrondi', pass: normal.pf !== null && normal.pf >= 1.1 },
    { id: 'dd', label: 'Drawdown réalisé au plus 8 R', pass: normal.dd <= 8 },
    { id: 'stress', label: 'Total en R positif avec coûts doublés', pass: stress.total > 0 },
    { id: 'account', label: 'Aucun breach dans les évaluations simulées aux deux coûts', pass: complete.every(w => ![w.normal.status, w.stress.status].includes('breached')) }
  ];
  results.push({ ...scenario, diagnostic: { normal: clean(diagnostic[0]), stress: clean(diagnostic[1]) }, windows, checks, researchPassed: checks.every(c => c.pass), confirmed: false });
  privateRuns.push({ scenario: scenario.id, diagnostic });
}
const effects = ['normal', 'stress'].map(cost => {
  const a = results[0].diagnostic[cost], b = results[1].diagnostic[cost];
  return { cost, netDollars: b.net - a.net, grossDollars: b.grossDollars - a.grossDollars, feesDollars: b.feesDollars - a.feesDollars, trades: b.trades - a.trades };
});
const decisions = [...filterDecisions.values()];
const filterSummary = { considered: decisions.length, accepted: decisions.filter(d => d.accepted).length,
  priceSide: decisions.filter(d => d.reason === 'priceSide').length, unavailable: decisions.filter(d => d.reason === 'unavailable').length };
assert.equal(filterSummary.considered, filterSummary.accepted + filterSummary.priceSide + filterSummary.unavailable);
audit.passed = true;
const report = { schema: 'jeu18-report-v1', protocol: policy.version, generatedAt: new Date().toISOString(), freezeSha256: hash(freezeText), protocolSha256: freeze.files['trading/lab/JEU18_PROTOCOL.md'], source, policy, riskPolicy,
  coverage: { expectedSessions, scoredSessions: eligible.length, first: eligible[0].date, last: eligible.at(-1).date, unavailable: unavailable.length, completeWindows: 5, blockedWindows: 3 }, results, effects, filterSummary, audit,
  readiness: [{ id: 'independent', label: 'Confirmation sur données indépendantes', ready: false }, { id: 'feed', label: 'Flux actuel autorisé', ready: false }, { id: 'paper', label: 'Exécution Paper Trading testée', ready: false }], confirmed: false };
const serialize = v => JSON.stringify(v, (_, x) => x === Infinity ? 'Infinity' : x, 2) + '\n';
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'report.json'), serialize(report));
await writeFile(resolve(outDir, 'runs-private.json'), serialize({ schema: 'jeu18-private-v1', freezeSha256: report.freezeSha256, source, filterDecisions: [...filterDecisions], runs: privateRuns }));
console.log(serialize({ coverage: report.coverage, results: results.map(r => ({ id: r.id, normal: { trades: r.diagnostic.normal.trades, net: r.diagnostic.normal.net }, stress: { trades: r.diagnostic.stress.trades, net: r.diagnostic.stress.net }, checks: r.checks })), effects, audit }));
