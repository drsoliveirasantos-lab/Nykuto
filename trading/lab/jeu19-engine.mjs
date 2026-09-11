// Generic contract arithmetic; prior frozen MNQ engines stay unchanged.
import { lucidSignals, entryGate, floorAtClose } from './jeu15-engine.mjs';
import { aggregateFive, signalsFor } from './jeu12-engine.mjs';
import { RULES, contextFor } from './validation-engine.mjs';
import { tradeTerms } from './market-comparison.mjs';
import { JEU15_POLICY as P } from './jeu15-policy.mjs';
import { JEU19_POLICY as Q, JEU19_PRODUCTS, JEU19_SCENARIOS } from './jeu19-policy.mjs';
const cents = n => Math.round(n * 100) / 100;
const validProduct = product => JEU19_PRODUCTS.some(p => p.symbol === product.symbol && p.tick === product.tick && p.multiplier === product.multiplier && p.fees === product.fees);
export function multimarketSignals(candles, mode) {
  if (mode === 'pullback') return lucidSignals(candles, 'entry5trend30');
  if (mode !== 'cross') throw new Error('Unknown signal mode');
  const bars = aggregateFive(candles, 30), ctx = contextFor(bars), result = new Map();
  let j = -1;
  for (const [time, signal] of signalsFor(candles, 5, 'cross')) {
    while (j + 1 < bars.length && bars[j + 1].closedAt <= time) j++;
    if (j < 0 || bars[j].day !== signal.day || ![ctx.fast[j], ctx.slow[j], ctx.adx[j]].every(Number.isFinite) || ctx.adx[j] < RULES.adxMin) continue;
    const direction = ctx.fast[j] > ctx.slow[j] ? 'Long' : ctx.fast[j] < ctx.slow[j] ? 'Short' : null;
    if (signal.side === direction) result.set(time, { ...signal, trendClosedAt: bars[j].closedAt });
  }
  return result;
}
export function multimarketTerms(signal, entry, entryTime, product, costFactor = 1) {
  if (!validProduct(product) || ![1, 2].includes(costFactor) || !Number.isFinite(entry) || entry <= 0 || Math.abs(entry / product.tick - Math.round(entry / product.tick)) > 1e-7 || !['Long', 'Short'].includes(signal.side) || signal.signalClose !== entryTime || !Number.isFinite(signal.atr) || signal.atr <= 0) throw new Error('Invalid contract entry');
  const terms = tradeTerms(product, signal.atr, costFactor);
  if ((terms.targetDistance * product.multiplier - terms.costDollars) / (terms.riskDollars + terms.costDollars) < Q.minNetRewardRisk) return { blocked: 'netReward' };
  return { terms };
}
export function multimarketFill(product, position, bar, balance, floor, dayStart, guarded, account) {
  const sign = position.side === 'Long' ? 1 : -1;
  const equity = price => cents(balance + sign * (price - position.entry) * product.multiplier - position.costDollars);
  const adverseTick = price => sign === 1 ? Math.floor(price / product.tick + 1e-9) * product.tick : Math.ceil(price / product.tick - 1e-9) * product.tick;
  const levelPrice = level => adverseTick(position.entry + sign * (level - balance + position.costDollars) / product.multiplier);
  const levels = [{ price: position.stop, reason: 'Stop', priority: 2 }];
  if (account) levels.push({ price: levelPrice(floor), reason: 'MLL', priority: 0 });
  if (guarded) levels.push({ price: levelPrice(dayStart - P.dailyLoss), reason: 'Daily limit', priority: 1 });
  levels.sort((a, b) => sign * (b.price - a.price) || a.priority - b.priority);
  const adverse = levels[0], targetTouched = sign === 1 ? bar.high >= position.target : bar.low <= position.target;
  if (account && equity(bar.open) <= floor) return { price: bar.open, reason: 'MLL gap', ambiguous: false };
  if (guarded && equity(bar.open) <= dayStart - P.dailyLoss) return { price: bar.open, reason: 'Daily gap', ambiguous: false };
  if (sign === 1 ? bar.open <= adverse.price : bar.open >= adverse.price) return { price: bar.open, reason: 'Stop gap', ambiguous: false };
  if (sign === 1 ? bar.open >= position.target : bar.open <= position.target) return { price: position.target, reason: 'Target open', ambiguous: false };
  if (sign === 1 ? bar.low <= adverse.price : bar.high >= adverse.price) return { price: adverse.price, reason: adverse.reason, ambiguous: targetTouched };
  if (targetTouched) return { price: position.target, reason: 'Target', ambiguous: false };
  return null;
}


