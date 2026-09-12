// Nykuto Trading — adaptive per-opportunity risk budget
// Research-only. A $500 ceiling is an absolute maximum, never a default stake.
// The model deliberately ignores current-day PnL throttling in this research
// layer so opportunity potential can be measured separately from account guards.

export const ADAPTIVE_RISK_POLICY = Object.freeze({
  version: 'adaptive-risk-v1',
  researchOnly: true,
  executionAllowed: false,
  absoluteMaxRiskUsd: 500,
  dailyLossThrottle: false,
  edgeForFullRiskR: 0.5,
  evidenceShrinkageN: 100,
  neutralQuality: 0.5,
  riskStepUsd: 5,
  probabilityIsNotQualityScore: true,
  tp1ReachAloneIsNotTerminalWinProbability: true
});

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const cents = value => Math.round(value * 100) / 100;

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function firstFinite(...values) {
  for (const value of values) {
    const number = finite(value);
    if (number !== null) return number;
  }
  return null;
}

function probability(value) {
  const number = finite(value);
  if (number === null) return null;
  const normalized = number > 1 && number <= 100 ? number / 100 : number;
  return normalized >= 0 && normalized <= 1 ? normalized : null;
}

function resolveWinProbability(opportunity) {
  // Only fields that explicitly represent a calibrated terminal/full-trade win
  // probability are accepted. A TP1 reach percentage is intentionally excluded.
  return probability(
    opportunity?.calibratedWinProbability ??
    opportunity?.terminalWinProbability ??
    opportunity?.winProbability
  );
}

function resolveExpectedR(opportunity) {
  const explicit = firstFinite(
    opportunity?.historicalEvR,
    opportunity?.expectancyR,
    opportunity?.expectedR,
    opportunity?.evR
  );
  if (explicit !== null) return { value: explicit, source: 'EMPIRICAL_EV_R' };

  const winProbability = resolveWinProbability(opportunity);
  const rewardR = firstFinite(opportunity?.rewardRisk, opportunity?.rewardR, opportunity?.targetR);
  if (winProbability === null || rewardR === null || rewardR <= 0) return { value: null, source: null };

  // Binary approximation only when the caller explicitly supplies a calibrated
  // terminal win probability paired with the reward multiple. Loss = -1R.
  return {
    value: winProbability * rewardR - (1 - winProbability),
    source: 'CALIBRATED_WIN_PROBABILITY_X_REWARD_R'
  };
}

function resolveEvidenceN(opportunity) {
  const n = firstFinite(opportunity?.evidenceN, opportunity?.sampleSize, opportunity?.sampleN, opportunity?.n);
  return n !== null && n > 0 ? Math.floor(n) : null;
}

function resolveQuality(opportunity) {
  const normalized = firstFinite(opportunity?.qualityNormalized, opportunity?.qualityScoreNormalized);
  if (normalized !== null) return { value: clamp(normalized), source: 'NORMALIZED_QUALITY' };

  const score = firstFinite(opportunity?.qualityScore, opportunity?.quality);
  const maximum = firstFinite(opportunity?.qualityMax, opportunity?.maxQualityScore);
  if (score !== null && maximum !== null && maximum > 0) {
    return { value: clamp(score / maximum), source: 'QUALITY_OVER_MAX' };
  }

  // These labels are quality context only. They never become probabilities.
  if (opportunity?.t5AndCleanV2 === true || opportunity?.t5Clean === true) {
    return { value: 0.95, source: 'T5_CLEAN_QUALITY_CONTEXT' };
  }
  if (opportunity?.cleanV2 === true) return { value: 0.8, source: 'CLEAN_V2_QUALITY_CONTEXT' };
  if (opportunity?.clean === true) return { value: 0.75, source: 'CLEAN_QUALITY_CONTEXT' };

  return { value: ADAPTIVE_RISK_POLICY.neutralQuality, source: 'NEUTRAL_QUALITY_FALLBACK' };
}

function cappedMaximum(requested) {
  const numeric = finite(requested);
  if (numeric === null || numeric <= 0) return ADAPTIVE_RISK_POLICY.absoluteMaxRiskUsd;
  return Math.min(numeric, ADAPTIVE_RISK_POLICY.absoluteMaxRiskUsd);
}

function roundRiskDown(value) {
  const step = ADAPTIVE_RISK_POLICY.riskStepUsd;
  return Math.max(0, Math.floor((value + 1e-9) / step) * step);
}

/**
 * Recommend a fresh-risk budget for one opportunity.
 *
 * Inputs deliberately separate:
 * - empirical expectancy (or calibrated terminal win probability + reward R),
 * - evidence sample size,
 * - setup quality.
 *
 * Current-day PnL is not read here. Account protection remains a separate layer.
 */
