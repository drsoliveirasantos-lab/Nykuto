import { JEU23_PRODUCTS, JEU23_SCENARIOS } from './jeu23-policy.mjs';
export const JEU29_PRODUCTS = JEU23_PRODUCTS;
export const JEU29_RISK = JEU23_SCENARIOS.find(s => s.riskPerTrade === 150);
// One joint configuration; alphabetical tie-break, never ranked by observed PnL.
export const JEU29_PROFILES = Object.freeze([
  { symbol: 'MES', strategy: 'baseline', game: 23 },
  { symbol: 'MGC', strategy: 'failure', game: 26 },
  { symbol: 'MNQ', strategy: 'protection', game: 28 },
  { symbol: 'MYM', strategy: 'protection', game: 28 }
].map(Object.freeze));
export const JEU29_POLICY = Object.freeze({
  version: 'jeu29-shared-portfolio-v1', id: 'PORTFOLIO/shared150',
  from: '2026-01-01', trainEnd: '2026-05-01', priorAttempts: 65,
  riskPerTrade: 150, dailyLoss: 300, floorReserve: 100,
  maxTradesPerDay: 2, maxPositions: 1, quantity: 1,
  tieBreak: 'MES,MGC,MNQ,MYM', coverage: 'intersection-of-complete-sessions',
  maxDrawdownR: 8, minimumPF: 1.1, minimumTrades: 40, minimumWindowTrades: 12,
  independent: false, confirmed: false, executionAllowed: false,
  brokerEnabled: false, paperEnabled: false, shadowEnabled: false, liveFeed: false
});
