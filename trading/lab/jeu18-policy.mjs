export const JEU18_POLICY = Object.freeze({
  version: 'jeu18-vwap-v1', definedAt: '2026-09-09', tick: .25,
  anchorMinute: 570, candleSeconds: 300, priceSource: 'hlc3',
  independent: false, confirmed: false, paperEnabled: false,
  shadowEnabled: false, brokerEnabled: false, liveFeed: false
});
export const JEU18_SCENARIOS = Object.freeze([
  Object.freeze({ id: 'reference', label: 'ATR + marge · référence', filter: 'none' }),
  Object.freeze({ id: 'vwap', label: 'ATR + marge + VWAP de séance', filter: 'vwap' })
]);
