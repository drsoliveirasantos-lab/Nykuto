export const JEU14_POLICY = Object.freeze({ version: 'jeu14-v1', candidateId: '30-full-both', family: 'pullback', from: '2025-03-17', end: '2026-09-09', warmup: 220, bootstrapSeed: 14092026, bootstrapDraws: 10000, paperEnabled: false });
export const JEU14_SEGMENTS = Object.freeze([
  { ticker: 'MNQM5', prep: '2025-03-17', start: '2025-03-17', end: '2025-06-16', expiry: '2025-06-20' },
  { ticker: 'MNQU5', prep: '2025-05-01', start: '2025-06-16', end: '2025-09-15', expiry: '2025-09-19' },
  { ticker: 'MNQZ5', prep: '2025-08-01', start: '2025-09-15', end: '2025-12-15', expiry: '2025-12-19' },
  { ticker: 'MNQH6', prep: '2025-11-01', start: '2025-12-15', end: '2026-03-16', expiry: '2026-03-20' },
  { ticker: 'MNQM6', prep: '2026-02-01', start: '2026-03-16', end: '2026-06-15', expiry: '2026-06-18' },
  { ticker: 'MNQU6', prep: '2026-05-01', start: '2026-06-15', end: '2026-09-09', expiry: '2026-09-18' }
].map(Object.freeze));
const holidays = new Set(['2025-04-18','2025-05-26','2025-06-19','2025-07-04','2025-09-01','2025-11-27','2025-12-25','2026-01-01','2026-01-19','2026-02-16','2026-04-03','2026-05-25','2026-06-19','2026-07-03','2026-09-07']);
const early = new Set(['2025-07-03','2025-11-28','2025-12-24']);
export function historyCalendar(from = JEU14_POLICY.from, end = JEU14_POLICY.end) {
  const rows = [];
  for (let t = Date.parse(from + 'T00:00:00Z'); t < Date.parse(end + 'T00:00:00Z'); t += 86400000) {
    const d = new Date(t), date = d.toISOString().slice(0,10);
    if (![0,6].includes(d.getUTCDay()) && !holidays.has(date)) rows.push({ date, open: date + 'T09:30:00', close: date + (early.has(date) ? 'T13:00:00' : 'T16:00:00') });
  }
  return rows;
}
export const JEU14_WINDOWS = Object.freeze(['2025-05-01','2025-07-01','2025-09-01','2025-11-01','2026-01-01','2026-03-01','2026-05-01','2026-07-01'].map(start => {
  const end = new Date(start+'T00:00:00Z'); end.setUTCMonth(end.getUTCMonth()+2);
  return Object.freeze({ start, end:end.toISOString().slice(0,10), confirmation:['2025-07-01','2025-09-01','2025-11-01'].includes(start) });
}));
