import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PROJECT_STATUS as status } from '../trading/suivi/status-data.mjs';

test('project status preserves the reviewed V15.1.1 census and execution boundary', () => {
  assert.equal(status.schema, 'nykuto-trading-project-status-v1');
  assert.equal(status.pine.version, 'NYKUTO V15.1.1 PRO · Partner Clean');
  assert.equal(status.pine.executionAllowed, false);
  assert.equal(status.dataset.bars, 132650);
  assert.equal(status.dataset.opportunities, 11545);
  assert.equal(status.dataset.tiers.reduce((sum, tier) => sum + tier.n, 0), 11545);
  const weightedTp1 = status.dataset.tiers.reduce((sum, tier) => sum + tier.n * tier.tp1Pct, 0) / status.dataset.opportunities;
  assert.ok(Math.abs(weightedTp1 - status.dataset.overallTp1Pct) < 0.01);
});

test('Time-Pace totals and exact-union checklist remain explicit', () => {
  const totalFor = tier => status.timePace.results.filter(row => row.tier === tier).reduce((sum, row) => sum + row.n, 0);
  assert.equal(totalFor('CORE'), 462);
  assert.equal(totalFor('POWER'), 337);
  assert.equal(totalFor('CONFIRMED ★★'), 164);
  assert.equal(status.nextTest.id, 'v151-time-pace-exact-union');
  assert.equal(status.nextTest.state, 'pending');
  assert.equal(status.nextTest.steps.length, 8);
  assert.match(status.nextTest.dedupeRule, /setup parent/i);
});

test('status page and shared navigation expose Suivi without claiming activation', async () => {
  const [html, navigation] = await Promise.all([
    readFile(new URL('../trading/suivi/index.html', import.meta.url), 'utf8'),
    readFile(new URL('../trading/navigation.js', import.meta.url), 'utf8')
  ]);
  assert.match(html, /Où en est réellement Nykuto Trading/);
  assert.match(html, /Exécution OFF/);
  assert.match(html, /id="nextTestSteps"/);
  assert.match(navigation, /\['\/suivi\/',\s*'Suivi'\]/);
  assert.ok(status.boundaries.some(item => /Paper Bot OFF et Shadow OFF/.test(item)));
});
