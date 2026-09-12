import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPPORTUNITY_CENSUS_POLICY,
  buildOpportunityCensus,
  compareCensusToSequential,
  normalizedOpportunityKey
} from '../trading/lab/opportunity-census.mjs';

const minute = 60_000;
const base = Date.parse('2026-09-10T13:30:00Z');

test('opportunity census has no daily trade cap and ignores active-plan state', () => {
  assert.equal(OPPORTUNITY_CENSUS_POLICY.maxTradesPerDay, null);
  assert.equal(OPPORTUNITY_CENSUS_POLICY.activePlanBlocksCensus, false);
  assert.equal(OPPORTUNITY_CENSUS_POLICY.overlappingOpportunitiesAllowed, true);

  const events = Array.from({ length: 12 }, (_, index) => ({
    time: base + index * 10 * minute,
    day: '2026-09-10',
    side: index % 2 ? 'SELL' : 'BUY',
    family: index % 3 ? 'B/S' : 'REV',
    timeframe: '5m',
    qualified: true,
    planActive: index > 0
  }));

  const census = buildOpportunityCensus(events, { dedupeBars: 1, timeframeMinutes: 5 });
  assert.equal(census.opportunities.length, 12);
  assert.equal(census.stats.maxInSingleDay, 12);
});

test('dedupe removes repeated emissions of the same setup, not later distinct opportunities', () => {
  const events = [
    { time: base, side: 'BUY', family: 'B/S', timeframe: '5m', qualified: true },
    { time: base + 2 * minute, side: 'BUY', family: 'B/S', timeframe: '5m', qualified: true },
    { time: base + 2 * minute, side: 'SELL', family: 'B/S', timeframe: '5m', qualified: true },
    { time: base + 10 * minute, side: 'BUY', family: 'B/S', timeframe: '5m', qualified: true }
  ];

  const census = buildOpportunityCensus(events, { dedupeBars: 1, timeframeMinutes: 5 });
  assert.equal(census.opportunities.length, 3);
  assert.equal(census.rejected.length, 1);
  assert.equal(census.rejected[0].censusReason, 'DUPLICATE_SETUP_WINDOW');
});

test('sequential comparison reports opportunities hidden by execution state', () => {
  const events = [
    { time: base, side: 'BUY', family: 'B/S', timeframe: '5m', qualified: true },
    { time: base + 10 * minute, side: 'SELL', family: 'REV', timeframe: '5m', qualified: true },
    { time: base + 20 * minute, side: 'BUY', family: 'ORB', timeframe: '5m', qualified: true }
  ];
  const census = buildOpportunityCensus(events, { dedupeBars: 1, timeframeMinutes: 5 });
  const sequentialPlans = [events[0], events[2]];
  const comparison = compareCensusToSequential(census, sequentialPlans);

  assert.equal(comparison.censusCount, 3);
  assert.equal(comparison.sequentialCount, 2);
  assert.equal(comparison.matchedExecutedCount, 2);
  assert.equal(comparison.censusOnlyCount, 1);
  assert.equal(comparison.executionCoverage, 2 / 3);
});

test('opportunity identity is deterministic', () => {
  const event = { time: base, side: 'buy', family: 'rev', timeframe: '15m' };
  assert.equal(normalizedOpportunityKey(event), `BUY|REV|15m|${base}`);
});
