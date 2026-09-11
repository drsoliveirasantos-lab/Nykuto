// Dates frozen before retrieving prices. This retrospective sample overlaps markets previously studied.
const closed = new Set(['2025-12-25', '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25', '2026-06-19', '2026-07-03']);
const calendar = [];
for (let time = Date.parse('2025-12-01T12:00:00Z'); time < Date.parse('2026-09-01T00:00:00Z'); time += 86400000) {
  const date = new Date(time), day = date.toISOString().slice(0, 10);
  if (![0, 6].includes(date.getUTCDay()) && !closed.has(day) && !(day >= '2026-03-01' && day < '2026-03-09')) calendar.push(day);
}
export const SIX_MONTHS_DAYS = Object.freeze(calendar);
export const SIX_MONTHS_SEGMENTS = Object.freeze([
  Object.freeze({ ticker: 'MNQH6', prep: '2025-12-01', start: '2026-01-01', end: '2026-03-01', expiry: '2026-03-20' }),
  Object.freeze({ ticker: 'MNQM6', prep: '2026-03-09', start: '2026-04-01', end: '2026-06-01', expiry: '2026-06-18' }),
  Object.freeze({ ticker: 'MNQU6', prep: '2026-06-01', start: '2026-07-01', end: '2026-09-01', expiry: '2026-09-18' })
]);
const epoch = day => Date.parse(`${day}T00:00:00Z`) / 1000;
export const SIX_MONTHS_WINDOWS = Object.freeze([
  Object.freeze({ label: 'Janvier – février 2026', start: epoch('2026-01-01'), end: epoch('2026-03-01') }),
  Object.freeze({ label: 'Avril – mai 2026', start: epoch('2026-04-01'), end: epoch('2026-06-01') }),
  Object.freeze({ label: 'Juillet – août 2026', start: epoch('2026-07-01'), end: epoch('2026-09-01') })
]);
export const SIX_MONTHS_POLICY = Object.freeze({ version: 'jeu09-v2', start: '2026-01-01', end: '2026-09-01', earlyCloses: Object.freeze({ '2025-12-24': 780 }), retrospective: true, independent: false, paperEnabled: false });
