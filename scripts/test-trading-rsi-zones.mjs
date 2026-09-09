import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRsi, summarizeRsi } from '../trading/lab/rsi-zones.mjs';
test('RSI extremes use raw 30/70 values, exact boundaries remain middle and missing never means neutral', () => {
  assert.equal(classifyRsi(29.99999).zone, 'oversold'); assert.equal(classifyRsi(30).zone, 'middle');
  assert.equal(classifyRsi(70).zone, 'middle'); assert.equal(classifyRsi(70.00001).zone, 'overbought');
  assert.equal(classifyRsi(null).zone, 'unknown'); assert.equal(classifyRsi(50).zone, 'middle');
  for (const x of [undefined, NaN, Infinity, '25', -1, 101]) assert.throws(() => classifyRsi(x), /Invalid/);
});
test('leaving a zone is distinct from remaining inside it and is unknown without the preceding closed RSI', () => {
  assert.equal(classifyRsi(31, 29).event, 'leave-oversold'); assert.equal(classifyRsi(30, 29).event, 'leave-oversold');
  assert.equal(classifyRsi(69, 71).event, 'leave-overbought'); assert.equal(classifyRsi(70, 71).event, 'leave-overbought');
  assert.equal(classifyRsi(25, 27).event, 'none'); assert.equal(classifyRsi(31, 30).event, 'none');
  assert.equal(classifyRsi(31).event, 'unknown'); assert.equal(classifyRsi(null, 25).event, 'unknown');
});
test('zone summaries retain buy/sell direction, zero outcomes, empty groups and all trades exactly once', () => {
  const t = { symbol: 'MNQ', day: '2026-08-03', side: 'Short', entryTime: 1, netDollars: 10, resultR: 1, costDollars: 1, rsiZone: classifyRsi(25, 27) };
  const rows = [t, { ...t, entryTime: 2, side: 'Long', netDollars: -5, resultR: -0.5, rsiZone: classifyRsi(75, 72) },
    { ...t, entryTime: 3, netDollars: 0, resultR: 0, rsiZone: classifyRsi(null) }];
  const x = summarizeRsi(rows); assert.equal(x.total.net, 5); assert.equal(x.total.count, 3);
  assert.equal(x.zones[0].wins, 1); assert.equal(x.zones[1].count, 0); assert.equal(x.zones[1].winRate, null);
  assert.equal(x.zones[3].flat, 1); assert.equal(x.bySide[1].zones[0].count, 1);
  assert.throws(() => summarizeRsi([t, t]), /Duplicate/);
});
