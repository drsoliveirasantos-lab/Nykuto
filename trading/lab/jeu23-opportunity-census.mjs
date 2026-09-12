import { openingTerms } from './jeu22-engine.mjs';
import { JEU15_POLICY as SESSION_POLICY } from './jeu15-policy.mjs';
import { JEU23_PRODUCTS, JEU23_SCENARIOS } from './jeu23-policy.mjs';
import { riskFill, riskProfile } from './jeu23-risk.mjs';
import { buildOpportunityCensus } from './opportunity-census.mjs';

const cents = number => Math.round(number * 100) / 100;
const validProduct = product => JEU23_PRODUCTS.some(candidate =>
  candidate.symbol === product.symbol &&
  candidate.tick === product.tick &&
  candidate.multiplier === product.multiplier &&
  candidate.fees === product.fees
);

function validatePolicy(scenario, product, costFactor) {
  if (![1, 2].includes(costFactor) || !validProduct(product)) throw new Error('Invalid opportunity census policy');
  if (!JEU23_SCENARIOS.some(candidate => candidate.id === scenario.id && scenario.guarded === true)) throw new Error('Invalid opportunity census scenario');
  return riskProfile(scenario);
}

function independentOutcome(candles, startIndex, position, product, riskPolicy) {
  const entryDay = candles[startIndex].day;
  for (let index = startIndex; index < candles.length; index += 1) {
    const bar = candles[index];
    if (bar.day !== entryDay) break;

    if (bar.minute >= bar.closeMinute - SESSION_POLICY.exitBeforeClose) {
      const fill = riskFill(product, position, { ...bar, high: bar.open, low: bar.open }, 0, 0, 0, false, false, riskPolicy)
        || { price: bar.open, reason: 'Session close', ambiguous: false };
      return { fill, exitTime: bar.time };
    }

    // Opportunity outcomes intentionally ignore account state, daily loss limits,
    // other open positions and daily trade counts. They retain the same stop /
    // target geometry and conservative same-candle ordering.
    const fill = riskFill(product, position, bar, 0, 0, 0, false, false, riskPolicy);
    if (fill) return { fill, exitTime: bar.time };
  }

  const last = candles.slice(startIndex).findLast(bar => bar.day === entryDay);
  return last
    ? { fill: { price: last.close, reason: 'End of data/session', ambiguous: false }, exitTime: last.time }
    : null;
}

/**
 * Evaluate every causal JEU23 admission signal independently.
 *
 * This is an Opportunity Census, NOT an account replay:
 * - no max trades/day;
 * - no one-trade-per-side/day consumption;
 * - no active-position blocking;
 * - no loss-streak or daily-PnL suppression;
 * - overlapping opportunities are evaluated independently.
 *
 * Per-trade geometry and the configured single-trade risk cap are still
 * reported so the census can distinguish analytical opportunities from ones
 * that are executable under the selected risk profile.
 */
