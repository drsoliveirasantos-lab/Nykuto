import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS, tradeTerms, simulateMarket, segmentsFor, prepareMarket, calendarSessions } from '../trading/lab/market-comparison.mjs';
import { loadMarketHistory, readMarketBundle } from '../trading/lab/market-source.mjs';

const product = PRODUCTS[1];
const start = Date.parse('2025-07-01T13:30:00Z') / 1000;
const window = { label: 'Fixture', start, end: start + 10000 };
function fixture() {
  const candles = [0, 1, 2, 3].map(i => ({ time: start + (i - 1) * 900, day: '2025-07-01', open: 100, high: 101, low: 99, close: 100, sessionEnd: i === 3 }));
  candles[3].open = 101;
  const context = { fast: [0, 2, 2, 2], slow: [1, 1, 1, 1], adx: [30, 30, 30, 30], atr: [1.6, 1.6, 1.6, 1.6] };
  return { candles, context };
}

test('trade prices respect ticks and contract-specific dollar costs', () => {
  const terms = tradeTerms(product, 1.1);
  assert.equal(terms.risk, 1.5);
  assert.equal(terms.targetDistance, 2.25);
  assert.equal(terms.riskDollars, 7.5);
  assert.equal(terms.costDollars, 5);
  assert.equal(tradeTerms(PRODUCTS[2], 1.1).costDollars, 3.5);
  assert.equal(tradeTerms(PRODUCTS[0], 1.1).costDollars, .04);
  assert.equal(tradeTerms(product, 1.1, 2).costR, 2 * terms.costR);
});

test('entry is next-bar causal and session close reads only the open', () => {
  const { candles, context } = fixture();
  const trades = simulateMarket(candles, context, window, product);
  assert.equal(trades.length, 1);
  assert.equal(trades[0].entryTime, candles[2].time);
  assert.equal(trades[0].exit, 101);
  assert.equal(trades[0].reason, 'Fin de séance');
  assert.equal(trades[0].grossR, .5);
  assert.equal(trades[0].resultR, 0);
  candles[3].high = 1000; candles[3].low = 1; candles[3].close = 800;
  assert.deepEqual(simulateMarket(candles, context, window, product), trades);
  assert.equal(simulateMarket(candles, context, window, product, 2)[0].resultR, -.5);
  candles[2].day = candles[3].day = '2025-07-02';
  assert.equal(simulateMarket(candles, context, window, product).length, 0, 'No overnight signal');
});

test('ambiguous bars use stop first; gaps can exceed the stop', () => {
  const { candles, context } = fixture();
  candles[2].high = 104; candles[2].low = 97;
  const stop = simulateMarket(candles, context, window, product)[0];
  assert.equal(stop.exit, 98); assert.equal(stop.reason, 'Stop prioritaire'); assert.equal(stop.resultR, -1.5);
  candles[2].high = 101; candles[2].low = 99; candles[3].open = 97;
  const gap = simulateMarket(candles, context, window, product)[0];
  assert.equal(gap.exit, 97); assert.equal(gap.resultR, -2);
});

test('higher costs re-evaluate the daily brake, rather than adjusting old trades', () => {
  const candles = Array.from({ length: 8 }, (_, i) => ({ time: start + (i - 1) * 900, day: '2025-07-01', open: 100, high: 101, low: 99, close: 100, sessionEnd: i === 7 }));
  // Two stop losses are not needed here: a single loss reaches -2R only at doubled costs.
  candles[2].low = 97;
  const ctx = { fast: [0, 2, 2, 0, 0, 2, 2, 2], slow: Array(8).fill(1), adx: Array(8).fill(30), atr: Array(8).fill(1.6) };
  const normal = simulateMarket(candles, ctx, window, product);
  const stress = simulateMarket(candles, ctx, window, product, 2);
  assert.ok(normal.length > stress.length);
  assert.equal(stress.length, 1);
  assert.equal(stress[0].resultR, -2);
});

test('missing sessions and wrong contracts fail before any score', () => {
  const calendar = [];
  for (let time = Date.parse('2025-06-01'); time < Date.parse('2026-01-01'); time += 86400000) {
    const d = new Date(time), day = d.toISOString().slice(0, 10);
    if (![0, 6].includes(d.getUTCDay())) calendar.push({ date: day, open: `${day}T09:30:00`, close: `${day}T16:00:00` });
  }
  const sessions = calendarSessions(calendar);
  assert.throws(() => prepareMarket(product, { symbol: 'MES', segments: segmentsFor(product).map(g => ({ ticker: g.ticker, bars: [] })) }, sessions), /séance incomplète/);
  assert.throws(() => prepareMarket(product, { symbol: 'SPY', segments: [] }, sessions), /contrats manquants/);
  assert.equal(segmentsFor(product)[1].start, '2025-09-15');
});

test('bad signatures, login pages and failed fetches never become market data', async () => {
  await assert.rejects(readMarketBundle('{"schema":"jeu06-data-v1"}'), /ne correspond pas/);
  await assert.rejects(loadMarketHistory(async () => new Response('', { status: 401 })), /session/);
  await assert.rejects(loadMarketHistory(async () => new Response('<html>Login</html>', { headers: { 'Content-Type': 'text/html' } })), /indisponible/);
  await assert.rejects(loadMarketHistory(async () => { throw new TypeError('offline'); }), /interrompu/);
});
