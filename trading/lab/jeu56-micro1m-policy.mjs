export const MICRO1M_POLICY = Object.freeze({
  version: 'jeu56-v1',
  researchOnly: true,
  executionAllowed: false,
  paperPromotion: false,
  contextTimeframe: '15m',
  primaryAlertTimeframe: '5m',
  microTimeframe: '1m',
  standalone1mProductionAlert: false,
  families: Object.freeze(['structure', 'momentum', 'participation', 'levelReaction']),
  stage1: Object.freeze({ windowsMinutes: Object.freeze([2, 3, 5]), minimumScores: Object.freeze([2, 3, 4]), cooldownMinutes: 10 }),
  stage2: Object.freeze({ conditionalOnRobustNeighborhood: true, cooldownMinutes: Object.freeze([5, 10, 20]) }),
  variants: Object.freeze([
    'reference-no-1m',
    'confirm-same-side',
    'warning-opposite',
    'veto-opposite',
    'timing-only',
    'standalone-1m-research-control'
  ]),
  primaryMetric: 'incremental-expectancy-vs-same-5m-population'
});
