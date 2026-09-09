import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { backtest, createSignalReader, manualExitFill, simulateManualSegment } from '../trading/lab/manual-backtest.mjs';

// Synthetic data only: these fixtures never enter a research archive or report.
const config = { signalModel: 'ema', direction: 'both', paramA: 9, paramB: 21,
  atrMultiple: 1, rr: 2, maxTrades: 5, maxDailyLoss: 10, lossStreak: 2, costR: 0.05 };
const fixture = (length = 60) => Array.from({ length }, (_, i) => ({
  time: Date.parse('2026-01-02T10:00:00Z') / 1000 + i * 300,
  open: 100, high: 100.2, low: 99.5, close: 100, volume: 100
}));
const reader = (bars, signals, risk = 1) => ({
  signalAt: i => signals.get(i) || null, atrValues: Array(bars.length).fill(risk)
});
const segment = (bars, signals, options = {}, settings = config, risk = 1) =>
  simulateManualSegment(bars, settings, reader(bars, new Map(signals), risk),
    { start: 30, end: bars.length, validation: false, ...options });

test('Manual execution uses adverse gap opens in both directions and charges costs once', () => {
  for (const [side, open] of [['Long', 97], ['Short', 103]]) {
    const bars = fixture();
    Object.assign(bars[32], { open, high: open + 1, low: open - 1, close: open });
    const [trade] = segment(bars, [[30, side]]);
    assert.equal(trade.entryTime, bars[31].time);
    assert.equal(trade.entry, bars[31].open);
    assert.equal(trade.exit, open);
    assert.equal(trade.resultR, -3.05);
    assert.equal(trade.reason, 'Gap au stop');
  }
});

test('A target already reached at the open precedes later lows/highs; ambiguous intrabar stops still win', () => {
  for (const side of ['Long', 'Short']) {
    const long = side === 'Long', p = { side, stop: long ? 99 : 101, target: long ? 102 : 98 };
    assert.equal(manualExitFill(p, { open: long ? 103 : 97, high: 104, low: 96 }).price, p.target);
    const ambiguous = manualExitFill(p, { open: 100, high: 103, low: 97 });
    assert.equal(ambiguous.price, p.stop);
    assert.equal(ambiguous.reason, 'Stop prioritaire');
    assert.equal(manualExitFill(p, { open: 100, high: 100.2, low: 99.5 }), null);
  }
});

test('Development closes before the split and validation cannot inherit a pending signal or position', () => {
  const bars = fixture(), signals = [[40, 'Long'], [41, 'Short'], [42, 'Short']];
  const train = segment(bars, signals, { end: 42 }, config, 10);
  const validation = segment(bars, signals, { start: 42, validation: true }, config, 10);
  assert.equal(train[0].entryIndex, 41);
  assert.equal(train[0].exitIndex, 41);
  assert.equal(train[0].reason, 'Fin du développement');
  assert.equal(validation[0].entryIndex, 43);
  assert.equal(validation[0].validation, true);
  assert.ok(train.every(t => t.entryIndex < 42 && t.exitIndex < 42));
  assert.ok(validation.every(t => t.entryIndex > 42 && t.exitIndex >= 42));
  assert.equal(segment(bars, [[41, 'Long']], { start: 42, validation: true }).length, 0);
});

test('Changing all validation prices cannot change development trades with the real signal readers', () => {
  const bars = fixture(240);
  bars.forEach((b, i) => {
    const close = 100 + 2 * Math.sin(i / 6);
    Object.assign(b, { open: close, close, high: close + 0.2, low: close - 0.2 });
  });
  for (const signalModel of ['ema', 'rsi', 'breakout']) {
    const settings = { ...config, signalModel, paramA: signalModel === 'rsi' ? 30 : 9, paramB: signalModel === 'rsi' ? 70 : signalModel === 'breakout' ? 1 : 21 };
    const initial = backtest(bars, settings), split = initial.splitIndex;
    const changed = bars.map((b, i) => i < split ? b : { ...b, open: b.open * 3, close: b.close * 3, high: b.high * 3, low: b.low * 3 });
    const rerun = backtest(changed, settings);
    assert.ok(initial.trades.some(t => !t.validation), signalModel);
    assert.deepEqual(rerun.trades.filter(t => !t.validation), initial.trades.filter(t => !t.validation), signalModel);
    assert.ok(initial.trades.every(t => t.validation ? t.entryIndex > split : t.exitIndex < split));
    const a = createSignalReader(bars, settings), b = createSignalReader(changed, settings);
    for (let i = 0; i < split; i++) {
      assert.equal(a.atrValues[i], b.atrValues[i]);
      assert.equal(a.signalAt(i), b.signalAt(i));
    }
  }
});

