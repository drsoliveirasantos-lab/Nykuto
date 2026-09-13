import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { simulate } from '../trading/lab/validation-engine.mjs';
import { prepareSessionCandles, comparisonWindows, runSessionComparison } from '../trading/lab/session-comparison.mjs';
import { readSessionBundle } from '../trading/lab/session-source.mjs';

const start = Date.parse('2025-01-02T20:00:00Z') / 1000;
const sample = () => [0, 1, 2, 3, 4].map(i => ({ time: start + i * 900, open: 100, high: 100.1, low: 99.9, close: 100, day: i < 4 ? '2025-01-02' : '2025-01-03', sessionEnd: i === 3 }));
const context = () => ({ fast: [0, 2, 2, 2, 2], slow: [1, 1, 1, 1, 1], atr: [1, 1, 1, 1, 1], adx: [25, 25, 25, 25, 25] });
const window = { label: 'test', start: start + 900, end: start + 5 * 900 };

test('session-close uses only the final bar open and prevents overnight exposure', () => {
  const candles = sample(); candles[3] = { ...candles[3], open: 100.25, high: 110, low: 90, close: 105 };
  const flat = simulate(candles, context(), window, true, 0.05, true);
  assert.equal(flat.length, 1); assert.equal(flat[0].entryTime, candles[2].time);
  assert.equal(flat[0].exitTime, candles[3].time); assert.equal(flat[0].exit, 100.25); assert.equal(flat[0].reason, 'Fin de séance');
  candles[3] = { ...candles[3], high: 120, low: 80, close: 90 };
  assert.deepEqual(simulate(candles, context(), window, true, 0.05, true), flat);
  assert.equal(simulate(candles, context(), window, true)[0].reason, 'Stop prioritaire');
  candles[3].open = 98;
  assert.equal(simulate(candles, context(), window, true, 0.05, true)[0].exit, 98);
});

test('signals cannot enter in the closing bar or roll into another session', () => {
  const candles = sample(), ctx = context();
  ctx.fast = [0, 0, 2, 2, 2];
  assert.equal(simulate(candles, ctx, window, true, 0.05, true).length, 0);
  assert.equal(simulate(candles, ctx, window, true).length, 1);
  ctx.fast = [0, 0, 0, 2, 2];
  assert.equal(simulate(candles, ctx, window, true, 0.05, true).length, 0);
  assert.equal(simulate(candles, ctx, window, true).length, 1);
});

function completeFixture() {
  const calendar = [], bars = [];
  for (let time = Date.parse('2024-12-02T00:00:00Z'); time < Date.parse('2025-07-01T00:00:00Z'); time += 86400000) {
    const date = new Date(time); if ([0, 6].includes(date.getUTCDay())) continue;
    const day = date.toISOString().slice(0, 10), early = day === '2024-12-24', close = early ? 13 : 16;
    calendar.push({ date: day, open: `${day}T09:30:00`, close: `${day}T${close}:00:00` });
    const offset = day >= '2025-03-09' ? '-04:00' : '-05:00';
    const open = Date.parse(`${day}T09:30:00${offset}`) / 1000;
    for (let i = 0; i < (close - 9.5) * 4; i++) bars.push({ time: open + i * 900, open: 100, high: 101, low: 99, close: 100, volume: 1 });
  }
  return { calendar, bars };
}

test('exchange calendar controls early closes and rejects missing sessions/intervals', () => {
  const { bars, calendar } = completeFixture();
  const prepared = prepareSessionCandles(bars, calendar, 2025);
  const early = prepared.candles.find(b => b.day === '2024-12-24' && b.sessionEnd);
  assert.equal(early.minute, 765); // 12:45 New York
  assert.equal(prepared.candles.find(b => b.day === '2025-03-10' && b.sessionEnd).minute, 945);
  assert.throws(() => prepareSessionCandles(bars.filter(b => new Date(b.time * 1000).toISOString().slice(0, 10) !== '2025-02-03'), calendar, 2025), /séance incomplète/);
  assert.throws(() => prepareSessionCandles(bars.slice(1), calendar, 2025), /séance incomplète/);
  const comparison = runSessionComparison(bars, calendar, 2025);
  assert.equal(comparison.gate.status, 'Échantillon insuffisant');
  assert.equal(comparison.candidate.overnight, 0); assert.equal(comparison.gate.paperEnabled, false);
  assert.equal(comparisonWindows(2025).at(-1).end, Date.parse('2025-07-01T00:00:00Z') / 1000);
});

test('tampered holdout data is rejected and visible controls resolve', async () => {
  await assert.rejects(readSessionBundle('{"schema":"jeu05-data-v1"}'), /ne correspondent pas/);
  const html = fs.readFileSync(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
  const ui = fs.readFileSync(new URL('../trading/lab/lab-session.mjs', import.meta.url), 'utf8');
  for (const [, id] of ui.matchAll(/el\('([^']+)'\)/g)) assert.ok(html.includes(`id="${id}"`), id);
  assert.doesNotMatch(html, /id="scRun"[^>]*disabled/);
});
