import test from 'node:test';
import assert from 'node:assert/strict';
import { simulatePortfolio } from '../trading/lab/jeu29-engine.mjs';
import { JEU29_PRODUCTS, JEU29_PROFILES, JEU29_RISK } from '../trading/lab/jeu29-policy.mjs';
import { simulateAdmission } from '../trading/lab/jeu23-engine.mjs';
import { simulateBreakEven } from '../trading/lab/jeu28-engine.mjs';
import { simulateFailure } from '../trading/lab/jeu26-engine.mjs';
import { JEU28_SCENARIOS } from '../trading/lab/jeu28-policy.mjs';
import { JEU26_SCENARIOS } from '../trading/lab/jeu26-policy.mjs';
const period = { start: '2026-01-02', end: '2026-01-03' };
function fixture() {
  const time = Date.parse('2026-01-02T14:30:00Z') / 1000;
  return JEU29_PROFILES.map(p => ({ symbol: p.symbol, signals: new Map(),
    candles: Array.from({ length: 78 }, (_, i) => ({ time: time + 300 * i, day: period.start,
      minute: 570 + i * 5, closeMinute: 960, ticker: p.symbol + 'H6',
      open: 1000, high: 1001, low: 999, close: 1000, volume: 100 })) }));
}
const get = (s, symbol) => s.find(x => x.symbol === symbol);
const product = symbol => JEU29_PRODUCTS.find(p => p.symbol === symbol);
function signal(streams, symbol, i = 8, side = 'Long', distance = { MES: 20, MGC: 10, MNQ: 40, MYM: 100 }[symbol]) {
  const s = get(streams, symbol), b = s.candles[i], sign = side === 'Long' ? 1 : -1, p = product(symbol);
  const failure = symbol === 'MGC', entry = b.open, stop = entry - sign * distance;
  const value = { day: b.day, side, signalOpen: b.time - 300, signalClose: b.time,
    rangeClosedAt: s.candles[6].time, trendClosedAt: s.candles[6].time, breakoutAt: b.time - 300,
    rangeHigh: failure ? entry + distance * 2 : side === 'Long' ? entry - 1 : entry + distance * 3,
    rangeLow: failure ? entry - distance / 2 : side === 'Long' ? entry - distance * 3 : entry + 1,
    stopPrice: stop, pattern: failure ? 'orb-failure' : 'orb-retest' };
  if (failure) value.excursionExtreme = stop + sign * p.tick;
  s.signals.set(b.time, value); return value;
}
const run = (s, cost = 1, account = false, p = period) => simulatePortfolio(s, p, cost, account);
const hit = (s, symbol, i, price) => { const b = get(s, symbol).candles[i]; b.high = Math.max(b.high, price); b.low = Math.min(b.low, price); };

test('simultaneous signals use fixed alphabetical priority independent of input order and future return', () => {
  const s = fixture(); for (const p of JEU29_PROFILES) signal(s, p.symbol);
  hit(s, 'MES', 8, 980); hit(s, 'MNQ', 8, 1100);
  const value = run(s); assert.equal(value.trades.length, 1); assert.equal(value.trades[0].symbol, 'MES');
  assert.equal(value.trades[0].netDollars, -105); assert.equal(value.denied.simultaneous, 3);
  assert.deepEqual(run([...s].reverse()), value); assert.equal(value.executionAllowed, false);
});

test('an open position blocks other markets for its entire exit bar, including an opening gap', () => {
  for (const gap of [false, true]) {
    const s = fixture(); signal(s, 'MES'); signal(s, 'MNQ', 9); signal(s, 'MYM', 10);
    if (gap) Object.assign(get(s, 'MES').candles[9], { open: 975, high: 976, low: 974, close: 975 });
    else hit(s, 'MES', 9, 980);
    const r = run(s); assert.equal(r.denied.occupied, 1); assert.deepEqual(r.trades.map(t => t.symbol), ['MES', 'MYM']);
    assert.equal(r.trades[0].exitTime, get(s, 'MES').candles[9].time);
    assert.ok(r.trades[1].entryTime >= r.trades[0].exitTime + 300);
    if (gap) assert.equal(r.trades[0].netDollars, -130);
  }
});

test('two entries and consumed sides are shared and reset at the next session', () => {
  const s = fixture(); signal(s, 'MES'); hit(s, 'MES', 8, 1030);
  signal(s, 'MES', 9); signal(s, 'MNQ', 10); hit(s, 'MNQ', 10, 1060); signal(s, 'MYM', 11);
  const first = run(s); assert.equal(first.denied.sideLimit, 1); assert.equal(first.denied.dailyEntries, 1); assert.equal(first.trades.length, 2);
  const all = s.map(x => ({ ...x, candles: [...x.candles, ...x.candles.map(b => ({ ...b, time: b.time + 86400, day: '2026-01-03' }))],
    signals: new Map([...x.signals, ...[...x.signals].map(([t, v]) => [t + 86400, { ...v, day: '2026-01-03',
      signalOpen: v.signalOpen + 86400, signalClose: v.signalClose + 86400, rangeClosedAt: v.rangeClosedAt + 86400,
      trendClosedAt: v.trendClosedAt + 86400, breakoutAt: v.breakoutAt + 86400 }])]) }));
  const r = run(all, 1, false, { start: period.start, end: '2026-01-04' });
  assert.deepEqual(r.trades.slice(0, 2), first.trades); assert.deepEqual(r.days.map(d => d.trades), [2, 2]);
});

