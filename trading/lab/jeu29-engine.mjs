import { floorAtClose } from './jeu15-engine.mjs';
import { JEU15_POLICY as A } from './jeu15-policy.mjs';
import { RULES } from './validation-engine.mjs';
import { sessionFor } from './session-comparison.mjs';
import { openingTerms } from './jeu22-engine.mjs';
import { failedBreakoutTerms } from './jeu26-terms.mjs';
import { closedBreakEven } from './jeu28-protection.mjs';
import { riskGate, riskFill } from './jeu23-risk.mjs';
import { assessAccountRisk, SHARED_RISK_POLICY } from './account-risk-supervisor.mjs';
import { JEU29_POLICY as P, JEU29_PROFILES, JEU29_PRODUCTS, JEU29_RISK } from './jeu29-policy.mjs';
const cents = n => Math.round(n * 100) / 100;

// All four tapes must be complete and synchronized before any performance.
// Full-day availability is an ex-post data-quality restriction, not a live filter.
function validatedStreams(streams, period) {
  if (!Array.isArray(streams) || streams.length !== 4 || new Set(streams.map(s => s.symbol)).size !== 4)
    throw new Error('Four unique markets required');
  if (![period.start, period.end].every(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
    || [period.start, period.end].some(d => !Number.isFinite(Date.parse(d + 'T00:00:00Z')) || new Date(d + 'T00:00:00Z').toISOString().slice(0, 10) !== d)
    || period.start >= period.end || period.start < P.from || period.end > P.trainEnd) throw new Error('Development period required');
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

export function simulatePortfolio(streams, period, costFactor = 1, account = false) {
  if (![1, 2].includes(costFactor) || typeof account !== 'boolean') throw new Error('Invalid portfolio policy');
  if (SHARED_RISK_POLICY.perTradeUSD !== P.riskPerTrade || SHARED_RISK_POLICY.dailyLossUSD !== P.dailyLoss
    || SHARED_RISK_POLICY.maxEntriesPerDay !== P.maxTradesPerDay || SHARED_RISK_POLICY.maxPositionsAndPending !== 1)
    throw new Error('Shared risk policy mismatch');
  const ordered = validatedStreams(streams, period), trades = [], days = [], decisions = [];
  const denied = {}, byMarket = Object.fromEntries(ordered.map(s => [s.symbol, { signals: 0, denied: {} }]));
  let balance = A.initial, floor = A.initial - A.maxLoss, day = '', dayStart = balance, position = null;
  let entries = 0, losses = 0, realizedR = 0, consumed = new Set(), peak = balance, drawdown = 0;
  let bestDay = 0, status = 'incomplete', terminalDay = null, ambiguous = 0;
  const finishDay = () => {
    if (!day) return;
    if (position) throw new Error('Position held across session');
    const net = cents(balance - dayStart); bestDay = Math.max(bestDay, net);
    if (account) floor = floorAtClose(floor, balance);
    days.push({ day, net, trades: entries, balance, floor: account ? floor : null });
    const profit = cents(balance - A.initial);
    if (account && status !== 'breached' && profit >= A.profitTarget && bestDay <= profit * A.consistency + 1e-9) {
      status = 'targetMet'; terminalDay = day;
    }
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
    const netDollars = cents(sign * (fill.price - position.entry) * p.multiplier - position.costDollars), resultR = netDollars / position.riskDollars;
    balance = cents(balance + netDollars); realizedR += resultR; losses = netDollars < 0 ? losses + 1 : 0;
    peak = Math.max(peak, balance); drawdown = Math.max(drawdown, peak - balance); if (fill.ambiguous) ambiguous++;
    trades.push({ ...position, exitTime: bar.time, exit: fill.price, reason: fill.reason,
      ambiguous: !!fill.ambiguous, netDollars, resultR, balanceAfter: balance });
    position = null;
    if (account && balance <= floor) { status = 'breached'; terminalDay = day; }
  };
  for (let i = 0; i < ordered[0].candles.length; i++) {
    const clock = ordered[0].candles[i];
    if (day !== clock.day) {
      finishDay(); if (['targetMet', 'breached'].includes(status)) break;
      day = clock.day; dayStart = balance; entries = 0; losses = 0; realizedR = 0; consumed = new Set();
    }
    if (status === 'breached') continue;
    if (clock.minute >= clock.closeMinute - A.exitBeforeClose) {
      if (position) {
        const s = ordered.find(s => s.symbol === position.symbol), bar = s.candles[i];
        close(riskFill(s.product, position, { ...bar, high: bar.open, low: bar.open }, balance, floor, dayStart, true, account, JEU29_RISK)
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
      const decision = (s.strategy === 'failure' ? failedBreakoutTerms : openingTerms)(signal, bar.open, bar.time, s.product, costFactor);
      if (decision.blocked) { reject(s.symbol, bar.time, decision.blocked); continue; }
      const terms = decision.terms, blocked = riskGate({ balance, floor, dayStart, ...terms, account }, JEU29_RISK);
      if (blocked) { reject(s.symbol, bar.time, blocked); continue; }
      const sign = signal.side === 'Long' ? 1 : -1, stop = cents(bar.open - sign * terms.risk);
      if (account) {
        const check = assessAccountRisk({ accountId: 'jeu29-research', session: day, revision: trades.length,
          balanceUSD: balance, dayStartUSD: dayStart, floorUSD: floor, entriesToday: entries,
          lossStreak: losses, realizedR, commitments: [] },
        { id: s.symbol + '-' + bar.time, accountId: 'jeu29-research', session: day, expectedRevision: trades.length,
          symbol: s.symbol, side: signal.side, quantity: 1, entry: bar.open, stop, costFactor });
        if (!check.riskPassed) throw new Error('Shared risk supervisor disagreement: ' + check.reason);
        if (Math.abs(check.riskUSD - terms.riskDollars - terms.costDollars) > 1e-7) throw new Error('Risk reconciliation failed');
      }
      position = { symbol: s.symbol, strategy: s.strategy, ticker: bar.ticker, side: signal.side, day,
        entryTime: bar.time, entry: bar.open, ...signal, ...terms, stop, initialStop: stop,
        target: cents(bar.open + sign * terms.targetDistance), breakEvenAt: null,
        balanceBefore: balance, dayStart, floorBefore: account ? floor : null };
      consumed.add(s.symbol + '/' + signal.side); entries++; selectedAtOpen = true;
      decisions.push({ day, time: bar.time, symbol: s.symbol, accepted: true, reason: 'admitted' });
    }
    if (position) {
      const s = ordered.find(s => s.symbol === position.symbol), bar = s.candles[i];
      const fill = riskFill(s.product, position, bar, balance, floor, dayStart, true, account, JEU29_RISK);
      if (fill) close(fill, bar);
      else if (s.strategy === 'protection') { const change = closedBreakEven(position, bar, s.product); if (change) Object.assign(position, change); }
    }
  }
  if (day && days.at(-1)?.day !== day) finishDay();
  const net = cents(balance - A.initial), active = days.filter(d => d.trades > 0);
  return { status: account ? status : 'diagnostic', terminalDay, net, balance, floor: account ? floor : null,
    bestDay, drawdown: cents(drawdown), ambiguous, trades, days, decisions, denied, byMarket,
    executionAllowed: false, daily: { observed: days.length, positive: days.filter(d => d.net > 0).length,
      negative: days.filter(d => d.net < 0).length, flatActive: active.filter(d => d.net === 0).length,
      noTrade: days.length - active.length, worst: days.length ? Math.min(...days.map(d => d.net)) : null } };
}
