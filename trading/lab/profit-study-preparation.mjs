import {historyCalendar} from './jeu14-policy.mjs';
import {admissionSignals} from './jeu23-signals.mjs';
import {combinedContexts} from './jeu24-context.mjs';
import {JEU29_PRODUCTS} from './jeu29-policy.mjs';
export function prepareMnqProfitStudy(corpus, through = '2026-08-31') {
  if (corpus.symbol !== 'MNQ' || corpus.intervalMinutes !== 5 || !/^2026-\d{2}-\d{2}$/.test(through) || through > '2026-08-31')
    throw Error('MNQ M5 and authorized historical end required');
  const expected = historyCalendar('2026-05-25', '2026-09-01').filter(d => d.date <= through);
  const byDay = new Map();
  for (const bar of corpus.candles) {
    if (bar.day > through) continue;
    if (!byDay.has(bar.day)) byDay.set(bar.day, []);
    byDay.get(bar.day).push(bar);
  }
  const product = JEU29_PRODUCTS.find(p => p.symbol === 'MNQ');
  const candles = [], excluded = [], eligibleDays = [];
  for (const date of expected) {
    const group = byDay.get(date.date) || [];
    const closeMinute = Number(date.close.slice(11,13)) * 60 + Number(date.close.slice(14,16));
    const complete = group.length === (closeMinute - 570) / 5 &&
      group.every((b, i) => b.day === date.date && b.minute === 570 + 5*i &&
        b.closeMinute === closeMinute && (!i || b.time === group[i-1].time + 300));
    if (!complete) {excluded.push({day: date.date, reason: 'incomplete-research-session', observedBars: group.length}); continue;}
    candles.push(...group); eligibleDays.push(date.date);
  }
  const stream = {symbol: 'MNQ', candles, signals: new Map()};
  // Rebuild each day independently, preventing a missing session from creating a fictitious signal.
  for (const day of eligibleDays) {
    const group = candles.filter(b => b.day === day);
    for (const [t, s] of admissionSignals(group, product)) stream.signals.set(t, s);
  }
  // MNQ native entry has no MES-RSI/MGC-clock filter. Context is descriptive under fixed risk.
  const contexts = new Map([['MNQ', combinedContexts(candles, product)]]);
  return {stream, contexts, excluded, eligibleDays};
}
