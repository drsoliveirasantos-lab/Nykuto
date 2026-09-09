import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMarketProfileRegistry, selectResearchProfile, inspectProfileIntent, STRATEGY_OPTIONS } from '../trading/lab/market-profile-registry.mjs';
import { assessAccountRisk, reserveResearchRisk } from '../trading/lab/account-risk-supervisor.mjs';

const buffers = Object.fromEntries(await Promise.all([23, 26, 27, 28].map(async g => [g, await readFile(new URL(`../trading/lab/jeu${g}-report.json`, import.meta.url))])));
const registry = await createMarketProfileRegistry(buffers);
const state = (patch = {}) => ({ accountId: 'research-test', session: '2026-01-02', revision: 0,
  balanceUSD: 25000, dayStartUSD: 25000, floorUSD: 24000, entriesToday: 0, lossStreak: 0,
  realizedR: 0, commitments: [], ...patch });
const intent = (patch = {}) => ({ accountId: 'research-test', session: '2026-01-02', expectedRevision: 0,
  id: 'proposal-1', symbol: 'MNQ', side: 'Long', quantity: 1, costFactor: 1, entry: 20000, stop: 19960, ...patch });

test('each market keeps its own explicit research focus and exact archived results', () => {
  assert.deepEqual(registry.markets.map(m => [m.symbol, m.focus]), [['MNQ', 'protect'], ['MES', 'base'], ['MYM', 'protect'], ['MGC', 'failure']]);
  assert.deepEqual(registry.markets.map(m => selectResearchProfile(registry, m.symbol).normal.netUSD), [931.5, -206.25, -213, 636.5]);
  for (const market of registry.markets) for (const option of STRATEGY_OPTIONS) {
    const profile = selectResearchProfile(registry, market.symbol, option.key);
    const archived = JSON.parse(buffers[option.game]).results.find(x => x.id === `${market.symbol}/${option.scenario}`);
    assert.equal(profile.normal.netUSD, archived.diagnostic.normal.net);
    assert.equal(profile.stress.netUSD, archived.diagnostic.stress.net);
    assert.equal(profile.normal.trades, archived.diagnostic.normal.trades);
    assert.deepEqual(profile.windows.map(w => [w.observed, w.expected]), archived.windows.map(w => [w.scored, w.expected]));
    assert.equal(profile.available, true); assert.equal(profile.executionAllowed, false);
  }
});

test('viewing another market strategy cannot change any other focus, activate execution or add trials', () => {
  const before = JSON.stringify(registry);
  assert.equal(selectResearchProfile(registry, 'MNQ', 'base').normal.netUSD, 887.5);
  assert.equal(selectResearchProfile(registry, 'MGC').game, 26);
  assert.equal(JSON.stringify(registry), before); assert.equal(registry.newTrials, 0);
  assert.equal(registry.historicalTrials, 65); assert.equal(registry.independentConfirmations, 0);
  assert.ok(registry.markets.every(m => m.executionStrategyId === null));
  assert.throws(() => { registry.markets[0].focus = 'base'; }, TypeError);
  assert.throws(() => selectResearchProfile(JSON.parse(before), 'MNQ'), /Unverified/);
  assert.throws(() => selectResearchProfile(registry, 'MNQ', 'MGC/failure'), /Unknown/);
});

test('a damaged report disables its alternatives without falling back or hiding other verified markets', async () => {
  const damaged = Buffer.from(buffers[28]); damaged[0] = 88;
  const partial = await createMarketProfileRegistry({ ...buffers, 28: damaged });
  assert.equal(selectResearchProfile(partial, 'MNQ').status, 'unavailable');
  assert.equal(selectResearchProfile(partial, 'MYM').status, 'unavailable');
  assert.equal(selectResearchProfile(partial, 'MES').normal.netUSD, -206.25);
  assert.equal(selectResearchProfile(partial, 'MGC').normal.netUSD, 636.5);
  assert.equal(selectResearchProfile(partial, 'MNQ', 'base').available, true);
  const absent = await createMarketProfileRegistry({});
  assert.ok(absent.markets.every(m => m.alternatives.every(a => !a.available && !a.executionAllowed)));
});

test('a positive total and successful risk check never authorize an unqualified research profile', () => {
  const decision = inspectProfileIntent(registry, 'MNQ', 'protect', state(), intent());
  assert.equal(decision.risk.riskPassed, true); assert.equal(decision.executionAllowed, false);
  assert.equal(decision.reason, 'research-profile-unqualified');
  assert.equal(inspectProfileIntent(registry, 'MGC', 'failure', state(), intent()).reason, 'profile-market-mismatch');
});

test('risk uses each contract multiplier and tick costs, symmetrically and under doubled costs', () => {
  for (const [symbol, distance, normal, stress] of [['MNQ', 20, 43.5, 47], ['MES', 20, 105, 110], ['MYM', 20, 13.5, 17], ['MGC', 10, 104.5, 109]]) {
    for (const side of ['Long', 'Short']) for (const factor of [1, 2]) {
      const result = assessAccountRisk(state(), intent({ symbol, side, stop: 20000 + (side === 'Long' ? -distance : distance), costFactor: factor }));
      assert.equal(result.riskPassed, true); assert.equal(result.riskUSD, factor === 1 ? normal : stress);
      assert.equal(result.executionAllowed, false);
    }
  }
});

