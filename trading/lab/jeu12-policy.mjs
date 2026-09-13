export const JEU12_POLICY = Object.freeze({ version: 'jeu12-v1', timeframes: Object.freeze([5, 15, 30]), warmup: 220, executionMinutes: 5, exitBeforeClose: 15, paperEnabled: false });
export const JEU12_HOURS = Object.freeze([
  { id: 'full', label: 'Full session', start: 570, end: 945 },
  { id: 'morning', label: 'Morning', start: 570, end: 720 },
  { id: 'afternoon', label: 'Afternoon', start: 780, end: 945 }
].map(Object.freeze));
export const JEU12_CONFIGS = Object.freeze(JEU12_POLICY.timeframes.flatMap(timeframe => JEU12_HOURS.flatMap(hours => ['Both', 'Long', 'Short'].map(side => Object.freeze({ id: `${timeframe}-${hours.id}-${side.toLowerCase()}`, timeframe, hours, side })))));
export const JEU12_CONTROL = Object.freeze({ ticker: 'MNQU5', prep: '2025-05-01', start: '2025-06-01', end: '2025-07-01', expiry: '2025-09-19', label: 'Juin 2025' });
