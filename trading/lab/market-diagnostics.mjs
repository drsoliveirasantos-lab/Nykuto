// Descriptive audit only: never creates signals, filters or orders.
import assert from 'node:assert/strict';
export const round = (n, places = 4) => n === null ? null : Math.round(n * 10 ** places) / 10 ** places;
const average = a => a.length ? a.reduce((n, x) => n + x, 0) / a.length : null;
const median = a => { const s = [...a].sort((a, b) => a - b), n = s.length; return n ? (s[Math.floor(n / 2)] + s[Math.floor((n - 1) / 2)]) / 2 : null; };
export const outcome = t => t.netDollars > 0 ? 'win' : t.netDollars < 0 ? 'loss' : 'flat';
export const tradeKey = t => `${t.symbol}/${t.day}/${t.side}/${t.entryTime}`;
export const CHECKS = Object.freeze(['trend', 'structure', 'momentum', 'volume', 'pattern']);

// Every input observation must have closed by the recorded entry. Unknown is
// not false: a cold-start indicator must not become a failed confirmation.
export function entryContext(t, closedBars, context) {
  assert.ok(closedBars.length, 'Missing entry history');
  assert.equal(closedBars.at(-1).time + 300, t.entryTime, 'Wrong last closed bar');
  assert.ok(closedBars.every((b, i) => b.time + 300 <= t.entryTime && b.day === t.day && b.ticker === t.ticker
    && (!i || b.time === closedBars[i - 1].time + 300)), 'Noncausal entry history');
  assert.ok(t.risk > 0 && t.riskDollars > 0, 'Invalid original risk');
  assert.equal(context?.closedAt, t.entryTime, 'Noncausal context');
  assert.equal(context.sourceTime, t.entryTime - 300, 'Noncausal context source');
  assert.equal(context.day, t.day); assert.equal(context.ticker, t.ticker);
  const sign = t.side === 'Long' ? 1 : -1, b = closedBars.at(-1);
  const volume = closedBars.reduce((n, b) => n + b.volume, 0);
  const vwap = volume ? closedBars.reduce((n, b) => n + (b.high + b.low + b.close) / 3 * b.volume, 0) / volume : null;
  const shapes = sign === 1 ? ['Englobante haussière', 'Forme de marteau', 'Corps haussier dominant']
    : ['Englobante baissière', 'Longue mèche haute', 'Corps baissier dominant'];
  const checks = {
    trend: context.emaReady && context.vwapSide !== null ? sign * (context.fast - context.slow) > 0 && context.vwapSide === sign : null,
    structure: context.structure === null ? null : context.structure === t.side,
    momentum: context.rsi === null ? null : sign * (context.rsi - 50) > 0,
    volume: context.volumeRatio === null ? null : context.volumeRatio >= 1,
    pattern: context.patterns.some(x => shapes.includes(x)) && !context.patterns.includes('Doji')
  };
  return { checks, entryMinute: b.minute + 5, hour: b.minute + 5 < 660 ? '10:00–10:59' : '11:00–12:00',
    weekday: new Date(t.day + 'T00:00:00Z').getUTCDay(),
    plannedRiskUSD: round(t.riskDollars + t.costDollars), riskPriceUSD: t.riskDollars,
    costRiskRatio: round(t.costDollars / t.riskDollars),
    netRewardRisk: round((t.targetDistance / t.risk * t.riskDollars - t.costDollars) / (t.riskDollars + t.costDollars)),
    rangeWidthR: round((t.rangeHigh - t.rangeLow) / t.risk),
    breakoutDelayMinutes: (t.entryTime - t.breakoutAt) / 60,
    emaGapR: context.emaReady ? round(sign * (context.fast - context.slow) / t.risk) : null,
    vwapDistanceR: vwap === null ? null : round(sign * (b.close - vwap) / t.risk),
    rsi: round(context.rsi), relativeVolume: round(context.volumeRatio),
    signalBodyRatio: b.high > b.low ? round(Math.abs(b.close - b.open) / (b.high - b.low)) : null };
}

