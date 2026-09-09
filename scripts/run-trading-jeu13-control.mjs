import { readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { JEU13_CONTROL_SOURCE as source } from '../trading/lab/jeu13-control-source.mjs';
import { JEU13_CONTROL_SEGMENTS as definitions, JEU13_CONTROL_DAYS as days, JEU13_SELECTED } from '../trading/lab/jeu13-control-policy.mjs';
import { JEU12_CONFIGS } from '../trading/lab/jeu12-policy.mjs';
import { inspectFiveGroup, simulateFive, signalsFor, chooseCandidate } from '../trading/lab/jeu12-engine.mjs';
import { metrics } from '../trading/lab/validation-engine.mjs';
const [dir, selectionPath] = process.argv.slice(2), root = fileURLToPath(new URL('../', import.meta.url));
if (!dir || !selectionPath || !relative(root, resolve(dir)).startsWith('../')) throw new Error('Private output and frozen selection required.');
const report = JSON.parse(await readFile(selectionPath, 'utf8'));
assert.equal(report.protocol, 'jeu13-v1'); assert.equal(report.candidateId, JEU13_SELECTED); assert.equal(chooseCandidate(report.results), JEU13_SELECTED); assert.equal(report.control.evaluated, false);
const text = await readFile(resolve(dir, 'dataset.json'), 'utf8');
assert.equal(Buffer.byteLength(text), source.bytes); assert.equal(createHash('sha256').update(text).digest('hex'), source.sha256);
const bundle = JSON.parse(text); assert.equal(bundle.schema, 'jeu13-control-v1'); assert.equal(bundle.segments.length, 2);
assert.deepEqual(bundle.calendar.map(s => s.date), days);
const config = JEU12_CONFIGS.find(c => c.id === JEU13_SELECTED), all = [[], []], quality = [];
let signalPrefixes = 0, sessionComparisons = 0;
for (const [i, d] of definitions.entries()) {
  const selectedDays = days.filter(day => day >= d.prep && day < d.end);
  const g = inspectFiveGroup(bundle.segments[i], d, bundle.calendar.filter(s => selectedDays.includes(s.date)), bundle.scheduleEvents.filter(s => selectedDays.includes(s.session_end_date)));
  quality.push({ ticker: d.ticker, ...g.quality });
  const signals = signalsFor(g.candles, 30, 'pullback');
  const trades = [1, 2].map(factor => simulateFive(g.candles, signals, config, d, factor));
  for (let cut = 1; cut <= g.candles.length; cut++) {
    const last = g.candles[cut - 1]; if (last.minute !== last.closeMinute - 5) continue;
    const prefix = g.candles.slice(0, cut), subset = signalsFor(prefix, 30, 'pullback');
    assert.deepEqual([...subset], [...signals].filter(([t]) => t <= last.time + 300)); signalPrefixes++;
    if (last.day < d.start) continue;
    for (const factor of [1, 2]) { assert.deepEqual(simulateFive(prefix, subset, config, d, factor), trades[factor - 1].filter(t => t.exitTime <= last.time)); sessionComparisons++; }
  }
  all[0].push(...trades[0]); all[1].push(...trades[1]);
}
const normal = metrics(all[0]), stress = metrics(all[1]);
const checks = [
  { label: 'Au moins 12 trades', pass: normal.count >= 12 },
  { label: 'Résultat net positif', pass: normal.total > 0 },
  { label: 'Résultat positif à coûts doublés', pass: stress.total > 0 },
  { label: 'Profit factor ≥ 1,10 avant arrondi', pass: normal.pf !== null && normal.pf >= 1.1 },
  { label: 'Drawdown réalisé ≤ 8 R', pass: normal.dd <= 8 }
];
report.control = { evaluated: true, candidateId: JEU13_SELECTED, start: '2025-06-01', end: '2025-07-01', scoredSessions: 20, source, amendment: 'JEU13_AVAILABILITY.md', initialMissingWarmupBars: 10, quality, normal, stress, checks, passed: checks.every(c => c.pass), audit: { passed: true, signalPrefixes, sessionComparisons } };
const serialize = (r, spaces) => JSON.stringify(r, (_, v) => v === Infinity ? 'Infinity' : v, spaces);
await writeFile(resolve(dir, 'trades-private.json'), serialize({ normal: all[0], stress: all[1] }));
await writeFile(resolve(dir, 'report-pullback-control.json'), serialize(report, 2) + '\n');
console.log(JSON.stringify(report.control));
