import test from 'node:test';
import assert from 'node:assert/strict';
import { entryContext, pathBounds, statistics, summarizeMarket, compareCosts } from '../trading/lab/market-diagnostics.mjs';
const t = { symbol: 'MNQ', ticker: 'MNQU6', day: '2026-08-03', side: 'Long', entryTime: 600, exitTime: 900,
  entry: 100, exit: 99, risk: 1, riskDollars: 2, costDollars: 0.5, netDollars: -2.5, resultR: -1.25,
  targetDistance: 2, rangeHigh: 101, rangeLow: 98, breakoutAt: 300, reason: 'Stop', breakEvenAt: null, ambiguous: false };
const bar = (time, fields = {}) => ({ time, day: t.day, ticker: t.ticker, minute: 600 + time / 60,
  open: 100, high: 100.5, low: 99.5, close: 100, volume: 10, ...fields });
const context = { closedAt: 600, sourceTime: 300, day: t.day, ticker: t.ticker,
  emaReady: false, fast: 100, slow: 100, vwapSide: 0, rsi: null, volumeRatio: null, structure: null, patterns: [] };
test('entry diagnostics reject future candles and mismatched context; unavailable indicators stay unknown', () => {
  const v = entryContext(t, [bar(300)], context);
  assert.equal(v.checks.trend, null); assert.equal(v.checks.volume, null); assert.equal(v.checks.structure, null);
  assert.equal(v.checks.pattern, false);
  assert.throws(() => entryContext(t, [bar(300), bar(600)], context));
  assert.throws(() => entryContext(t, [bar(300)], { ...context, closedAt: 900 }));
  assert.throws(() => entryContext(t, [bar(300)], { ...context, ticker: 'MNQM6' }));
});
test('exit-bar highs bound MFE and do not invent a favorable move before a stop', () => {
  const p = pathBounds(t, [bar(600), bar(900, { high: 102, low: 99 })]);
  assert.equal(p.mfeLowerR, 0.5); assert.equal(p.mfeUpperR, 2); assert.equal(p.reachedOneR, 'unknown');
  assert.equal(p.closedMaxR, 0); assert.equal(p.maeLowerR, 1);
  assert.equal(p.heldMinutesLower, 5); assert.equal(p.heldMinutesUpper, 10);
  const certain = pathBounds(t, [bar(600, { high: 101.2, close: 101.1 }), bar(900, { open: 101.1, high: 102, low: 99 })]);
  assert.equal(certain.reachedOneR, 'confirmed'); assert.equal(certain.closedMaxR, 1.1);
});
test('opening gaps and short positions use the correct side and exclude later extremes', () => {
  const gap = { ...t, exitTime: 600, exit: 98, reason: 'Stop gap' };
  const p = pathBounds(gap, [bar(600, { open: 98, high: 110, low: 90 })]);
  assert.equal(p.mfeUpperR, 0); assert.equal(p.maeUpperR, 2); assert.equal(p.heldMinutesUpper, 0);
  const short = { ...t, side: 'Short', exit: 101 };
  const q = pathBounds(short, [bar(600, { low: 98.5 }), bar(900, { low: 95, high: 101 })]);
  assert.equal(q.mfeLowerR, 1.5); assert.equal(q.mfeUpperR, 5); assert.equal(q.reachedOneR, 'confirmed');
  assert.throws(() => pathBounds(t, [bar(600), bar(1200)]));
});
test('statistics distinguish zero, losses due to costs, currency and R expectancy, and duplicate observations', () => {
  const rows = [t, { ...t, entryTime: 1200, netDollars: 6, resultR: 1.5, riskDollars: 4 },
    { ...t, entryTime: 1800, netDollars: -0.5, resultR: -0.25 }, { ...t, entryTime: 2400, netDollars: 0, resultR: 0 }];
  const s = statistics(rows);
  assert.equal(s.count, 4); assert.equal(s.wins, 1); assert.equal(s.losses, 2); assert.equal(s.flat, 1);
  assert.equal(s.net, 3); assert.equal(s.gross, 5); assert.equal(s.feeTurnedLosses, 1);
  assert.equal(s.profitFactorUSD, 2); assert.equal(s.profitFactorR, 1); assert.equal(s.expectancyR, 0);
  assert.equal(s.netWithoutBestTrade, -3); assert.equal(s.netWithoutBestDay, 0);
  assert.equal(statistics([]).averageNet, null); assert.equal(statistics([]).winRate, null);
  assert.throws(() => statistics([t, t]), /Duplicate/);
});
test('cost attribution reconciles changed exits, extra costs and different admitted trades', () => {
  const normal = [t, { ...t, entryTime: 1200, netDollars: 6 }];
  const stress = [{ ...t, netDollars: -3, costDollars: 1 }, { ...t, entryTime: 1800, netDollars: 10 }];
  const x = compareCosts(normal, stress);
  assert.equal(x.matched, 1); assert.equal(x.matchedFeesEffect, -0.5); assert.equal(x.matchedGrossEffect, 0);
  assert.equal(x.removedNormalEffect, -6); assert.equal(x.addedStressEffect, 10); assert.equal(x.delta, 3.5);
  assert.throws(() => compareCosts([t, t], []));
});
test('winner/loser groups retain unknown confirmations and reconcile accepted and rejected signals', () => {
  const row = { ...t, context: entryContext(t, [bar(300)], context), path: pathBounds(t, [bar(600), bar(900, { low: 99 })]) };
  const x = summarizeMarket([row], [{ accepted: true }, { accepted: false, reason: 'occupied' }]);
  assert.equal(x.classes.find(c => c.outcome === 'loss').checks.volume.unknown, 1);
  assert.equal(x.byConfirmation.find(c => c.check === 'volume').groups.find(g => g.value === 'unknown').count, 1);
  assert.equal(x.classes.find(c => c.outcome === 'win').features.rsi.mean, null);
  assert.equal(x.signals, 2); assert.equal(x.admitted, 1); assert.equal(x.refused, 1);
  assert.throws(() => summarizeMarket([row], []), /reconciliation/);
});
