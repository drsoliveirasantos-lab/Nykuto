import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectConfirmation, runConfirmation } from '../trading/lab/mnq-confirmation.mjs';
import { readConfirmation, loadConfirmation } from '../trading/lab/mnq-source.mjs';

function fixture() {
  const calendar = [], bars = [], scheduleEvents = [];
  for (let t = Date.parse('2024-09-09'); t < Date.parse('2024-12-01'); t += 86400000) {
    const date = new Date(t), day = date.toISOString().slice(0, 10);
    if ([0, 6].includes(date.getUTCDay()) || day === '2024-11-28') continue;
    const early = day === '2024-11-29';
    calendar.push({ date: day, open: `${day}T09:30:00`, close: `${day}T${early ? '13' : '16'}:00:00` });
    const start = Date.parse(`${day}T${day >= '2024-11-04' ? '14' : '13'}:30:00Z`) / 1000;
    const count = early ? 14 : 26;
    for (let i = 0; i < count; i++) bars.push([start + i * 900, 100, 101, 99, 100, 1000]);
    for (const [event, seconds] of [['open', start - 3600], ['close', start + count * 900 + 900]]) scheduleEvents.push({ product_code: 'MNQ', trading_venue: 'XCME', session_end_date: day, event, timestamp: new Date(seconds * 1000).toISOString() });
  }
  return { schema: 'jeu07-data-v1', ticker: 'MNQZ4', calendar, bars, scheduleEvents };
}
test('complete prices cannot produce performance when futures schedules are absent or pre-open only', () => {
  const data = fixture(); assert.equal(data.calendar.length, 59); assert.equal(data.bars.length, 1522);
  for (const events of [[], [{ ...data.scheduleEvents[0], event: 'pre_open' }, { ...data.scheduleEvents[0], event: 'pre_open' }]]) {
    const result = runConfirmation({ ...data, scheduleEvents: events });
    assert.equal(result.quality.priceSessions, 59); assert.equal(result.quality.scheduleSessions, 0);
    assert.equal(result.calculated, false); assert.equal(result.normal, null); assert.equal(result.stress, null);
    assert.equal(result.trades.length, 0); assert.equal(result.paperEnabled, false);
  }
});
test('a truncated session or intraday trading pause prevents a confirmation calculation', () => {
  const data = fixture();
  const incomplete = runConfirmation({ ...data, bars: data.bars.slice(1) });
  assert.equal(incomplete.calculated, false); assert.deepEqual(incomplete.quality.missingPriceDays, ['2024-09-09']);
  const day = '2024-10-01';
  data.scheduleEvents.push({ product_code: 'MNQ', trading_venue: 'XCME', session_end_date: day, event: 'paused', timestamp: `${day}T14:00:00Z` });
  const pause = runConfirmation(data); assert.equal(pause.calculated, false); assert.deepEqual(pause.quality.missingScheduleDays, [day]);
  data.scheduleEvents.at(-1).event = 'pcp';
  assert.equal(runConfirmation(data).calculated, false);
});
test('contract identity, tick grid, duplicates and DST time errors are rejected', () => {
  const data = fixture();
  assert.throws(() => inspectConfirmation({ ...data, ticker: 'MNQH5' }), /invalide/);
  const offTick = structuredClone(data); offTick.bars[0][1] = 100.1;
  assert.throws(() => inspectConfirmation(offTick), /invalide/);
  assert.throws(() => inspectConfirmation({ ...data, bars: [...data.bars, data.bars[0]] }), /invalide/);
  const badTime = structuredClone(data); const index = badTime.bars.findIndex(b => b[0] === Date.parse('2024-11-04T14:30:00Z') / 1000); badTime.bars[index][0] -= 3600;
  assert.throws(() => inspectConfirmation(badTime), /hors séance/);
});
test('verified input still cannot certify a bot from one two-month window', () => {
  const result = runConfirmation(fixture());
  assert.equal(result.calculated, true); assert.equal(result.quality.scheduleSessions, 59); assert.equal(result.quality.warmup, 416); assert.equal(result.quality.scoredSessions, 43);
  assert.equal(result.status, 'Confirmation incomplète'); assert.equal(result.checks[0].pass, false); assert.equal(result.paperEnabled, false);
  assert.equal(result.policy.requiredWindows, 3); assert.equal(result.policy.completeWindows, 1);
});
test('integrity and loading failures cannot masquerade as a completed confirmation', async () => {
  await assert.rejects(readConfirmation('{}'), /Taille/);
  await assert.rejects(readConfirmation('{}'.padEnd(86442)), /ne correspond pas/);
  await assert.rejects(loadConfirmation(async () => new Response('', { status: 401 })), /reconnecter/);
  await assert.rejects(loadConfirmation(async () => new Response('<html>login</html>')), /indisponibles/);
  await assert.rejects(loadConfirmation(async () => { throw new TypeError('network'); }), /interrompu/);
});
