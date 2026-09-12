// Nykuto Trading — Opportunity Census
// Research-only utility. Counts distinct market opportunities independently of
// the sequential execution state. It does NOT authorize broker execution.

export const OPPORTUNITY_CENSUS_POLICY = Object.freeze({
  researchOnly: true,
  executionAllowed: false,
  maxTradesPerDay: null,
  overlappingOpportunitiesAllowed: true,
  activePlanBlocksCensus: false
});

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function epochMs(value) {
  const number = finiteNumber(value);
  if (number === null) return null;
  // Research engines in this repository use epoch seconds, while UI/event data
  // can use epoch milliseconds. Normalize both representations for comparison.
  return Math.abs(number) < 1e12 ? number * 1000 : number;
}

export function normalizedOpportunityKey(event) {
  if (!event || typeof event !== 'object') return '';
  const side = String(event.side || '').toUpperCase();
  const family = String(event.family || event.source || 'UNKNOWN').toUpperCase();
  const timeframe = String(event.timeframe || '5m');
  const timeMs = epochMs(event.time ?? event.timestamp ?? event.barTime ?? event.entryTime);
  if (!side || timeMs === null) return '';
  return `${side}|${family}|${timeframe}|${timeMs}`;
}

/**
 * Deduplicate only repeated emissions of the same setup family/direction.
 * This is deliberately NOT a daily trade cap and does not look at planActive.
 *
 * A later same-side opportunity is kept once it is outside the configured
 * de-duplication window, and opposite-side/family opportunities remain eligible.
 */
export function buildOpportunityCensus(events, {
  dedupeBars = 1,
  timeframeMinutes = 5,
  requireQualified = true
} = {}) {
  const windowMs = Math.max(0, Number(dedupeBars) || 0) * Math.max(1, Number(timeframeMinutes) || 5) * 60_000;
  const source = Array.isArray(events) ? events : [];
  const accepted = [];
  const rejected = [];
  const lastBySignature = new Map();

  const sorted = [...source].sort((a, b) => {
    const aMs = epochMs(a?.time ?? a?.timestamp ?? a?.barTime ?? a?.entryTime) ?? 0;
    const bMs = epochMs(b?.time ?? b?.timestamp ?? b?.barTime ?? b?.entryTime) ?? 0;
    return aMs - bMs;
  });

  for (const raw of sorted) {
    const originalTime = finiteNumber(raw?.time ?? raw?.timestamp ?? raw?.barTime ?? raw?.entryTime);
    const timeMs = epochMs(originalTime);
    const side = String(raw?.side || '').toUpperCase();
    const family = String(raw?.family || raw?.source || 'UNKNOWN').toUpperCase();
    const timeframe = String(raw?.timeframe || `${timeframeMinutes}m`);
    const qualified = raw?.qualified !== false;

    if (originalTime === null || timeMs === null || !side) {
      rejected.push({ ...raw, censusReason: 'INVALID_EVENT' });
      continue;
    }
    if (requireQualified && !qualified) {
      rejected.push({ ...raw, censusReason: 'NOT_QUALIFIED' });
      continue;
    }

    const signature = `${side}|${family}|${timeframe}`;
    const previousMs = lastBySignature.get(signature);
    if (previousMs !== undefined && windowMs > 0 && timeMs - previousMs < windowMs) {
      rejected.push({ ...raw, censusReason: 'DUPLICATE_SETUP_WINDOW' });
      continue;
    }

    const opportunity = {
      ...raw,
      time: originalTime,
      censusTimeMs: timeMs,
      side,
      family,
      timeframe,
      censusKey: normalizedOpportunityKey({ ...raw, time: originalTime, side, family, timeframe }),
      censusReason: 'COUNTED'
    };
    accepted.push(opportunity);
    lastBySignature.set(signature, timeMs);
  }

  return {
    policy: OPPORTUNITY_CENSUS_POLICY,
    opportunities: accepted,
    rejected,
    stats: summarizeOpportunityCensus(accepted, rejected)
  };
}

export function summarizeOpportunityCensus(opportunities, rejected = []) {
  const accepted = Array.isArray(opportunities) ? opportunities : [];
  const byDay = new Map();
  const bySide = { BUY: 0, SELL: 0, LONG: 0, SHORT: 0 };
  const byFamily = {};

  for (const item of accepted) {
    const side = String(item.side || '').toUpperCase();
    if (side in bySide) bySide[side] += 1;
    const family = String(item.family || 'UNKNOWN').toUpperCase();
    byFamily[family] = (byFamily[family] || 0) + 1;
    const timeMs = item.censusTimeMs ?? epochMs(item.time ?? item.timestamp ?? item.barTime ?? item.entryTime);
    const day = item.day || (timeMs === null ? 'UNKNOWN' : new Date(timeMs).toISOString().slice(0, 10));
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }

  const dailyCounts = [...byDay.values()];
  return {
    totalOpportunities: accepted.length,
    rejectedCount: Array.isArray(rejected) ? rejected.length : 0,
    daysWithOpportunities: byDay.size,
    averagePerActiveDay: byDay.size ? accepted.length / byDay.size : 0,
    maxInSingleDay: dailyCounts.length ? Math.max(...dailyCounts) : 0,
    bySide,
    byFamily,
    daily: Object.fromEntries([...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)))
  };
}

/**
 * Compare the independent census with a sequential execution stream.
 * `sequentialPlans` should contain the plans actually admitted by the execution
 * state machine. Missing opportunities are reported, not silently discarded.
 */
export function compareCensusToSequential(census, sequentialPlans = []) {
  const opportunities = Array.isArray(census?.opportunities) ? census.opportunities : [];
  const sequential = Array.isArray(sequentialPlans) ? sequentialPlans : [];
  const executedKeys = new Set(sequential.map(normalizedOpportunityKey).filter(Boolean));
  const executed = [];
  const notExecuted = [];

  for (const opportunity of opportunities) {
    if (executedKeys.has(opportunity.censusKey)) executed.push(opportunity);
    else notExecuted.push(opportunity);
  }

  return {
    censusCount: opportunities.length,
    sequentialCount: sequential.length,
    matchedExecutedCount: executed.length,
    censusOnlyCount: notExecuted.length,
    executionCoverage: opportunities.length ? executed.length / opportunities.length : 0,
    executed,
    censusOnly: notExecuted
  };
}