export function recommendAdaptiveRisk(opportunity, { maxRiskUsd = ADAPTIVE_RISK_POLICY.absoluteMaxRiskUsd } = {}) {
  const cap = cappedMaximum(maxRiskUsd);
  const ev = resolveExpectedR(opportunity);
  const evidenceN = resolveEvidenceN(opportunity);
  const quality = resolveQuality(opportunity);
  const calibratedWinProbability = resolveWinProbability(opportunity);

  if (ev.value === null || evidenceN === null) {
    return {
      status: 'INSUFFICIENT_EVIDENCE',
      recommendedRiskUsd: 0,
      rawRiskUsd: 0,
      maxRiskUsd: cap,
      expectedR: ev.value === null ? null : cents(ev.value),
      expectedRSource: ev.source,
      calibratedWinProbability,
      evidenceN,
      confidence: evidenceN === null ? null : cents(evidenceN / (evidenceN + ADAPTIVE_RISK_POLICY.evidenceShrinkageN)),
      quality: cents(quality.value),
      qualitySource: quality.source,
      dailyLossThrottleApplied: false
    };
  }

  if (ev.value <= 0) {
    return {
      status: 'BLOCK_NON_POSITIVE_EDGE',
      recommendedRiskUsd: 0,
      rawRiskUsd: 0,
      maxRiskUsd: cap,
      expectedR: cents(ev.value),
      expectedRSource: ev.source,
      calibratedWinProbability,
      evidenceN,
      confidence: cents(evidenceN / (evidenceN + ADAPTIVE_RISK_POLICY.evidenceShrinkageN)),
      quality: cents(quality.value),
      qualitySource: quality.source,
      dailyLossThrottleApplied: false
    };
  }

  const confidence = evidenceN / (evidenceN + ADAPTIVE_RISK_POLICY.evidenceShrinkageN);
  const edgeScore = clamp(ev.value / ADAPTIVE_RISK_POLICY.edgeForFullRiskR);
  const qualityFactor = 0.5 + 0.5 * quality.value;
  const rawRiskUsd = Math.min(cap, cap * edgeScore * confidence * qualityFactor);
  const recommendedRiskUsd = Math.min(cap, roundRiskDown(rawRiskUsd));

  return {
    status: recommendedRiskUsd > 0 ? 'SIZED' : 'EDGE_TOO_SMALL_TO_SIZE',
    recommendedRiskUsd,
    rawRiskUsd: cents(rawRiskUsd),
    maxRiskUsd: cap,
    expectedR: cents(ev.value),
    expectedRSource: ev.source,
    calibratedWinProbability,
    evidenceN,
    confidence: cents(confidence),
    edgeScore: cents(edgeScore),
    quality: cents(quality.value),
    qualitySource: quality.source,
    dailyLossThrottleApplied: false
  };
}

export function sizeAdaptiveContracts(opportunity, recommendation = recommendAdaptiveRisk(opportunity)) {
  const budget = finite(recommendation?.recommendedRiskUsd);
  if (budget === null || budget <= 0) {
    return {
      sizingStatus: 'NO_RISK_BUDGET',
      quantity: 0,
      perContractLossUsd: null,
      plannedLossUsd: 0
    };
  }

  let perContractLossUsd = firstFinite(opportunity?.perContractLossUsd, opportunity?.riskPerContractUsd);
  if (perContractLossUsd === null) {
    const entry = finite(opportunity?.entry);
    const stop = finite(opportunity?.stop);
    const pointValue = finite(opportunity?.pointValue);
    const perContractCostUsd = Math.max(0, firstFinite(opportunity?.perContractCostUsd, opportunity?.costPerContractUsd, 0) ?? 0);
    if (entry !== null && stop !== null && pointValue !== null && pointValue > 0) {
      perContractLossUsd = Math.abs(entry - stop) * pointValue + perContractCostUsd;
    }
  }

  if (perContractLossUsd === null || perContractLossUsd <= 0) {
    return {
      sizingStatus: 'MISSING_CONTRACT_RISK',
      quantity: null,
      perContractLossUsd: null,
      plannedLossUsd: null
    };
  }

  const quantity = Math.max(0, Math.floor((budget + 1e-9) / perContractLossUsd));
  const plannedLossUsd = cents(quantity * perContractLossUsd);
  return {
    sizingStatus: quantity > 0 ? 'TRADEABLE' : 'ANALYTICAL_ONLY_RISK',
    quantity,
    perContractLossUsd: cents(perContractLossUsd),
    plannedLossUsd
  };
}

export function applyAdaptiveRiskSizing(censusOrOpportunities, options = {}) {
  const source = Array.isArray(censusOrOpportunities)
    ? censusOrOpportunities
    : Array.isArray(censusOrOpportunities?.opportunities)
      ? censusOrOpportunities.opportunities
      : [];

  const opportunities = source.map(opportunity => {
    const recommendation = recommendAdaptiveRisk(opportunity, options);
    const sizing = sizeAdaptiveContracts(opportunity, recommendation);
    return {
      ...opportunity,
      adaptiveRisk: { ...recommendation, ...sizing },
      recommendedRiskUsd: recommendation.recommendedRiskUsd,
      adaptiveRiskStatus: recommendation.status,
      adaptiveQuantity: sizing.quantity,
      adaptivePlannedLossUsd: sizing.plannedLossUsd
    };
  });

  const sized = opportunities.filter(item => item.adaptiveRiskStatus === 'SIZED');
  const recommendations = sized.map(item => item.recommendedRiskUsd);
  const statuses = {};
  for (const item of opportunities) statuses[item.adaptiveRiskStatus] = (statuses[item.adaptiveRiskStatus] || 0) + 1;

  return {
    policy: ADAPTIVE_RISK_POLICY,
    opportunities,
    stats: {
      sourceOpportunities: opportunities.length,
      sizedCount: sized.length,
      statusCounts: statuses,
      averageRecommendedRiskUsd: recommendations.length
        ? cents(recommendations.reduce((sum, value) => sum + value, 0) / recommendations.length)
        : 0,
      maxRecommendedRiskUsd: recommendations.length ? Math.max(...recommendations) : 0,
      totalRecommendedRiskUsd: cents(recommendations.reduce((sum, value) => sum + value, 0)),
      dailyLossThrottleApplied: false,
      absoluteMaxRiskUsd: ADAPTIVE_RISK_POLICY.absoluteMaxRiskUsd
    }
  };
}
