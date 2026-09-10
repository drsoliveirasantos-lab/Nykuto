import { JEU40_POLICY } from './jeu40-policy.mjs';
export const JEU46_POLICY = Object.freeze({
  ...JEU40_POLICY, version: 'jeu46-closed-invalidation-v1', variant: null,
  reference: 'baseline', priorCandidate: 'mnq-time-exit30',
  invalidation: 'first-surviving-closed-M5-strictly-back-through-original-breakout-level',
  longCondition: 'closed-price-less-than-rangeHigh',
  shortCondition: 'closed-price-greater-than-rangeLow',
  equalityInvalidates: false, entryBarEligible: true,
  fill: 'next-open-original-gap-risk-stop-target-priority',
  occupiedExitSlot: true, stopMoved: false, reversePosition: false,
  combinedVariants: false, parameterSearch: false, modelInferences: 0,
  newConfigurations: 2, executionCount: 64, exactControls: 32,
  accountPrefixes: 1312, filterPrefixes: 1312, contextPrefixes: 1312,
  criterion: 'separate-Game45-gates-against-baseline-and-prior-candidate; progression-requires-both',
  costsDoubled: 'commission-and-modeled-slippage-only-risk-cap-remains-100-USD',
});
export const JEU46_VARIANTS = Object.freeze([
  { id: 'baseline', timeExitSymbol: null, invalidationSymbol: null, control: true },
  { id: 'mnq-time-exit30', timeExitSymbol: 'MNQ', invalidationSymbol: null, control: true },
  { id: 'mnq-closed-invalidation', timeExitSymbol: null, invalidationSymbol: 'MNQ', control: false },
  { id: 'mes-closed-invalidation', timeExitSymbol: null, invalidationSymbol: 'MES', control: false },
].map(Object.freeze));
