export const JEU16_POLICY = Object.freeze({
  version: 'jeu16-structural-v1', definedAt: '2026-09-09',
  pivotLeft: 2, pivotRight: 2, bufferTicks: 1, minNetRewardRisk: 1,
  independent: false, confirmed: false, paperEnabled: false,
  shadowEnabled: false, brokerEnabled: false, liveFeed: false
});
export const JEU16_SCENARIOS = Object.freeze([
  Object.freeze({ id: 'atr5', label: 'Référence · stop ATR 5 min', stopMode: 'atr', guarded: true }),
  Object.freeze({ id: 'pivot5', label: 'Nouveau · pivot confirmé + marge nette', stopMode: 'pivot', guarded: true })
]);
