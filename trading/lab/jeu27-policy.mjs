import { JEU23_POLICY, JEU23_PRODUCTS } from './jeu23-policy.mjs';
export const JEU27_POLICY = Object.freeze({ ...JEU23_POLICY,
  version: 'jeu27-fresh-reentry-v1', priorAttempts: 57,
  riskPerTrade: 150, riskCaps: Object.freeze([150]), dailyLoss: 300,
  maxTradesPerDay: 2, maxTradesPerSide: 2, quantity: 1,
  riskMode: 'fixed-admission-cap',
  reentryMode: 'breakout-open-at-or-after-previous-same-side-exit-bar-close'
});
export const JEU27_PRODUCTS = JEU23_PRODUCTS;
export const JEU27_SCENARIOS = Object.freeze([Object.freeze({
  id: 'fresh-reentry150', label: 'Nouveau retour après sortie · plafond 150 $',
  guarded: true, riskPerTrade: 150, dailyLoss: 300
})]);
