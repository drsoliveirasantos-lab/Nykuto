export const JEU15_POLICY = Object.freeze({
  version: 'jeu15-lucidflex-v1', checkedAt: '2026-09-09', account: 'LucidFlex 25K evaluation',
  initial: 25000, maxLoss: 1000, lockedFloor: 25100, profitTarget: 1250,
  consistency: .5, riskPerTrade: 50, dailyLoss: 100, floorReserve: 100,
  tick: .25, multiplier: 2, maxContracts: 1, cost: 3.5, exitBeforeClose: 15,
  paperEnabled: false, shadowEnabled: false, brokerEnabled: false,
  independent: false, liveFeed: false, confirmed: false
});
export const JEU15_SCENARIOS = Object.freeze([
  { id: 'reference30', label: 'Pullback 30 min · référence', signal: 'pullback30', guarded: false },
  { id: 'guard30', label: 'Pullback 30 min · risque limité', signal: 'pullback30', guarded: true },
  { id: 'entry5trend30', label: 'Pullback 5 min + tendance 30 min', signal: 'entry5trend30', guarded: true }
].map(Object.freeze));
