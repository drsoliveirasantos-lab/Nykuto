import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { executionDiagnostics, compareExecutionDiagnostics, uniqueChangedOpportunities } from '../trading/lab/research-execution-diagnostics.mjs';
import { comparePreparedResearchBot, compareResearchBotMonth, RESEARCH_BOT } from '../trading/lab/research-bot.mjs';
import { simulateConfidencePortfolio as original } from '../trading/lab/jeu40-engine.mjs';

const t0 = Date.parse('2026-06-01T14:10Z') / 1000;
function trade(netDollars, index = 0, extra = {}) {
  return { symbol: 'MNQ', ticker: 'MNQM6', side: 'Long', entryTime: t0 + index * 3600,
    exitTime: t0 + index * 3600 + 300, entry: 100, exit: 100 + (netDollars + 4) / 2,
    quantity: 1, costDollars: 4, netDollars, reason: 'Stop', ambiguous: false, ...extra };
}
function fixture(symbol = 'MNQ', side = 'Long') {
  const day = '2026-06-01', start = t0 - 2400, sign = side === 'Long' ? 1 : -1;
  const streams = ['MES', 'MGC', 'MNQ', 'MYM'].map(symbol => ({ symbol, signals: new Map(),
    candles: Array.from({ length: 78 }, (_, i) => ({ time: start + i * 300, day, minute: 570 + i * 5,
      closeMinute: 960, ticker: symbol + 'M6', open: 100, high: 101, low: 99, close: 100 })) }));
  const stream = streams.find(s => s.symbol === symbol);
  stream.signals.set(t0, { day, side, signalOpen: t0 - 300, signalClose: t0, rangeClosedAt: start + 1800,
    breakoutAt: start + 2100, trendClosedAt: start + 1800, rangeHigh: sign === 1 ? 99 : 111,
    rangeLow: sign === 1 ? 89 : 101, stopPrice: 100 - sign * 10, pattern: 'orb-retest' });
  const later = stream.candles.find(b => b.time === t0 + 2100);
  Object.assign(later, side === 'Long' ? { high: 121, close: 120 } : { low: 79, close: 80 });
  return { streams, contexts: new Map(), period: { start: day, end: '2026-06-02' } };
}

test('development comparison always includes both costs, exact reference and only the MNQ exit', () => {
  for (const symbol of ['MNQ', 'MES']) for (const side of ['Long', 'Short']) {
    const f = fixture(symbol, side), before = structuredClone(f);
    const r = comparePreparedResearchBot(f.streams, f.contexts, f.period);
    for (const [cost, factor] of [['normal', 1], ['stress', 2]]) {
      assert.deepEqual(r[cost].reference, original(f.streams, f.contexts, f.period, factor));
      if (symbol === 'MES') assert.deepEqual(r[cost].candidate, r[cost].reference);
      else {
        assert.equal(r[cost].candidate.trades[0].reason, 'Time exit 30m');
        assert.equal(r[cost].diagnostics.attribution.sacrificedWinners, 1);
        assert.ok(r[cost].candidate.trades[0].riskCapUSD <= 100);
        assert.equal(r[cost].candidate.trades[0].targetDistance, 2 * r[cost].candidate.trades[0].risk);
      }
      assert.equal(r[cost].candidate.executionAllowed, false);
    }
    assert.deepEqual(f, before, 'Input streams must not be changed');
  }
});

test('future data cannot be relabelled as an existing development month', () => {
  assert.throws(() => compareResearchBotMonth({}, {}, 'september'), /own protocol/);
  assert.equal(RESEARCH_BOT.selection, null);
  assert.equal(RESEARCH_BOT.confirmed, false);
  assert.equal(Object.isFrozen(RESEARCH_BOT), true);
});

