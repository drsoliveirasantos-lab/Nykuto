import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { simulatePortfolio } from '../trading/lab/jeu29-engine.mjs';
import { simulateAugustPortfolio } from '../trading/lab/jeu30-engine.mjs';
import { calendarBreakdown, mondayOf } from '../trading/lab/jeu30-calendar.mjs';
import { JEU30_POLICY } from '../trading/lab/jeu30-policy.mjs';

test('August executor preserves the exact prior economic code; only policy import, export name and date bounds differ', async () => {
  const source = await readFile(new URL('../trading/lab/jeu29-engine.mjs', import.meta.url), 'utf8');
  const expected = source.replace('jeu29-policy.mjs', 'jeu30-policy.mjs')
    .replace('JEU29_POLICY as P', 'JEU30_POLICY as P').replaceAll('P.trainEnd', 'P.end')
    .replace('Development period required', 'Authorized August period required')
    .replace('export function simulatePortfolio(', 'export function simulateAugustPortfolio(');
  assert.equal(await readFile(new URL('../trading/lab/jeu30-engine.mjs', import.meta.url), 'utf8'), expected);
  assert.equal(JEU30_POLICY.economicRulesChanged, false); assert.equal(JEU30_POLICY.executionAllowed, false);
});
function fixture(day, utc) {
  const base = Date.parse(day + 'T' + utc + ':00Z') / 1000;
  return ['MES', 'MGC', 'MNQ', 'MYM'].map(symbol => ({ symbol, signals: new Map(),
    candles: Array.from({ length: 78 }, (_, i) => ({ time: base + i * 300, day, minute: 570 + 5 * i,
      closeMinute: 960, ticker: symbol + 'U6', open: 1000, high: 1001, low: 999, close: 1000, volume: 100 })) }));
}
function entry(streams) {
  const stream = streams.find(s => s.symbol === 'MNQ'), bar = stream.candles[8];
  stream.signals.set(bar.time, { side: 'Long', day: bar.day, signalOpen: bar.time - 300, signalClose: bar.time,
    trendClosedAt: stream.candles[6].time, rangeClosedAt: stream.candles[6].time, breakoutAt: bar.time - 300,
    rangeHigh: 999, rangeLow: 900, stopPrice: 960, pattern: 'orb-retest' });
  Object.assign(stream.candles[8], { high: 1041, close: 1040 });
  stream.candles[9].low = 990;
}
test('same synthetic economics work with August daylight time and both costs/account modes', () => {
  for (const factor of [1, 2]) for (const account of [false, true]) {
    const jan = fixture('2026-01-02', '14:30'), aug = fixture('2026-08-03', '13:30'); entry(jan); entry(aug);
    const a = simulatePortfolio(jan, { start: '2026-01-02', end: '2026-01-03' }, factor, account);
    const b = simulateAugustPortfolio(aug, { start: '2026-08-03', end: '2026-08-04' }, factor, account);
    assert.equal(a.net, b.net); assert.equal(a.trades.length, b.trades.length);
    for (const key of ['entry', 'exit', 'stop', 'target', 'riskDollars', 'costDollars', 'reason']) assert.equal(a.trades[0][key], b.trades[0][key]);
  }
});
test('old reserve gate stays closed and new gate accepts only authorized August dates', () => {
  const s = fixture('2026-08-03', '13:30');
  assert.throws(() => simulatePortfolio(s, { start: '2026-08-01', end: '2026-09-01' }), /Development/);
  for (const p of [{ start: '2026-07-01', end: '2026-09-01' }, { start: '2026-08-01', end: '2026-09-02' }])
    assert.throws(() => simulateAugustPortfolio(s, p), /Authorized August/);
});
const d = (day, net, balance, trades = 1) => ({ day, net, balance, trades, floor: 24000 });
const t = (day, netDollars) => ({ day, netDollars, symbol: 'MNQ' });
test('weekly totals retain the continuous balance and the partial week on August 31', () => {
  const run = { status: 'diagnostic', net: 80, days: [d('2026-08-07', 100, 25100), d('2026-08-10', -30, 25070), d('2026-08-31', 10, 25080)],
    trades: [t('2026-08-07', 100), t('2026-08-10', -30), t('2026-08-31', 10)] };
  const b = calendarBreakdown(run, run.days.map(x => x.day));
  assert.deepEqual(b.weeks.map(w => w.week), ['2026-08-03', '2026-08-10', '2026-08-31']);
  assert.deepEqual(b.weeks.map(w => w.net), [100, -30, 10]); assert.deepEqual(b.weeks.map(w => w.balance), [25100, 25070, 25080]);
  assert.deepEqual(b.daily.map(x => x.cumulative), [100, 70, 80]); assert.equal(b.weeks[2].expectedSessions, 1);
  assert.equal(mondayOf('2026-08-09'), '2026-08-03'); assert.throws(() => mondayOf('2026-02-30'), /Invalid/);
});
test('target and breach terminal days remain distinct from zero-result trading days', () => {
  for (const status of ['targetMet', 'breached']) {
    const run = { status, terminalDay: '2026-08-03', net: 0, days: [d('2026-08-03', 0, 25000, 0)], trades: [] };
    const b = calendarBreakdown(run, ['2026-08-03', '2026-08-04', '2026-08-10']);
    assert.equal(b.daily[0].state, 'no-trade'); assert.equal(b.daily[0].net, 0);
    assert.equal(b.daily[1].state, status === 'targetMet' ? 'stopped-target' : 'stopped-breach'); assert.equal(b.daily[1].net, null);
    assert.equal(b.weeks[1].net, null); assert.equal(b.weeks[1].simulatedSessions, 0); assert.equal(b.weeks[1].stoppedSessions, 1);
  }
});
test('missing data, active zero and no-trade days are separate and missing rows are never invented', () => {
  const run = { status: 'diagnostic', net: 0, days: [d('2026-08-03', 0, 25000), d('2026-08-05', 0, 25000, 0)], trades: [t('2026-08-03', 0)] };
  const calendar = ['2026-08-03', '2026-08-04', '2026-08-05'];
  const b = calendarBreakdown(run, calendar, ['2026-08-04']);
  assert.deepEqual(b.daily.map(x => x.state), ['flat-active', 'missing-data', 'no-trade']);
  assert.deepEqual(b.daily.map(x => x.net), [0, null, 0]); assert.equal(b.weeks[0].missingSessions, 1);
  assert.throws(() => calendarBreakdown(run, calendar), /Unexplained/);
});
test('incorrect trades, duplicate days, equity resets and mismatched monthly totals fail reconciliation', () => {
  const valid = { status: 'diagnostic', net: 100, days: [d('2026-08-03', 100, 25100)], trades: [t('2026-08-03', 100)] };
  for (const mutate of [r => { r.net = 101; }, r => { r.days[0].balance = 25000; }, r => { r.trades[0].netDollars = 99; }, r => { r.days.push(r.days[0]); }]) {
    const r = structuredClone(valid); mutate(r); assert.throws(() => calendarBreakdown(r, ['2026-08-03']));
  }
});