// 5-minute OHLC does not tell whether an exit-bar extreme came before the fill.
// Report bounds, not an invented exact MFE/MAE or a retroactive exit opportunity.
export function pathBounds(t, bars) {
  assert.ok(bars.length && bars[0].time === t.entryTime && bars.at(-1).time === t.exitTime, 'Incomplete trade path');
  assert.ok(bars.every((b, i) => b.day === t.day && b.ticker === t.ticker && (!i || b.time === bars[i - 1].time + 300)), 'Detached trade path');
  assert.ok(t.exitTime >= t.entryTime && t.risk > 0);
  const sign = t.side === 'Long' ? 1 : -1, inR = p => sign * (p - t.entry) / t.risk;
  const before = bars.slice(0, -1), last = bars.at(-1);
  const certain = [0, inR(t.exit), inR(last.open), ...before.flatMap(b => [inR(b.high), inR(b.low)])];
  const openingExit = /gap|open/i.test(t.reason) || t.reason === 'Session close';
  const possible = openingExit ? certain : [...certain, inR(last.high), inR(last.low)];
  const mfeLowerR = Math.max(...certain), mfeUpperR = Math.max(...possible);
  const closes = before.map(b => inR(b.close));
  return { mfeLowerR: round(mfeLowerR), mfeUpperR: round(mfeUpperR),
    maeLowerR: round(-Math.min(...certain)), maeUpperR: round(-Math.min(...possible)),
    closedMaxR: round(Math.max(0, ...closes)),
    reachedOneR: mfeLowerR >= 1 - 1e-9 ? 'confirmed' : mfeUpperR < 1 - 1e-9 ? 'no' : 'unknown',
    heldMinutesLower: (t.exitTime - t.entryTime) / 60,
    heldMinutesUpper: (t.exitTime - t.entryTime) / 60 + (openingExit ? 0 : 5),
    exitBarAmbiguous: !!t.ambiguous, protectionActivated: t.breakEvenAt !== null };
}

export function statistics(trades) {
  assert.equal(new Set(trades.map(tradeKey)).size, trades.length, 'Duplicate trade observations');
  const wins = trades.filter(t => t.netDollars > 0), losses = trades.filter(t => t.netDollars < 0);
  const net = trades.reduce((n, t) => n + t.netDollars, 0), fees = trades.reduce((n, t) => n + t.costDollars, 0);
  const gains = wins.reduce((n, t) => n + t.netDollars, 0), lost = -losses.reduce((n, t) => n + t.netDollars, 0);
  const gainR = wins.reduce((n, t) => n + t.resultR, 0), lossR = -losses.reduce((n, t) => n + t.resultR, 0);
  const daily = new Map(); for (const t of trades) daily.set(t.day, (daily.get(t.day) || 0) + t.netDollars);
  const meanWin = average(wins.map(t => t.netDollars)), meanLoss = average(losses.map(t => -t.netDollars));
  return { count: trades.length, wins: wins.length, losses: losses.length, flat: trades.length - wins.length - losses.length,
    net: round(net, 2), gross: round(net + fees, 2), fees: round(fees, 2),
    winRate: trades.length ? round(wins.length / trades.length) : null,
    averageNet: round(average(trades.map(t => t.netDollars)), 2),
    averageWin: round(meanWin, 2), averageLoss: round(meanLoss, 2),
    breakEvenWinRate: meanWin !== null && meanLoss !== null ? round(meanLoss / (meanWin + meanLoss)) : null,
    profitFactorUSD: lost ? round(gains / lost) : gains ? 'Infinity' : null,
    profitFactorR: lossR ? round(gainR / lossR) : gainR ? 'Infinity' : null,
    expectancyR: round(average(trades.map(t => t.resultR))),
    activeDays: daily.size,
    netWithoutBestTrade: trades.length ? round(net - Math.max(...trades.map(t => t.netDollars)), 2) : null,
    netWithoutBestDay: daily.size ? round(net - Math.max(...daily.values()), 2) : null,
    feeTurnedLosses: losses.filter(t => t.netDollars + t.costDollars >= -1e-9).length };
}

