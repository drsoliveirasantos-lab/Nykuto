import {floorAtClose} from './jeu15-engine.mjs';
import {RULES} from './validation-engine.mjs';
import {JEU15_POLICY as P} from './jeu15-policy.mjs';
import {JEU23_POLICY as Q,JEU23_PRODUCTS,JEU23_SCENARIOS} from './jeu23-policy.mjs';
import {riskGate,riskFill,riskProfile} from './jeu23-risk.mjs';
import {openingTerms} from './jeu22-engine.mjs';
const cents=n=>Math.round(n*100)/100;
const validProduct=p=>JEU23_PRODUCTS.some(x=>x.symbol===p.symbol&&x.tick===p.tick&&x.multiplier===p.multiplier&&x.fees===p.fees);
export function simulateAdmission(candles, signals, scenario, product, { start, end }, costFactor = 1, account = true) {
  if (![1, 2].includes(costFactor) || !JEU23_SCENARIOS.some(s => s.id === scenario.id && scenario.guarded === true) || !validProduct(product)) throw new Error('Invalid simulation policy');
  const riskPolicy=riskProfile(scenario);
  const trades = [], days = [], denied = { tradeRisk: 0, dailyBudget: 0, floorReserve: 0, missingPivot: 0, invalidPivot: 0, netReward: 0, invalidStop:0, returnedInside:0, sideLimit:0 };
  let balance = P.initial, floor = P.initial - P.maxLoss, position = null, day = '', dayStart = balance;
  let consumed=new Set(),refused={Long:0,Short:0};
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
      day = bar.day; dayStart = balance; entries = 0; losses = 0; realizedR = 0; consumed=new Set();refused={Long:0,Short:0};
    }
    if (status === 'breached') continue;
    if (bar.minute >= bar.closeMinute - P.exitBeforeClose) {
      if (position) close(riskFill(product, position, { ...bar, high: bar.open, low: bar.open }, balance, floor, dayStart, scenario.guarded, account, riskPolicy) || { price: bar.open, reason: 'Session close' }, bar);
      continue;
    }
    const signal = signals.get(bar.time);
    if (!position && signal && entries < RULES.maxTrades && losses < RULES.lossStreak && realizedR > -RULES.maxDailyLoss) {
      if (signal.day !== day || signal.signalClose !== bar.time || signal.signalOpen < bar.time - (bar.minute - 570) * 60 || signal.signalOpen >= signal.signalClose || (signal.trendClosedAt !== undefined && signal.trendClosedAt > bar.time)) throw new Error('Noncausal signal');
      if(consumed.has(signal.side)){denied.sideLimit++;continue;}
      signalCount++;
      const decision = openingTerms(signal, bar.open, bar.time, product, costFactor);
      if (decision.blocked) { denied[decision.blocked]++;refused[signal.side]++; continue; }
      const terms = decision.terms;
      const blocked = riskGate({ balance, floor, dayStart, ...terms, account },riskPolicy);
      if (blocked) { denied[blocked]++;refused[signal.side]++; continue; }
      const sign = signal.side === 'Long' ? 1 : -1;
      position = { ticker: bar.ticker, side: signal.side, day, priorRefusals:refused[signal.side], entryTime: bar.time, entry: bar.open,
        signalOpen: signal.signalOpen, signalClose: signal.signalClose, trendClosedAt: signal.trendClosedAt ?? null,
        rangeClosedAt:signal.rangeClosedAt,rangeHigh:signal.rangeHigh,rangeLow:signal.rangeLow,breakoutAt:signal.breakoutAt,stopPrice:signal.stopPrice,pattern:signal.pattern,
        ...terms, stop: cents(bar.open - sign * terms.risk), target: cents(bar.open + sign * terms.targetDistance),
        balanceBefore: balance, dayStart, floorBefore: account ? floor : null };
      consumed.add(signal.side);entries++;
    }
    if (position) { const fill = riskFill(product, position, bar, balance, floor, dayStart, scenario.guarded, account, riskPolicy); if (fill) close(fill, bar); }
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
