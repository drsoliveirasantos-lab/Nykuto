// Called after the completed M5 survived the unchanged stop/target/risk checks.
export function invalidationDecision46(position, bar, targetSymbol) {
  if (position.symbol !== targetSymbol) return null;
  if (!['MNQ', 'MES'].includes(targetSymbol) || !['Long', 'Short'].includes(position.side)
    || position.pattern !== 'orb-retest' || !Number.isSafeInteger(position.entryTime)
    || !Number.isSafeInteger(bar.time) || bar.time % 300 || bar.time < position.entryTime
    || bar.day !== position.day || !Number.isFinite(bar.close) || bar.close <= 0
    || ![position.rangeHigh, position.rangeLow].every(Number.isFinite)
    || !(position.rangeHigh > position.rangeLow && position.rangeLow > 0)) throw Error('Invalid closed invalidation bar');
  const level = position.side === 'Long' ? position.rangeHigh : position.rangeLow;
  const invalidated = position.side === 'Long' ? bar.close < level : bar.close > level;
  return invalidated ? {
    invalidationAt: bar.time + 300, invalidationDecisionAt: bar.time + 300,
    invalidationLevel: level, invalidationClose: bar.close,
  } : null;
}
