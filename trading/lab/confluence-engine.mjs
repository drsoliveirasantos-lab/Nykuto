import { inspectSixMonths } from './mnq-six-months.mjs';
import { SIX_MONTHS_WINDOWS } from './mnq-six-months-policy.mjs';
import { contextFor, metrics } from './validation-engine.mjs?v=2';
import { PRODUCTS, simulateMarket } from './market-comparison.mjs?v=2';
import { CONFLUENCE_POLICY as policy, CONFLUENCE_VARIANTS as variants, CONFLUENCE_EVENTS as events } from './confluence-policy.mjs';

export function engulfing(previous, current) {
  if (!previous || previous.day !== current.day || current.time - previous.time !== 900) return null;
  const long = previous.close < previous.open && current.close > current.open && current.open <= previous.close && current.close >= previous.open && (current.open < previous.close || current.close > previous.open);
  const short = previous.close > previous.open && current.close < current.open && current.open >= previous.close && current.close <= previous.open && (current.open > previous.close || current.close < previous.open);
  return long ? 'Long' : short ? 'Short' : null;
}

// Everything in feature[i] is available at candle i's close. Complete cash
// hours are anchored at 09:30 NY; no unfinished hour or overnight synthesis.
export function confluenceFeatures(candles, eventCalendar = events) {
  const slots = new Map(), byDay = new Map();
  for (const event of eventCalendar) byDay.set(event.day, [...(byDay.get(event.day) || []), event.type]);
  let hourFast = null, hourSlow = null, hourCount = 0, hourClosedAt = null;
  return candles.map((bar, i) => {
    const offset = bar.minute - 570;
    if (offset >= 45 && offset % 60 === 45 && i >= 3) {
      const block = candles.slice(i - 3, i + 1);
      if (block.every((c, j) => c.day === bar.day && c.time === bar.time - (3 - j) * 900) && block[0].minute === bar.minute - 45) {
        hourFast = hourFast === null ? bar.close : hourFast + 2 / (policy.hourFast + 1) * (bar.close - hourFast);
        hourSlow = hourSlow === null ? bar.close : hourSlow + 2 / (policy.hourSlow + 1) * (bar.close - hourSlow);
        hourCount += 1; hourClosedAt = bar.time + 900;
      }
    }
    const previous = slots.get(bar.minute) || [];
    const mean = previous.length === policy.volumeSessions ? previous.reduce((n, v) => n + v, 0) / previous.length : null;
    const volumeRatio = mean !== null && mean > 0 ? bar.volume / mean : null;
    slots.set(bar.minute, [...previous, bar.volume].slice(-policy.volumeSessions));
    return { time: bar.time + 900, day: bar.day, hourCount, hourClosedAt, hourFast, hourSlow,
      trend: hourCount < policy.hourSlow || hourFast === hourSlow ? null : hourFast > hourSlow ? 'Long' : 'Short',
      candle: engulfing(candles[i - 1], bar), volumeRatio, events: byDay.get(bar.day) || [] };
  });
}

const labels = { trend: 'Tendance 1 h dans le sens du signal', candle: 'Englobante dans le sens du signal', volume: 'Volume au moins égal aux cinq séances précédentes', events: 'Hors des jours CPI, emploi ou décision FOMC recensés', long: 'Signal long', short: 'Signal short' };
export function signalChecks(feature, side, filters) {
  const values = { trend: feature.trend === side, candle: feature.candle === side, volume: feature.volumeRatio !== null && feature.volumeRatio >= policy.volumeRatio, events: feature.events.length === 0, long: side === 'Long', short: side === 'Short' };
  return filters.map(id => ({ id, label: labels[id], pass: values[id] === true }));
}
export function confluenceMetrics(trades) {
  const durations = trades.map(t => (t.exitTime - t.entryTime) / 60).sort((a, b) => a - b);
  const median = durations.length ? (durations[Math.floor((durations.length - 1) / 2)] + durations[Math.floor(durations.length / 2)]) / 2 : null;
  return { ...metrics(trades), medianMinutes: median, bySide: ['Long', 'Short'].map(side => ({ side, ...metrics(trades.filter(t => t.side === side)) })) };
}

export function runConfluence(bundle) {
  const inspected = inspectSixMonths(bundle);
  const quality = { ready: inspected.ready, sessions: inspected.sessions, bars: inspected.bars };
  if (!quality.ready) return { policy, quality, calculated: false, variants: [], paperEnabled: false };
  const groups = inspected.groups.map(g => ({ ...g, context: contextFor(g.candles), features: confluenceFeatures(g.candles) }));
  const product = PRODUCTS.find(p => p.symbol === 'MNQ'), epoch = day => Date.parse(`${day}T00:00:00Z`) / 1000;
  const results = variants.map(variant => {
    const decisions = [];
    const windows = SIX_MONTHS_WINDOWS.map(window => {
      const calculate = cost => groups.flatMap(group => {
        const start = Math.max(window.start, epoch(group.start)), end = Math.min(window.end, epoch(group.end));
        if (start >= end) return [];
        return simulateMarket(group.candles, group.context, { ...window, start, end }, product, cost, group.ticker, {
          acceptSignal: (side, i) => {
            const feature = group.features[i], checks = signalChecks(feature, side, variant.filters), accepted = checks.every(c => c.pass);
            if (cost === 1) decisions.push({ ticker: group.ticker, side, time: feature.time, day: feature.day, feature, checks, accepted });
            return accepted;
          }
        });
      }).sort((a, b) => a.entryTime - b.entryTime);
      const trades = calculate(1), stressTrades = calculate(2);
      return { ...window, trades, stressTrades, normal: confluenceMetrics(trades), stress: confluenceMetrics(stressTrades) };
    });
    const trades = windows.flatMap(w => w.trades), stressTrades = windows.flatMap(w => w.stressTrades);
    const normal = confluenceMetrics(trades), stress = confluenceMetrics(stressTrades);
    const executed = new Set(trades.map(t => `${t.ticker}:${t.side}:${t.entryTime}`));
    for (const decision of decisions) decision.executed = executed.has(`${decision.ticker}:${decision.side}:${decision.time}`);
    const checks = [
      { label: 'Au moins 40 transactions au total', pass: normal.count >= 40 },
      { label: 'Au moins 12 transactions par période', pass: windows.every(w => w.normal.count >= 12) },
      { label: 'Résultat positif dans chaque période', pass: windows.every(w => w.normal.total > 0) },
      { label: 'Profit factor au moins égal à 1,10', pass: normal.pf !== null && normal.pf >= 1.1 },
      { label: 'Baisse réalisée limitée à 8 R', pass: normal.dd <= 8 },
      { label: 'Résultat positif avec frais doublés', pass: stress.total > 0 }
    ];
    return { ...variant, windows, trades, stressTrades, normal, stress, checks, decisions,
      status: !checks[0].pass || !checks[1].pass ? 'Échantillon insuffisant' : checks.every(c => c.pass) ? 'Critères historiques satisfaits' : 'Non confirmé', paperEnabled: false };
  });
  for (const result of results) result.deltaExpectancy = result.normal.exp === null || results[0].normal.exp === null ? null : result.normal.exp - results[0].normal.exp;
  const scoredDays = new Set(groups.flatMap(g => g.candles.filter(c => c.day >= g.start && c.day < g.end).map(c => c.day)));
  return { policy, quality, calculated: true, variants: results, events: events.map(e => ({ ...e, scoredSession: scoredDays.has(e.day) })), paperEnabled: false };
}