export function simulateAdmissionOpportunityCensus(candles, signals, scenario, product, { start, end }, costFactor = 1) {
  const riskPolicy = validatePolicy(scenario, product, costFactor);
  if (!(signals instanceof Map)) throw new Error('Opportunity census requires a signal Map');

  const bars = candles.filter(bar => bar.day >= start && bar.day < end);
  const indexByTime = new Map(bars.map((bar, index) => [bar.time, index]));
  const rawEvents = [];

  for (const [signalTime, signal] of signals) {
    if (signal.day < start || signal.day >= end) continue;
    rawEvents.push({
      time: signalTime,
      day: signal.day,
      side: signal.side,
      family: signal.pattern || 'admission',
      timeframe: '5m',
      qualified: true,
      signal
    });
  }

  // JEU23 admissionSignals already emits discrete completed retests. Therefore
  // dedupeBars=0 preserves every candidate instead of imposing another cooldown.
  const census = buildOpportunityCensus(rawEvents, { dedupeBars: 0, timeframeMinutes: 5 });
  const opportunities = [];
  const blocked = {};

  for (const event of census.opportunities) {
    const signal = event.signal;
    const index = indexByTime.get(event.time);
    if (index === undefined) {
      blocked.missingEntryBar = (blocked.missingEntryBar || 0) + 1;
      opportunities.push({ ...event, status: 'BLOCKED', blocked: 'missingEntryBar' });
      continue;
    }

    const bar = bars[index];
    if (signal.day !== bar.day || signal.signalClose !== bar.time || signal.signalOpen >= signal.signalClose || (signal.trendClosedAt !== undefined && signal.trendClosedAt > bar.time)) {
      throw new Error('Noncausal opportunity signal');
    }

    if (bar.minute >= bar.closeMinute - SESSION_POLICY.exitBeforeClose) {
      blocked.sessionCloseWindow = (blocked.sessionCloseWindow || 0) + 1;
      opportunities.push({ ...event, status: 'BLOCKED', blocked: 'sessionCloseWindow' });
      continue;
    }

    const decision = openingTerms(signal, bar.open, bar.time, product, costFactor);
    if (decision.blocked) {
      blocked[decision.blocked] = (blocked[decision.blocked] || 0) + 1;
      opportunities.push({ ...event, status: 'BLOCKED', blocked: decision.blocked });
      continue;
    }

    const terms = decision.terms;
    const singleTradeLoss = cents(terms.riskDollars + terms.costDollars);
    const riskTradeable = singleTradeLoss <= riskPolicy.riskPerTrade;
    const sign = signal.side === 'Long' ? 1 : -1;
    const position = {
      ticker: bar.ticker,
      side: signal.side,
      day: bar.day,
      entryTime: bar.time,
      entry: bar.open,
      signalOpen: signal.signalOpen,
      signalClose: signal.signalClose,
      trendClosedAt: signal.trendClosedAt ?? null,
      rangeClosedAt: signal.rangeClosedAt,
      rangeHigh: signal.rangeHigh,
      rangeLow: signal.rangeLow,
      breakoutAt: signal.breakoutAt,
      stopPrice: signal.stopPrice,
      pattern: signal.pattern,
      ...terms,
      stop: cents(bar.open - sign * terms.risk),
      target: cents(bar.open + sign * terms.targetDistance)
    };

    const outcome = independentOutcome(bars, index, position, product, riskPolicy);
    if (!outcome) {
      blocked.noOutcome = (blocked.noOutcome || 0) + 1;
      opportunities.push({ ...event, ...position, riskTradeable, status: 'NO_OUTCOME' });
      continue;
    }

    const { fill, exitTime } = outcome;
    const netDollars = cents(sign * (fill.price - position.entry) * product.multiplier - position.costDollars);
    const resultR = netDollars / position.riskDollars;
    opportunities.push({
      ...event,
      ...position,
      riskTradeable,
      singleTradeLoss,
      status: riskTradeable ? 'TRADEABLE' : 'ANALYTICAL_ONLY_RISK',
      exitTime,
      exit: fill.price,
      reason: fill.reason,
      ambiguous: !!fill.ambiguous,
      resultR,
      netDollars,
      targetReached: String(fill.reason).startsWith('Target')
    });
  }

  const byDay = {};
  for (const opportunity of opportunities) byDay[opportunity.day] = (byDay[opportunity.day] || 0) + 1;
  const tradeable = opportunities.filter(opportunity => opportunity.status === 'TRADEABLE');
  const analytical = opportunities.filter(opportunity => opportunity.status === 'ANALYTICAL_ONLY_RISK');
  const resolved = opportunities.filter(opportunity => Number.isFinite(opportunity.resultR));

  return {
    policy: census.policy,
    scenario: scenario.id,
    totalSignals: rawEvents.length,
    totalOpportunities: opportunities.length,
    tradeableCount: tradeable.length,
    analyticalOnlyRiskCount: analytical.length,
    resolvedCount: resolved.length,
    targetReachedCount: resolved.filter(opportunity => opportunity.targetReached).length,
    positiveCount: resolved.filter(opportunity => opportunity.resultR > 0).length,
    blocked,
    maxOpportunitiesInDay: Object.keys(byDay).length ? Math.max(...Object.values(byDay)) : 0,
    averagePerActiveDay: Object.keys(byDay).length ? opportunities.length / Object.keys(byDay).length : 0,
    byDay,
    opportunities
  };
}
