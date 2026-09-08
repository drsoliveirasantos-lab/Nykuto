import test from 'node:test';
import assert from 'node:assert/strict';
import { COLLECTION, inspectCollection, inspectSession, plannedSessions, normalizeCapture } from '../trading/lab/prospective-collection.mjs';

const sessions = plannedSessions(), first = sessions[0];
const now = (first.close + 86400) * 1000;
function fixture(session = first) {
  return { date: session.date, ticker: COLLECTION.ticker, collectedAt: new Date((session.close + 3600) * 1000).toISOString(), source: { provider: 'Massive', rawSha256: 'a'.repeat(64), paginationComplete: true }, bars: Array.from({ length: session.expectedBars }, (_, i) => [session.open + i * 900, 100, 101, 99, 100.25, 12]), scheduleEvents: [{ product_code: 'MNQ', trading_venue: 'XCME', session_end_date: session.date, event: 'open', timestamp: new Date((session.open - 15 * 3600) * 1000).toISOString() }, { product_code: 'MNQ', trading_venue: 'XCME', session_end_date: session.date, event: 'close', timestamp: new Date((session.close + 3600) * 1000).toISOString() }] };
}
function bundle(records = []) { return { schema: 'jeu08-collection-v1', protocol: COLLECTION.id, updatedAt: new Date(now).toISOString(), records }; }

test('planned calendar preserves 58 sessions, DST, holiday and early close', () => {
  assert.equal(sessions.length, 58);
  assert.equal(sessions.filter(s => s.phase === 'prep').length, 16);
  assert.equal(new Date(first.open * 1000).toISOString(), '2026-09-09T13:30:00.000Z');
  assert.equal(new Date(sessions.find(s => s.date === '2026-11-02').open * 1000).toISOString(), '2026-11-02T14:30:00.000Z');
  assert.equal(sessions.some(s => s.date === '2026-11-26'), false);
  assert.equal(sessions.find(s => s.date === '2026-11-27').expectedBars, 14);
});
test('empty archive never fabricates observations or strategy confirmation', () => {
  const status = inspectCollection(bundle(), first.open * 1000);
  assert.equal(status.due, 0); assert.equal(status.complete, 0); assert.equal(status.automationScheduled, false);
  assert.equal(status.calculated, false); assert.equal(status.paperEnabled, false); assert.equal(status.shadowEnabled, false);
});
test('missing prices, missing schedules, intraday halts and late capture stay incomplete', () => {
  assert.equal(inspectSession(fixture(), first, now).complete, true);
  const missing = fixture(); missing.bars.pop();
  assert.equal(inspectSession(missing, first, now).prices, false);
  const schedule = fixture(); schedule.scheduleEvents.pop();
  assert.equal(inspectSession(schedule, first, now).schedule, false);
  const halted = fixture(); halted.scheduleEvents.push({ ...halted.scheduleEvents[0], event: 'halt', timestamp: new Date((first.open + 3600) * 1000).toISOString() });
  assert.equal(inspectSession(halted, first, now).schedule, false);
  const late = fixture(); late.collectedAt = new Date((first.close + 49 * 3600) * 1000).toISOString();
  assert.equal(inspectSession(late, first, (first.close + 50 * 3600) * 1000).timely, false);
});
test('invalid tick, duplicate bar/day, wrong contract and preclose capture fail closed', () => {
  const tick = fixture(); tick.bars[0][1] = 100.1;
  assert.throws(() => inspectSession(tick, first, now), /tick/);
  const duplicate = fixture(); duplicate.bars[1] = duplicate.bars[0];
  assert.throws(() => inspectSession(duplicate, first, now), /doublon/);
  assert.throws(() => inspectCollection(bundle([fixture(), fixture()]), now), /répétée/);
  assert.throws(() => inspectSession({ ...fixture(), ticker: 'MNQU6' }, first, now), /invalide/);
  assert.throws(() => inspectSession({ ...fixture(), collectedAt: new Date(first.open * 1000).toISOString() }, first, now), /clôture/);
});
test('CSV normalization handles nanoseconds and next-session overnight bars, rejects pagination and duplicates', async () => {
  const good = fixture();
  const pricesCsv = 'ticker,window_start,session_end_date,open,high,low,close,volume\n' + good.bars.map(([t, ...v]) => `${COLLECTION.ticker},${BigInt(t) * 1000000000n},${good.date},${v.join(',')}`).join('\n') + `\nMNQZ6,${BigInt(first.close + 4 * 3600) * 1000000000n},2026-09-10,100,101,99,100,2\n`;
  const fields = ['product_code', 'trading_venue', 'session_end_date', 'event', 'timestamp'];
  const schedulesCsv = fields.join(',') + '\n' + good.scheduleEvents.map(e => fields.map(f => e[f]).join(',')).join('\n');
  const raw = { date: good.date, collectedAt: good.collectedAt, paginationComplete: true, pricesCsv, schedulesCsv };
  const normalized = await normalizeCapture(raw, now);
  assert.equal(normalized.bars.length, 26); assert.match(normalized.source.rawSha256, /^[a-f0-9]{64}$/);
  await assert.rejects(normalizeCapture({ ...raw, pricesCsv: pricesCsv + 'next_url: more' }, now), /paginée/);
  await assert.rejects(normalizeCapture({ ...raw, pricesCsv: pricesCsv.replaceAll('MNQZ6', 'MNQU6') }, now), /inattendue/);
});
