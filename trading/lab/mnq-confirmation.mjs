import { RULES, contextFor, metrics } from './validation-engine.mjs?v=2';
import { PRODUCTS, simulateMarket } from './market-comparison.mjs';
import { sessionFor } from './session-comparison.mjs';

export const CONFIRMATION_POLICY = Object.freeze({ version: 'jeu07-v1', ticker: 'MNQZ4', prep: '2024-09-09', start: '2024-10-01', end: '2024-12-01', completeWindows: 1, requiredWindows: 3, paperEnabled: false });
const epoch = day => Date.parse(`${day}T00:00:00Z`) / 1000;
const minute = text => Number(text.slice(11, 13)) * 60 + Number(text.slice(14, 16));
const product = PRODUCTS.find(p => p.symbol === 'MNQ');

export function inspectConfirmation(bundle, policy = CONFIRMATION_POLICY) {
  if (bundle.schema !== 'jeu07-data-v1' || bundle.ticker !== policy.ticker || !Array.isArray(bundle.calendar) || bundle.calendar.length !== (policy.calendarDays?.length || 59) || !Array.isArray(bundle.bars) || bundle.bars.length > 5000 || !Array.isArray(bundle.scheduleEvents) || bundle.scheduleEvents.length > 2000) throw new Error('Historique du Jeu 07 invalide.');
  const sessions = new Map(); let previousDay = '';
  for (const entry of bundle.calendar) {
    const expectedClose = policy.earlyCloses?.[entry.date] ?? (entry.date === '2024-11-29' ? 780 : 960);
    if (typeof entry.date !== 'string' || !(policy.calendarDays ? /^\d{4}-\d{2}-\d{2}$/ : new RegExp(`^${policy.prep.slice(0, 4)}-\\d{2}-\\d{2}$`)).test(entry.date) || (policy.calendarDays && !policy.calendarDays.includes(entry.date)) || entry.date <= previousDay || entry.date < policy.prep || entry.date >= policy.end || typeof entry.open !== 'string' || typeof entry.close !== 'string' || !entry.open.startsWith(entry.date) || !entry.close.startsWith(entry.date) || minute(entry.open) !== 570 || minute(entry.close) !== expectedClose) throw new Error('Calendrier du Jeu 07 invalide.');
    sessions.set(entry.date, { ...entry, openMinute: 570, closeMinute: expectedClose }); previousDay = entry.date;
  }
  const daily = new Map(), seen = new Set();
  const candles = bundle.bars.map(values => {
    if (!Array.isArray(values) || values.length !== 6 || !values.every(Number.isFinite)) throw new Error('Bougie MNQ invalide.');
    const [time, open, high, low, close, volume] = values;
    if (!Number.isInteger(time) || time % 900 || seen.has(time) || low <= 0 || high < Math.max(open, close, low) || low > Math.min(open, close) || volume < 0 || [open, high, low, close].some(price => Math.abs(price / product.tick - Math.round(price / product.tick)) > 1e-6)) throw new Error('Prix, tick ou horodatage MNQ invalide.');
    seen.add(time);
    const local = sessionFor(time), session = sessions.get(local.day);
    if (!session || local.minute < session.openMinute || local.minute >= session.closeMinute) throw new Error('Bougie hors séance prévue.');
    const candle = { time, open, high, low, close, volume, ...local, sessionEnd: local.minute === session.closeMinute - 15 };
    if (!daily.has(local.day)) daily.set(local.day, []);
    daily.get(local.day).push(candle); return candle;
  }).sort((a, b) => a.time - b.time);
  const missingPriceDays = [];
  for (const session of sessions.values()) {
    const bars = (daily.get(session.date) || []).sort((a, b) => a.time - b.time);
    if (bars.length !== (session.closeMinute - session.openMinute) / 15 || bars.some((b, i) => b.minute !== 570 + i * 15)) missingPriceDays.push(session.date);
  }
  const events = new Map();
  for (const event of bundle.scheduleEvents) {
    if (event.product_code !== 'MNQ' || event.trading_venue !== 'XCME' || !sessions.has(event.session_end_date) || !['open', 'close', 'pre_open', 'paused', 'halt', 'pcp'].includes(event.event) || typeof event.timestamp !== 'string' || !/(?:Z|[+-]\d{2}:\d{2})$/.test(event.timestamp) || !Number.isFinite(Date.parse(event.timestamp))) throw new Error('Horaire futures invalide.');
    events.set(`${event.session_end_date}/${event.event}/${event.timestamp}`, event);
  }
  const missingScheduleDays = [];
  for (const session of sessions.values()) {
    const dayEvents = [...events.values()].filter(e => e.session_end_date === session.date).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
    // Convert UTC event time through the same New York clock used for the candles.
    // Require one genuine open-to-close interval containing the entire cash session.
    let opened = null, covered = false;
    for (const event of dayEvents) {
      if (event.event === 'open') opened = Date.parse(event.timestamp) / 1000;
      else if (['close', 'paused', 'halt', 'pre_open', 'pcp'].includes(event.event) && opened !== null) {
        const closed = Date.parse(event.timestamp) / 1000;
        const left = sessionFor(opened), right = sessionFor(closed);
        if (event.event === 'close' && closed > opened && (left.day < session.date || (left.day === session.date && left.minute + (opened % 60) / 60 <= 570)) && (right.day > session.date || (right.day === session.date && right.minute + (closed % 60) / 60 >= session.closeMinute))) covered = true;
        opened = null;
      }
    }
    if (!covered) missingScheduleDays.push(session.date);
  }
  const warmup = candles.filter(c => c.time < epoch(policy.start)).length;
  const quality = { bars: candles.length, expectedSessions: sessions.size, scoredSessions: [...sessions.keys()].filter(day => day >= policy.start).length, warmup, priceSessions: sessions.size - missingPriceDays.length, scheduleSessions: sessions.size - missingScheduleDays.length, uniqueScheduleEvents: events.size, missingPriceDays, missingScheduleDays };
  const ready = !missingPriceDays.length && !missingScheduleDays.length && warmup >= RULES.warmup;
  return { quality, ready, candles };
}
function describe(trades) { return { ...metrics(trades), cost: trades.reduce((n, t) => n + t.costR, 0), worst: trades.length ? Math.min(...trades.map(t => t.resultR)) : null }; }
export function runConfirmation(bundle, policy = CONFIRMATION_POLICY) {
  const { quality, ready, candles } = inspectConfirmation(bundle, policy);
  if (!ready) return { policy, quality, status: 'Données incomplètes', calculated: false, normal: null, stress: null, trades: [], stressTrades: [], checks: [], paperEnabled: false };
  const context = contextFor(candles);
  const window = { start: epoch(policy.start), end: epoch(policy.end), label: policy.label || 'Octobre – novembre 2024' };
  const trades = simulateMarket(candles, context, window, product, 1, policy.ticker);
  const stressTrades = simulateMarket(candles, context, window, product, 2, policy.ticker);
  const normal = describe(trades), stress = describe(stressTrades);
  const checks = [
    { label: 'Trois fenêtres complètes de deux mois encore inutilisées', pass: policy.completeWindows >= policy.requiredWindows },
    { label: 'Au moins 40 nouvelles transactions au total', pass: normal.count >= 40 },
    { label: 'Au moins 12 transactions dans la fenêtre disponible', pass: normal.count >= 12 },
    { label: 'Moyenne nette positive dans la fenêtre disponible', pass: normal.exp !== null && normal.exp > 0 },
    { label: 'Profit factor au moins égal à 1,10', pass: normal.pf !== null && normal.pf >= 1.1 },
    { label: 'Baisse maximale réalisée limitée à 8 R', pass: normal.dd <= 8 },
    { label: 'Résultat positif avec les coûts doublés', pass: stress.total > 0 }
  ];
  return { policy, quality, status: policy.diagnostic ? 'Diagnostic court, non confirmé' : 'Confirmation incomplète', calculated: true, normal, stress, trades, stressTrades, checks, paperEnabled: false };
}
