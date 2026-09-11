import { RULES, contextFor, exitFill, metrics } from './validation-engine.mjs?v=2';
import { sessionFor } from './session-comparison.mjs';

const epoch = day => Date.parse(`${day}T00:00:00Z`) / 1000;
export const MARKET_POLICY = Object.freeze({ version: 'jeu06-v1', year: 2025, start: '2025-07-01', end: '2026-01-01', paperEnabled: false });
export const PRODUCTS = Object.freeze([
  Object.freeze({ symbol: 'SPY', label: 'SPY · ETF S&P 500', tick: 0.01, multiplier: 1, fees: 0.02, contracts: ['SPY'] }),
  Object.freeze({ symbol: 'MES', label: 'MES · Micro S&P 500', tick: 0.25, multiplier: 5, fees: 2.50, contracts: ['MESU5', 'MESZ5', 'MESH6'] }),
  Object.freeze({ symbol: 'MNQ', label: 'MNQ · Micro Nasdaq', tick: 0.25, multiplier: 2, fees: 2.50, contracts: ['MNQU5', 'MNQZ5', 'MNQH6'] })
]);
export const MARKET_WINDOWS = Object.freeze([
  { label: 'Juillet – août 2025', start: epoch('2025-07-01'), end: epoch('2025-09-01') },
  { label: 'Septembre – octobre 2025', start: epoch('2025-09-01'), end: epoch('2025-11-01') },
  { label: 'Novembre – décembre 2025', start: epoch('2025-11-01'), end: epoch('2026-01-01') }
]);
export function segmentsFor(product) {
  return product.symbol === 'SPY'
    ? [{ ticker: 'SPY', prep: '2025-06-01', start: '2025-07-01', end: '2026-01-01' }]
    : [
      { ticker: product.contracts[0], prep: '2025-06-01', start: '2025-07-01', end: '2025-09-15' },
      { ticker: product.contracts[1], prep: '2025-08-15', start: '2025-09-15', end: '2025-12-15' },
      { ticker: product.contracts[2], prep: '2025-11-15', start: '2025-12-15', end: '2026-01-01' }
    ];
}
const minute = text => Number(text.slice(11, 13)) * 60 + Number(text.slice(14, 16));
export function calendarSessions(calendar) {
  if (!Array.isArray(calendar) || calendar.length < 130) throw new Error('Calendrier de comparaison incomplet.');
  const sessions = new Map();
  let previous = '';
  for (const entry of calendar) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || entry.date <= previous || entry.date < '2025-06-01' || entry.date >= '2026-01-01' || typeof entry.open !== 'string' || typeof entry.close !== 'string') throw new Error('Calendrier de comparaison invalide.');
    const open = minute(entry.open), close = minute(entry.close);
    if (!entry.open.startsWith(entry.date) || !entry.close.startsWith(entry.date) || open !== 570 || !Number.isFinite(close) || close <= open || close > 960 || (close - open) % 15) throw new Error('Horaires de comparaison invalides.');
    sessions.set(entry.date, { date: entry.date, open, close }); previous = entry.date;
  }
  return sessions;
}

