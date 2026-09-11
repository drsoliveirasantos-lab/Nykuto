import test from 'node:test';
import assert from 'node:assert/strict';
import { ablationTerms, simulateAblation } from '../trading/lab/jeu17-engine.mjs';
import { simulateStructural } from '../trading/lab/jeu16-engine.mjs';
import { JEU17_SCENARIOS as S } from '../trading/lab/jeu17-policy.mjs';
import { JEU16_SCENARIOS as OLD } from '../trading/lab/jeu16-policy.mjs';
const day = '2026-01-02', start = Date.parse(day + 'T14:30:00Z') / 1000;
function signal(side = 'Long', risk = 20) {
  return { side, day, atr: risk / 1.25, signalOpen: start + 2700, signalClose: start + 3000,
    pivot: { kind: side === 'Long' ? 'low' : 'high', price: 100 - (side === 'Long' ? 1 : -1) * (risk - .25), time: start + 900, confirmedAt: start + 1800, day } };
}
function fixture() {
  return { bars: Array.from({ length: 78 }, (_, i) => ({ time: start + i * 300, day, minute: 570 + i * 5, closeMinute: 960, ticker: 'MNQH6', open: 100, close: 100, high: 100, low: 100, volume: 1 })),
    signals: new Map([[start + 3000, signal()]]), bounds: { start: day, end: '2026-01-03' } };
}
test('all four cells enforce the same net boundary in both directions, only when enabled', () => {
  for (const side of ['Long', 'Short']) for (const s of S) {
    const small = ablationTerms(signal(side, 2.5), 100, start + 3000, s);
    assert.equal(small.blocked, s.netMargin ? 'netReward' : undefined);
    const boundary = ablationTerms(signal(side, 7), 100, start + 3000, s);
    assert.ok(boundary.terms); assert.equal(boundary.terms.risk, 7);
    const stress = ablationTerms(signal(side, 7), 100, start + 3000, s, 2);
    assert.equal(stress.blocked, s.netMargin ? 'netReward' : undefined);
  }
});
test('the two old cells reproduce Jeu 16 fills, days, refusals and terminal status', () => {
  const f = fixture();
  for (const s of [S[0], S[3]]) for (const factor of [1, 2]) for (const account of [false, true]) {
    for (const prices of [{ high: 130, low: 100 }, { high: 140, low: 70 }, { open: 50, low: 50, high: 50 }]) {
      const bars = f.bars.map(b => ({ ...b })); Object.assign(bars[11], prices);
      const a = simulateAblation(bars, f.signals, s, f.bounds, factor, account);
      const b = simulateStructural(bars, f.signals, OLD.find(o => o.id === s.id), f.bounds, factor, account);
      assert.deepEqual(a, b);
    }
  }
});
test('a disabled margin never disables the risk budget, and invalid policy fails closed', () => {
  const f = fixture(); f.signals.set(start + 3000, signal('Long', 50));
  for (const s of S) {
    const a = simulateAblation(f.bars, f.signals, s, f.bounds);
    assert.equal(a.trades.length, 0); assert.equal(a.denied.tradeRisk, 1);
  }
  assert.throws(() => simulateAblation(f.bars, f.signals, { ...S[0], netMargin: true }, f.bounds), /Invalid/);
});
test('margin refusal fully replays later admissions instead of filtering finished trades', () => {
  const f = fixture(); f.signals.set(start + 3000, signal('Long', 2.5));
  f.signals.set(start + 3600, { ...signal(), signalOpen: start + 3300, signalClose: start + 3600 });
  for (const [plain, filtered] of [[S[0], S[1]], [S[2], S[3]]]) {
    const a = simulateAblation(f.bars, f.signals, plain, f.bounds);
    const b = simulateAblation(f.bars, f.signals, filtered, f.bounds);
    assert.equal(a.trades[0].entryTime, start + 3000);
    assert.equal(b.trades[0].entryTime, start + 3600);
    assert.equal(b.denied.netReward, 1);
  }
});
test('future pivots and touched opening pivots remain invalid without the margin filter', () => {
  const s = signal(); s.pivot.time += 1500; s.pivot.confirmedAt += 1500;
  assert.throws(() => ablationTerms(s, 100, start + 3000, S[2]), /Noncausal/);
  assert.equal(ablationTerms(signal(), 80.25, start + 3000, S[2]).blocked, 'invalidPivot');
});
test('entry-bar extremes change fills but never the admission, entry or stop of either new cell', () => {
  const f = fixture();
  for (const s of [S[1], S[2]]) {
    const before = simulateAblation(f.bars, f.signals, s, f.bounds);
    const bars = f.bars.map(b => ({ ...b })); Object.assign(bars[10], { high: 200, low: 1 });
    const after = simulateAblation(bars, f.signals, s, f.bounds);
    assert.equal(after.trades[0].entry, before.trades[0].entry);
    assert.equal(after.trades[0].stop, before.trades[0].stop);
    assert.equal(after.trades[0].reason, 'Stop'); assert.equal(after.trades[0].ambiguous, true);
  }
});
