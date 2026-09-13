import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCandles } from '../trading/lab/validation-data.mjs';
import { RULES, WINDOWS, exitFill, simulate, contextFor, prepareCandles, runValidation, metrics, evaluateGate } from '../trading/lab/validation-engine.mjs';

const csv = row => `time,open,high,low,close,symbol\n${row}`;
test('CSV rejects missing/zero prices, wrong assets, ambiguous timezones and contradictory duplicates', () => {
  assert.throws(() => parseCandles(csv('1767364200,,102,99,101,SPY')), /invalide/);
  assert.throws(() => parseCandles(csv('1767364200,0,102,0,101,SPY')), /invalide/);
  assert.throws(() => parseCandles(csv('1767364200,100,102,99,101,QQQ')), /SPY/);
  assert.throws(() => parseCandles(csv('2026-01-02T09:30:00,100,102,99,101,SPY')), /fuseau/);
  assert.throws(() => parseCandles(csv('1767364200,100,102,99,101,SPY\n1767364200,100,102,99,100,SPY')), /différentes/);
});
test('CSV accepts explicit timezones, quoted fields, milliseconds and deduplicates without increasing the sample', () => {
  const data = parseCandles('\uFEFFtime;open;high;low;close;symbol\r\n"2026-01-02T09:30:00-05:00";100;102;99;101;SPY\r\n1767364200000;100;102;99;101;SPY');
  assert.equal(data.candles.length, 1);
  assert.equal(data.duplicateCount, 1);
  assert.equal(data.candles[0].time, 1767364200);
});

test('gaps use the actual adverse open, and the stop wins ambiguous OHLC bars for both sides', () => {
  const long = { side: 'Long', stop: 99, target: 101.5 };
  const short = { side: 'Short', stop: 101, target: 98.5 };
  assert.equal(exitFill(long, { open: 97, high: 102, low: 96 }).price, 97);
  assert.equal(exitFill(short, { open: 103, high: 104, low: 98 }).price, 103);
  assert.equal(exitFill(long, { open: 100, high: 102, low: 98 }).price, 99);
  assert.equal(exitFill(short, { open: 100, high: 102, low: 98 }).price, 101);
  assert.equal(exitFill(long, { open: 103, high: 104, low: 98 }).price, 101.5);
});

function simpleBars(length = 18) {
  return Array.from({ length }, (_, i) => ({ time: 1000000 + i * 900, open: 100 + i, high: 100.1 + i, low: 99.9 + i, close: 100 + i, day: '2026-01-02' }));
}
test('entries use the next candle open and never carry a preparation signal into the scored window', () => {
  const bars = simpleBars(8);
  const ctx = { fast: [-1, 1, 1, -1, 1, 1, 1, 1], slow: Array(8).fill(0), adx: Array(8).fill(30), atr: Array(8).fill(100) };
  const window = { start: bars[2].time, end: bars[7].time, label: 'Test' };
  const trades = simulate(bars, ctx, window, false);
  assert.equal(trades[0].entryTime, bars[4].time);
  assert.equal(trades[0].entry, bars[4].open);
  assert.equal(trades[0].exitTime, bars[6].time);
  assert.equal(trades[0].reason, 'Fin de période');
  assert.ok(trades.every(t => t.entryTime >= window.start && t.exitTime < window.end));
});
test('ADX below 20 rejects the signal and the boundary 20 is accepted', () => {
  const bars = simpleBars(8), ctx = { fast: [-1, -1, 1, 1, 1, 1, 1, 1], slow: Array(8).fill(0), adx: Array(8).fill(19.99), atr: Array(8).fill(100) };
  const window = { start: bars[1].time, end: bars.at(-1).time + 900, label: 'Test' };
  assert.equal(simulate(bars, ctx, window, true).length, 0);
  ctx.adx[2] = 20;
  assert.equal(simulate(bars, ctx, window, true).length, 1);
});
test('two losses block new entries until the next day, including when no day was previously blocked', () => {
  const bars = simpleBars();
  bars.forEach((bar, i) => Object.assign(bar, { open: 100, high: 103, low: 97, close: 100, day: i < 10 ? '2026-01-02' : '2026-01-05' }));
  const ctx = { fast: bars.map((_, i) => i % 2 ? 1 : -1), slow: bars.map(() => 0), adx: bars.map(() => 30), atr: bars.map(() => 1) };
  const trades = simulate(bars, ctx, { start: bars[1].time, end: bars.at(-1).time + 900, label: 'Test' }, false);
  assert.equal(trades.filter(t => t.entryTime < bars[10].time).length, 2);
  assert.equal(trades.filter(t => t.entryTime >= bars[10].time).length, 2);
  assert.ok(trades.every(t => Math.abs(t.resultR + 1.05) < 1e-8));
});

