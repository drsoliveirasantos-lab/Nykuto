// Game37: account risk state is separate from the closed-signal confidence.
// One personal payout is modeled; new research variants continue toward 4000 USD.
import { RULES } from './validation-engine.mjs';
import { sessionFor } from './session-comparison.mjs';
import { riskFill } from './jeu23-risk.mjs';
import { JEU29_PROFILES, JEU29_PRODUCTS } from './jeu29-policy.mjs';
import { accountProfile, accountFloor, consistencyStatus } from './jeu33-policy.mjs';
import { confidenceGrade, desiredRisk, accountRiskTier, confidenceSizedTerms, confidenceRiskGate } from './jeu37-risk.mjs';
import { simulateMonthlyPortfolio } from './jeu34-engine.mjs';
import { JEU37_POLICY as P, confidenceProfile } from './jeu37-policy.mjs';
import { payoutEligibility } from './jeu34-payout.mjs';
const cents = n => Math.round(n * 100) / 100;

// All four tapes must be complete and synchronized before any performance.
// Full-day availability is an ex-post data-quality restriction, not a live filter.
function validatedStreams(streams, period) {
  if (!Array.isArray(streams) || streams.length !== 4 || new Set(streams.map(s => s.symbol)).size !== 4)
    throw new Error('Four unique markets required');
  if (![period.start, period.end].every(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
    || [period.start, period.end].some(d => !Number.isFinite(Date.parse(d + 'T00:00:00Z')) || new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) !== d)
    || period.start >= period.end || period.start < '2026-01-01' || period.end > P.end) throw new Error('Authorized January–August period required');
  const ordered = JEU29_PROFILES.map(profile => {
    const stream = streams.find(s => s.symbol === profile.symbol), product = JEU29_PRODUCTS.find(p => p.symbol === profile.symbol);
    if (!stream || !Array.isArray(stream.candles) || !(stream.signals instanceof Map)) throw new Error('Invalid market stream');
    const candles = stream.candles.filter(b => b.day >= period.start && b.day < period.end);
    let previous = null;
    for (const b of candles) {
      const local = Number.isSafeInteger(b.time) ? sessionFor(b.time) : {};
      const grid = v => Number.isFinite(v) && v > 0 && Math.abs(v / product.tick - Math.round(v / product.tick)) < 1e-7;
      if (!Number.isSafeInteger(b.time) || !Number.isInteger(b.minute) || !Number.isInteger(b.closeMinute)
        || local.day !== b.day || local.minute !== b.minute || b.time % 300
        || b.minute < 570 || b.minute >= b.closeMinute || (b.minute - 570) % 5 || b.closeMinute > 960
        || b.closeMinute < 600 || b.closeMinute % 5 || typeof b.ticker !== 'string' || !b.ticker.startsWith(profile.symbol)
        || ![b.open, b.high, b.low, b.close].every(grid) || b.low > Math.min(b.open, b.close) || b.high < Math.max(b.open, b.close)
        || (previous && (b.time <= previous.time || b.day < previous.day))) throw new Error('Invalid chronological prices');
      if (previous?.day === b.day) {
        if (b.time !== previous.time + 300 || b.minute !== previous.minute + 5 || b.ticker !== previous.ticker || b.closeMinute !== previous.closeMinute)
          throw new Error('Incomplete or changing session');
      } else if (b.minute !== 570 || (previous && previous.minute !== previous.closeMinute - 5)) throw new Error('Incomplete session boundary');
      previous = b;
    }
    if (previous && previous.minute !== previous.closeMinute - 5) throw new Error('Incomplete final session');
    const lookup = new Map(candles.map(b => [b.time, b]));
    for (const [time, signal] of stream.signals) {
      const b = lookup.get(time);
      if (!signal || typeof signal.day !== 'string' || !Number.isSafeInteger(time)) throw new Error('Noncausal portfolio signal');
      if (!b && (signal.day < period.start || signal.day >= period.end)) continue;
      if (!b || signal.day !== b.day || signal.signalClose !== time || signal.signalOpen !== time - 300
        || b.minute < 600 || b.minute > 720 || !['Long', 'Short'].includes(signal.side)
        || ![signal.rangeClosedAt, signal.breakoutAt, signal.trendClosedAt].every(Number.isFinite)
        || signal.rangeClosedAt < time - (b.minute - 570) * 60 || signal.rangeClosedAt > signal.breakoutAt
        || signal.breakoutAt > signal.signalOpen || signal.trendClosedAt > time
        || !(signal.rangeHigh > signal.rangeLow && signal.rangeLow > 0)) throw new Error('Noncausal portfolio signal');
    }
    return { ...profile, product, candles, signals: stream.signals };
  });
  const base = ordered[0].candles;
  for (const s of ordered.slice(1)) if (s.candles.length !== base.length || s.candles.some((b, i) =>
    b.time !== base[i].time || b.day !== base[i].day || b.minute !== base[i].minute || b.closeMinute !== base[i].closeMinute))
    throw new Error('Unsynchronized market tapes');
  return ordered;
}