test('a denied expensive candidate leaves the slot free; doubled costs are fully resimulated', () => {
  const s = fixture(); signal(s, 'MES', 8, 'Long', 29); signal(s, 'MNQ');
  const normal = run(s), stress = run(s, 2);
  assert.equal(normal.trades[0].symbol, 'MES'); assert.equal(normal.trades[0].riskDollars + normal.trades[0].costDollars, 150);
  assert.equal(stress.denied.tradeRisk, 1); assert.equal(stress.trades[0].symbol, 'MNQ');
});

test('a gap loss consumes the common daily envelope across different markets', () => {
  const s = fixture(); signal(s, 'MES'); Object.assign(get(s, 'MES').candles[9], { open: 969, high: 969, low: 969, close: 969 });
  // -160 / 100 = -1.6R: daily R brake is not hit, but only 140 USD remains.
  signal(s, 'MNQ', 10, 'Long', 72); const r = run(s);
  assert.equal(r.trades[0].netDollars, -160); assert.equal(r.denied.dailyBudget, 1); assert.equal(r.trades.length, 1);
});

test('a single gap beyond -2R blocks other markets even before the entry limit', () => {
  const s = fixture(); signal(s, 'MES'); Object.assign(get(s, 'MES').candles[9], { open: 950, high: 950, low: 950, close: 950 });
  signal(s, 'MYM', 10); const r = run(s); assert.equal(r.trades[0].netDollars, -255); assert.equal(r.denied.dailyBrake, 1);
});

test('account floor breach is terminal and shared supervisor agrees with successful entries', () => {
  const s = fixture(); signal(s, 'MES'); Object.assign(get(s, 'MES').candles[9], { open: 790, high: 790, low: 790, close: 790 });
  signal(s, 'MYM', 10); const r = run(s, 1, true);
  assert.equal(r.status, 'breached'); assert.equal(r.trades.length, 1); assert.equal(r.trades[0].reason, 'MLL gap');
  assert.equal(r.balance, 23945); assert.equal(r.executionAllowed, false);
});

test('each isolated profile preserves its frozen entry and exit behavior, both costs and account modes', () => {
  for (const p of JEU29_PROFILES) for (const cost of [1, 2]) for (const account of [false, true]) {
    const s = fixture(); signal(s, p.symbol); const stream = get(s, p.symbol), prod = product(p.symbol);
    const distance = { MES: 20, MGC: 10, MNQ: 40, MYM: 100 }[p.symbol];
    Object.assign(stream.candles[8], { high: 1000 + distance + prod.tick, close: 1000 + distance });
    hit(s, p.symbol, 9, 1000 - distance);
    const own = p.strategy === 'baseline' ? simulateAdmission(stream.candles, stream.signals, JEU29_RISK, prod, period, cost, account)
      : p.strategy === 'failure' ? simulateFailure(stream.candles, stream.signals, JEU26_SCENARIOS[0], prod, period, cost, account)
      : simulateBreakEven(stream.candles, stream.signals, JEU28_SCENARIOS[0], prod, period, cost, account);
    const joint = run(s, cost, account); assert.equal(joint.net, own.net, p.symbol);
    assert.equal(joint.trades.length, own.trades.length);
    for (const field of ['entryTime', 'exitTime', 'entry', 'exit', 'stop', 'target', 'netDollars', 'reason'])
      assert.equal(joint.trades[0][field], own.trades[0][field], p.symbol + '/' + field);
  }
});

test('short entries retain stop-first ambiguity and the correct contract multiplier', () => {
  const s = fixture(); signal(s, 'MNQ', 8, 'Short'); hit(s, 'MNQ', 8, 1040); hit(s, 'MNQ', 8, 940);
  const r = run(s); assert.equal(r.trades[0].reason, 'Stop'); assert.equal(r.trades[0].ambiguous, true); assert.equal(r.net, -83.5);
});

test('missing, duplicate, shifted, out-of-grid and cross-contract bars block the entire replay', () => {
  for (const damage of [s => get(s, 'MNQ').candles.splice(9, 1), s => get(s, 'MES').candles.push(get(s, 'MES').candles[0]),
    s => { get(s, 'MYM').candles[9].time += 300; }, s => { get(s, 'MGC').candles[9].open = 1000.01; },
    s => { get(s, 'MNQ').candles[9].ticker = 'MNQM6'; }, s => get(s, 'MES').candles.pop(),
    s => { get(s, 'MYM').candles = []; }]) {
    const s = fixture(); damage(s); assert.throws(() => run(s), /session|prices|tapes/);
  }
  assert.throws(() => run(fixture().slice(1)), /Four/); assert.throws(() => run(fixture(), 3), /policy/);
});

test('future or detached signals and reserve dates are rejected before execution', () => {
  for (const mutate of [v => { v.signalOpen++; }, v => { v.trendClosedAt = v.signalClose + 300; },
    v => { v.rangeClosedAt = v.signalClose; }, v => { v.day = '2026-01-01'; }]) {
    const s = fixture(), v = signal(s, 'MNQ'); mutate(v);
    // Outside-period signals may be ignored only if their key is outside too.
    assert.throws(() => run(s), /Noncausal/);
  }
  assert.throws(() => run(fixture(), 1, false, { start: '2026-05-01', end: '2026-06-01' }), /Development/);
});

test('decision counts and market contributions reconcile without changing input objects', () => {
  const s = fixture(); for (const p of JEU29_PROFILES) signal(s, p.symbol); const before = structuredClone(s);
  const r = run(s); assert.deepEqual(s, before);
  assert.equal(Object.values(r.byMarket).reduce((n, m) => n + m.signals, 0), r.decisions.length);
  assert.equal(r.decisions.length, r.trades.length + Object.values(r.denied).reduce((a, b) => a + b, 0));
  assert.equal(r.daily.observed, r.daily.positive + r.daily.negative + r.daily.flatActive + r.daily.noTrade);
});
