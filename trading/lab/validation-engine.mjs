import { ema, atr, adx } from './validation-indicators.mjs';

const epoch = date => Date.parse(`${date}T00:00:00Z`) / 1000;
export const RULES = Object.freeze({
  version: 'jeu04-v1', asset: 'SPY', interval: '15m', fast: 9, slow: 21,
  adxPeriod: 14, adxMin: 20, atrPeriod: 14, atrMultiple: 1.25,
  rr: 1.5, costR: 0.05, stressCostR: 0.10, maxTrades: 3,
  maxDailyLoss: 2, lossStreak: 2, warmup: 220,
  minimumTotalTrades: 40, minimumWindowTrades: 12
});
export const WINDOWS = Object.freeze([
  Object.freeze({ label: 'Janvier – février', start: epoch('2026-01-01'), end: epoch('2026-03-01') }),
  Object.freeze({ label: 'Mars – avril', start: epoch('2026-03-01'), end: epoch('2026-05-01') }),
  Object.freeze({ label: 'Mai – juin', start: epoch('2026-05-01'), end: epoch('2026-07-01') })
]);
const newYork = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

function session(time) {
  const p = Object.fromEntries(newYork.formatToParts(new Date(time * 1000)).map(({ type, value }) => [type, value]));
  return { day: `${p.year}-${p.month}-${p.day}`, minute: Number(p.hour) * 60 + Number(p.minute), weekend: p.weekday === 'Sat' || p.weekday === 'Sun' };
}

export function prepareCandles(input) {
  const start = WINDOWS[0].start, end = WINDOWS.at(-1).end;
  const candles = input.filter(c => c.time >= epoch('2025-12-01') && c.time < end).map(c => ({ ...c, ...session(c.time) })).filter(c => !c.weekend && c.minute >= 570 && c.minute < 960);
  const firstTest = candles.findIndex(c => c.time >= start);
  if (firstTest < 0) throw new Error('Aucune bougie sur janvier à juin 2026. Les dates du Jeu 03 sont exclues.');
  if (firstTest < RULES.warmup) throw new Error(`Il manque l’historique de décembre : ${firstTest} bougies de préparation, ${RULES.warmup} requises avant janvier.`);
  const quality = [];
  for (const window of WINDOWS) {
    const bars = candles.filter(c => c.time >= window.start && c.time < window.end);
    const days = new Map();
    for (const bar of bars) {
      if (!days.has(bar.day)) days.set(bar.day, []);
      days.get(bar.day).push(bar);
    }
    let gaps = 0;
    for (const day of days.values()) {
      for (let i = 1; i < day.length; i += 1) if (day[i].time - day[i - 1].time !== 900) gaps += 1;
      // 13 bars permits genuine shortened sessions without inventing their calendar.
      if (day.length < 13 || day[0].minute !== 570) gaps += 1;
    }
    if (days.size < 30 || !bars.length || bars[0].time - window.start > 7 * 86400 || window.end - bars.at(-1).time > 7 * 86400) {
      throw new Error(`${window.label} : période incomplète. Fournis la période entière avec au moins 30 séances.`);
    }
    if (gaps) throw new Error(`${window.label} : ${gaps} anomalie(s) de continuité en séance. Utilise des bougies 15 minutes, horodatées à l’ouverture, sans trous intrajournaliers.`);
    quality.push({ label: window.label, bars: bars.length, sessions: days.size, first: bars[0].time, last: bars.at(-1).time });
  }
  return { candles, quality, warmupBars: firstTest, excludedBars: input.length - candles.length };
}

export function contextFor(candles) {
  const closes = candles.map(c => c.close);
  return { fast: ema(closes, RULES.fast), slow: ema(closes, RULES.slow), atr: atr(candles, RULES.atrPeriod), adx: adx(candles, RULES.adxPeriod) };
}

export function exitFill(position, candle) {
  const long = position.side === 'Long';
  if (long ? candle.open <= position.stop : candle.open >= position.stop) return { price: candle.open, reason: 'Gap au-delà du stop' };
  if (long ? candle.open >= position.target : candle.open <= position.target) return { price: position.target, reason: 'Objectif à l’ouverture' };
  const stop = long ? candle.low <= position.stop : candle.high >= position.stop;
  const target = long ? candle.high >= position.target : candle.low <= position.target;
  if (stop) return { price: position.stop, reason: target ? 'Stop prioritaire' : 'Stop' };
  if (target) return { price: position.target, reason: 'Objectif' };
  return null;
}