export function prepareMarket(product, source, sessions) {
  const definitions = segmentsFor(product);
  if (source.symbol !== product.symbol || !Array.isArray(source.segments) || source.segments.length !== definitions.length) throw new Error(`${product.symbol} : contrats manquants.`);
  const groups = definitions.map((definition, index) => {
    const raw = source.segments[index];
    if (raw.ticker !== definition.ticker || !Array.isArray(raw.bars) || raw.bars.length > 10000) throw new Error(`${product.symbol} : contrat inattendu.`);
    const seen = new Set(), daily = new Map();
    const candles = raw.bars.map(values => {
      if (!Array.isArray(values) || values.length !== 6 || !values.every(Number.isFinite)) throw new Error('Bougie invalide.');
      const [time, open, high, low, close, volume] = values;
      if (!Number.isInteger(time) || time % 900 || seen.has(time) || low <= 0 || high < Math.max(open, close, low) || low > Math.min(open, close) || volume < 0) throw new Error(`${raw.ticker} : prix ou horodatage invalide.`);
      seen.add(time);
      const local = sessionFor(time), session = sessions.get(local.day);
      if (!session || local.day < definition.prep || local.day >= definition.end || local.minute < session.open || local.minute >= session.close) throw new Error(`${raw.ticker} : bougie hors séance commune.`);
      if (product.symbol !== 'SPY' && [open, high, low, close].some(price => Math.abs(price / product.tick - Math.round(price / product.tick)) > 1e-5)) throw new Error(`${raw.ticker} : prix incompatible avec le tick.`);
      const bar = { time, open, high, low, close, volume, ...local, sessionEnd: local.minute === session.close - 15 };
      if (!daily.has(local.day)) daily.set(local.day, []);
      daily.get(local.day).push(bar);
      return bar;
    }).sort((a, b) => a.time - b.time);
    for (const session of sessions.values()) {
      if (session.date < definition.prep || session.date >= definition.end) continue;
      const bars = (daily.get(session.date) || []).sort((a, b) => a.time - b.time);
      if (bars.length !== (session.close - session.open) / 15 || bars.some((b, i) => b.minute !== session.open + 15 * i)) throw new Error(`${raw.ticker}, ${session.date} : séance incomplète.`);
    }
    const warmup = candles.filter(c => c.day < definition.start).length;
    if (warmup < RULES.warmup) throw new Error(`${raw.ticker} : préparation insuffisante.`);
    return { ...definition, start: epoch(definition.start), end: epoch(definition.end), candles, context: contextFor(candles), warmup };
  });
  const scored = groups.flatMap(g => g.candles.filter(c => c.time >= g.start && c.time < g.end));
  const quality = MARKET_WINDOWS.map(window => {
    const bars = scored.filter(c => c.time >= window.start && c.time < window.end);
    const count = new Set(bars.map(c => c.day)).size;
    if (count < 30 || !bars.length || bars[0].time - window.start > 7 * 86400 || window.end - bars.at(-1).time > 7 * 86400) throw new Error(`${product.symbol} : période incomplète.`);
    return { label: window.label, bars: bars.length, sessions: count };
  });
  return { groups, quality };
}

export function tradeTerms(product, atr, costFactor = 1) {
  const ticks = Math.ceil((atr * RULES.atrMultiple) / product.tick - 1e-9);
  const risk = ticks * product.tick;
  const targetDistance = Math.floor(ticks * RULES.rr + 1e-9) * product.tick;
  const riskDollars = risk * product.multiplier;
  const costDollars = (product.fees + 2 * product.tick * product.multiplier) * costFactor;
  return { risk, targetDistance, riskDollars, costDollars, costR: costDollars / riskDollars };
}

export function simulateMarket(candles, ctx, window, product, costFactor = 1, ticker = product.symbol, options = {}) {
  const first = candles.findIndex(c => c.time >= window.start);
  let end = candles.findIndex(c => c.time >= window.end);
  if (end < 0) end = candles.length;
  if (first < 1 || first >= end) return [];
  const trades = [];
  let position = null, pending = null, day = null, count = 0, realized = 0, losses = 0;
  const closePosition = (fill, candle) => {
    const grossR = (fill.price - position.entry) / position.risk * (position.side === 'Long' ? 1 : -1);
    const resultR = grossR - position.costR;
    trades.push({ ...position, ticker, exit: fill.price, exitTime: candle.time, grossR, resultR, reason: fill.reason, window: window.label });
    realized += resultR; losses = resultR < 0 ? losses + 1 : 0; position = null;
  };
  for (let i = first; i < end; i += 1) {
    const candle = candles[i];
    if (day !== candle.day) { day = candle.day; count = 0; realized = 0; losses = 0; pending = null; }
    if (candle.sessionEnd) {
      pending = null;
      if (position) closePosition(exitFill(position, { open: candle.open, high: candle.open, low: candle.open }) || { price: candle.open, reason: 'Fin de séance' }, candle);
      continue;
    }
    const allowed = () => count < RULES.maxTrades && realized > -RULES.maxDailyLoss && losses < RULES.lossStreak;
    if (!position && pending) {
      const terms = tradeTerms(product, ctx.atr[pending.index], costFactor);
      if (allowed() && Number.isFinite(terms.risk) && terms.risk > 0) {
        const sign = pending.side === 'Long' ? 1 : -1;
        position = { side: pending.side, entryTime: candle.time, entry: candle.open, ...terms, stop: candle.open - sign * terms.risk, target: candle.open + sign * terms.targetDistance };
        count += 1;
      }
      pending = null;
    }
    if (position) { const fill = exitFill(position, candle); if (fill) closePosition(fill, candle); }
    if (!position && allowed() && i < end - 1 && [ctx.fast[i - 1], ctx.slow[i - 1], ctx.fast[i], ctx.slow[i], ctx.adx[i]].every(Number.isFinite) && ctx.adx[i] >= RULES.adxMin) {
      const side = ctx.fast[i - 1] <= ctx.slow[i - 1] && ctx.fast[i] > ctx.slow[i] ? 'Long' : ctx.fast[i - 1] >= ctx.slow[i - 1] && ctx.fast[i] < ctx.slow[i] ? 'Short' : null;
      if (side && (!options.acceptSignal || options.acceptSignal(side, i))) pending = { side, index: i };
    }
  }
  if (position) throw new Error(`${ticker} : position encore ouverte à la fin d’une période.`);
  return trades;
}

