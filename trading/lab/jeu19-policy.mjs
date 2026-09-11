// Fixed before the first performance calculation. No parameter sweep.
export const JEU19_POLICY = Object.freeze({
  version: 'jeu19-multimarket-v1', from: '2026-01-01', end: '2026-09-01',
  trainEnd: '2026-05-01', warmup30: 220, minNetRewardRisk: 1,
  minimumTrainTrades: 40, minimumWindowTrades: 12, minimumPF: 1.1, maxDrawdownR: 8,
  paperEnabled: false, shadowEnabled: false, brokerEnabled: false, confirmed: false,
  independent: false, liveFeed: false
});
export const JEU19_PRODUCTS = Object.freeze([
  { symbol: 'MNQ', label: 'Micro Nasdaq', tick: .25, multiplier: 2, fees: 2.5, venue: 'XCME', priorData: true },
  { symbol: 'MES', label: 'Micro S&P 500', tick: .25, multiplier: 5, fees: 2.5, venue: 'XCME', priorData: false },
  { symbol: 'MYM', label: 'Micro Dow Jones', tick: 1, multiplier: .5, fees: 2.5, venue: 'XCBT', priorData: false },
  { symbol: 'MGC', label: 'Micro Or', tick: .1, multiplier: 10, fees: 2.5, venue: 'XCEC', priorData: false }
].map(Object.freeze));
export const JEU19_SCENARIOS = Object.freeze([
  { id: 'pullback', label: 'Pullback 5 min + tendance 30 min', guarded: true },
  { id: 'cross', label: 'Croisement 5 min + tendance 30 min', guarded: true }
].map(Object.freeze));
export const JEU19_WINDOWS = Object.freeze([
  { start: '2026-01-01', end: '2026-03-01', phase: 'train' },
  { start: '2026-03-01', end: '2026-05-01', phase: 'train' },
  { start: '2026-05-01', end: '2026-07-01', phase: 'holdout' },
  { start: '2026-07-01', end: '2026-09-01', phase: 'holdout' }
].map(Object.freeze));
export const JEU19_SEGMENTS = Object.freeze([
  ...['MES', 'MYM'].flatMap(symbol => [
    { symbol, ticker: symbol + 'H6', prep: '2025-12-01', start: '2026-01-01', end: '2026-03-16' },
    { symbol, ticker: symbol + 'M6', prep: '2026-02-01', start: '2026-03-16', end: '2026-06-15' },
    { symbol, ticker: symbol + 'U6', prep: '2026-05-01', start: '2026-06-15', end: '2026-09-01' }
  ]),
  { symbol: 'MGC', ticker: 'MGCG6', prep: '2025-12-01', start: '2026-01-01', end: '2026-01-26' },
  { symbol: 'MGC', ticker: 'MGCJ6', prep: '2026-01-01', start: '2026-01-26', end: '2026-03-25' },
  { symbol: 'MGC', ticker: 'MGCM6', prep: '2026-03-01', start: '2026-03-25', end: '2026-05-25' },
  { symbol: 'MGC', ticker: 'MGCQ6', prep: '2026-05-01', start: '2026-05-25', end: '2026-07-27' },
  { symbol: 'MGC', ticker: 'MGCV6', prep: '2026-07-01', start: '2026-07-27', end: '2026-09-01' }
].map(Object.freeze));
