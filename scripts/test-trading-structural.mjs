import test from 'node:test';
import assert from 'node:assert/strict';
import { pivotContexts, structuralTerms, simulateStructural } from '../trading/lab/jeu16-engine.mjs';
import { simulateLucid } from '../trading/lab/jeu15-engine.mjs';
import { JEU16_SCENARIOS as S, JEU16_POLICY as P } from '../trading/lab/jeu16-policy.mjs';
const day = '2026-01-02', start = Date.parse(day + 'T14:30:00Z') / 1000;
function bars(lows, highs = lows.map(n => n + 10)) {
  return lows.map((low, i) => ({ time: start + i * 300, day, minute: 570 + i * 5, closeMinute: 960, ticker: 'MNQH6', open: low + 5, close: low + 5, low, high: highs[i], volume: 1 }));
}
const context = xs => [...pivotContexts(xs).values()].at(-1);
test('a strict pivot is unavailable until both right bars close, for Long and Short', () => {
  const b = bars([95, 94, 90, 92, 93], [105, 106, 110, 108, 107]);
  assert.equal(context(b.slice(0, 4)).low, null);
  assert.equal(context(b).low.price, 90); assert.equal(context(b).high.price, 110);
  assert.equal(context(b).low.confirmedAt, b[4].time + 300);
  b[3].low = 90; assert.equal(context(b).low, null);
});
test('touch invalidates a pivot without falling back to an older one', () => {
  const b = bars([96, 94, 90, 93, 94, 95, 93, 91, 94, 95, 91]);
  assert.equal(context(b.slice(0, 10)).low.price, 91);
  assert.equal(context(b).low, null);
});
test('day, contract and missing-bar boundaries cannot create or carry pivots', () => {
  const b = bars([95, 94, 90, 92, 93, 96]);
  for (const change of [{ day: '2026-01-03' }, { time: b[5].time + 300 }, { ticker: 'MNQM6' }]) {
    assert.equal(context([...b.slice(0, 5), { ...b[5], ...change }]).low, null);
  }
  assert.throws(() => pivotContexts([b[1], b[0]]), /Nonchronological/);
});
test('adding future candles never changes a previous pivot context', () => {
  const b = bars([95, 94, 90, 92, 93, 96, 91, 89, 92, 94, 88]);
  const all = pivotContexts(b);
  for (let i = 1; i <= b.length; i++) assert.deepEqual([...pivotContexts(b.slice(0, i))], [...all].filter(([t]) => t <= b[i - 1].time + 300));
});
function signal(side = 'Long', price = 80.25) {
  return { side, day, atr: 16, signalOpen: start + 2700, signalClose: start + 3000,
    pivot: { kind: side === 'Long' ? 'low' : 'high', price, time: start + 900, confirmedAt: start + 1800, day } };
}
test('structural stops stay one tick outside the pivot, with mirrored targets and a net margin', () => {
  const a = structuralTerms(signal(), 100, start + 3000);
  const b = structuralTerms(signal('Short', 119.75), 100, start + 3000);
  assert.deepEqual(a, b); assert.equal(a.terms.risk, 20); assert.equal(a.terms.targetDistance, 30);
  assert.ok(a.expectedNetRR >= 1); assert.equal(a.terms.costDollars, 3.5);
  const c = structuralTerms(signal('Long', 91), 100, start + 3000);
  assert.equal(c.terms.targetDistance, 13.75);
  assert.equal(structuralTerms(signal('Long', 91), 100, start + 3000, 2).blocked, 'netReward');
});
test('no pivot, an opening gap through it and future confirmation cannot become valid entries', () => {
  assert.equal(structuralTerms({ ...signal(), pivot: null }, 100, start + 3000).blocked, 'missingPivot');
  assert.equal(structuralTerms(signal(), 80.25, start + 3000).blocked, 'invalidPivot');
  const s = signal(); s.pivot.time += 1500; s.pivot.confirmedAt += 1500;
  assert.throws(() => structuralTerms(s, 100, start + 3000), /Noncausal/);
  assert.throws(() => structuralTerms(signal(), 100.1, start + 3000), /Invalid/);
});
function fixture(closeMinute = 960) {
  const b = bars(Array((closeMinute - 570) / 5).fill(95));
  for (const x of b) Object.assign(x, { open: 100, close: 100, high: 100, low: 100, closeMinute });
  return { b, s: new Map([[start + 3000, signal()]]), bounds: { start: day, end: '2026-01-03' } };
}
test('the ATR control reproduces the unchanged Jeu 15 replay', () => {
  const { b, s, bounds } = fixture(); b[12].high = 150;
  for (const factor of [1, 2]) for (const account of [false, true]) {
    const a = simulateLucid(b, s, { guarded: true }, bounds, factor, account);
    const r = simulateStructural(b, s, S[0], bounds, factor, account);
    assert.deepEqual(r.trades, a.trades); assert.deepEqual(r.days, a.days); assert.equal(r.status, a.status);
  }
});
test('changing entry-bar high/low changes only fills, never the structural entry or stop', () => {
  const { b, s, bounds } = fixture(); const a = simulateStructural(b, s, S[1], bounds);
  b[10].high = 200; b[10].low = 1;
  const r = simulateStructural(b, s, S[1], bounds);
  assert.equal(r.trades[0].entry, a.trades[0].entry); assert.equal(r.trades[0].stop, 80);
  assert.equal(r.trades[0].reason, 'Stop'); assert.equal(r.trades[0].ambiguous, true);
});
test('risk refusal does not tighten a structural stop or invent fractional MNQ', () => {
  const { b, s, bounds } = fixture(); s.set(start + 3000, signal('Long', 60.25));
  const r = simulateStructural(b, s, S[1], bounds); assert.equal(r.trades.length, 0); assert.equal(r.denied.tradeRisk, 1);
  s.set(start + 3000, { ...signal(), pivot: null }); assert.equal(simulateStructural(b, s, S[1], bounds).denied.missingPivot, 1);
});
test('two losses stop the day; a gap can exceed the nominal risk and early close stays flat', () => {
  const { b, s, bounds } = fixture(); b[11].low = 79; b[21].low = 79;
  for (const i of [20, 30]) s.set(b[i].time, { ...signal(), signalClose: b[i].time, signalOpen: b[i - 1].time });
  const r = simulateStructural(b, s, S[1], bounds); assert.equal(r.trades.length, 2); assert.equal(r.net, -87);
  b[11].open = 40; b[11].low = 40;
  assert.ok(simulateStructural(b, s, S[1], bounds).trades[0].netDollars < -100);
  const early = fixture(780), e = simulateStructural(early.b, early.s, S[1], bounds);
  assert.equal(e.trades[0].exitTime, early.b[39].time); assert.equal(e.trades[0].reason, 'Session close');
  assert.equal(P.confirmed, false); assert.equal(P.brokerEnabled, false);
});
