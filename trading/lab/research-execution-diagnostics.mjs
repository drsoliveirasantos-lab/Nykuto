// Descriptive accounting only. Never selects a strategy or changes admissions.
import { JEU29_PRODUCTS } from './jeu29-policy.mjs';

const cents = n => Math.round(n * 100) / 100;
const sum = (rows, key) => cents(rows.reduce((n, row) => n + row[key], 0));
const identity = t => `${t.symbol}/${t.ticker}/${t.side}/${t.entryTime}`;
const ensure = (condition, message) => { if (!condition) throw Error(message); };

function checkedTrades(trades) {
  ensure(Array.isArray(trades), 'Trade array required');
  const seen = new Set();
  for (const t of trades) {
    const product = JEU29_PRODUCTS.find(p => p.symbol === t.symbol);
    ensure(product && typeof t.ticker === 'string' && t.ticker.startsWith(t.symbol)
      && ['Long', 'Short'].includes(t.side), 'Invalid trade identity');
    ensure(Number.isSafeInteger(t.entryTime) && Number.isSafeInteger(t.exitTime)
      && t.entryTime % 300 === 0 && t.exitTime % 300 === 0 && t.exitTime >= t.entryTime,
    'Invalid M5 trade clock');
    ensure([t.entry, t.exit, t.costDollars, t.netDollars].every(Number.isFinite)
      && t.entry > 0 && t.exit > 0 && t.costDollars >= 0
      && Number.isInteger(t.quantity) && t.quantity > 0 && typeof t.reason === 'string'
      && typeof t.ambiguous === 'boolean', 'Invalid trade cashflow');
    const gross = (t.side === 'Long' ? 1 : -1) * (t.exit - t.entry) * product.multiplier * t.quantity;
    ensure(cents(gross - t.costDollars) === t.netDollars, 'Trade cashflow does not reconcile');
    ensure(!seen.has(identity(t)), 'Duplicate trade in one cost scenario');
    seen.add(identity(t));
  }
  return trades;
}

export function executionDiagnostics(trades) {
  checkedTrades(trades);
  const wins = trades.filter(t => t.netDollars > 0), losses = trades.filter(t => t.netDollars < 0);
  const netUSD = sum(trades, 'netDollars'), modeledCostsUSD = sum(trades, 'costDollars');
  const averageWinUSD = wins.length ? sum(wins, 'netDollars') / wins.length : null;
  const averageLossUSD = losses.length ? -sum(losses, 'netDollars') / losses.length : null;
  return {
    trades: trades.length, wins: wins.length, losses: losses.length,
    flat: trades.length - wins.length - losses.length,
    netUSD, grossBalanceUSD: cents(netUSD + modeledCostsUSD), modeledCostsUSD,
    meanNetUSD: trades.length ? netUSD / trades.length : null,
    meanModeledCostUSD: trades.length ? modeledCostsUSD / trades.length : null,
    averageWinUSD, averageLossUSD,
    // Excludes flat trades; a sample identity, not a forecast win probability.
    breakEvenWinRateAmongNonflat: averageWinUSD !== null && averageLossUSD !== null
      ? averageLossUSD / (averageWinUSD + averageLossUSD) : null,
    observedWinRateAmongNonflat: wins.length + losses.length ? wins.length / (wins.length + losses.length) : null,
    entryBarLosses: losses.filter(t => t.exitTime === t.entryTime).length,
    ambiguousExits: trades.filter(t => t.ambiguous).length,
    gapExits: trades.filter(t => /gap$/i.test(t.reason)).length,
    timedExitDecisions: trades.filter(t => t.timeExitAt !== undefined).length,
    timedExitFills: trades.filter(t => t.reason === 'Time exit 30m').length,
    exits: Object.fromEntries([...new Set(trades.map(t => t.reason))].sort()
      .map(reason => [reason, trades.filter(t => t.reason === reason).length])),
    spreadObserved: false, latencyObserved: false, intrabarOrderKnown: false,
  };
}

