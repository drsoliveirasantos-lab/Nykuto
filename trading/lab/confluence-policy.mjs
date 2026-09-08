export const CONFLUENCE_POLICY = Object.freeze({ version: 'jeu10-v1', retrospective: true, independent: false, paperEnabled: false, hourFast: 20, hourSlow: 50, volumeSessions: 5, volumeRatio: 1 });
export const CONFLUENCE_VARIANTS = Object.freeze([
  { id: 'baseline', label: 'Référence', filters: [] },
  { id: 'trend', label: '+ Tendance 1 h', filters: ['trend'] },
  { id: 'candle', label: '+ Bougie englobante', filters: ['candle'] },
  { id: 'volume', label: '+ Volume', filters: ['volume'] },
  { id: 'events', label: 'Sans jours d’annonces', filters: ['events'] },
  { id: 'combined', label: 'Quatre confirmations', filters: ['trend', 'candle', 'volume', 'events'] },
  { id: 'long', label: 'Long seulement', filters: ['long'] },
  { id: 'short', label: 'Short seulement', filters: ['short'] }
].map(v => Object.freeze({ ...v, filters: Object.freeze(v.filters) })));
export const EVENT_SOURCES = Object.freeze({ CPI: 'https://www.bls.gov/schedule/news_release/cpi.htm', Emploi: 'https://www.bls.gov/schedule/news_release/empsit.htm', FOMC: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm' });
export const CONFLUENCE_EVENTS = Object.freeze([
  ...['2026-01-13', '2026-02-13', '2026-04-10', '2026-05-12', '2026-07-14', '2026-08-12'].map(day => ({ day, type: 'CPI' })),
  ...['2026-01-09', '2026-02-11', '2026-04-03', '2026-05-08', '2026-07-02', '2026-08-07'].map(day => ({ day, type: 'Emploi' })),
  ...['2026-01-28', '2026-04-29', '2026-07-29'].map(day => ({ day, type: 'FOMC' }))
].sort((a, b) => a.day.localeCompare(b.day)).map(Object.freeze));
