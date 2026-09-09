import { entryGate, floorAtClose } from './jeu15-engine.mjs';
import { RULES } from './validation-engine.mjs';
import { JEU15_POLICY as P } from './jeu15-policy.mjs';
import { JEU22_POLICY as Q, JEU22_PRODUCTS, JEU22_SCENARIOS } from './jeu22-policy.mjs';
import { multimarketFill } from './jeu19-engine.mjs';
const cents=n=>Math.round(n*100)/100;
const validProduct=p=>JEU22_PRODUCTS.some(x=>x.symbol===p.symbol&&x.tick===p.tick&&x.multiplier===p.multiplier&&x.fees===p.fees);
export function openingTerms(signal,entry,entryTime,product,costFactor=1){
  if(!validProduct(product)||![1,2].includes(costFactor)||!Number.isFinite(entry)||entry<=0||Math.abs(entry/product.tick-Math.round(entry/product.tick))>1e-7||!['Long','Short'].includes(signal.side)||signal.signalClose!==entryTime||signal.pattern!=='orb-retest'||!Number.isFinite(signal.stopPrice)||!Number.isFinite(signal.rangeClosedAt)||!Number.isFinite(signal.breakoutAt)||signal.rangeClosedAt>signal.breakoutAt||signal.breakoutAt>signal.signalOpen)throw new Error('Invalid opening entry');
  const sign=signal.side==='Long'?1:-1,level=sign===1?signal.rangeHigh:signal.rangeLow;
  if(!Number.isFinite(level)||sign*(entry-level)<=0)return {blocked:'returnedInside'};
  const distance=sign*(entry-signal.stopPrice),ticks=Math.round(distance/product.tick);
  if(ticks<1||Math.abs(distance/product.tick-ticks)>1e-7)return {blocked:'invalidStop'};
  const risk=ticks*product.tick,targetDistance=Math.floor(ticks*RULES.rr+1e-9)*product.tick;
  const riskDollars=cents(risk*product.multiplier),costDollars=cents((product.fees+2*product.tick*product.multiplier)*costFactor);
  if((targetDistance*product.multiplier-costDollars)/(riskDollars+costDollars)<Q.minNetRewardRisk)return {blocked:'netReward'};
  return {terms:{risk,targetDistance,riskDollars,costDollars,costR:costDollars/riskDollars}};
}

export function simulateOpening(candles, signals, scenario, product, { start, end }, costFactor = 1, account = true) {
  if (![1, 2].includes(costFactor) || !JEU22_SCENARIOS.some(s => s.id === scenario.id && scenario.guarded === true) || !validProduct(product)) throw new Error('Invalid simulation policy');
  const trades = [], days = [], denied = { tradeRisk: 0, dailyBudget: 0, floorReserve: 0, missingPivot: 0, invalidPivot: 0, netReward: 0, invalidStop:0, returnedInside:0 };
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
      const decision = openingTerms(signal, bar.open, bar.time, product, costFactor);
      if (decision.blocked) { denied[decision.blocked]++; continue; }
      const terms = decision.terms;
      const blocked = entryGate({ balance, floor, dayStart, ...terms, guarded: scenario.guarded, account });
      if (blocked) { denied[blocked]++; continue; }
      const sign = signal.side === 'Long' ? 1 : -1;
      position = { ticker: bar.ticker, side: signal.side, day, entryTime: bar.time, entry: bar.open,
        signalOpen: signal.signalOpen, signalClose: signal.signalClose, trendClosedAt: signal.trendClosedAt ?? null,
        rangeClosedAt:signal.rangeClosedAt,rangeHigh:signal.rangeHigh,rangeLow:signal.rangeLow,breakoutAt:signal.breakoutAt,stopPrice:signal.stopPrice,pattern:signal.pattern,
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
