import { RULES, contextFor, simulate, metrics, evaluateGate } from './validation-engine.mjs?v=2';

export const SESSION_POLICY = Object.freeze({ version: 'jeu05-v1', closeMinutesBeforeEnd: 15, validationYear: 2025, developmentYear: 2026, protocolCommit: 'dcf15deec3bdd439fe2daa7491cbdad05f798a32' });
const epoch = date => Date.parse(`${date}T00:00:00Z`) / 1000;
const ny = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const minuteOf = text => Number(text.slice(11, 13)) * 60 + Number(text.slice(14, 16));
export function sessionFor(time) {
  const p = Object.fromEntries(ny.formatToParts(new Date(time * 1000)).map(p => [p.type, p.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, minute: Number(p.hour) * 60 + Number(p.minute) };
}
export function comparisonWindows(year) {
  return [['Janvier – février', '01', '03'], ['Mars – avril', '03', '05'], ['Mai – juin', '05', '07']].map(([label, start, end]) => ({ label: `${label} ${year}`, start: epoch(`${year}-${start}-01`), end: epoch(`${year}-${end}-01`) }));
}

export function prepareSessionCandles(input, calendar, year) {
  if (![2025, 2026].includes(year)) throw new Error('Année hors protocole du Jeu 05.');
  const prepDate = `${year - 1}-12-01`, endDate = `${year}-07-01`;
  const sessions = new Map();
  for (const entry of calendar.filter(c => c.date >= prepDate && c.date < endDate)) {
    const open = minuteOf(entry.open), close = minuteOf(entry.close);
    if (sessions.has(entry.date) || !entry.open.startsWith(entry.date) || !entry.close.startsWith(entry.date) || open !== 570 || !Number.isFinite(close) || close <= open || close > 960 || (close - open) % 15) throw new Error('Calendrier de séance invalide.');
    sessions.set(entry.date, { ...entry, openMinute: open, closeMinute: close, bars: [] });
  }
  const candles = [];
  for (const bar of input) {
    if (bar.time < epoch(prepDate) || bar.time >= epoch(endDate)) continue;
    const local = sessionFor(bar.time), session = sessions.get(local.day);
    if (!session || local.minute < session.openMinute || local.minute >= session.closeMinute) continue;
    const enriched = { ...bar, ...local, sessionEnd: local.minute === session.closeMinute - SESSION_POLICY.closeMinutesBeforeEnd };
    candles.push(enriched); session.bars.push(enriched);
  }
  candles.sort((a, b) => a.time - b.time);
  for (const session of sessions.values()) {
    session.bars.sort((a, b) => a.time - b.time);
    const expected = (session.closeMinute - session.openMinute) / 15;
    if (session.bars.length !== expected || session.bars.some((bar, i) => bar.minute !== session.openMinute + i * 15 || bar.time % 900 !== 0)) throw new Error(`${session.date} : séance incomplète. Le test ne peut pas utiliser une clôture déduite de données manquantes.`);
  }
  const warmupBars = candles.filter(c => c.time < epoch(`${year}-01-01`)).length;
  if (warmupBars < RULES.warmup) throw new Error('Historique de préparation insuffisant.');
  const quality = comparisonWindows(year).map(w => {
    const bars = candles.filter(c => c.time >= w.start && c.time < w.end);
    const count = new Set(bars.map(c => c.day)).size;
    if (count < 30 || !bars.length || bars[0].time - w.start > 7 * 86400 || w.end - bars.at(-1).time > 7 * 86400) throw new Error(`${w.label} : couverture insuffisante.`);
    return { label: w.label, bars: bars.length, sessions: count, first: bars[0].time, last: bars.at(-1).time };
  });
  return { candles, warmupBars, quality };
}

function describe(trades) {
  return { ...metrics(trades), worst: trades.length ? Math.min(...trades.map(t => t.resultR)) : null, overnight: trades.filter(t => sessionFor(t.entryTime).day !== sessionFor(t.exitTime).day).length, gaps: trades.filter(t => t.reason === 'Gap au-delà du stop').length };
}

export function runSessionComparison(input, calendar, year = SESSION_POLICY.validationYear) {
  const prepared = prepareSessionCandles(input, calendar, year), ctx = contextFor(prepared.candles);
  const windows = comparisonWindows(year).map(window => {
    const controlTrades = simulate(prepared.candles, ctx, window, true, RULES.costR);
    const candidateTrades = simulate(prepared.candles, ctx, window, true, RULES.costR, true);
    const stressTrades = simulate(prepared.candles, ctx, window, true, RULES.stressCostR, true);
    return { ...window, control: describe(controlTrades), candidate: describe(candidateTrades), stress: describe(stressTrades), controlTrades, candidateTrades, stressTrades };
  });
  const control = describe(windows.flatMap(w => w.controlTrades));
  const candidate = describe(windows.flatMap(w => w.candidateTrades));
  const stress = describe(windows.flatMap(w => w.stressTrades));
  const assessed = evaluateGate(windows.map(w => ({ filtered: w.candidate })), candidate, stress, control);
  assessed.checks[3].label = 'Résultat moyen supérieur à la stratégie avec nuits';
  const gate = year === SESSION_POLICY.validationYear ? assessed : { status: 'Exploration — données déjà utilisées', checks: [], paperEnabled: false };
  return { policy: SESSION_POLICY, rules: RULES, year, windows, control, candidate, stress, gate, quality: prepared.quality, warmupBars: prepared.warmupBars };
}

export function diagnoseTrades(trades) {
  const groups = [
    ['Achats', t => t.side === 'Long'], ['Ventes', t => t.side === 'Short'],
    ['Entrées 09:30–10:30', t => sessionFor(t.entryTime).minute < 630],
    ['Entrées 10:30–14:00', t => sessionFor(t.entryTime).minute >= 630 && sessionFor(t.entryTime).minute < 840],
    ['Entrées 14:00–16:00', t => sessionFor(t.entryTime).minute >= 840],
    ['Positions gardées la nuit', t => sessionFor(t.entryTime).day !== sessionFor(t.exitTime).day],
    ['Sorties au-delà du stop', t => t.reason === 'Gap au-delà du stop']
  ];
  return groups.map(([label, select]) => ({ label, ...describe(trades.filter(select)) }));
}
