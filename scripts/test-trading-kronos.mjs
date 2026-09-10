import test from 'node:test';
import assert from 'node:assert/strict';
import { kronosAgreesWithCandidate, summarizeKronosForecast, validateKronosForecastPayload } from '../trading/kronos/observer-core.mjs';

const bullish = {
  symbol: 'MNQ',
  lastClose: 20000,
  forecast: [
    { timestamp: '2026-09-09T14:35:00Z', open: 20000, high: 20020, low: 19995, close: 20015 },
    { timestamp: '2026-09-09T14:40:00Z', open: 20015, high: 20040, low: 20010, close: 20035 },
    { timestamp: '2026-09-09T14:45:00Z', open: 20035, high: 20055, low: 20030, close: 20050 }
  ]
};

test('Kronos observer validates coherent OHLC forecasts', () => {
  assert.equal(validateKronosForecastPayload(bullish), bullish);
});

test('Kronos observer summarizes direction without making the payload executable', () => {
  const summary = summarizeKronosForecast(bullish);
  assert.equal(summary.direction, 'bullish');
  assert.equal(summary.executable, false);
  assert.equal(summary.riskMultiplier, 1);
  assert.equal(kronosAgreesWithCandidate(summary, 'long'), true);
  assert.equal(kronosAgreesWithCandidate(summary, 'short'), false);
});

test('Kronos observer rejects malformed predicted candles', () => {
  const malformed = structuredClone(bullish);
  malformed.forecast[0].high = 19990;
  assert.throws(() => summarizeKronosForecast(malformed), /invalid OHLC ordering/);
});

test('Kronos observer rejects unsupported markets', () => {
  assert.throws(() => summarizeKronosForecast({ ...bullish, symbol: 'BTC' }), /Unsupported symbol/);
});
