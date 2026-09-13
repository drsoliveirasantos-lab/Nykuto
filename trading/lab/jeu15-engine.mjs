import { aggregateFive, signalsFor } from './jeu12-engine.mjs';
import { contextFor, RULES } from './validation-engine.mjs';
import { tradeTerms, PRODUCTS } from './market-comparison.mjs';
import { JEU15_POLICY as P } from './jeu15-policy.mjs';
const product = PRODUCTS.find(p => p.symbol === 'MNQ');
const cents = n => Math.round(n * 100) / 100;

export function lucidSignals(candles, mode) {
  if (mode === 'pullback30') return signalsFor(candles, 30, 'pullback');
  if (mode !== 'entry5trend30') throw new Error('Unknown signal mode');
  const bars = aggregateFive(candles, 30), ctx = contextFor(bars), result = new Map();
  let j = -1;
  for (const [time, signal] of signalsFor(candles, 5, 'pullback')) {
    while (j + 1 < bars.length && bars[j + 1].closedAt <= time) j++;
    if (j < 0 || bars[j].day !== signal.day || ![ctx.fast[j], ctx.slow[j], ctx.adx[j]].every(Number.isFinite) || ctx.adx[j] < RULES.adxMin) continue;
    const direction = ctx.fast[j] > ctx.slow[j] ? 'Long' : ctx.fast[j] < ctx.slow[j] ? 'Short' : null;
    if (signal.side === direction) result.set(time, { ...signal, trendClosedAt: bars[j].closedAt });
  }
  return result;
}

export function floorAtClose(previous, balance) {
  if (![previous, balance].every(Number.isFinite)) throw new Error('Invalid balance');
  return cents(Math.max(previous, Math.min(P.lockedFloor, balance - P.maxLoss)));
}

export function entryGate({ balance, floor, dayStart, riskDollars, costDollars, guarded, account }) {
  if (![balance, floor, dayStart, riskDollars, costDollars].every(Number.isFinite) || riskDollars <= 0 || costDollars < 0) throw new Error('Invalid risk budget');
  if (!guarded) return null;
  const loss = cents(riskDollars + costDollars);
  if (loss > P.riskPerTrade) return 'tradeRisk';
  if (balance - loss < dayStart - P.dailyLoss) return 'dailyBudget';
  if (account && balance - loss < floor + P.floorReserve) return 'floorReserve';
  return null;
}

// Entry equity reserves the entire round-trip cost. Thresholds use the first
// executable adverse tick, including the possibility of crossing a limit.
export function accountFill(position, bar, balance, floor, dayStart, guarded, account) {
  const sign = position.side === 'Long' ? 1 : -1;
  const equity = price => cents(balance + sign * (price - position.entry) * P.multiplier - position.costDollars);
  const adverseTick = price => sign === 1 ? Math.floor(price / P.tick + 1e-9) * P.tick : Math.ceil(price / P.tick - 1e-9) * P.tick;
  const levelPrice = level => adverseTick(position.entry + sign * (level - balance + position.costDollars) / P.multiplier);
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

// Pure historical replay, deliberately with no broker, network, or activation API.
// Input bars must already have passed inspectHistory and cover every scored day.
export function simulateLucid(candles, signals, scenario, { start, end }, costFactor = 1, account = true) {
  if (![1, 2].includes(costFactor) || typeof scenario.guarded !== 'boolean') throw new Error('Invalid simulation policy');
  const trades = [], days = [], denied = { tradeRisk: 0, dailyBudget: 0, floorReserve: 0 };
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
    const netDollars = cents(sign * (fill.price - position.entry) * P.multiplier - position.costDollars);
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
      if (position) close(accountFill(position, { ...bar, high: bar.open, low: bar.open }, balance, floor, dayStart, scenario.guarded, account) || { price: bar.open, reason: 'Session close' }, bar);
      continue;
    }
    const signal = signals.get(bar.time);
    if (!position && signal && entries < RULES.maxTrades && losses < RULES.lossStreak && realizedR > -RULES.maxDailyLoss) {
      if (signal.day !== day || signal.signalClose !== bar.time || signal.signalOpen < bar.time - (bar.minute - 570) * 60 || signal.signalOpen >= signal.signalClose || (signal.trendClosedAt !== undefined && signal.trendClosedAt > bar.time)) throw new Error('Noncausal signal');
      const terms = tradeTerms(product, signal.atr, costFactor);
      signalCount++;
      const blocked = entryGate({ balance, floor, dayStart, ...terms, guarded: scenario.guarded, account });
      if (blocked) { denied[blocked]++; continue; }
      const sign = signal.side === 'Long' ? 1 : -1;
      position = { ticker: bar.ticker, side: signal.side, day, entryTime: bar.time, entry: bar.open,
        signalOpen: signal.signalOpen, signalClose: signal.signalClose, trendClosedAt: signal.trendClosedAt ?? null,
        ...terms, stop: bar.open - sign * terms.risk, target: bar.open + sign * terms.targetDistance,
        balanceBefore: balance, dayStart, floorBefore: account ? floor : null };
      entries++;
    }
    if (position) { const fill = accountFill(position, bar, balance, floor, dayStart, scenario.guarded, account); if (fill) close(fill, bar); }
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
