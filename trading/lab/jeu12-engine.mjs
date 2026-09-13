import { contextFor, exitFill, metrics, RULES } from './validation-engine.mjs';
import { PRODUCTS, tradeTerms } from './market-comparison.mjs';
import { sessionFor } from './session-comparison.mjs';
import { inspectConfirmation } from './mnq-confirmation.mjs';
import { SIX_MONTHS_SEGMENTS, SIX_MONTHS_DAYS, SIX_MONTHS_POLICY } from './mnq-six-months-policy.mjs';
import { JEU12_POLICY as policy, JEU12_CONFIGS as configs } from './jeu12-policy.mjs';
const epoch = day => Date.parse(`${day}T00:00:00Z`) / 1000;
const product = PRODUCTS.find(p => p.symbol === 'MNQ');

export function aggregateFive(candles, minutes) {
  if (![5, 15, 30].includes(minutes)) throw new Error('Unsupported timeframe.');
  const size = minutes / 5, result = [];
  for (let i = 0; i < candles.length; i += size) {
    const block = candles.slice(i, i + size), first = block[0], last = block.at(-1);
    if (block.length !== size || (first.minute - 570) % minutes || block.some((b, j) => b.day !== first.day || b.time !== first.time + j * 300)) throw new Error('Incomplete or unaligned timeframe.');
    result.push({ time: first.time, day: first.day, minute: first.minute, open: first.open, high: Math.max(...block.map(b => b.high)), low: Math.min(...block.map(b => b.low)), close: last.close, volume: block.reduce((n, b) => n + b.volume, 0), closedAt: last.time + 300 });
  }
  return result;
}

export function inspectFiveGroup(raw, definition, calendar, scheduleEvents) {
  if (!raw || raw.ticker !== definition.ticker || raw.expiry !== definition.expiry || raw.paginationComplete !== true || !Array.isArray(raw.bars) || raw.bars.length > 20000) throw new Error('Invalid contract or pagination.');
  const sessions = new Map(calendar.map(s => [s.date, s])), seen = new Set();
  const candles = raw.bars.map(values => {
    if (!Array.isArray(values) || values.length !== 6 || !values.every(Number.isFinite)) throw new Error('Invalid 5-minute bar.');
    const [time, open, high, low, close, volume] = values;
    if (!Number.isInteger(time) || time % 300 || seen.has(time) || low <= 0 || low > Math.min(open, close) || high < Math.max(open, low, close) || volume < 0 || [open, high, low, close].some(p => Math.abs(p / .25 - Math.round(p / .25)) > 1e-7)) throw new Error('Invalid 5-minute OHLCV, tick or timestamp.');
    seen.add(time);
    const local = sessionFor(time), session = sessions.get(local.day);
    const closeMinute = session ? Number(session.close.slice(11, 13)) * 60 + Number(session.close.slice(14, 16)) : null;
    if (!session || local.day < definition.prep || local.day >= definition.end || local.minute < 570 || local.minute >= closeMinute) throw new Error('5-minute bar outside declared session.');
    return { time, open, high, low, close, volume, ...local, closeMinute };
  }).sort((a, b) => a.time - b.time);
  const fifteen = aggregateFive(candles, 15);
  const asValues = fifteen.map(b => [b.time, b.open, b.high, b.low, b.close, b.volume]);
  const checked = inspectConfirmation({ schema: 'jeu07-data-v1', ticker: raw.ticker, calendar, bars: asValues, scheduleEvents }, { ...definition, calendarDays: calendar.map(s => s.date), earlyCloses: Object.fromEntries(calendar.filter(s => s.close.slice(11, 16) === '13:00').map(s => [s.date, 780])) });
  if (!checked.ready) throw new Error('Incomplete prices or schedules.');
  const warmup = Object.fromEntries(policy.timeframes.map(tf => [tf, aggregateFive(candles, tf).filter(b => b.day < definition.start).length]));
  if (Object.values(warmup).some(n => n < policy.warmup)) throw new Error('Insufficient timeframe warmup.');
  return { ...definition, candles, fifteen: asValues, quality: { ...checked.quality, bars: candles.length, warmup } };
}

