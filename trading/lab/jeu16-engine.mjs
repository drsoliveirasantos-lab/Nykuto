// Isolated extension of the frozen Jeu 15 replay. Account fills and budgets
// remain shared with Jeu 15; its files and all previous results are untouched.
import { lucidSignals, entryGate, floorAtClose, accountFill } from './jeu15-engine.mjs';
import { RULES } from './validation-engine.mjs';
import { tradeTerms, PRODUCTS } from './market-comparison.mjs';
import { JEU15_POLICY as P } from './jeu15-policy.mjs';
import { JEU16_POLICY as Q } from './jeu16-policy.mjs';
const product = PRODUCTS.find(p => p.symbol === 'MNQ');
const cents = n => Math.round(n * 100) / 100;

// Context is timestamped when the right-hand confirming bar CLOSES.
// A touched pivot is discarded, never replaced with an older pivot.
export function pivotContexts(candles) {
  const result = new Map(); let recent = [], low = null, high = null, previous;
  for (const bar of candles) {
    if (!Number.isFinite(bar.time) || (previous && bar.time <= previous.time)) throw new Error('Nonchronological pivots');
    if (!previous || bar.day !== previous.day || bar.time !== previous.time + 300 || bar.ticker !== previous.ticker) { recent = []; low = null; high = null; }
    if (low && bar.low <= low.price) low = null;
    if (high && bar.high >= high.price) high = null;
    recent.push(bar); if (recent.length > Q.pivotLeft + Q.pivotRight + 1) recent.shift();
    if (recent.length === Q.pivotLeft + Q.pivotRight + 1) {
      const middle = recent[Q.pivotLeft], other = recent.filter((_, i) => i !== Q.pivotLeft);
      if (other.every(b => middle.low < b.low)) low = Object.freeze({ kind: 'low', price: middle.low, time: middle.time, confirmedAt: bar.time + 300, day: bar.day });
      if (other.every(b => middle.high > b.high)) high = Object.freeze({ kind: 'high', price: middle.high, time: middle.time, confirmedAt: bar.time + 300, day: bar.day });
    }
    result.set(bar.time + 300, { low, high }); previous = bar;
  }
  return result;
}

export function structuralSignals(candles) {
  const contexts = pivotContexts(candles);
  return new Map([...lucidSignals(candles, 'entry5trend30')].map(([time, signal]) => [time, {
    ...signal, pivot: contexts.get(time)?.[signal.side === 'Long' ? 'low' : 'high'] ?? null
  }]));
}

export function structuralTerms(signal, entry, entryTime, costFactor = 1) {
  if (![1, 2].includes(costFactor) || !Number.isFinite(entry) || entry <= 0 || Math.abs(entry / P.tick - Math.round(entry / P.tick)) > 1e-8 || !['Long', 'Short'].includes(signal.side) || signal.signalClose !== entryTime) throw new Error('Invalid structural entry');
  const pivot = signal.pivot;
  if (!pivot) return { blocked: 'missingPivot' };
  if (!Number.isFinite(pivot.price) || !Number.isFinite(pivot.confirmedAt) || !Number.isFinite(pivot.time) || pivot.price <= 0 || pivot.time + (Q.pivotRight + 1) * 300 !== pivot.confirmedAt || pivot.confirmedAt > entryTime || pivot.day !== signal.day || pivot.kind !== (signal.side === 'Long' ? 'low' : 'high') || Math.abs(pivot.price / P.tick - Math.round(pivot.price / P.tick)) > 1e-8) throw new Error('Noncausal structural pivot');
  const sign = signal.side === 'Long' ? 1 : -1;
  if (sign * (entry - pivot.price) <= 0) return { blocked: 'invalidPivot' };
  const stop = pivot.price - sign * Q.bufferTicks * P.tick;
  if (stop <= 0) return { blocked: 'invalidPivot' };
  const risk = sign * (entry - stop), ticks = Math.round(risk / P.tick);
  const targetDistance = Math.floor(ticks * RULES.rr + 1e-9) * P.tick;
  const riskDollars = risk * P.multiplier, costDollars = P.cost * costFactor;
  const expectedNetRR = (targetDistance * P.multiplier - costDollars) / (riskDollars + costDollars);
  if (expectedNetRR < Q.minNetRewardRisk) return { blocked: 'netReward' };
  return { terms: { risk, targetDistance, riskDollars, costDollars, costR: costDollars / riskDollars }, expectedNetRR };
}

export function simulateStructural(candles, signals, scenario, { start, end }, costFactor = 1, account = true) {
  if (![1, 2].includes(costFactor) || scenario.guarded !== true || !['atr', 'pivot'].includes(scenario.stopMode)) throw new Error('Invalid simulation policy');
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
      signalCount++;
      const decision = scenario.stopMode === 'pivot' ? structuralTerms(signal, bar.open, bar.time, costFactor) : { terms: tradeTerms(product, signal.atr, costFactor) };
      if (decision.blocked) { denied[decision.blocked]++; continue; }
      const terms = decision.terms;
      const blocked = entryGate({ balance, floor, dayStart, ...terms, guarded: scenario.guarded, account });
      if (blocked) { denied[blocked]++; continue; }
      const sign = signal.side === 'Long' ? 1 : -1;
      position = { ticker: bar.ticker, side: signal.side, day, entryTime: bar.time, entry: bar.open,
        signalOpen: signal.signalOpen, signalClose: signal.signalClose, trendClosedAt: signal.trendClosedAt ?? null,
        ...terms, stop: bar.open - sign * terms.risk, target: bar.open + sign * terms.targetDistance,
        ...(scenario.stopMode === 'pivot' ? { pivot: signal.pivot, expectedNetRR: decision.expectedNetRR } : {}),
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
