// Nykuto Trading — Market Scanner research contract
// Research-only. The scanner reports every distinct qualified market setup even
// while another plan/runner is active. It never authorizes an order.

export const MARKET_SCANNER_POLICY = Object.freeze({
  researchOnly: true,
  executionAllowed: false,
  activePlanBlocksSignals: false,
  maxSignalsPerDay: null,
  sameSetupReemissionAllowed: false,
  h1StrongAdxMin: 22,
  m15PerfectScore: 5,
  m15SundayMinScore: 4,
  sundayOpenWaitMinutes: 30,
  sundayGapFillMaxAtr: 0.50,
  sundayGapContinuationMinAtr: 0.75,
  sundayExtremeGapAtr: 2.0,
  sundayExtremeGapWaitMinutes: 60,
  midnightCautionStartMinuteEt: 23 * 60 + 30,
  midnightCautionEndMinuteEt: 30,
  m1Mandatory: false,
  biasMeaning: 'NEXT_60M_NYKUTO_SETUP_DIRECTION',
  biasIsWinProbability: false,
  biasIsPriceDirectionProbability: false
});

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function normalizeScannerSide(value) {
  const side = String(value ?? '').trim().toUpperCase();
  if (side === 'BUY' || side === 'LONG' || side === 'BULL' || side === 'UP') return 'BUY';
  if (side === 'SELL' || side === 'SHORT' || side === 'BEAR' || side === 'DOWN') return 'SELL';
  return '';
}

function opposite(side) {
  return side === 'BUY' ? 'SELL' : side === 'SELL' ? 'BUY' : '';
}

export function h1DirectionAligned(context = {}, sideValue) {
  const side = normalizeScannerSide(sideValue);
  const h1 = context.h1 || {};
  return side !== ''
    && normalizeScannerSide(h1.direction) === side
    && h1.structureAligned === true
    && h1.dmiAligned === true;
}

export function h1StrongAligned(context = {}, sideValue) {
  return h1DirectionAligned(context, sideValue)
    && finite(context?.h1?.adx) !== null
    && Number(context.h1.adx) >= MARKET_SCANNER_POLICY.h1StrongAdxMin;
}

export function m15Aligned(context = {}, sideValue, minScore = MARKET_SCANNER_POLICY.m15PerfectScore) {
  const side = normalizeScannerSide(sideValue);
  const m15 = context.m15 || {};
  return side !== ''
    && normalizeScannerSide(m15.direction) === side
    && finite(m15.score) !== null
    && Number(m15.score) >= minScore;
}