// Synthetic fixtures are regression tests only; no fixture is served as market data.
function historicalFixture() {
  const result = [], ny = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  for (let day = Date.parse('2025-12-01T00:00:00Z'); day < Date.parse('2026-07-01T00:00:00Z'); day += 86400000) {
    if ([0, 6].includes(new Date(day).getUTCDay())) continue;
    const hour = ny.format(new Date(day + 13.5 * 3600000)) === '09:30' ? 13.5 : 14.5;
    for (let j = 0; j < 26; j += 1) {
      const k = result.length, close = 100 + 4 * Math.sin(k / 13) + Math.sin(k / 3);
      const open = k ? result.at(-1).close : close;
      result.push({ time: (day + hour * 3600000) / 1000 + j * 900, open, high: Math.max(open, close) + .2, low: Math.min(open, close) - .2, close, volume: 100 });
    }
  }
  return result;
}
const fixture = historicalFixture();
test('all indicators are causal when later prices change', () => {
  const prefix = fixture.slice(0, 500), longer = [...prefix, ...fixture.slice(500, 550).map(c => ({ ...c, close: 10000 }))];
  const a = contextFor(prefix), b = contextFor(longer);
  for (const key of Object.keys(a)) assert.deepEqual(b[key].slice(0, 500), a[key]);
});
test('coverage excludes Jeu 03 dates, requires warmup and catches gaps/wrong bar intervals', () => {
  const prepared = prepareCandles([...fixture, { ...fixture[0], time: Date.parse('2026-08-03T13:30:00Z') / 1000 }]);
  assert.equal(prepared.excludedBars, 1);
  assert.equal(prepared.quality.length, 3);
  assert.ok(prepared.candles.every(c => c.time < WINDOWS.at(-1).end));
  assert.throws(() => prepareCandles(fixture.filter(c => c.time >= WINDOWS[0].start)), /préparation/);
  assert.throws(() => prepareCandles(fixture.filter((_, i) => i !== 750)), /continuité/);
  assert.throws(() => prepareCandles(fixture.filter((_, i) => i % 4 === 0)), /préparation|continuité/);
  assert.throws(() => prepareCandles(fixture.filter(c => c.time < WINDOWS[1].end)), /incomplète/);
});
test('full calculation is deterministic, scores separate windows and reruns the stress scenario', () => {
  const a = runValidation(fixture), b = runValidation(fixture);
  assert.deepEqual(a, b);
  assert.ok(a.filtered.count > 0);
  assert.equal(a.filtered.count, a.windows.reduce((sum, w) => sum + w.filtered.count, 0));
  for (const w of a.windows) for (const trade of [...w.baselineTrades, ...w.filteredTrades, ...w.stressTrades]) {
    assert.ok(trade.entryTime >= w.start && trade.exitTime < w.end);
  }
  assert.ok(a.windows.flatMap(w => w.stressTrades).every(t => t.costR === RULES.stressCostR));
  assert.equal(a.gate.paperEnabled, false);
});
test('a high win rate with few trades cannot pass the sample gate; zero trades is not 0% wins', () => {
  const tiny = metrics(Array.from({ length: 4 }, () => ({ resultR: 1.45 })));
  const gate = evaluateGate(WINDOWS.map(() => ({ filtered: tiny })), tiny, tiny, metrics([{ resultR: -1.05 }]));
  assert.equal(gate.status, 'Échantillon insuffisant');
  assert.equal(gate.paperEnabled, false);
  assert.equal(metrics([]).win, null);
  assert.equal(metrics([]).exp, null);
  assert.ok(tiny.winInterval[0] < .6);
});
test('browser module references existing controls and all imports resolve', () => {
  const html = readFileSync(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
  const ui = readFileSync(new URL('../trading/lab/lab-validation.mjs', import.meta.url), 'utf8');
  for (const match of ui.matchAll(/byId\('([^']+)'\)/g)) assert.ok(html.includes(`id="${match[1]}"`), match[1]);
  assert.match(html, /type="module"/);
  assert.match(html, /id="ivRun"/);
  assert.doesNotMatch(html, /id="ivRun"[^>]*disabled/);
  assert.match(ui, /loadHostedDataset\(\)/);
  assert.match(html, /id="ivResults" hidden/);
});
