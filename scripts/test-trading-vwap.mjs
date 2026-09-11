import test from 'node:test';
import assert from 'node:assert/strict';
import { sessionVwapContexts, filterVwapSignals, simulateVwap } from '../trading/lab/jeu18-engine.mjs';
import { JEU18_SCENARIOS as S } from '../trading/lab/jeu18-policy.mjs';
import { simulateAblation } from '../trading/lab/jeu17-engine.mjs';
import { JEU17_SCENARIOS } from '../trading/lab/jeu17-policy.mjs';
const day = '2026-03-06', start = Date.parse(day + 'T14:30:00Z') / 1000;
function bar(i, price = 100, volume = 1) {
  return { time: start + i * 300, day, minute: 570 + i * 5, closeMinute: 960, ticker: 'MNQH6', open: price, high: price, low: price, close: price, volume };
}
const last = xs => [...sessionVwapContexts(xs).values()].at(-1);
const signal = (i, side = 'Long') => ({ day, side, signalOpen: start + i * 300, signalClose: start + (i + 1) * 300, trendClosedAt: start + 1800, atr: 16 });
test('VWAP weights closed HLC3 bars by volume and preserves exact price equality', () => {
  const a = { ...bar(0, 10), high: 12, low: 8 }, b = { ...bar(1, 20, 3), high: 22, low: 18 };
  assert.equal(last([a, b]).vwap, 17.5); assert.equal(last([a, b]).comparison, 1);
  assert.equal(last([bar(0), bar(1, 100, 1000)]).comparison, 0);
  assert.equal(last([{ ...bar(0, 10), high: 12 }]).vwap, 32 / 3);
});
test('Long/Short filters use the signal close and reject equality', () => {
  for (const [price, side, expected] of [[110, 'Long', true], [110, 'Short', false], [90, 'Short', true], [90, 'Long', false], [100, 'Long', false]]) {
    const s = signal(1, side), r = filterVwapSignals([bar(0), bar(1, price)], new Map([[s.signalClose, s]]));
    assert.equal(r.signals.has(s.signalClose), expected);
    assert.equal(r.decisions.get(s.signalClose).reason, expected ? 'accepted' : 'priceSide');
  }
});
test('cash-day/DST reset and early close never carry another session or contract', () => {
  const afterDst = { ...bar(0, 200), day: '2026-03-09', time: Date.parse('2026-03-09T13:30:00Z') / 1000, closeMinute: 780 };
  assert.equal(last([bar(0), bar(1), afterDst]).vwap, 200);
  assert.equal(last([bar(0), { ...bar(1, 200), ticker: 'MNQM6' }]).available, false);
  assert.equal(last([bar(1), bar(2)]).available, false);
  assert.equal(last([bar(0), bar(2), bar(3)]).available, false);
  assert.equal(last([bar(0), bar(2), afterDst]).available, true);
});
test('missing/invalid volume, malformed OHLC, duplicates and unsafe precision fail closed', () => {
  assert.equal(last([bar(0, 100, 0)]).available, false);
  assert.equal(last([bar(0), bar(1, 200, 0)]).vwap, 100);
  for (const volume of [-1, 1.5, NaN, undefined]) assert.throws(() => sessionVwapContexts([{ ...bar(0), volume }]), /Invalid/);
  assert.throws(() => sessionVwapContexts([bar(0), bar(0)]), /Invalid/);
  assert.throws(() => sessionVwapContexts([{ ...bar(0), high: 99 }]), /Invalid/);
  assert.throws(() => sessionVwapContexts([bar(0, 100, Number.MAX_SAFE_INTEGER)]), /precision/);
});
test('future prices and volumes never change past VWAP contexts or decisions', () => {
  const xs = Array.from({ length: 20 }, (_, i) => bar(i, 100 + i, i + 1));
  const signals = new Map(xs.slice(0, -1).map((_, i) => { const s = signal(i); return [s.signalClose, s]; }));
  const full = filterVwapSignals(xs, signals);
  for (let n = 1; n <= xs.length; n++) {
    const prefix = filterVwapSignals(xs.slice(0, n), new Map([...signals].filter(([t]) => t <= xs[n - 1].time + 300)));
    assert.deepEqual([...prefix.contexts], [...full.contexts].filter(([t]) => t <= xs[n - 1].time + 300));
    assert.deepEqual([...prefix.signals], [...full.signals].filter(([t]) => t <= xs[n - 1].time + 300));
  }
  assert.throws(() => filterVwapSignals(xs, new Map([[start + 300, { ...signal(0), signalClose: start + 600 }]])), /Invalid/);
});
function fixture() {
  const xs = Array.from({ length: 78 }, (_, i) => bar(i, i < 10 ? 104 : i < 12 ? 100 : 105));
  const signals = new Map([10, 12].map(i => { const s = signal(i); return [s.signalClose, s]; }));
  return { xs, signals, bounds: { start: day, end: '2026-03-07' } };
}
test('reference is unchanged; candidate gate cannot be bypassed and replays later admissions', () => {
  const f = fixture();
  for (const cost of [1, 2]) for (const account of [false, true]) {
    const old = simulateAblation(f.xs, f.signals, JEU17_SCENARIOS[1], f.bounds, cost, account);
    assert.deepEqual(simulateVwap(f.xs, f.signals, S[0], f.bounds, cost, account), old);
    const newRun = simulateVwap(f.xs, f.signals, S[1], f.bounds, cost, account);
    assert.equal(old.trades[0].entryTime, start + 3300);
    assert.equal(newRun.trades[0].entryTime, start + 3900);
    assert.ok(newRun.trades.every(t => t.riskDollars + t.costDollars <= 50));
  }
  assert.throws(() => simulateVwap(f.xs, f.signals, { ...S[1], filter: 'none' }, f.bounds), /Invalid/);
});
test('entry-bar extremes never determine the VWAP admission or stop', () => {
  const f = fixture(), before = simulateVwap(f.xs, f.signals, S[1], f.bounds);
  const bars = f.xs.map(x => ({ ...x })); Object.assign(bars[13], { high: 200, low: 1 });
  const after = simulateVwap(bars, f.signals, S[1], f.bounds);
  assert.equal(after.trades[0].entryTime, before.trades[0].entryTime);
  assert.equal(after.trades[0].entry, before.trades[0].entry);
  assert.equal(after.trades[0].stop, before.trades[0].stop);
  assert.equal(after.trades[0].reason, 'Stop'); assert.equal(after.trades[0].ambiguous, true);
});
