// Fixed BEFORE historical performance. Dollar objectives are diagnostics, not guarantees.
export const PROFIT_STUDY = Object.freeze({
  id: 'mnq-profit-study-v1', symbol: 'MNQ', initialUSD: 50000,
  maxLossUSD: 2000, floorReserveUSD: 100, dailyLossUSD: 200,
  maxMicroContracts: 20, targetR: 2, timeExitMinutes: 30,
  costsUSDPerContract: Object.freeze({normal: 3.5, stress: 7}),
  mode: 'historical-research-only', independent: false, confirmed: false,
  selection: null, executionAllowed: false, parameterSearch: false,
  sourceCommit: '061eb66a3d95b5a93119eaf6622c71b85a440207',
  sourceEngineBlob: '0b934165ccb636c1060d39de02055bd422d6436e',
  datasetId: 'mnq1-tradingview-rth-m5-2026-05-25_2026-09-10',
});
export const PROFIT_VARIANTS = Object.freeze([
  {id: 'reference100', maxRiskUSD: 100, minimumNetTargetUSD: 0},
  {id: 'risk150', maxRiskUSD: 150, minimumNetTargetUSD: 0},
  {id: 'risk200', maxRiskUSD: 200, minimumNetTargetUSD: 0},
  {id: 'net100-risk100', maxRiskUSD: 100, minimumNetTargetUSD: 100},
].map(Object.freeze));
export const PROFIT_MONTHS = Object.freeze([
  {id: '2026-06', start: '2026-06-01', end: '2026-07-01'},
  {id: '2026-07', start: '2026-07-01', end: '2026-08-01'},
  {id: '2026-08', start: '2026-08-01', end: '2026-09-01'},
].map(Object.freeze));
export function profitStudyProfile(id) {
  const found = PROFIT_VARIANTS.find(v => v.id === id);
  if (!found) throw Error('Unknown frozen profit-study profile');
  return found;
}
const money = n => Math.round(n * 100) / 100;
export function plannedNetTarget(terms, multiplier = 2) {
  const {quantity, targetDistance, costDollars} = terms;
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 20 ||
      ![targetDistance, costDollars, multiplier].every(Number.isFinite) ||
      targetDistance <= 0 || costDollars < 0 || multiplier <= 0) throw Error('Invalid target terms');
  return money(quantity * targetDistance * multiplier - costDollars);
}
// A quote never submits an order, moves a stop, or chooses size from a revenue wish.
export function quoteMnqTrade({side, entry, stop, riskCapUSD = 100, costFactor = 1}) {
  if (!['Long', 'Short'].includes(side) || ![1, 2].includes(costFactor) ||
      ![100, 150, 200].includes(riskCapUSD) ||
      ![entry, stop].every(p => Number.isFinite(p) && p > 0 && Number.isSafeInteger(p * 4)))
    throw Error('Invalid MNQ quote');
  const sign = side === 'Long' ? 1 : -1;
  const riskTicks = sign * (entry - stop) * 4;
  if (riskTicks <= 0) throw Error('Stop must be on the loss side of entry');
  const unitRiskCents = riskTicks * 50, unitCostCents = 350 * costFactor;
  const quantity = Math.min(20, Math.floor(riskCapUSD * 100 / (unitRiskCents + unitCostCents)));
  if (!quantity) return {blocked: 'tradeRisk', quantity: 0, executionAllowed: false};
  if ((2 * unitRiskCents - unitCostCents) / (unitRiskCents + unitCostCents) < 1)
    return {blocked: 'netReward', quantity: 0, executionAllowed: false};
  const plannedRiskUSD = quantity * (unitRiskCents + unitCostCents) / 100;
  const targetNetUSD = quantity * (2 * unitRiskCents - unitCostCents) / 100;
  return {side, entry, stop, quantity, riskCapUSD, plannedRiskUSD, targetNetUSD,
    target: money(entry + sign * 2 * riskTicks / 4), costUSD: quantity * unitCostCents / 100,
    reaches100: targetNetUSD >= 100, reaches200: targetNetUSD >= 200, executionAllowed: false};
}
export function summarizeProfitRun(run) {
  const trades = run.trades, wins = trades.filter(t => t.netDollars > 0), losses = trades.filter(t => t.netDollars < 0);
  const total = rows => money(rows.reduce((s, t) => s + t.netDollars, 0));
  const winning = total(wins), losing = -total(losses);
  return {netUSD: run.net, trades: trades.length, wins: wins.length, losses: losses.length,
    meanAllUSD: trades.length ? money(total(trades) / trades.length) : null,
    meanWinnerUSD: wins.length ? money(winning / wins.length) : null,
    meanLoserUSD: losses.length ? money(-losing / losses.length) : null,
    winRate: trades.length ? wins.length / trades.length : null,
    profitFactor: losing > 0 ? winning / losing : null,
    noLosingTrades: losses.length === 0,
    winnersAtLeast100: wins.filter(t => t.netDollars >= 100).length,
    winnersAtLeast200: wins.filter(t => t.netDollars >= 200).length,
    costsUSD: money(trades.reduce((s, t) => s + t.costDollars, 0)),
    maxRealizedDrawdownUSD: run.drawdown, status: run.status, ambiguousM5: run.ambiguous,
    maxPlannedLossUSD: trades.length ? Math.max(...trades.map(t => t.plannedRiskUSD)) : null,
    maxContracts: trades.length ? Math.max(...trades.map(t => t.quantity)) : null,
    denied: run.denied, executionAllowed: false};
}
export function judgeProfitStudy(rows, missingSessions = []) {
  const verdicts = [];
  for (const variant of PROFIT_VARIANTS.slice(1)) {
    const reasons = [];
    if (missingSessions.length) reasons.push('incomplete-month-coverage');
    for (const factor of [1, 2]) {
      const cells = rows.filter(r => r.variant === variant.id && r.factor === factor);
      const references = rows.filter(r => r.variant === 'reference100' && r.factor === factor);
      if (cells.length !== 3 || references.length !== 3) { reasons.push(`missing-cells-cost${factor}`); continue; }
      let gain = 0, base = 0, n = 0, baseN = 0;
      for (const cell of cells) {
        const ref = references.find(r => r.month === cell.month);
        if (!ref) {reasons.push('missing-reference'); continue;}
        const s = cell.summary, b = ref.summary;
        gain += s.netUSD; base += b.netUSD; n += s.trades; baseN += b.trades;
        if (s.status === 'breached') reasons.push(`${cell.month}/cost${factor}:breached`);
        if (s.netUSD < b.netUSD) reasons.push(`${cell.month}/cost${factor}:net-degraded`);
        if (s.maxRealizedDrawdownUSD > b.maxRealizedDrawdownUSD) reasons.push(`${cell.month}/cost${factor}:drawdown-degraded`);
      }
      if (gain <= base || !n || !baseN || gain / n <= base / baseN)
        reasons.push(`cost${factor}:no-strict-total-and-expectancy-improvement`);
    }
    verdicts.push({variant: variant.id, descriptiveGatePassed: reasons.length === 0,
      reasons, selection: null, confirmed: false, executionAllowed: false});
  }
  return verdicts;
}