export function inspectJeu12(bundle, reference) {
  if (bundle?.schema !== 'jeu12-data-v1' || bundle.protocol !== policy.version || bundle.segments?.length !== 3 || reference?.schema !== 'jeu09-data-v1') throw new Error('Invalid Jeu 12 bundle.');
  return SIX_MONTHS_SEGMENTS.map((definition, i) => {
    const days = SIX_MONTHS_DAYS.filter(d => d >= definition.prep && d < definition.end);
    const calendar = days.map(date => ({ date, open: `${date}T09:30:00`, close: `${date}T${SIX_MONTHS_POLICY.earlyCloses[date] === 780 ? '13' : '16'}:00:00` }));
    const group = inspectFiveGroup(bundle.segments[i], definition, calendar, reference.scheduleEvents.filter(e => days.includes(e.session_end_date)));
    const original = reference.segments[i];
    if (original.ticker !== definition.ticker || JSON.stringify(group.fifteen) !== JSON.stringify(original.bars)) throw new Error('5-minute aggregates differ from pinned 15-minute reference.');
    return group;
  });
}

export function signalsFor(candles, timeframe, mode = 'cross') {
  if (!['cross', 'pullback'].includes(mode)) throw new Error('Unsupported signal family.');
  const bars = aggregateFive(candles, timeframe), ctx = contextFor(bars), signals = new Map();
  for (let i = 1; i < bars.length; i++) {
    if (![ctx.fast[i - 1], ctx.slow[i - 1], ctx.fast[i], ctx.slow[i], ctx.adx[i], ctx.atr[i]].every(Number.isFinite) || ctx.adx[i] < RULES.adxMin) continue;
    const side = mode === 'cross'
      ? ctx.fast[i - 1] <= ctx.slow[i - 1] && ctx.fast[i] > ctx.slow[i] ? 'Long' : ctx.fast[i - 1] >= ctx.slow[i - 1] && ctx.fast[i] < ctx.slow[i] ? 'Short' : null
      : ctx.fast[i] > ctx.slow[i] && bars[i].low <= ctx.fast[i] && bars[i].close > ctx.fast[i] && bars[i].close > bars[i].open ? 'Long'
        : ctx.fast[i] < ctx.slow[i] && bars[i].high >= ctx.fast[i] && bars[i].close < ctx.fast[i] && bars[i].close < bars[i].open ? 'Short' : null;
    if (side) signals.set(bars[i].closedAt, { side, day: bars[i].day, atr: ctx.atr[i], signalOpen: bars[i].time, signalClose: bars[i].closedAt });
  }
  return signals;
}

