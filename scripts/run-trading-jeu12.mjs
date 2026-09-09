import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readSixMonths } from '../trading/lab/six-months-source.mjs';
import { JEU12_SOURCE as source } from '../trading/lab/jeu12-source.mjs';
import { JEU12_CONFIGS as configs } from '../trading/lab/jeu12-policy.mjs';
import { inspectJeu12, runTimeframeGrid, signalsFor, simulateFive } from '../trading/lab/jeu12-engine.mjs';
const [dir, referencePath, family = 'cross'] = process.argv.slice(2), root = fileURLToPath(new URL('../', import.meta.url));
if (!['cross', 'pullback'].includes(family)) throw new Error('Use cross or pullback.');
const suffix = family === 'cross' ? '' : '-pullback';
if (!dir || !referencePath || !relative(root, resolve(dir)).startsWith('../')) throw new Error('Private directory and pinned reference required.');
const text = await readFile(resolve(dir, 'dataset.json'), 'utf8');
assert.equal(Buffer.byteLength(text), source.bytes);
assert.equal(createHash('sha256').update(text).digest('hex'), source.sha256);
const reference = await readSixMonths(await readFile(referencePath, 'utf8'));
const groups = inspectJeu12(JSON.parse(text), reference), result = runTimeframeGrid(groups, family);
const serialize = (value, space) => JSON.stringify(value, (_, v) => v === Infinity ? 'Infinity' : v, space);
// Keep the complete first result before diagnostic output. It is never used to
// modify the frozen grid or ranking, and the reserved month is not read here.
await writeFile(resolve(dir, `result-private${suffix}.json`), serialize(result));
let signalPrefixes = 0, sessionComparisons = 0, auditedTrades = 0;
for (const [index, g] of groups.entries()) {
  const lookup = new Map(g.candles.map(b => [b.time, b]));
  const fullSignals = Object.fromEntries([5, 15, 30].map(tf => [tf, signalsFor(g.candles, tf, family)]));
  for (let cut = 1; cut <= g.candles.length; cut++) {
    const last = g.candles[cut - 1]; if (last.minute !== last.closeMinute - 5) continue;
    const prefix = g.candles.slice(0, cut);
    const partialSignals = Object.fromEntries([5, 15, 30].map(tf => [tf, signalsFor(prefix, tf, family)]));
    for (const tf of [5, 15, 30]) {
      assert.deepEqual([...partialSignals[tf]], [...fullSignals[tf]].filter(([time]) => time <= last.time + 300));
      signalPrefixes++;
    }
    if (last.day < g.start) continue;
    for (const c of configs) for (const factor of [1, 2]) {
      const trades = result.results.find(r => r.id === c.id).windows[index][factor === 1 ? 'trades' : 'stressTrades'];
      assert.deepEqual(simulateFive(prefix, partialSignals[c.timeframe], c, g, factor), trades.filter(t => t.exitTime <= last.time), `${c.id}/${g.ticker}/${last.day}/${factor}`);
      sessionComparisons++;
    }
  }
  for (const config of configs) for (const factor of [1, 2]) {
    const trades = result.results.find(r => r.id === config.id).windows[index][factor === 1 ? 'trades' : 'stressTrades'];
    let day = '', count = 0, realized = 0, losses = 0, previousExit = -Infinity;
    for (const t of trades) {
      const bar = lookup.get(t.entryTime), exit = lookup.get(t.exitTime), signal = fullSignals[config.timeframe].get(t.entryTime);
      assert.ok(bar && exit && signal && bar.day === exit.day);
      assert.equal(t.entry, bar.open); assert.equal(t.signalClose, t.entryTime);
      assert.equal(t.signalClose - t.signalOpen, config.timeframe * 60);
      assert.ok(t.entryTime > previousExit && t.exitTime >= t.entryTime); previousExit = t.exitTime;
      assert.ok(bar.minute >= config.hours.start && bar.minute < config.hours.end && bar.minute < bar.closeMinute - 15);
      assert.ok(exit.minute <= exit.closeMinute - 15);
      assert.ok(config.side === 'Both' || config.side === t.side);
      if (bar.day !== day) { day = bar.day; count = 0; realized = 0; losses = 0; }
      assert.ok(count < 3 && realized > -2 && losses < 2);
      const sign = t.side === 'Long' ? 1 : -1, riskTicks = Math.ceil(signal.atr * 1.25 / .25 - 1e-9);
      assert.equal(t.risk, riskTicks * .25); assert.equal(t.stop, t.entry - sign * t.risk);
      assert.equal(t.target, t.entry + sign * Math.floor(riskTicks * 1.5 + 1e-9) * .25);
      for (const price of [t.entry, t.exit, t.stop, t.target]) assert.ok(Number.isFinite(price) && Math.abs(price / .25 - Math.round(price / .25)) < 1e-8);
      assert.equal(t.costDollars, factor * 3.5);
      const net = sign * (t.exit - t.entry) / t.risk - factor * 3.5 / (t.risk * 2);
      assert.ok(Math.abs(net - t.resultR) < 1e-12);
      count++; realized += net; losses = net < 0 ? losses + 1 : 0; auditedTrades++;
    }
  }
}
const report = { schema: family === 'cross' ? 'jeu12-report-v1' : 'jeu13-report-v1', protocol: result.protocol, generatedAt: new Date().toISOString(), dataset: source,
  paperEnabled: false, candidateId: result.candidateId, control: { evaluated: false, reason: result.candidateId ? 'Contrôle séparé à exécuter' : 'Aucune candidate ne satisfait la grille' },
  quality: groups.map(g => ({ ticker: g.ticker, start: g.start, end: g.end, ...g.quality })), audit: { passed: true, signalPrefixes, sessionComparisons, auditedTrades },
  results: result.results.map(r => ({ ...r, windows: r.windows.map(({ trades, stressTrades, ...w }) => w) })) };
await writeFile(resolve(dir, `report${suffix}.json`), serialize(report, 2) + '\n');
console.log(JSON.stringify({ candidate: result.candidateId, audit: report.audit, results: result.results.map(r => ({ id: r.id, trades: r.normal.count, net: r.normal.total, stress: r.stress.total, pf: r.normal.pf, dd: r.normal.dd, windows: r.windows.map(w => ({ trades: w.normal.count, net: w.normal.total })), failed: r.checks.filter(c => !c.pass).map(c => c.id) })) }));
