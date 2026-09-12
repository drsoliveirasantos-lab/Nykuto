import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MARKET_SCANNER_POLICY,
  classifyScannerSignal,
  classifySundayContext,
  formatNext60mSetupBias,
  h1StrongAligned,
  scanMarketSignals
} from '../trading/lab/market-scanner.mjs';

const baseContext = {
  h1: { direction: 'SELL', structureAligned: true, dmiAligned: true, adx: 26, distanceFromEma20Atr: 1.1 },
  h4: { direction: 'SELL' },
  m15: { direction: 'SELL', score: 5 },
  m1: { score: 1 },
  session: { sundayWindow: false }
};

function signal(overrides = {}) {
  return {
    time: 1_789_000_000 + (overrides.offset || 0),
    day: '2026-09-12',
    side: 'SELL',
    family: 'B/S',
    timeframe: '5m',
    qualified: true,
    riskCompatible: true,
    sessionAllowed: true,
    setupId: overrides.setupId || `S-${overrides.offset || 0}`,
    ...overrides
  };
}

test('scanner contract never uses planActive as a display blocker and has no daily cap', () => {
  assert.equal(MARKET_SCANNER_POLICY.activePlanBlocksSignals, false);
  assert.equal(MARKET_SCANNER_POLICY.maxSignalsPerDay, null);
  const events = Array.from({ length: 12 }, (_, i) => signal({ offset: i * 300, setupId: `X-${i}`, planActive: i > 0 }));
  const result = scanMarketSignals(events, () => baseContext);
  assert.equal(result.signals.length, 12);
  assert.equal(result.stats.maxSignalsInSingleDay, 12);
  assert.equal(result.stats.whilePlanActive, 11);
  assert.ok(result.signals.every(x => x.planActiveBlockedSignal === false));
});

test('a new opposite setup is displayed while another plan is active', () => {
  const events = [
    signal({ setupId: 'A', side: 'BUY', planActive: false }),
    signal({ offset: 300, setupId: 'B', side: 'SELL', planActive: true })
  ];
  const contexts = e => e.side === 'BUY'
    ? { ...baseContext, h1: { ...baseContext.h1, direction: 'BUY' }, h4: { direction: 'BUY' }, m15: { direction: 'BUY', score: 5 } }
    : baseContext;
  const result = scanMarketSignals(events, contexts);
  assert.deepEqual(result.signals.map(x => x.button), ['BUY', 'SELL']);
  assert.equal(result.signals[1].planActiveObserved, true);
});

test('same setup re-emission is suppressed but a distinct setup on the same day survives', () => {
  const events = [
    signal({ setupId: 'PARENT-1' }),
    signal({ offset: 300, setupId: 'PARENT-1', planActive: true }),
    signal({ offset: 600, setupId: 'PARENT-2', planActive: true })
  ];
  const result = scanMarketSignals(events, () => baseContext);
  assert.equal(result.signals.length, 2);
  assert.equal(result.stats.duplicateReemissionsSuppressed, 1);
  assert.deepEqual(result.signals.map(x => x.setupId), ['PARENT-1', 'PARENT-2']);
});

test('risk-incompatible qualified signal stays visible as analytical-only', () => {
  const item = classifyScannerSignal(signal({ setupId: 'RISK', riskCompatible: false, planActive: true }), baseContext);
  assert.equal(item.displaySignal, true);
  assert.equal(item.operational, false);
  assert.equal(item.scannerReason, 'DISPLAY_ANALYTICAL_ONLY');
  assert.ok(item.tags.includes('RISK_WARNING'));
});

test('H1 STRONG plus M15 5/5 can promote the tested relaxed M5 booster', () => {
  assert.equal(h1StrongAligned(baseContext, 'SELL'), true);
  const extra = classifyScannerSignal({
    ...signal({ setupId: 'BOOST', qualified: false }),
    qualified: false,
    bsScore: 10,
    quality: 2
  }, baseContext);
  assert.equal(extra.displaySignal, true);
  assert.equal(extra.signalSource, 'HTF_LTF_BOOSTER');
  assert.ok(extra.tags.includes('H1_STRONG'));
  assert.ok(extra.tags.includes('M15_5_5'));
});