export function classifySundayContext(context = {}, sideValue) {
  const side = normalizeScannerSide(sideValue);
  const session = context.session || {};
  const result = {
    inSundayWindow: session.sundayWindow === true,
    state: 'NORMAL',
    safe: false,
    prime: false,
    gapRegime: 'NONE',
    favoredSide: '',
    midnightCaution: false,
    operational: true,
    reason: 'NORMAL'
  };
  if (!result.inSundayWindow) return result;

  const minuteEt = finite(session.etMinute);
  const gapAtr = Math.abs(finite(session.gapAtr) ?? 0);
  const gapSide = normalizeScannerSide(session.gapDirection);
  const h1Aligned = h1DirectionAligned(context, side);
  const h1Strong = h1StrongAligned(context, side);
  const m15Safe = m15Aligned(context, side, MARKET_SCANNER_POLICY.m15SundayMinScore);

  if (minuteEt !== null) {
    result.midnightCaution = minuteEt >= MARKET_SCANNER_POLICY.midnightCautionStartMinuteEt
      || minuteEt <= MARKET_SCANNER_POLICY.midnightCautionEndMinuteEt;
  }

  if (gapAtr <= MARKET_SCANNER_POLICY.sundayGapFillMaxAtr) {
    result.gapRegime = 'GAP_FILL';
    result.favoredSide = opposite(gapSide);
  } else if (gapAtr < MARKET_SCANNER_POLICY.sundayGapContinuationMinAtr) {
    result.gapRegime = 'GAP_NEUTRAL';
  } else if (gapAtr <= MARKET_SCANNER_POLICY.sundayExtremeGapAtr) {
    result.gapRegime = 'GAP_CONTINUATION';
    result.favoredSide = gapSide;
  } else {
    result.gapRegime = 'GAP_EXTREME';
    result.favoredSide = gapSide;
  }

  const minutesSinceOpen = finite(session.minutesSinceSundayOpen);
  if (minutesSinceOpen !== null && minutesSinceOpen < MARKET_SCANNER_POLICY.sundayOpenWaitMinutes) {
    result.state = 'SUNDAY_WAIT';
    result.operational = false;
    result.reason = 'WAIT_FIRST_30M';
    return result;
  }
  if (result.gapRegime === 'GAP_EXTREME'
      && minutesSinceOpen !== null
      && minutesSinceOpen < MARKET_SCANNER_POLICY.sundayExtremeGapWaitMinutes) {
    result.state = 'SUNDAY_EXTREME_GAP_WAIT';
    result.operational = false;
    result.reason = 'WAIT_FIRST_60M_EXTREME_GAP';
    return result;
  }

  result.safe = h1Aligned && m15Safe;
  const gapAgrees = result.favoredSide === '' || result.favoredSide === side;
  result.prime = result.safe && h1Strong && gapAgrees;
  result.state = result.prime ? 'SUNDAY_PRIME' : result.safe ? 'SUNDAY_SAFE' : 'SUNDAY_CAUTION';
  result.operational = result.safe;
  result.reason = !h1Aligned ? 'H1_NOT_ALIGNED'
    : !m15Safe ? 'M15_NOT_ALIGNED'
      : !gapAgrees ? 'GAP_REGIME_OPPOSES_SIGNAL'
        : result.midnightCaution ? 'MIDNIGHT_CAUTION'
          : result.prime ? 'PRIME' : 'SAFE';
  return result;
}

export function scannerSetupIdentity(event = {}) {
  const explicit = event.setupId ?? event.parentSetupId ?? event.patternId;
  if (explicit !== undefined && explicit !== null && String(explicit) !== '') return String(explicit);
  const side = normalizeScannerSide(event.side);
  const family = String(event.family || event.source || 'UNKNOWN').toUpperCase();
  const timeframe = String(event.timeframe || '5m').toUpperCase();
  const time = finite(event.time ?? event.timestamp ?? event.barTime ?? event.entryTime);
  return time === null ? '' : `${side}|${family}|${timeframe}|${time}`;
}

