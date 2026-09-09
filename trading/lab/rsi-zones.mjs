import assert from 'node:assert/strict';
import { statistics } from './market-diagnostics.mjs';
export const RSI_ZONES = Object.freeze(['oversold', 'middle', 'overbought', 'unknown']);
export const RSI_EVENTS = Object.freeze(['leave-oversold', 'leave-overbought', 'none', 'unknown']);
export function classifyRsi(current, previous = null) {
  const valid = x => x === null || typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 100;
  assert.ok(valid(current) && valid(previous), 'Invalid RSI value');
  const zone = current === null ? 'unknown' : current < 30 ? 'oversold' : current > 70 ? 'overbought' : 'middle';
  const event = current === null || previous === null ? 'unknown'
    : previous < 30 && current >= 30 ? 'leave-oversold'
      : previous > 70 && current <= 70 ? 'leave-overbought' : 'none';
  return { zone, event };
}
export function summarizeRsi(rows) {
  const groups = (key, values) => values.map(value => ({ value, ...statistics(rows.filter(t => t.rsiZone[key] === value)) }));
  const zones = groups('zone', RSI_ZONES), events = groups('event', RSI_EVENTS);
  assert.equal(zones.reduce((n, g) => n + g.count, 0), rows.length, 'Unknown zone omitted');
  assert.equal(events.reduce((n, g) => n + g.count, 0), rows.length, 'Unknown event omitted');
  return { total: statistics(rows), zones, events,
    bySide: ['Long', 'Short'].map(side => ({ side, zones: RSI_ZONES.map(value => ({ value,
      ...statistics(rows.filter(t => t.side === side && t.rsiZone.zone === value)) })) })) };
}
