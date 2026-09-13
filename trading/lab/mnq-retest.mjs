import { runConfirmation } from './mnq-confirmation.mjs?v=3';
const days = [];
for (let t = Date.parse('2026-06-15T12:00:00Z'); t < Date.parse('2026-07-25T00:00:00Z'); t += 86400000) {
  const date = new Date(t), day = date.toISOString().slice(0, 10);
  if (![0, 6].includes(date.getUTCDay()) && !['2026-06-19', '2026-07-03'].includes(day)) days.push(day);
}
export const RETEST_POLICY = Object.freeze({ version: 'jeu07b-v1', ticker: 'MNQU6', prep: '2026-06-15', start: '2026-07-01', end: '2026-07-25', calendarDays: Object.freeze(days), label: '1–24 juillet 2026', completeWindows: 0, requiredWindows: 3, diagnostic: true, paperEnabled: false });
export const runRetest = bundle => runConfirmation(bundle, RETEST_POLICY);