// Each window starts flat. Indicator preparation may use only earlier bars;
// no order from preparation or another window is carried into the scored period.
export function simulate(candles, ctx, window, filtered, costR = RULES.costR, flatBeforeClose = false) {
  const first = candles.findIndex(c => c.time >= window.start);
  let end = candles.findIndex(c => c.time >= window.end);
  if (end < 0) end = candles.length;
  if (first < 1 || end <= first) return [];
  const trades = [];
  let position = null, pending = null, day = null, count = 0, realized = 0, losses = 0;
  const close = (fill, candle) => {
    const grossR = (fill.price - position.entry) / position.risk * (position.side === 'Long' ? 1 : -1);
    const resultR = grossR - costR;
    trades.push({ side: position.side, entryTime: position.entryTime, exitTime: candle.time, entry: position.entry, exit: fill.price, stop: position.stop, target: position.target, risk: position.risk, grossR, costR, resultR, reason: fill.reason, window: window.label });
    realized += resultR;
    losses = resultR < 0 ? losses + 1 : 0;
    position = null;
  };
  for (let i = first; i < end; i += 1) {
    const candle = candles[i];
    const currentDay = candle.day || new Date(candle.time * 1000).toISOString().slice(0, 10);
    if (day !== currentDay) { day = currentDay; count = 0; realized = 0; losses = 0; if (flatBeforeClose) pending = null; }
    // sessionEnd comes from the validated exchange calendar, never a future price.
    if (flatBeforeClose && candle.sessionEnd) {
      pending = null;
      if (position) close(exitFill(position, { open: candle.open, high: candle.open, low: candle.open }) || { price: candle.open, reason: 'Fin de séance' }, candle);
      continue;
    }
    const allowed = () => count < RULES.maxTrades && realized > -RULES.maxDailyLoss && losses < RULES.lossStreak;
    if (!position && pending) {
      const risk = ctx.atr[pending.index] * RULES.atrMultiple;
      if (allowed() && Number.isFinite(risk) && risk > 0) {
        const sign = pending.side === 'Long' ? 1 : -1;
        position = { side: pending.side, entryTime: candle.time, entry: candle.open, risk, stop: candle.open - sign * risk, target: candle.open + sign * risk * RULES.rr };
        count += 1;
      }
      pending = null;
    }
    if (position) { const fill = exitFill(position, candle); if (fill) close(fill, candle); }
    if (!position && allowed() && i < end - 1 && [ctx.fast[i - 1], ctx.slow[i - 1], ctx.fast[i], ctx.slow[i]].every(Number.isFinite)) {
      const side = ctx.fast[i - 1] <= ctx.slow[i - 1] && ctx.fast[i] > ctx.slow[i] ? 'Long' : ctx.fast[i - 1] >= ctx.slow[i - 1] && ctx.fast[i] < ctx.slow[i] ? 'Short' : null;
      if (side && (!filtered || Number.isFinite(ctx.adx[i]) && ctx.adx[i] >= RULES.adxMin)) pending = { side, index: i };
    }
  }
  if (position) close({ price: candles[end - 1].close, reason: 'Fin de période' }, candles[end - 1]);
  return trades;
}

export function metrics(trades) {
  const count = trades.length;
  if (!count) return { count: 0, wins: 0, win: null, total: 0, exp: null, pf: null, dd: 0, winInterval: null };
  let total = 0, profit = 0, loss = 0, peak = 0, dd = 0, wins = 0;
  for (const trade of trades) {
    const r = trade.resultR;
    total += r; profit += Math.max(r, 0); loss += Math.max(-r, 0); wins += r > 0 ? 1 : 0;
    peak = Math.max(peak, total); dd = Math.max(dd, peak - total);
  }
  const win = wins / count, z = 1.96, denominator = 1 + z * z / count;
  const center = (win + z * z / (2 * count)) / denominator;
  const radius = z * Math.sqrt(win * (1 - win) / count + z * z / (4 * count * count)) / denominator;
  return { count, wins, win, total, exp: total / count, pf: loss ? profit / loss : profit ? Infinity : null, dd, winInterval: [Math.max(0, center - radius), Math.min(1, center + radius)] };
}

export function evaluateGate(windows, total, stress, baseline) {
  const checks = [
    { label: 'Au moins 40 trades filtrés au total', pass: total.count >= RULES.minimumTotalTrades },
    { label: 'Au moins 12 trades filtrés dans chacune des 3 périodes', pass: windows.every(w => w.filtered.count >= RULES.minimumWindowTrades) },
    { label: 'Résultat moyen positif dans chacune des 3 périodes', pass: windows.every(w => Number.isFinite(w.filtered.exp) && w.filtered.exp > 0) },
    { label: 'Résultat moyen supérieur à l’EMA seule sur l’ensemble', pass: Number.isFinite(total.exp) && Number.isFinite(baseline.exp) && total.exp > baseline.exp },
    { label: 'Profit factor au moins égal à 1,10', pass: total.pf !== null && total.pf >= 1.10 },
    { label: 'Baisse maximale réalisée limitée à 8 R', pass: total.dd <= 8 },
    { label: 'Résultat moyen total positif avec un coût doublé (0,10 R)', pass: Number.isFinite(stress.exp) && stress.exp > 0 }
  ];
  const enough = checks[0].pass && checks[1].pass;
  return { checks, status: !enough ? 'Échantillon insuffisant' : checks.every(c => c.pass) ? 'Piste à examiner' : 'Non confirmé', paperEnabled: false };
}

export function runValidation(input) {
  const prepared = prepareCandles(input), ctx = contextFor(prepared.candles);
  const windows = WINDOWS.map(window => {
    const baselineTrades = simulate(prepared.candles, ctx, window, false);
    const filteredTrades = simulate(prepared.candles, ctx, window, true);
    const stressTrades = simulate(prepared.candles, ctx, window, true, RULES.stressCostR);
    return { ...window, baseline: metrics(baselineTrades), filtered: metrics(filteredTrades), stress: metrics(stressTrades), baselineTrades, filteredTrades, stressTrades };
  });
  const baseline = metrics(windows.flatMap(w => w.baselineTrades));
  const filtered = metrics(windows.flatMap(w => w.filteredTrades));
  const stress = metrics(windows.flatMap(w => w.stressTrades));
  return { rules: RULES, windows, baseline, filtered, stress, quality: prepared.quality, warmupBars: prepared.warmupBars, excludedBars: prepared.excludedBars, gate: evaluateGate(windows, filtered, stress, baseline) };
}
