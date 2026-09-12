import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPPORTUNITY_CENSUS_POLICY,
  buildOpportunityCensus,
  compareCensusToSequential,
  normalizedOpportunityKey
} from '../trading/lab/opportunity-census.mjs';
import { simulateAdmissionOpportunityCensus } from '../trading/lab/jeu23-opportunity-census.mjs';
import { admissionSignals } from '../trading/lab/jeu23-signals.mjs';
import { simulateAdmission } from '../trading/lab/jeu23-engine.mjs';
import { JEU23_PRODUCTS, JEU23_SCENARIOS } from '../trading/lab/jeu23-policy.mjs';

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

test('census normalizes repository epoch-seconds timestamps', () => {
  const seconds = Math.floor(base / 1000);
  const census = buildOpportunityCensus([
    { time: seconds, side: 'Long', family: 'ORB', timeframe: '5m', qualified: true },
    { time: seconds + 120, side: 'Long', family: 'ORB', timeframe: '5m', qualified: true },
    { time: seconds + 600, side: 'Long', family: 'ORB', timeframe: '5m', qualified: true }
  ], { dedupeBars: 1, timeframeMinutes: 5 });
  assert.equal(census.opportunities.length, 2);
  assert.equal(census.rejected.length, 1);
  assert.equal(census.opportunities[0].censusTimeMs, base);
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

function jeu23Fixture(firstLow = 80) {
  const time = Date.parse('2026-01-02T14:30:00Z') / 1000;
  const bars = Array.from({ length: 78 }, (_, index) => ({
    time: time + index * 300,
    day: '2026-01-02',
    minute: 570 + index * 5,
    closeMinute: 960,
    ticker: 'MNQH6',
    open: 110,
    high: 120,
    low: 100,
    close: 110,
    volume: 100
  }));
  Object.assign(bars[6], { open: 118, high: 131, low: 117, close: 130 });
  Object.assign(bars[7], { open: 130, high: 132, low: firstLow, close: 131 });
  Object.assign(bars[8], { open: 131, high: 134, low: 119, close: 133 });
  Object.assign(bars[9], { open: 133, high: 134, low: 132, close: 133.5 });
  Object.assign(bars[10], { open: 133.5, high: 160, low: 133, close: 155 });
  Object.assign(bars[11], { open: 130, high: 132, low: 119, close: 131 });
  return bars;
}

test('JEU23 census keeps same-side opportunities that sequential execution consumes', () => {
  const product = JEU23_PRODUCTS[0];
  const scenario = JEU23_SCENARIOS.find(candidate => candidate.riskPerTrade === 150);
  const period = { start: '2026-01-02', end: '2026-01-04' };
  const bars = jeu23Fixture();
  const signals = admissionSignals(bars, product);

  const sequential = simulateAdmission(bars, signals, scenario, product, period, 1, false);
  const census = simulateAdmissionOpportunityCensus(bars, signals, scenario, product, period, 1);

  assert.equal(signals.size, 2);
  assert.equal(sequential.trades.length, 1);
  assert.ok(sequential.denied.sideLimit > 0);
  assert.equal(census.totalSignals, 2);
  assert.equal(census.totalOpportunities, 2);
  assert.equal(census.maxOpportunitiesInDay, 2);
  assert.equal(census.opportunities.filter(opportunity => Number.isFinite(opportunity.resultR)).length, 2);
});

test('JEU23 census records risk-incompatible opportunities instead of deleting them', () => {
  const product = JEU23_PRODUCTS[0];
  const scenario = JEU23_SCENARIOS.find(candidate => candidate.riskPerTrade === 50);
  const period = { start: '2026-01-02', end: '2026-01-04' };
  const bars = jeu23Fixture();
  const signals = admissionSignals(bars, product);
  const census = simulateAdmissionOpportunityCensus(bars, signals, scenario, product, period, 1);

  assert.equal(census.totalOpportunities, 2);
  assert.ok(census.analyticalOnlyRiskCount >= 1);
  assert.ok(census.tradeableCount >= 1);
  assert.equal(census.tradeableCount + census.analyticalOnlyRiskCount, 2);
});