test('One loss yesterday does not consume today’s consecutive-loss allowance', () => {
  const bars = fixture();
  bars.forEach((b, i) => {
    if (i >= 32) b.time += 86400;
    if ([31, 33, 35].includes(i)) b.low = 98;
  });
  const trades = segment(bars, [[30, 'Long'], [32, 'Long'], [34, 'Long'], [36, 'Long']]);
  assert.deepEqual(trades.map(t => t.entryIndex), [31, 33, 35]);
  assert.ok(trades.every(t => t.resultR === -1.05));
});

test('Daily limits and a reached loss pause reset on the next UTC day', () => {
  for (const settings of [{ ...config, lossStreak: 1 }, { ...config, maxDailyLoss: 1 }, { ...config, maxTrades: 1 }]) {
    const bars = fixture();
    bars.forEach((b, i) => { if (i >= 34) b.time += 86400; b.low = 98; });
    const trades = segment(bars, [[30, 'Long'], [32, 'Long'], [34, 'Long'], [36, 'Long']], {}, settings);
    assert.deepEqual(trades.map(t => t.entryIndex), [31, 35]);
  }
});

test('Validation starts with fresh brakes even when the split is within the same UTC day', () => {
  const bars = fixture(); bars.forEach(b => { b.low = 98; });
  const signals = [[30, 'Long'], [32, 'Long'], [42, 'Long'], [44, 'Long']];
  const settings = { ...config, maxTrades: 1 };
  assert.deepEqual(segment(bars, signals, { end: 42 }, settings).map(t => t.entryIndex), [31]);
  assert.deepEqual(segment(bars, signals, { start: 42, validation: true }, settings).map(t => t.entryIndex), [43]);
});

test('Entry-bar highs/lows cannot determine the entry price, stop distance or side', () => {
  const bars = fixture(), modified = fixture();
  modified[31].high = 110; modified[31].low = 90;
  const signals = [[30, 'Long']];
  const a = segment(bars, signals)[0], b = segment(modified, signals)[0];
  assert.equal(a.entry, b.entry); assert.equal(a.entryTime, b.entryTime); assert.equal(a.side, b.side);
  assert.equal(b.exitIndex, 31); assert.equal(b.exit, 99); assert.equal(b.resultR, -1.05);
});

test('Invalid OHLC, duplicate/out-of-order bars and insufficient warmup stop the manual calculation', () => {
  for (const patch of [{ open: 0 }, { close: NaN }, { low: 101 }, { high: 99 }, { volume: -1 }, { time: null }]) {
    const bars = fixture(); Object.assign(bars[35], patch);
    assert.throws(() => backtest(bars, config), /Historique invalide/);
  }
  for (const time of [fixture()[34].time, fixture()[34].time - 300]) {
    const bars = fixture(); bars[35].time = time;
    assert.throws(() => backtest(bars, config), /Historique invalide/);
  }
  assert.throws(() => backtest(fixture(), { ...config, paramB: 200 }), /préparation/);
  assert.throws(() => backtest(fixture(), { ...config, rr: Infinity }), /Paramètres/);
  assert.throws(() => backtest(fixture(), { ...config, costR: -1 }), /Paramètres/);
});

test('The manual run handler hides stale results on bad data and recovers on the next valid run', async () => {
  // Minimal DOM adapter exercises the actual handler; this is not browser QA.
  const html = readFileSync(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
  const element = () => ({ value: '', hidden: false, textContent: '', className: '',
    listeners: {}, classList: { add() {} },
    addEventListener(type, callback) { this.listeners[type] = callback; },
    replaceChildren() {}, appendChild() {} });
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map(m => [m[1], element()]));
  const byId = id => elements.get(id);
  let candles = fixture(), fatal = null;
  const source = readFileSync(new URL('../trading/lab/lab.js', import.meta.url), 'utf8')
    .replace("await import('./manual-backtest.mjs?v=1')", 'window.manualEngine');
  await runInNewContext(source, {
    window: { manualEngine: { backtest }, Nykuto: { ready: Promise.resolve(), read: () => ({}), status: message => { fatal = message; } } },
    document: { getElementById: byId, createElement: element },
    fetch: async () => ({ ok: true, json: async () => ({ label: 'Synthetic fixture', candles, source: 'test only' }) }),
    Intl, Date, Error, setTimeout
  });
  assert.equal(fatal, null);
  const run = byId('runBacktest').listeners.click;
  await run();
  assert.equal(byId('backtestResults').hidden, false);
  assert.match(byId('backtestNote').textContent, /Deux simulations séparées/);
  candles = fixture(); candles[35].close = 0;
  await run();
  assert.equal(byId('backtestResults').hidden, true);
  assert.match(byId('backtestNote').textContent, /Historique invalide/);
  assert.equal(byId('runBacktest').disabled, false);
  candles = fixture();
  await run();
  assert.equal(byId('backtestResults').hidden, false);
  assert.equal(byId('backtestNote').className, 'backtest-note is-success');
});