export function summarizeMarket(rows, decisions) {
  const groups = key => [...new Set(rows.map(key))].map(value => ({ value, ...statistics(rows.filter(t => key(t) === value)) }));
  const features = ['plannedRiskUSD', 'costRiskRatio', 'netRewardRisk', 'rangeWidthR', 'breakoutDelayMinutes', 'emaGapR', 'vwapDistanceR', 'rsi', 'relativeVolume', 'signalBodyRatio'];
  const classes = ['win', 'loss', 'flat'].map(kind => {
    const same = rows.filter(t => outcome(t) === kind);
    return { outcome: kind, count: same.length, features: Object.fromEntries(features.map(f => {
      const a = same.map(t => t.context[f]).filter(Number.isFinite);
      return [f, { known: a.length, missing: same.length - a.length, mean: round(average(a)), median: round(median(a)) }];
    })), checks: Object.fromEntries(CHECKS.map(k => [k, { yes: same.filter(t => t.context.checks[k] === true).length,
      no: same.filter(t => t.context.checks[k] === false).length, unknown: same.filter(t => t.context.checks[k] === null).length }])),
    path: { meanMfeLowerR: round(average(same.map(t => t.path.mfeLowerR))), meanMfeUpperR: round(average(same.map(t => t.path.mfeUpperR))),
      meanMaeLowerR: round(average(same.map(t => t.path.maeLowerR))), meanMaeUpperR: round(average(same.map(t => t.path.maeUpperR))),
      oneRConfirmed: same.filter(t => t.path.reachedOneR === 'confirmed').length,
      oneRUnknown: same.filter(t => t.path.reachedOneR === 'unknown').length,
      oneRNotReached: same.filter(t => t.path.reachedOneR === 'no').length,
      closedOneRBeforeExit: same.filter(t => t.path.closedMaxR >= 1 - 1e-9).length,
      meanHoldLowerMinutes: round(average(same.map(t => t.path.heldMinutesLower))),
      meanHoldUpperMinutes: round(average(same.map(t => t.path.heldMinutesUpper))),
      protectionActivated: same.filter(t => t.path.protectionActivated).length,
      ambiguousExit: same.filter(t => t.path.exitBarAmbiguous).length } };
  });
  const reasons = [...new Set(decisions.filter(d => !d.accepted).map(d => d.reason))];
  assert.equal(decisions.filter(d => d.accepted).length, rows.length, 'Decision/trade reconciliation');
  return { total: statistics(rows), classes, bySide: groups(t => t.side), byHour: groups(t => t.context.hour),
    byWeekday: groups(t => t.context.weekday), byExit: groups(t => t.reason),
    byConfirmation: CHECKS.map(check => ({ check, groups: ['yes', 'no', 'unknown'].map(value => ({ value,
      ...statistics(rows.filter(t => (t.context.checks[check] === null ? 'unknown' : t.context.checks[check] ? 'yes' : 'no') === value)) })) })),
    signals: decisions.length, admitted: rows.length, refused: decisions.length - rows.length,
    refusals: reasons.map(reason => ({ reason, count: decisions.filter(d => !d.accepted && d.reason === reason).length })) };
}

// Same trade entries can have different exits. Attribution includes all terms;
// unmatched trades are not treated as the same observations with bigger fees.
export function compareCosts(normal, stress) {
  const n = new Map(normal.map(t => [tradeKey(t), t])), s = new Map(stress.map(t => [tradeKey(t), t]));
  assert.equal(n.size, normal.length); assert.equal(s.size, stress.length);
  const matched = normal.filter(t => s.has(tradeKey(t))), onlyNormal = normal.filter(t => !s.has(tradeKey(t))), onlyStress = stress.filter(t => !n.has(tradeKey(t)));
  let fees = 0, gross = 0, changedExits = 0;
  for (const t of matched) { const other = s.get(tradeKey(t)); fees -= other.costDollars - t.costDollars;
    gross += other.netDollars + other.costDollars - t.netDollars - t.costDollars;
    if (other.exitTime !== t.exitTime || other.exit !== t.exit || other.reason !== t.reason) changedExits++; }
  const removed = -onlyNormal.reduce((a, t) => a + t.netDollars, 0), added = onlyStress.reduce((a, t) => a + t.netDollars, 0);
  const delta = stress.reduce((a, t) => a + t.netDollars, 0) - normal.reduce((a, t) => a + t.netDollars, 0);
  assert.equal(round(fees + gross + removed + added, 2), round(delta, 2));
  return { normalCount: normal.length, stressCount: stress.length, matched: matched.length, changedExits,
    onlyNormal: onlyNormal.length, onlyStress: onlyStress.length, matchedFeesEffect: round(fees, 2),
    matchedGrossEffect: round(gross, 2), removedNormalEffect: round(removed, 2), addedStressEffect: round(added, 2), delta: round(delta, 2) };
}
