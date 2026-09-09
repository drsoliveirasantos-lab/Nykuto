export const JEU13_SELECTED = '30-full-both';
export const JEU13_CONTROL_SEGMENTS = Object.freeze([
  { ticker: 'MNQM5', prep: '2025-05-01', start: '2025-06-01', end: '2025-06-16', expiry: '2025-06-20' },
  { ticker: 'MNQU5', prep: '2025-05-21', start: '2025-06-16', end: '2025-07-01', expiry: '2025-09-19' }
].map(Object.freeze));
export const JEU13_CONTROL_DAYS = Object.freeze(Array.from({ length: 61 }, (_, i) => new Date(Date.parse('2025-05-01T00:00:00Z') + i * 86400000)).filter(d => ![0, 6].includes(d.getUTCDay()) && !['2025-05-26', '2025-06-19'].includes(d.toISOString().slice(0, 10))).map(d => d.toISOString().slice(0, 10)));