test('global loss and floor headroom are shared across symbols with an exact admissible boundary', () => {
  const s = state({ balanceUSD: 24750 });
  assert.equal(assessAccountRisk(s, intent()).reason, 'daily-budget');
  assert.equal(assessAccountRisk(s, intent({ symbol: 'MGC', entry: 2500, stop: 2490 })).reason, 'daily-budget');
  const exact = assessAccountRisk(state({ balanceUSD: 24783.5 }), intent());
  assert.equal(exact.dailyRemainingUSD, 83.5); assert.equal(exact.riskPassed, true);
  assert.equal(assessAccountRisk(state({ balanceUSD: 24783.49 }), intent()).reason, 'daily-budget');
  assert.equal(assessAccountRisk(state({ balanceUSD: 24150, dayStartUSD: 24150 }), intent()).reason, 'floor-reserve');
  assert.equal(assessAccountRisk(state({ balanceUSD: 24000, dayStartUSD: 24000 }), intent()).reason, 'account-floor');
});

test('pending reservations consume shared headroom and block another market without mutating the source', () => {
  const original = state(), first = reserveResearchRisk(original, intent());
  assert.equal(original.commitments.length, 0); assert.equal(original.revision, 0);
  assert.equal(first.state.revision, 1); assert.equal(first.state.commitments[0].riskUSD, 83.5);
  const secondIntent = intent({ expectedRevision: 1, id: 'proposal-2', symbol: 'MES', entry: 5000, stop: 4980 });
  const second = reserveResearchRisk(first.state, secondIntent);
  assert.equal(second.reason, 'position-or-pending'); assert.equal(second.reservedUSD, 83.5);
  assert.equal(second.dailyRemainingUSD, 216.5); assert.equal(second.state, first.state);
  assert.equal(second.executionAllowed, false);
  const tight = state({ balanceUSD: 24800, commitments: first.state.commitments });
  assert.equal(assessAccountRisk(tight, intent({ id: 'proposal-3' })).reason, 'daily-budget');
});

test('stale revisions, duplicate pending IDs, cross-account and prior-session intents fail closed', () => {
  const first = reserveResearchRisk(state(), intent());
  assert.equal(reserveResearchRisk(first.state, intent({ id: 'proposal-2' })).reason, 'stale-revision');
  assert.equal(reserveResearchRisk(first.state, intent({ expectedRevision: 1 })).reason, 'duplicate-intent');
  assert.equal(assessAccountRisk(state(), intent({ accountId: 'another-account' })).reason, 'account-or-session-mismatch');
  assert.equal(assessAccountRisk(state(), intent({ session: '2026-01-01' })).reason, 'account-or-session-mismatch');
  assert.equal(assessAccountRisk(state({ revision: Number.MAX_SAFE_INTEGER }), intent()).reason, 'invalid-state');
});

test('daily entry and loss brakes apply to all market profiles and cannot be overridden by intent', () => {
  for (const symbol of ['MNQ', 'MES', 'MYM', 'MGC']) {
    const proposal = intent({ symbol, stop: 19990, dailyLossUSD: 10000, perTradeUSD: 10000 });
    assert.equal(assessAccountRisk(state({ entriesToday: 2 }), proposal).reason, 'daily-entry-limit');
    assert.equal(assessAccountRisk(state({ lossStreak: 2 }), proposal).reason, 'daily-brake');
    assert.equal(assessAccountRisk(state({ realizedR: -2 }), proposal).reason, 'daily-brake');
  }
  assert.equal(assessAccountRisk(state(), intent({ stop: 19900, perTradeUSD: 10000 })).reason, 'trade-risk');
  assert.equal(assessAccountRisk(state(), intent({ quantity: 2 })).reason, 'invalid-intent');
});

test('invalid quotes, unsupported instruments and malformed commitments cannot understate risk', () => {
  for (const patch of [{ entry: null }, { entry: NaN }, { stop: 0 }, { stop: 19960.1 }, { entry: '20000' }]) {
    assert.equal(assessAccountRisk(state(), intent(patch)).reason, 'invalid-price-grid');
  }
  assert.equal(assessAccountRisk(state(), intent({ stop: 20001 })).reason, 'invalid-stop-side');
  assert.equal(assessAccountRisk(state(), intent({ symbol: 'NQ' })).reason, 'invalid-intent');
  assert.equal(assessAccountRisk(state(), intent({ costFactor: 0 })).reason, 'invalid-intent');
  for (const commitments of [[{ id: 'p', symbol: 'MNQ', status: 'pending', riskUSD: -10 }],
    [{ id: 'p', symbol: 'MNQ', status: 'pending', riskUSD: 10 }, { id: 'p', symbol: 'MES', status: 'position', riskUSD: 10 }]]) {
    assert.equal(assessAccountRisk(state({ commitments }), intent()).reason, 'invalid-state');
  }
  assert.equal(assessAccountRisk(state({ session: '2026-02-31' }), intent()).reason, 'invalid-state');
});