export function simulateMultimarket(candles, signals, scenario, product, { start, end }, costFactor = 1, account = true) {
  if (![1, 2].includes(costFactor) || !JEU19_SCENARIOS.some(s => s.id === scenario.id && scenario.guarded === true) || !validProduct(product)) throw new Error('Invalid simulation policy');
  const trades = [], days = [], denied = { tradeRisk: 0, dailyBudget: 0, floorReserve: 0, missingPivot: 0, invalidPivot: 0, netReward: 0 };
  let balance = P.initial, floor = P.initial - P.maxLoss, position = null, day = '', dayStart = balance;
  let entries = 0, losses = 0, realizedR = 0, status = 'incomplete', terminalDay = null, bestDay = 0;
  let peak = balance, drawdown = 0, ambiguous = 0, signalCount = 0;
  const finishDay = () => {
    if (!day) return;
    if (position) throw new Error('Position held across session');
    const net = cents(balance - dayStart); bestDay = Math.max(bestDay, net);
    if (account) floor = floorAtClose(floor, balance);
    days.push({ day, net, trades: entries, balance, floor: account ? floor : null });
    const profit = cents(balance - P.initial);
    if (account && status !== 'breached' && profit >= P.profitTarget && bestDay <= profit * P.consistency + 1e-9) { status = 'targetMet'; terminalDay = day; }
  };
  const close = (fill, bar) => {
    const sign = position.side === 'Long' ? 1 : -1;
    const netDollars = cents(sign * (fill.price - position.entry) * product.multiplier - position.costDollars);
    const resultR = netDollars / position.riskDollars;
    balance = cents(balance + netDollars); realizedR += resultR; losses = resultR < 0 ? losses + 1 : 0;
    peak = Math.max(peak, balance); drawdown = Math.max(drawdown, peak - balance);
    if (fill.ambiguous) ambiguous++;
    trades.push({ ...position, exitTime: bar.time, exit: fill.price, reason: fill.reason, ambiguous: !!fill.ambiguous, resultR, netDollars, balanceAfter: balance });
    position = null;
    if (account && balance <= floor) { status = 'breached'; terminalDay = day; }
  };
  let previous = -Infinity;
  for (const bar of candles) {
    if (bar.day < start || bar.day >= end) continue;
    if (!Number.isFinite(bar.time) || bar.time <= previous) throw new Error('Nonchronological bars'); previous = bar.time;
    if (day !== bar.day) {
      finishDay(); if (status === 'targetMet' || status === 'breached') break;
      day = bar.day; dayStart = balance; entries = 0; losses = 0; realizedR = 0;
    }
    if (status === 'breached') continue;
    if (bar.minute >= bar.closeMinute - P.exitBeforeClose) {
      if (position) close(multimarketFill(product, position, { ...bar, high: bar.open, low: bar.open }, balance, floor, dayStart, scenario.guarded, account) || { price: bar.open, reason: 'Session close' }, bar);
      continue;
    }
    const signal = signals.get(bar.time);
    if (!position && signal && entries < RULES.maxTrades && losses < RULES.lossStreak && realizedR > -RULES.maxDailyLoss) {
      if (signal.day !== day || signal.signalClose !== bar.time || signal.signalOpen < bar.time - (bar.minute - 570) * 60 || signal.signalOpen >= signal.signalClose || (signal.trendClosedAt !== undefined && signal.trendClosedAt > bar.time)) throw new Error('Noncausal signal');
      signalCount++;
      const decision = multimarketTerms(signal, bar.open, bar.time, product, costFactor);
      if (decision.blocked) { denied[decision.blocked]++; continue; }
      const terms = decision.terms;
      const blocked = entryGate({ balance, floor, dayStart, ...terms, guarded: scenario.guarded, account });
      if (blocked) { denied[blocked]++; continue; }
      const sign = signal.side === 'Long' ? 1 : -1;
      position = { ticker: bar.ticker, side: signal.side, day, entryTime: bar.time, entry: bar.open,
        signalOpen: signal.signalOpen, signalClose: signal.signalClose, trendClosedAt: signal.trendClosedAt ?? null,
        ...terms, stop: cents(bar.open - sign * terms.risk), target: cents(bar.open + sign * terms.targetDistance),
        balanceBefore: balance, dayStart, floorBefore: account ? floor : null };
      entries++;
    }
    if (position) { const fill = multimarketFill(product, position, bar, balance, floor, dayStart, scenario.guarded, account); if (fill) close(fill, bar); }
  }
  // A stop at the next day's first bar has already recorded the prior day.
  if (day && days.at(-1)?.day !== day) finishDay();
  if (!account) status = 'diagnostic';
  const net = cents(balance - P.initial), active = days.filter(d => d.trades > 0);
  return { status, terminalDay, net, balance, floor: account ? floor : null, bestDay, drawdown: cents(drawdown),
    consistency: net > 0 ? bestDay / net : null, signalCount, denied, ambiguous, trades, days,
    daily: { observed: days.length, positive: days.filter(d => d.net > 0).length, negative: days.filter(d => d.net < 0).length,
      flatActive: active.filter(d => d.net === 0).length, noTrade: days.length - active.length, worst: days.length ? Math.min(...days.map(d => d.net)) : null } };
}
