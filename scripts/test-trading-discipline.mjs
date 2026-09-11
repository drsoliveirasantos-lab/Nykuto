import test from 'node:test';
import assert from 'node:assert/strict';
import { drawdownScenario, preparationReasons, mergeJournal } from '../trading/discipline/discipline-core.mjs';
import { RETEST_POLICY, runRetest } from '../trading/lab/mnq-retest.mjs';
test('drawdown and recovery use their respective capital bases; losses compound', () => {
  const r = drawdownScenario({ peak: 1000, current: 800, riskPct: 10, losses: 2 });
  assert.ok(Math.abs(r.drawdownPct - 20) < 1e-9); assert.equal(r.recoveryPct, 25); assert.equal(r.after, 648);
  const zero = drawdownScenario({ peak: 1000, current: 0, riskPct: 1, losses: 3 });
  assert.equal(zero.recoveryPct, null); assert.equal(zero.after, 0);
  assert.throws(() => drawdownScenario({ peak: 100, current: 200, riskPct: 1, losses: 3 }));
  assert.throws(() => drawdownScenario({ peak: 100, current: 90, riskPct: 1, losses: 1.5 }));
});
const prep = () => ({ id: 'fixture', createdAt: '2026-09-08T12:00:00Z', asset: 'MNQ', mode: 'manual', side: 'Long', emotion: 'calm', stress: 0, fatigue: 0, fomo: 4, revenge: false, plan: 'Scénario de test', decision: 'consider', checks: { signal: true, stop: true, size: true, acceptLoss: true } });
test('emotional warnings reflect self-report without inventing a trading signal', () => {
  assert.deepEqual(preparationReasons(prep()), ['Forte peur de rater le mouvement']);
  assert.deepEqual(preparationReasons({ ...prep(), fomo: 0 }), []);
  assert.ok(preparationReasons({ ...prep(), revenge: true }).includes('Envie de récupérer une perte'));
});
test('manual result retains existing journal entries and emotions without duplicate insertion', () => {
  const p = { ...prep(), result: { r: -1.2, emotion: 'frustrated', followedPlan: 'partly', closedAt: '2026-09-08T13:00:00Z', note: 'Fixture' } };
  const previous = [{ id: 'previous', asset: 'SPY', r: 1 }], merged = mergeJournal(previous, p);
  assert.equal(previous.length, 1); assert.equal(merged.length, 2); assert.equal(merged[0], previous[0]);
  assert.equal(merged[1].discipline.before, 'calm'); assert.equal(merged[1].discipline.mode, 'manual');
  assert.equal(mergeJournal(merged, p).length, 2);
  assert.throws(() => mergeJournal(merged, { ...p, result: { ...p.result, r: 2 } }), /différent/);
  assert.throws(() => mergeJournal({}, p), /illisible/);
});
test('complete replacement dates permit a short diagnostic but cannot confirm the bot', () => {
  const calendar = RETEST_POLICY.calendarDays.map(date => ({ date, open: `${date}T09:30:00-04:00`, close: `${date}T16:00:00-04:00` }));
  const bars = calendar.flatMap(s => Array.from({ length: 26 }, (_, i) => [Date.parse(s.open) / 1000 + 900 * i, 100, 101, 99, 100, 10]));
  const scheduleEvents = calendar.flatMap(s => [{ event: 'open', timestamp: new Date(Date.parse(s.open) - 15 * 3600000).toISOString() }, { event: 'close', timestamp: new Date(Date.parse(s.close) + 3600000).toISOString() }].map(e => ({ ...e, product_code: 'MNQ', trading_venue: 'XCME', session_end_date: s.date })));
  const bundle = { schema: 'jeu07-data-v1', ticker: 'MNQU6', calendar, bars, scheduleEvents }, r = runRetest(bundle);
  assert.equal(r.calculated, true); assert.equal(r.quality.warmup, 286); assert.equal(r.quality.scoredSessions, 17);
  assert.equal(r.paperEnabled, false); assert.equal(r.checks[0].pass, false); assert.match(r.status, /court/);
  assert.equal(runRetest({ ...bundle, bars: bars.slice(1) }).calculated, false);
  assert.equal(runRetest({ ...bundle, scheduleEvents: [] }).calculated, false);
});