function describe(trades) {
  let streak = 0, maxLosingStreak = 0, cost = 0;
  for (const trade of trades) { streak = trade.resultR < 0 ? streak + 1 : 0; maxLosingStreak = Math.max(maxLosingStreak, streak); cost += trade.costR; }
  return { ...metrics(trades), cost, maxLosingStreak, worst: trades.length ? Math.min(...trades.map(t => t.resultR)) : null };
}
function screen(windows, total, stress) {
  const checks = [
    { label: 'Au moins 40 transactions au total', pass: total.count >= 40 },
    { label: 'Au moins 12 transactions dans chaque période', pass: windows.every(w => w.normal.count >= 12) },
    { label: 'Résultat moyen positif dans chaque période', pass: windows.every(w => w.normal.exp !== null && w.normal.exp > 0) },
    { label: 'Profit factor au moins égal à 1,10', pass: total.pf !== null && total.pf >= 1.10 },
    { label: 'Baisse maximale réalisée limitée à 8 R', pass: total.dd <= 8 },
    { label: 'Résultat positif avec les coûts doublés', pass: stress.exp !== null && stress.exp > 0 }
  ];
  return { status: !checks[0].pass || !checks[1].pass ? 'Échantillon insuffisant' : checks.every(c => c.pass) ? 'Piste à examiner' : 'Non confirmé', checks, paperEnabled: false };
}
export function runMarketComparison(bundle) {
  if (bundle.schema !== 'jeu06-data-v1' || !Array.isArray(bundle.products) || bundle.products.length !== 3) throw new Error('Historique du Jeu 06 invalide.');
  const sessions = calendarSessions(bundle.calendar);
  const products = PRODUCTS.map((product, index) => {
    const prepared = prepareMarket(product, bundle.products[index], sessions);
    const windows = MARKET_WINDOWS.map(window => {
      const calculate = factor => prepared.groups.flatMap(group => {
        const start = Math.max(window.start, group.start), end = Math.min(window.end, group.end);
        return start < end ? simulateMarket(group.candles, group.context, { ...window, start, end }, product, factor, group.ticker) : [];
      }).sort((a, b) => a.entryTime - b.entryTime);
      const trades = calculate(1), stressTrades = calculate(2);
      return { ...window, trades, stressTrades, normal: describe(trades), stress: describe(stressTrades) };
    });
    const trades = windows.flatMap(w => w.trades), stressTrades = windows.flatMap(w => w.stressTrades);
    const normal = describe(trades), stress = describe(stressTrades);
    return { ...product, windows, trades, normal, stress, gate: screen(windows, normal, stress), quality: prepared.quality, preparation: prepared.groups.map(g => ({ ticker: g.ticker, warmup: g.warmup })) };
  });
  return { policy: MARKET_POLICY, products, paperEnabled: false };
}
