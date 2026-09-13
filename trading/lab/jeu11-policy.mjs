export const JEU11_POLICY = Object.freeze({ version: 'jeu11-v1', ticker: 'MNQM5', expiry: '2025-06-20', prep: '2025-03-17', start: '2025-04-01', end: '2025-06-01', label: 'Avril–mai 2025', completeWindows: 1, requiredWindows: 3, paperEnabled: false });
const closed = new Set(['2025-04-18', '2025-05-26']);
const days = [];
for (let time = Date.parse(`${JEU11_POLICY.prep}T00:00:00Z`); time < Date.parse(`${JEU11_POLICY.end}T00:00:00Z`); time += 86400000) {
  const date = new Date(time), day = date.toISOString().slice(0, 10);
  if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6 && !closed.has(day)) days.push(day);
}
export const JEU11_DAYS = Object.freeze(days);
export const JEU11_EVENTS = Object.freeze([
  { day: '2025-04-04', type: 'NFP' }, { day: '2025-04-10', type: 'CPI' },
  { day: '2025-05-02', type: 'NFP' }, { day: '2025-05-07', type: 'FOMC' },
  { day: '2025-05-13', type: 'CPI' }
].map(Object.freeze));