test('relaxed M5 signal is not promoted when H1/M15 strong context is absent', () => {
  const weak = { ...baseContext, h1: { direction: 'SELL', structureAligned: true, dmiAligned: true, adx: 18 }, m15: { direction: 'SELL', score: 4 } };
  const extra = classifyScannerSignal({ ...signal({ setupId: 'NOBOOST', qualified: false }), qualified: false, bsScore: 10, quality: 3 }, weak);
  assert.equal(extra.displaySignal, false);
});

test('H4 and M1 are tags, not universal hard gates', () => {
  const context = { ...baseContext, h4: { direction: 'BUY' }, m1: { score: 0 } };
  const item = classifyScannerSignal(signal({ setupId: 'NO-H4-M1' }), context);
  assert.equal(item.displaySignal, true);
  assert.equal(item.operational, true);
  assert.equal(item.m1WasGate, false);
  assert.ok(!item.tags.includes('H4_PRIME'));
});

test('Sunday first 30 minutes remains visible but is marked WAIT, not silently deleted', () => {
  const context = { ...baseContext, session: { sundayWindow: true, etMinute: 18 * 60 + 10, minutesSinceSundayOpen: 10, gapAtr: 0.8, gapDirection: 'SELL' } };
  const item = classifyScannerSignal(signal({ setupId: 'SUN-WAIT' }), context);
  assert.equal(item.displaySignal, true);
  assert.equal(item.operational, false);
  assert.equal(item.sunday.state, 'SUNDAY_WAIT');
});

test('Sunday gap regimes classify small fill and large continuation safely', () => {
  const small = classifySundayContext({ ...baseContext, session: { sundayWindow: true, etMinute: 19 * 60, minutesSinceSundayOpen: 60, gapAtr: 0.25, gapDirection: 'BUY' } }, 'SELL');
  assert.equal(small.gapRegime, 'GAP_FILL');
  assert.equal(small.favoredSide, 'SELL');
  assert.equal(small.safe, true);
  assert.equal(small.prime, true);

  const large = classifySundayContext({ ...baseContext, session: { sundayWindow: true, etMinute: 19 * 60, minutesSinceSundayOpen: 60, gapAtr: 1.1, gapDirection: 'SELL' } }, 'SELL');
  assert.equal(large.gapRegime, 'GAP_CONTINUATION');
  assert.equal(large.favoredSide, 'SELL');
  assert.equal(large.prime, true);
});

test('extreme Sunday gap waits 60 minutes but still displays the signal', () => {
  const context = { ...baseContext, session: { sundayWindow: true, etMinute: 18 * 60 + 45, minutesSinceSundayOpen: 45, gapAtr: 2.2, gapDirection: 'SELL' } };
  const item = classifyScannerSignal(signal({ setupId: 'EXTREME' }), context);
  assert.equal(item.displaySignal, true);
  assert.equal(item.operational, false);
  assert.equal(item.sunday.state, 'SUNDAY_EXTREME_GAP_WAIT');
});

test('midnight ET is a caution tag, not a hard block', () => {
  const context = { ...baseContext, session: { sundayWindow: true, etMinute: 23 * 60 + 45, minutesSinceSundayOpen: 345, gapAtr: 0.6, gapDirection: 'SELL' } };
  const item = classifyScannerSignal(signal({ setupId: 'MIDNIGHT' }), context);
  assert.equal(item.displaySignal, true);
  assert.equal(item.operational, true);
  assert.equal(item.sunday.midnightCaution, true);
  assert.ok(item.tags.includes('MIDNIGHT_CAUTION'));
});

test('NEXT 60M bias is explicitly setup-direction probability, not win probability', () => {
  const bias = formatNext60mSetupBias(0.714);
  assert.equal(bias.buyPct, 71.4);
  assert.equal(bias.sellPct, 28.6);
  assert.equal(bias.leadingSide, 'BUY');
  assert.equal(bias.meaning, 'NEXT_60M_NYKUTO_SETUP_DIRECTION');
  assert.equal(bias.isWinProbability, false);
  assert.equal(bias.isPriceDirectionProbability, false);
});
