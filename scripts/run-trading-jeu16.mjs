import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { inspectHistory } from '../trading/lab/jeu14-history.mjs';
import { JEU14_SOURCE as source } from '../trading/lab/jeu14-source.mjs';
import { JEU14_WINDOWS, historyCalendar } from '../trading/lab/jeu14-policy.mjs';
import { lucidSignals, simulateLucid, entryGate, floorAtClose } from '../trading/lab/jeu15-engine.mjs';
import { JEU15_POLICY as riskPolicy } from '../trading/lab/jeu15-policy.mjs';
import { pivotContexts, structuralSignals, structuralTerms, simulateStructural } from '../trading/lab/jeu16-engine.mjs';
import { JEU16_POLICY as policy, JEU16_SCENARIOS as scenarios } from '../trading/lab/jeu16-policy.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
const [sourceDir, priorDir, outDir] = process.argv.slice(2), root = fileURLToPath(new URL('../', import.meta.url));
if (![sourceDir, priorDir, outDir].every(d => d && relative(root, resolve(d)).startsWith('../'))) throw new Error('Private paths required');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const freezeText = await readFile(resolve(root, 'trading/lab/jeu16-freeze.json'), 'utf8'), freeze = JSON.parse(freezeText);
for (const [path, expected] of Object.entries(freeze.files)) assert.equal(hash(await readFile(resolve(root, path))), expected, `Frozen dependency changed: ${path}`);
const raw = await readFile(resolve(sourceDir, 'dataset.json'));
assert.equal(raw.length, source.bytes); assert.equal(hash(raw), source.sha256);
const oldRaw = await readFile(resolve(priorDir, 'runs-archive.json'));
assert.equal(hash(oldRaw), '174c0704d2b1c1372f7cddbf3fd7bbe95f56928b96411b0b8211aa0feb041593');
const oldRuns = JSON.parse(oldRaw).runs;
const { groups, eligible, expectedSessions, unavailable } = inspectHistory(JSON.parse(raw));
assert.equal(eligible.length, 330);
const allBars = new Map(), candles = [], maps = { atr: new Map(), pivot: new Map() };
const audit = { dependencies: Object.keys(freeze.files).length, signalPrefixes: 0, pivotPrefixes: 0, accountPrefixes: 0, trades: 0, structuralPivots: 0, legacyTrades: 0, passed: false };
for (const g of groups) {
  const plain = lucidSignals(g.candles, 'entry5trend30'), structural = structuralSignals(g.candles), contexts = pivotContexts(g.candles);
  assert.equal(plain.size, structural.size);
  for (const [t, s] of structural) { const { pivot, ...base } = s; assert.deepEqual(base, plain.get(t)); }
  for (const b of g.candles) {
    const key = `${g.ticker}/${b.time}`;
    if (allBars.has(key)) assert.deepEqual(allBars.get(key), b); else allBars.set(key, b);
    if (b.day >= g.start && b.day < g.end) candles.push({ ...b, ticker: g.ticker });
  }
  for (let cut = 6; cut <= g.candles.length; cut += 6) {
    const last = g.candles[cut - 1]; if (last.minute !== last.closeMinute - 5) continue;
    const prefix = g.candles.slice(0, cut);
    assert.deepEqual([...structuralSignals(prefix)], [...structural].filter(([t]) => t <= last.time + 300)); audit.signalPrefixes++;
    assert.deepEqual([...pivotContexts(prefix)], [...contexts].filter(([t]) => t <= last.time + 300)); audit.pivotPrefixes++;
  }
  for (const [mode, set] of [['atr', plain], ['pivot', structural]]) for (const [t, s] of set) if (s.day >= g.start && s.day < g.end) {
    assert.ok(!maps[mode].has(t)); maps[mode].set(t, s);
  }
}
candles.sort((a, b) => a.time - b.time);
assert.equal(new Set(candles.map(b => b.time)).size, candles.length);
assert.equal(new Set(candles.map(b => b.day)).size, eligible.length);
function auditPivot(t) {
  const p = t.pivot, sign = t.side === 'Long' ? 1 : -1;
  assert.ok(p && p.confirmedAt <= t.signalClose); assert.equal(p.confirmedAt, p.time + 900);
  const block = [-2, -1, 0, 1, 2].map(i => allBars.get(`${t.ticker}/${p.time + i * 300}`));
  assert.ok(block.every(b => b?.day === t.day));
  const field = sign === 1 ? 'low' : 'high'; assert.equal(block[2][field], p.price);
  for (const b of block.filter((_, i) => i !== 2)) assert.ok(sign * (b[field] - p.price) > 0);
  for (let time = p.confirmedAt; time < t.entryTime; time += 300) {
    const b = allBars.get(`${t.ticker}/${time}`); assert.ok(b && sign * (b[field] - p.price) > 0);
  }
  assert.equal(t.stop, p.price - sign * .25); assert.ok(t.expectedNetRR >= 1);
  assert.ok(t.targetDistance * 2 - t.costDollars >= t.riskDollars + t.costDollars);
  audit.structuralPivots++;
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
      if (scenario.stopMode === 'pivot') { auditPivot(t); const x = structuralTerms({ ...t, pivot: t.pivot }, t.entry, t.entryTime, factor); assert.equal(x.terms.risk, t.risk); }
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
  const signals = maps[scenario.stopMode], diagnostic = [1, 2].map(f => simulateStructural(candles, signals, scenario, bounds, f, false));
  for (const [i, run] of diagnostic.entries()) auditRun(run, scenario, false, i + 1);
  if (scenario.stopMode === 'atr') {
    const old = oldRuns.find(x => x.scenario === 'entry5trend30' && x.diagnostic).diagnostic;
    for (let i = 0; i < 2; i++) { assert.deepEqual(diagnostic[i].trades, old[i].trades); assert.deepEqual(diagnostic[i].days, old[i].days); audit.legacyTrades += old[i].trades.length; }
  }
  const windows = [];
  for (const w of JEU14_WINDOWS) {
    const expected = historyCalendar(w.start, w.end).length, scored = eligible.filter(d => d.date >= w.start && d.date < w.end).length;
    if (expected !== scored) { windows.push({ start: w.start, end: w.end, complete: false, expected, scored, normal: null, stress: null }); continue; }
    const bars = candles.filter(b => b.day >= w.start && b.day < w.end), pair = [];
    for (const factor of [1, 2]) {
      const run = simulateStructural(bars, signals, scenario, w, factor, true); auditRun(run, scenario, true, factor);
      if (scenario.stopMode === 'atr') {
        const old = oldRuns.find(x => x.scenario === 'entry5trend30' && x.window?.start === w.start)[factor === 1 ? 'normal' : 'stress'];
        assert.deepEqual(run.trades, old.trades); assert.deepEqual(run.days, old.days); assert.equal(run.status, old.status); audit.legacyTrades += old.trades.length;
        assert.deepEqual(run.trades, simulateLucid(bars, signals, { guarded: true }, w, factor, true).trades);
      }
      for (let cut = 1; cut <= bars.length; cut++) {
        const last = bars[cut - 1]; if (last.minute !== last.closeMinute - 5) continue;
        const prefix = simulateStructural(bars.slice(0, cut), signals, scenario, w, factor, true);
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
audit.passed = true;
const report = { schema: 'jeu16-report-v1', protocol: policy.version, generatedAt: new Date().toISOString(), freezeSha256: hash(freezeText), protocolSha256: freeze.files['trading/lab/JEU16_PROTOCOL.md'], source, policy, riskPolicy,
  coverage: { expectedSessions, scoredSessions: eligible.length, first: eligible[0].date, last: eligible.at(-1).date, unavailable: unavailable.length, completeWindows: 5, blockedWindows: 3 }, results, audit,
  readiness: [{ id: 'independent', label: 'Confirmation sur données indépendantes', ready: false }, { id: 'feed', label: 'Flux actuel autorisé', ready: false }, { id: 'paper', label: 'Exécution Paper Trading testée', ready: false }], confirmed: false };
const serialize = v => JSON.stringify(v, (_, x) => x === Infinity ? 'Infinity' : x, 2) + '\n';
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, 'report.json'), serialize(report));
await writeFile(resolve(outDir, 'runs-private.json'), serialize({ schema: 'jeu16-private-v1', freezeSha256: report.freezeSha256, source, runs: privateRuns }));
console.log(serialize({ coverage: report.coverage, results: results.map(r => ({ id: r.id, diagnostic: r.diagnostic, accounts: r.windows.filter(w => w.complete).map(w => ({ start: w.start, normal: { status: w.normal.status, net: w.normal.net, trades: w.normal.trades }, stress: { status: w.stress.status, net: w.stress.net, trades: w.stress.trades } })), checks: r.checks })), audit }));
