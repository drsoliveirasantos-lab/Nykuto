export const JEU17_POLICY = Object.freeze({
  version: 'jeu17-ablation-v1', definedAt: '2026-09-09', minNetRewardRisk: 1,
  independent: false, confirmed: false, paperEnabled: false,
  shadowEnabled: false, brokerEnabled: false, liveFeed: false
});
export const JEU17_SCENARIOS = Object.freeze([
  Object.freeze({ id: 'atr5', label: 'ATR · sans filtre de marge', stopMode: 'atr', netMargin: false, guarded: true }),
  Object.freeze({ id: 'atrNet5', label: 'ATR · avec filtre de marge', stopMode: 'atr', netMargin: true, guarded: true }),
  Object.freeze({ id: 'pivotOnly5', label: 'Pivot · sans filtre de marge', stopMode: 'pivot', netMargin: false, guarded: true }),
  Object.freeze({ id: 'pivot5', label: 'Pivot · avec filtre de marge', stopMode: 'pivot', netMargin: true, guarded: true })
]);
export const JEU17_CONTRASTS = Object.freeze([
  Object.freeze({ from: 'atr5', to: 'atrNet5', label: 'Ajouter la marge au stop ATR' }),
  Object.freeze({ from: 'pivotOnly5', to: 'pivot5', label: 'Ajouter la marge au stop pivot' }),
  Object.freeze({ from: 'atr5', to: 'pivotOnly5', label: 'Passer au pivot, sans marge' }),
  Object.freeze({ from: 'atrNet5', to: 'pivot5', label: 'Passer au pivot, avec marge' })
]);