export function classifyScannerSignal(event = {}, context = {}) {
  const side = normalizeScannerSide(event.side);
  if (!side) return { ...event, displaySignal: false, scannerReason: 'INVALID_SIDE' };

  const baseline = event.mainSignal === true || event.baselineSignal === true || event.qualified === true;
  const relaxedM5 = (finite(event.bsScore) ?? -Infinity) >= 10 || (finite(event.quality) ?? -Infinity) >= 3;
  const booster = !baseline && relaxedM5 && h1StrongAligned(context, side) && m15Aligned(context, side, 5);
  const displaySignal = baseline || booster;
  if (!displaySignal) return { ...event, side, displaySignal: false, scannerReason: 'NO_QUALIFIED_SIGNAL' };

  const sunday = classifySundayContext(context, side);
  const riskCompatible = event.riskCompatible !== false;
  const sessionAllowed = event.sessionAllowed !== false;
  const m1Score = finite(context?.m1?.score);
  const h4Prime = normalizeScannerSide(context?.h4?.direction) === side;
  const extended = finite(context?.h1?.distanceFromEma20Atr) !== null
    && Number(context.h1.distanceFromEma20Atr) > 3;

  const tags = [];
  if (h1StrongAligned(context, side)) tags.push('H1_STRONG');
  else if (h1DirectionAligned(context, side)) tags.push('H1_DIRECTION');
  if (m15Aligned(context, side, 5)) tags.push('M15_5_5');
  else if (m15Aligned(context, side, 4)) tags.push('M15_4_5');
  if (h4Prime) tags.push('H4_PRIME');
  if (extended) tags.push('EXTENDED');
  if (m1Score !== null && m1Score >= 2) tags.push('M1_TIMING');
  if (sunday.inSundayWindow) tags.push(sunday.state);
  if (sunday.midnightCaution) tags.push('MIDNIGHT_CAUTION');
  if (!riskCompatible) tags.push('RISK_WARNING');
  if (event.planActive === true) tags.push('PLAN_ALREADY_ACTIVE');

  const operational = riskCompatible && sessionAllowed && sunday.operational;
  return {
    ...event,
    side,
    setupId: scannerSetupIdentity(event),
    displaySignal: true,
    button: side,
    signalSource: baseline ? 'BASELINE' : 'HTF_LTF_BOOSTER',
    scannerReason: operational ? 'DISPLAY_OPERATIONAL' : 'DISPLAY_ANALYTICAL_ONLY',
    operational,
    planActiveObserved: event.planActive === true,
    planActiveBlockedSignal: false,
    m1WasGate: false,
    tags,
    sunday
  };
}

export function scanMarketSignals(events = [], contextResolver = () => ({}), { dedupeSameSetup = true } = {}) {
  const source = Array.isArray(events) ? [...events] : [];
  source.sort((a, b) => Number(a?.time ?? 0) - Number(b?.time ?? 0));
  const displayed = [];
  const hidden = [];
  const seenSetups = new Set();

  for (const event of source) {
    const context = typeof contextResolver === 'function' ? (contextResolver(event) || {}) : (contextResolver || {});
    const classified = classifyScannerSignal(event, context);
    if (!classified.displaySignal) {
      hidden.push(classified);
      continue;
    }
    if (dedupeSameSetup && classified.setupId && seenSetups.has(classified.setupId)) {
      hidden.push({ ...classified, displaySignal: false, scannerReason: 'SAME_SETUP_REEMISSION' });
      continue;
    }
    if (classified.setupId) seenSetups.add(classified.setupId);
    displayed.push(classified);
  }

  const byDay = new Map();
  for (const item of displayed) {
    const day = String(item.day || 'UNKNOWN');
    byDay.set(day, (byDay.get(day) || 0) + 1);
  }
  return {
    policy: MARKET_SCANNER_POLICY,
    signals: displayed,
    hidden,
    stats: {
      displayed: displayed.length,
      operational: displayed.filter(x => x.operational).length,
      analyticalOnly: displayed.filter(x => !x.operational).length,
      whilePlanActive: displayed.filter(x => x.planActiveObserved).length,
      duplicateReemissionsSuppressed: hidden.filter(x => x.scannerReason === 'SAME_SETUP_REEMISSION').length,
      maxSignalsInSingleDay: byDay.size ? Math.max(...byDay.values()) : 0,
      daily: Object.fromEntries([...byDay.entries()])
    }
  };
}

export function formatNext60mSetupBias(buyProbability) {
  const raw = finite(buyProbability);
  if (raw === null) return null;
  const probability = Math.min(1, Math.max(0, raw));
  const buyPct = Math.round(probability * 1000) / 10;
  const sellPct = Math.round((100 - buyPct) * 10) / 10;
  return {
    horizonMinutes: 60,
    meaning: MARKET_SCANNER_POLICY.biasMeaning,
    buyPct,
    sellPct,
    leadingSide: buyPct > sellPct ? 'BUY' : sellPct > buyPct ? 'SELL' : 'NEUTRAL',
    isWinProbability: false,
    isPriceDirectionProbability: false
  };
}