export function simulateConfidencePortfolio(streams, contexts, period, costFactor = 1, profileId = 'fixed100') {
  const profile=confidenceProfile(profileId),mode='funded';
  if(profile.control)return simulateMonthlyPortfolio(streams,period,costFactor,mode);
  const A = {...accountProfile('50k-reduced100'),dailyLoss:profile.dailyLoss,riskPerTrade:profile.maxRisk}, policy = A, account = true;
  if (![1, 2].includes(costFactor)) throw new Error('Invalid portfolio costs');
  const ordered = validatedStreams(streams, period), trades = [], days = [], decisions = [];
  const denied = {}, byMarket = Object.fromEntries(ordered.map(s => [s.symbol, { signals: 0, denied: {} }]));
  let balance = A.initial, floor = A.initial - A.maxLoss, day = '', dayStart = balance, position = null;
  let entries = 0, losses = 0, realizedR = 0, consumed = new Set(), peak = balance, drawdown = 0;
  let cap = A.riskPerTrade, tier = 1, profitGoalDay = null;
  let qualifyingDays = 0, withdrawnUSD = 0, receiptEUR = 0, goalDay = null;
  let bestDay = 0, status = 'incomplete', terminalDay = null, ambiguous = 0;
  const finishDay = () => {
    if (!day) return;
    if (position) throw new Error('Position held across session');
    const net = cents(balance - dayStart); bestDay = Math.max(bestDay, net);
    if (account) floor = accountFloor(floor, balance, A);
    if (net >= P.qualifyingDayUSD) qualifyingDays++;
    let payout = payoutEligibility({balance, initial:A.initial, qualifyingDays, mode, breached:status==='breached'});
    if(goalDay)payout={...payout,reason:'personal-goal-already-paid',goalEligible:false,maxRequestUSD:0,maxReceiptEUR:0,goalReceiptEUR:0};
    let payoutGrossUSD = 0, payoutReceiptEUR = 0;
    if (mode === 'funded' && payout.goalEligible && status !== 'breached') {
      payoutGrossUSD = payout.requestUSD; payoutReceiptEUR = payout.goalReceiptEUR;
      balance = payout.goalBalanceAfter; floor = payout.lockedFloor;
      withdrawnUSD = cents(withdrawnUSD + payoutGrossUSD); receiptEUR = cents(receiptEUR + payoutReceiptEUR);
      goalDay = day; qualifyingDays = 0;
    }
    days.push({ day, net, trades: entries, balance, floor, payoutGrossUSD, payoutReceiptEUR, qualifyingDays, payout });
    const profit = cents(balance - A.initial + withdrawnUSD);
    if(status!=='breached'&&profit>=P.monthlyProfitTargetUSD){profitGoalDay=day;status='profitTargetMet';terminalDay=day;}
  };
  const reject = (symbol, time, reason) => {
    denied[reason] = (denied[reason] || 0) + 1;
    byMarket[symbol].denied[reason] = (byMarket[symbol].denied[reason] || 0) + 1;
    decisions.push({ day, time, symbol, accepted: false, reason });
  };
  const close = (fill, bar) => {
    const p = JEU29_PRODUCTS.find(p => p.symbol === position.symbol), sign = position.side === 'Long' ? 1 : -1;
    if (position.breakEvenAt !== null && ['Stop', 'Stop gap'].includes(fill.reason))
      fill = { ...fill, reason: fill.reason === 'Stop' ? 'Break-even stop' : 'Break-even gap' };
    const netDollars = cents(sign * (fill.price - position.entry) * p.multiplier * (position.quantity ?? 1) - position.costDollars), resultR = netDollars / position.riskDollars;
    balance = cents(balance + netDollars); realizedR += resultR; losses = netDollars < 0 ? losses + 1 : 0;
    const performanceBalance=balance+withdrawnUSD;
    peak = Math.max(peak, performanceBalance); drawdown = Math.max(drawdown, peak - performanceBalance); if (fill.ambiguous) ambiguous++;
    trades.push({ ...position, exitTime: bar.time, exit: fill.price, reason: fill.reason,
      ambiguous: !!fill.ambiguous, netDollars, resultR, balanceAfter: balance });
    position = null;
    if (account && balance <= floor) { status = 'breached'; terminalDay = day; }
  };
  for (let i = 0; i < ordered[0].candles.length; i++) {
    const clock = ordered[0].candles[i];
    if (day !== clock.day) {
      finishDay(); if (['profitTargetMet', 'breached'].includes(status)) break;
      day = clock.day; dayStart = balance; entries = 0; losses = 0; realizedR = 0; consumed = new Set();
    }
    if (status === 'breached') continue;
    if (clock.minute >= clock.closeMinute - P.exitBeforeClose) {
      if (position) {
        const s = ordered.find(s => s.symbol === position.symbol), bar = s.candles[i];
        close(riskFill({ ...s.product, multiplier: s.product.multiplier * (position.quantity ?? 1) }, position, { ...bar, high: bar.open, low: bar.open }, balance, floor, dayStart, true, account, policy)
          || { price: bar.open, reason: 'Session close' }, bar);
      }
      continue;
    }
    // Entry eligibility is determined BEFORE this bar's high/low/close exits.
    // Even an opening exit conservatively reserves the whole five-minute slot.
    const occupiedAtOpen = !!position; let selectedAtOpen = false;
    for (const s of ordered) {
      const bar = s.candles[i], signal = s.signals.get(clock.time); if (!signal) continue;
      byMarket[s.symbol].signals++;
      if (occupiedAtOpen) { reject(s.symbol, bar.time, 'occupied'); continue; }
      if (selectedAtOpen) { reject(s.symbol, bar.time, 'simultaneous'); continue; }
      if (entries >= P.maxTradesPerDay) { reject(s.symbol, bar.time, 'dailyEntries'); continue; }
      if (losses >= RULES.lossStreak || realizedR <= -RULES.maxDailyLoss) { reject(s.symbol, bar.time, 'dailyBrake'); continue; }
      if (consumed.has(s.symbol + '/' + signal.side)) { reject(s.symbol, bar.time, 'sideLimit'); continue; }
      const confidence=s.symbol==='MGC'?{grade:'preserved',score:null,checks:null,missingContext:null}:confidenceGrade(signal,contexts.get(s.symbol)?.get(clock.time));
      const requestedRiskUSD=s.symbol==='MGC'?100:desiredRisk(s.symbol,confidence,profileId);
      tier=accountRiskTier(balance,floor,tier);cap=cents(requestedRiskUSD*tier);
      const decision = confidenceSizedTerms(signal, bar.open, bar.time, s.product, costFactor, cap);
      if (decision.blocked) { reject(s.symbol, bar.time, decision.blocked); continue; }
      const terms = decision.terms, blocked = confidenceRiskGate({ balance, floor, dayStart, ...terms }, A, cap);
      if (blocked) { reject(s.symbol, bar.time, blocked); continue; }
      const sign = signal.side === 'Long' ? 1 : -1, stop = cents(bar.open - sign * terms.risk);
      position = { symbol: s.symbol, strategy: s.strategy, ticker: bar.ticker, side: signal.side, day,
        entryTime: bar.time, entry: bar.open, ...signal, ...terms, stop, initialStop: stop,
        target: cents(bar.open + sign * terms.targetDistance), breakEvenAt: null,
        riskCapUSD: cap, requestedRiskUSD, accountTier:tier, confidence, balanceBefore: balance, dayStart, floorBefore: account ? floor : null };
      consumed.add(s.symbol + '/' + signal.side); entries++; selectedAtOpen = true;
      decisions.push({ day, time: bar.time, symbol: s.symbol, accepted: true, reason: 'admitted' });
    }
    if (position) {
      const s = ordered.find(s => s.symbol === position.symbol), bar = s.candles[i];
      const fill = riskFill({ ...s.product, multiplier: s.product.multiplier * (position.quantity ?? 1) }, position, bar, balance, floor, dayStart, true, account, policy);
      if (fill) close(fill, bar);

    }
  }
  if (day && days.at(-1)?.day !== day) finishDay();
  const net = cents(balance - A.initial + withdrawnUSD), active = days.filter(d => d.trades > 0);
  return { profitGoalDay, profitGoalAchieved:profitGoalDay!==null, profileId, mode, initial: A.initial, withdrawnUSD, receiptEUR, goalDay, personalGoalAchieved:goalDay!==null,
    consistency: mode==='evaluation'?consistencyStatus(bestDay, net, A):{applies:false}, status, terminalDay, net, balance, floor: account ? floor : null,
    bestDay, drawdown: cents(drawdown), ambiguous, trades, days, decisions, denied, byMarket,
    executionAllowed: false, daily: { observed: days.length, positive: days.filter(d => d.net > 0).length,
      negative: days.filter(d => d.net < 0).length, flatActive: active.filter(d => d.net === 0).length,
      noTrade: days.length - active.length, worst: days.length ? Math.min(...days.map(d => d.net)) : null } };
}
