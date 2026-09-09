import test from 'node:test';
import assert from 'node:assert/strict';
import { admissionSignals } from '../trading/lab/jeu23-signals.mjs';
import { simulateAdmission } from '../trading/lab/jeu23-engine.mjs';
import { simulateReentry } from '../trading/lab/jeu27-engine.mjs';
import { JEU27_PRODUCTS, JEU27_SCENARIOS } from '../trading/lab/jeu27-policy.mjs';
import { JEU23_SCENARIOS } from '../trading/lab/jeu23-policy.mjs';
import { compareExecutions } from '../trading/lab/jeu23-comparison.mjs';
const product = JEU27_PRODUCTS[0], scenario = JEU27_SCENARIOS[0];
const period = { start: '2026-01-02', end: '2026-01-04' };
const baseline = JEU23_SCENARIOS.find(s => s.riskPerTrade === 150);
function fixture() {
  const time = Date.parse('2026-01-02T14:30:00Z') / 1000;
  const bars = Array.from({ length: 78 }, (_, i) => ({ time: time + i * 300,
    day: '2026-01-02', minute: 570 + i * 5, closeMinute: 960, ticker: 'MNQH6',
    open: 110, high: 120, low: 100, close: 110, volume: 100 }));
  Object.assign(bars[6], { open: 118, high: 131, low: 117, close: 130 });
  Object.assign(bars[7], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[8], { open: 131, high: 160, low: 130, close: 155 });
  Object.assign(bars[9], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[10], { open: 131, high: 134, low: 130, close: 133 });
  Object.assign(bars[11], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[12], { open: 131, high: 160, low: 130, close: 155 });
  Object.assign(bars[13], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[14], { open: 131, high: 134, low: 130, close: 133 });
  Object.assign(bars[15], { open: 130, high: 132, low: 119, close: 131 });
  Object.assign(bars[16], { open: 131, high: 160, low: 130, close: 155 });
  return bars;
}
const run = (bars, factor = 1, account = false, p = product, signals = admissionSignals(bars, p)) =>
  simulateReentry(bars, signals, scenario, p, period, factor, account);

test('a new setup after closing permits a second same-side trade and preserves the first fill', () => {
  const bars = fixture(), signals = admissionSignals(bars, product);
  const old = simulateAdmission(bars, signals, baseline, product, period, 1, false);
  const next = run(bars);
  assert.equal(old.trades.length, 1);
  assert.deepEqual(next.trades.map(t => t.entryTime), [bars[8].time, bars[12].time]);
  assert.deepEqual(next.trades.map(t => t.repeatedSide), [false, true]);
  assert.equal(compareExecutions(old, next).unchangedCount, 1);
  assert.equal(next.trades[1].previousSameSideExitClose, bars[9].time);
  assert.ok(next.denied.staleRepeat > 0);
});

test('the exact breakout-open boundary is admissible; a setup started one bar earlier is refused', () => {
  const bars = fixture(), source = admissionSignals(bars, product);
  for (const [breakoutAt, expected] of [[bars[10].time, 2], [bars[9].time, 1]]) {
    const signals = new Map([[bars[8].time, source.get(bars[8].time)],
      [bars[12].time, { ...source.get(bars[12].time), breakoutAt }]]);
    assert.equal(run(bars, 1, false, product, signals).trades.length, expected);
  }
});

test('same-side repeat is symmetric and the two-entry ceiling holds for every microcontract and cost', () => {
  for (const p of JEU27_PRODUCTS) for (const factor of [1, 2]) for (const mirror of [false, true]) {
    const scale = { MNQ: 3, MES: 1, MYM: 10, MGC: 0.5 }[p.symbol];
    const scaled = fixture().map(b => ({ ...b, open: b.open*scale, high: b.high*scale, low: b.low*scale, close: b.close*scale }));
    const bars = scaled.map(b => mirror ? { ...b, open: 220*scale-b.open, high: 220*scale-b.low, low: 220*scale-b.high, close: 220*scale-b.close } : b);
    const value = run(bars, factor, false, p);
    assert.equal(value.trades.length, 2, p.symbol);
    assert.ok(value.trades.every(t => t.side === (mirror ? 'Short' : 'Long')));
    assert.ok(value.trades.every(t => t.riskDollars + t.costDollars <= 150));
    assert.ok(value.days.every(d => d.trades <= 2));
    assert.deepEqual(value.trades.map(t => t.entryNumber), [1, 2]);
  }
});

test('a first loss does not loosen risk or force an opposite side; a second loss still ends entries', () => {
  const bars = fixture(); bars[8].low = 118; bars[12].low = 118;
  const value = run(bars);
  assert.equal(value.trades.length, 2);
  assert.ok(value.trades.every(t => t.reason === 'Stop' && t.ambiguous && t.netDollars < 0));
  assert.equal(value.trades[0].riskDollars, value.trades[1].riskDollars);
  assert.equal(value.trades[0].stop, value.trades[1].stop);
});

test('refusing a wide first stop does not consume a trade or allow an invalid risk profile', () => {
  const bars = fixture(); bars[7].low = 40;
  const value = run(bars);
  assert.ok(value.denied.tradeRisk > 0);
  assert.ok(value.trades[0].entryTime > bars[8].time);
  assert.equal(value.trades[0].repeatedSide, false);
  assert.equal(value.trades[0].entryNumber, 1);
  assert.throws(() => simulateReentry(bars, admissionSignals(bars, product), { ...scenario, riskPerTrade: 1000 }, product, period), /Invalid risk profile/);
  assert.throws(() => simulateReentry(bars, admissionSignals(bars, product), { ...scenario, dailyLoss: 1000 }, product, period), /Invalid risk profile/);
});

test('an adverse opening gap uses its observed price and daily budget blocks another entry', () => {
  const bars = fixture(); Object.assign(bars[8], { high: 134, low: 130, close: 133 });
  Object.assign(bars[9], { open: 1, high: 132, low: 1, close: 131 });
  const value = run(bars);
  assert.equal(value.trades[0].exit, 1);
  assert.ok(value.trades[0].netDollars < -150);
  assert.equal(value.trades.length, 1);
});

test('daily repeat state resets and account prefixes reproduce completed sessions', () => {
  const first = fixture(), second = first.map(b => ({ ...b, time: b.time+86400, day: '2026-01-03' }));
  const all = run([...first, ...second], 1, true), prefix = run(first, 1, true);
  assert.equal(all.trades.length, 4);
  assert.deepEqual(all.trades.map(t => t.repeatedSide), [false, true, false, true]);
  assert.deepEqual(prefix.trades, all.trades.filter(t => t.day === '2026-01-02'));
  assert.deepEqual(prefix.days, all.days.slice(0, 1));
});

test('signal prefixes and changed future extremes never alter earlier decisions', () => {
  const bars = fixture(), signals = admissionSignals(bars, product);
  for (let cut = 1; cut <= bars.length; cut++) {
    assert.deepEqual([...admissionSignals(bars.slice(0, cut), product)], [...signals].filter(([t]) => t <= bars[cut-1].time + 300));
  }
  const modified = bars.map((b, i) => i < 13 ? b : { ...b, high: b.high+100, low: 1 });
  assert.deepEqual(run(modified).trades, run(bars).trades);
  assert.ok([...signals.values()].every(s => s.signalClose <= bars[0].time + (720-570)*60));
});
