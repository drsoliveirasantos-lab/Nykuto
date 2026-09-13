import { JEU23_POLICY, JEU23_PRODUCTS } from './jeu23-policy.mjs';
export const JEU28_POLICY = Object.freeze({ ...JEU23_POLICY,
  version: 'jeu28-closed-breakeven-v1', priorAttempts: 61,
  riskPerTrade: 150, riskCaps: Object.freeze([150]), dailyLoss: 300,
  maxTradesPerDay: 2, maxTradesPerSide: 1, quantity: 1,
  riskMode: 'fixed-admission-cap', breakEvenTriggerR: 1,
  breakEvenMode: 'closed-bar-1R-next-bar-fee-covered-stop'
});
export const JEU28_PRODUCTS = JEU23_PRODUCTS;
export const JEU28_SCENARIOS = Object.freeze([Object.freeze({
  id: 'closed-breakeven150', label: 'Protection après clôture +1R · plafond 150 $',
  guarded: true, riskPerTrade: 150, dailyLoss: 300
})]);