// All signal timeframes share this 5-minute execution clock. It never reads a
// later candle to place an entry and does not reuse a signal while in a position.
export function simulateFive(candles, signals, config, definition, costFactor = 1) {
  if (![1, 2].includes(costFactor)) throw new Error('Unsupported cost assumption.');
  const start = epoch(definition.start), end = epoch(definition.end);
  const trades = []; let position = null, day = '', count = 0, realized = 0, losses = 0;
  const close = (fill, candle) => {
    const grossR = (fill.price - position.entry) * (position.side === 'Long' ? 1 : -1) / position.risk;
    const resultR = grossR - position.costR;
    trades.push({ ...position, exitTime: candle.time, exit: fill.price, reason: fill.reason, grossR, resultR });
    realized += resultR; losses = resultR < 0 ? losses + 1 : 0; position = null;
  };
  for (const bar of candles) {
    if (bar.time < start || bar.time >= end) continue;
    if (bar.day !== day) {
      if (position) throw new Error('Position crossed a session.');
      day = bar.day; count = 0; realized = 0; losses = 0;
    }
    if (bar.minute >= bar.closeMinute - policy.exitBeforeClose) {
      if (position) close(exitFill(position, { open: bar.open, high: bar.open, low: bar.open }) || { price: bar.open, reason: 'Session close' }, bar);
      continue;
    }
    const signal = signals.get(bar.time);
    if (!position && signal && signal.day === bar.day && signal.signalOpen >= start && signal.signalOpen >= bar.time - (bar.minute - 570) * 60 && signal.signalClose === bar.time && (config.side === 'Both' || signal.side === config.side) && bar.minute >= config.hours.start && bar.minute < config.hours.end && count < RULES.maxTrades && realized > -RULES.maxDailyLoss && losses < RULES.lossStreak) {
      const terms = tradeTerms(product, signal.atr, costFactor);
      if (!Number.isFinite(terms.risk) || terms.risk <= 0) throw new Error('Invalid risk at signal.');
      const sign = signal.side === 'Long' ? 1 : -1;
      position = { ticker: definition.ticker, side: signal.side, day, entryTime: bar.time, entry: bar.open, signalOpen: signal.signalOpen, signalClose: signal.signalClose, ...terms, stop: bar.open - sign * terms.risk, target: bar.open + sign * terms.targetDistance };
      count++;
    }
    if (position) { const fill = exitFill(position, bar); if (fill) close(fill, bar); }
  }
  if (position) throw new Error('Unclosed final position.');
  return trades;
}

export function chooseCandidate(results) {
  return results.filter(r => r.checks.every(c => c.pass)).sort((a, b) => Math.min(...b.windows.map(w => w.normal.exp)) - Math.min(...a.windows.map(w => w.normal.exp)) || a.normal.dd - b.normal.dd || configs.findIndex(c => c.id === a.id) - configs.findIndex(c => c.id === b.id))[0]?.id || null;
}
export function runJeu12(groups) {
  return runTimeframeGrid(groups, 'cross');
}
export function runTimeframeGrid(groups, mode) {
  if (!['cross', 'pullback'].includes(mode)) throw new Error('Unsupported signal family.');
  const signalSets = groups.map(g => Object.fromEntries(policy.timeframes.map(tf => [tf, signalsFor(g.candles, tf, mode)])));
  const results = configs.map(config => {
    const windows = groups.map((g, i) => {
      const trades = simulateFive(g.candles, signalSets[i][config.timeframe], config, g, 1), stressTrades = simulateFive(g.candles, signalSets[i][config.timeframe], config, g, 2);
      return { ticker: g.ticker, start: g.start, end: g.end, trades, stressTrades, normal: metrics(trades), stress: metrics(stressTrades) };
    });
    const normal = metrics(windows.flatMap(w => w.trades)), stress = metrics(windows.flatMap(w => w.stressTrades));
    const checks = [
      { id: 'count', label: 'Au moins 40 trades', pass: normal.count >= 40 },
      { id: 'windowCount', label: 'Au moins 12 trades par période', pass: windows.every(w => w.normal.count >= 12) },
      { id: 'positive', label: 'Chaque période positive', pass: windows.every(w => w.normal.total > 0) },
      { id: 'pf', label: 'Profit factor ≥ 1,10 avant arrondi', pass: normal.pf !== null && normal.pf >= 1.1 },
      { id: 'dd', label: 'Drawdown réalisé ≤ 8 R', pass: normal.dd <= 8 },
      { id: 'stress', label: 'Coûts doublés : résultat positif', pass: stress.total > 0 }
    ];
    return { ...config, windows, normal, stress, checks };
  });
  return { schema: mode === 'cross' ? 'jeu12-result-v1' : 'jeu13-result-v1', protocol: mode === 'cross' ? policy.version : 'jeu13-v1', paperEnabled: false, results, candidateId: chooseCandidate(results) };
}