export function compareExecutionDiagnostics(reference, candidate) {
  const referenceStats = executionDiagnostics(reference), candidateStats = executionDiagnostics(candidate);
  const before = new Map(reference.map(t => [identity(t), t])), after = new Map(candidate.map(t => [identity(t), t]));
  const common = candidate.filter(t => before.has(identity(t)));
  const added = candidate.filter(t => !before.has(identity(t))), removed = reference.filter(t => !after.has(identity(t)));
  const deltas = common.map(t => cents(t.netDollars - before.get(identity(t)).netDollars));
  const commonDeltaUSD = cents(deltas.reduce((n, delta) => n + delta, 0));
  const addedNetUSD = sum(added, 'netDollars'), removedNetUSD = sum(removed, 'netDollars');
  const deltaUSD = cents(candidateStats.netUSD - referenceStats.netUSD);
  ensure(cents(commonDeltaUSD + addedNetUSD - removedNetUSD) === deltaUSD, 'Portfolio attribution does not reconcile');
  const improvements = deltas.filter(d => d > 0), deterioration = deltas.filter(d => d < 0);
  const sameEntries = added.length === 0 && removed.length === 0;
  const sameSizing = sameEntries && common.every(t => {
    const r = before.get(identity(t));
    return t.entry === r.entry && t.quantity === r.quantity && t.costDollars === r.costDollars;
  });
  const positiveCommonDeltaUSD = cents(improvements.reduce((n, d) => n + d, 0));
  return {
    reference: referenceStats, candidate: candidateStats, deltaUSD,
    attribution: { common: common.length, added: added.length, removed: removed.length,
      commonDeltaUSD, addedNetUSD, removedNetUSD,
      improvedCommonTrades: improvements.length, worsenedCommonTrades: deterioration.length,
      unchangedNetCommonTrades: deltas.filter(d => d === 0).length,
      sacrificedWinners: common.filter(t => before.get(identity(t)).netDollars > 0 && t.netDollars <= 0).length,
      removedWinners: removed.filter(t => t.netDollars > 0).length,
      removedLosers: removed.filter(t => t.netDollars < 0).length,
      addedWinners: added.filter(t => t.netDollars > 0).length,
      addedLosers: added.filter(t => t.netDollars < 0).length,
    },
    concentration: {
      sameEntriesAndSizing: sameSizing,
      positiveCommonDeltaUSD,
      largestImprovementShare: positiveCommonDeltaUSD ? Math.max(...improvements) / positiveCommonDeltaUSD : null,
      // Arithmetic subtraction only. Removing a trade could change later account decisions.
      arithmeticDeltaWithoutLargestImprovementUSD: sameSizing && improvements.length
        ? cents(deltaUSD - Math.max(...improvements)) : null,
      independentEvidence: false,
    },
    markets: JEU29_PRODUCTS.map(p => ({ symbol: p.symbol,
      reference: executionDiagnostics(reference.filter(t => t.symbol === p.symbol)),
      candidate: executionDiagnostics(candidate.filter(t => t.symbol === p.symbol)),
    })),
    selection: null, confirmed: false, executionAllowed: false,
  };
}

export function uniqueChangedOpportunities(pairs) {
  const changed = new Set();
  for (const { reference, candidate } of pairs) {
    checkedTrades(reference); checkedTrades(candidate);
    const before = new Map(reference.map(t => [identity(t), t]));
    const after = new Map(candidate.map(t => [identity(t), t]));
    for (const key of new Set([...before.keys(), ...after.keys()])) {
      const a = before.get(key), b = after.get(key);
      if (!a || !b || ['entry', 'exit', 'exitTime', 'quantity', 'costDollars', 'netDollars', 'reason']
        .some(field => a[field] !== b[field])) changed.add(key);
    }
  }
  return changed.size;
}