test('cost and loss diagnostics reconcile and empty observations stay unknown', () => {
  const rows = [trade(20), trade(-10, 1, { exitTime: t0 + 3600, ambiguous: true }), trade(0, 2)];
  const r = executionDiagnostics(rows);
  assert.equal(r.netUSD, 10); assert.equal(r.grossBalanceUSD, 22); assert.equal(r.modeledCostsUSD, 12);
  assert.equal(r.breakEvenWinRateAmongNonflat, 1 / 3); assert.equal(r.observedWinRateAmongNonflat, 1 / 2);
  assert.equal(r.entryBarLosses, 1); assert.equal(r.ambiguousExits, 1);
  assert.equal(executionDiagnostics([]).meanNetUSD, null);
  assert.equal(executionDiagnostics([trade(20)]).breakEvenWinRateAmongNonflat, null);
  assert.equal(r.latencyObserved, false);
});

test('diagnostic refuses duplicates, bad clocks, nonfinite metrics and inconsistent prices', () => {
  for (const rows of [[trade(1), trade(1)], [trade(1, 0, { quantity: 0 })], [trade(1, 0, { costDollars: NaN })],
    [trade(1, 0, { exitTime: t0 - 300 })], [trade(1, 0, { exit: 102 })]]) assert.throws(() => executionDiagnostics(rows));
});

test('all portfolio effects reconcile including removed winners and new losers', () => {
  const reference = [trade(20), trade(-10, 1)], candidate = [trade(-5, 1), trade(-7, 2)];
  const r = compareExecutionDiagnostics(reference, candidate);
  assert.equal(r.deltaUSD, -22); assert.equal(r.attribution.commonDeltaUSD, 5);
  assert.equal(r.attribution.removedNetUSD, 20); assert.equal(r.attribution.addedNetUSD, -7);
  assert.equal(r.attribution.removedWinners, 1); assert.equal(r.attribution.addedLosers, 1);
  assert.equal(r.concentration.arithmeticDeltaWithoutLargestImprovementUSD, null);
});

test('concentration deduplicates cost paths and never claims an independent observation', () => {
  const reference = [trade(-10), trade(-20, 1)], candidate = [trade(-5), trade(-10, 1)];
  const r = compareExecutionDiagnostics(reference, candidate);
  assert.equal(r.deltaUSD, 15); assert.equal(r.concentration.largestImprovementShare, 2 / 3);
  assert.equal(r.concentration.arithmeticDeltaWithoutLargestImprovementUSD, 5);
  assert.equal(uniqueChangedOpportunities([{ reference, candidate }, { reference, candidate }]), 2);
  assert.equal(r.concentration.independentEvidence, false); assert.equal(r.selection, null);
  assert.equal(compareExecutionDiagnostics(reference, reference).concentration.largestImprovementShare, null);
});

test('changed quantities cannot be presented as an isolated exit benefit', () => {
  const reference = [trade(20)];
  const candidate = [trade(44, 0, { quantity: 2, exit: 112 })];
  const r = compareExecutionDiagnostics(reference, candidate);
  assert.equal(r.concentration.sameEntriesAndSizing, false);
  assert.equal(r.concentration.arithmeticDeltaWithoutLargestImprovementUSD, null);
});

test('published evidence remains descriptive and agrees with the verified Game45 totals', () => {
  const evidence = JSON.parse(readFileSync('trading/lab/research-bot-evidence.json'));
  const verified = JSON.parse(readFileSync('trading/lab/jeu45-summary.json'));
  assert.equal(evidence.source.sha256, verified.sourceOutputs['runs-private.json'].sha256);
  assert.equal(evidence.uniqueChangedOpportunitiesAcrossCosts, 2);
  assert.equal(evidence.newPerformanceRuns, 0); assert.equal(evidence.independentObservationsAdded, 0);
  for (const cost of ['normal', 'stress']) {
    const r = evidence.costs[cost];
    assert.equal(r.deltaUSD, 91); assert.equal(r.attribution.improvedCommonTrades, 2);
    assert.equal(r.attribution.sacrificedWinners, 0);
    assert.equal(r.concentration.arithmeticDeltaWithoutLargestImprovementUSD, 37.5);
    assert.equal(r.months.length, 8);
    assert.equal(r.reference.netUSD, verified.variants.baseline.costs[cost].tradeStatistics.net);
    assert.equal(r.candidate.netUSD, verified.variants['mnq-time-exit30'].costs[cost].tradeStatistics.net);
  }
});
