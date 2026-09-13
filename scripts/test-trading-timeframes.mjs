import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateFive, signalsFor, simulateFive, chooseCandidate } from '../trading/lab/jeu12-engine.mjs';
import { JEU12_CONFIGS as configs } from '../trading/lab/jeu12-policy.mjs';
const start = Date.parse('2026-01-02T14:30:00Z') / 1000;
const definition = { ticker: 'FIXTURE', start: '2026-01-02', end: '2026-01-03' };
const full = configs.find(c => c.id === '5-full-both');
function bars(closeMinute = 960) {
  return Array.from({ length: (closeMinute - 570) / 5 }, (_, i) => ({ time: start + i * 300, day: '2026-01-02', minute: 570 + i * 5, closeMinute, open: 100, high: 100, low: 100, close: 100, volume: i + 1 }));
}
function signalMap(indices, input, side = 'Long', atr = 1.6) {
  return new Map(indices.map(i => [input[i].time, { side, day: input[i].day, atr, signalOpen: input[i].time - 300, signalClose: input[i].time }]));
}
test('timeframe aggregation stays session-anchored and rejects partial or missing 5-minute bars', () => {
  const b = bars(), a = aggregateFive(b, 30);
  assert.equal(a.length, 13); assert.equal(a[0].minute, 570); assert.equal(a[0].closedAt, start + 1800); assert.equal(a[0].volume, 21);
  assert.equal(aggregateFive(bars(780), 30).length, 7);
  assert.throws(() => aggregateFive(b.slice(1), 15), /unaligned/);
  assert.throws(() => aggregateFive([...b.slice(0, 4), ...b.slice(5)], 30), /Incomplete/);
  assert.throws(() => aggregateFive(b.slice(0, -1), 30), /Incomplete/);
});
test('signals close before their execution time and never change when later candles change', () => {
  const b = bars().map((x, i) => ({ ...x, close: 100 + Math.sin(i / 5) * 3, high: 105, low: 95 }));
  for (const tf of [5, 15, 30]) {
    const original = signalsFor(b, tf), changed = structuredClone(b), cutoff = b[36].time;
    for (let i = 36; i < changed.length; i++) changed[i].close += 1000;
    assert.deepEqual([...signalsFor(changed, tf)].filter(([t]) => t <= cutoff), [...original].filter(([t]) => t <= cutoff));
    for (const [t, s] of original) { assert.equal(t, s.signalOpen + tf * 60); assert.equal(t, s.signalClose); }
  }
});
test('all timeframes use next-open 5-minute fills and stop-first ambiguity for both sides', () => {
  for (const side of ['Long', 'Short']) {
    const b = bars(); b[1].high = 104; b[1].low = 96;
    const trades = simulateFive(b, signalMap([1], b, side), full, definition);
    assert.equal(trades.length, 1); assert.equal(trades[0].entryTime, b[1].time); assert.equal(trades[0].entry, 100);
    assert.equal(trades[0].reason, 'Stop prioritaire'); assert.equal(trades[0].exit, side === 'Long' ? 98 : 102);
    assert.equal(trades[0].resultR, -1.875);
  }
});
test('entry hours are end-exclusive, independent of hold duration, and closing-bar extremes stay unseen', () => {
  let b = bars(); const morning = configs.find(c => c.id === '5-morning-both'), afternoon = configs.find(c => c.id === '5-afternoon-both');
  assert.equal(simulateFive(b, signalMap([30], b), morning, definition).length, 0); // 12:00
  assert.equal(simulateFive(b, signalMap([41], b), afternoon, definition).length, 0); // 12:55
  assert.equal(simulateFive(b, signalMap([42], b), afternoon, definition).length, 1); // 13:00
  b[75].high = 10000; b[75].low = .25;
  const t = simulateFive(b, signalMap([29], b), morning, definition)[0];
  assert.equal(t.entryTime, b[29].time); assert.equal(t.exitTime, b[75].time); assert.equal(t.exit, 100);
  assert.equal(simulateFive(b, signalMap([75], b), full, definition).length, 0);
  b = bars(780); const early = simulateFive(b, signalMap([1], b), full, definition)[0];
  assert.equal(early.exitTime, b[39].time); // 12:45
});
test('double costs resimulate loss brakes and do not only adjust a fixed trade list', () => {
  const b = bars(); for (const i of [1, 3, 5, 7]) b[i].high = 103;
  const signals = signalMap([1, 3, 5, 7], b);
  const normal = simulateFive(b, signals, full, definition, 1), stress = simulateFive(b, signals, full, definition, 2);
  assert.equal(normal.length, 3); assert.equal(stress.length, 2);
  assert.ok(normal.every(t => t.resultR === .625)); assert.ok(stress.every(t => t.resultR === -.25));
});
test('an overnight or preparation signal and a disallowed side cannot enter', () => {
  const b = bars(), signals = signalMap([1], b); signals.get(b[1].time).day = '2026-01-01';
  assert.equal(simulateFive(b, signals, full, definition).length, 0);
  assert.equal(simulateFive(b, signalMap([1], b, 'Short'), configs.find(c => c.id === '5-full-long'), definition).length, 0);
  assert.equal(simulateFive(b, signalMap([0], b), full, definition).length, 0);
});
test('selection follows the frozen worst-window expectancy, drawdown and grid order', () => {
  const make = (i, exp, dd, pass = true) => ({ id: configs[i].id, windows: exp.map(e => ({ normal: { exp: e } })), normal: { dd }, checks: [{ pass }] });
  const weak = make(0, [2, .1, 1], 1), robust = make(1, [.2, .3, .4], 2), lowerDD = make(2, [.2, .3, .4], 1), failed = make(3, [10, 10, 10], 0, false);
  assert.equal(chooseCandidate([weak, robust, lowerDD, failed]), lowerDD.id);
  assert.equal(chooseCandidate([failed]), null);
  assert.equal(chooseCandidate([make(4, [.2], 1), make(0, [.2], 1)]), configs[0].id);
});
test('pullback is an explicit separate family, causal and symmetric, preserving default crossover', () => {
  const input = bars().map((b, i) => ({ ...b, open: 100 + i - .5, close: 100 + i, high: 101 + i, low: 95 + i }));
  const up = signalsFor(input, 5, 'pullback');
  assert.ok(up.size > 0); assert.ok([...up.values()].every(s => s.side === 'Long'));
  const down = input.map(b => ({ ...b, open: 300 - b.open, close: 300 - b.close, high: 300 - b.low, low: 300 - b.high }));
  const shorts = signalsFor(down, 5, 'pullback');
  assert.equal(shorts.size, up.size); assert.ok([...shorts.values()].every(s => s.side === 'Short'));
  assert.deepEqual(signalsFor(input, 5), signalsFor(input, 5, 'cross'));
  assert.equal(signalsFor(input.map(b => ({ ...b, low: b.close })), 5, 'pullback').size, 0);
  assert.equal(signalsFor(input.map(b => ({ ...b, open: b.close })), 5, 'pullback').size, 0);
  const changed = structuredClone(input); for (let i = 50; i < changed.length; i++) changed[i].close *= 3;
  assert.deepEqual([...signalsFor(changed, 5, 'pullback')].filter(([t]) => t <= input[50].time), [...up].filter(([t]) => t <= input[50].time));
});
