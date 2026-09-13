import { inspectConfirmation } from './mnq-confirmation.mjs?v=4';
import { RULES, contextFor, metrics } from './validation-engine.mjs?v=2';
import { PRODUCTS, simulateMarket } from './market-comparison.mjs';
import { SIX_MONTHS_POLICY as policy, SIX_MONTHS_DAYS as days, SIX_MONTHS_SEGMENTS as segments, SIX_MONTHS_WINDOWS as windows } from './mnq-six-months-policy.mjs';
const epoch = day => Date.parse(`${day}T00:00:00Z`) / 1000;
const product = PRODUCTS.find(item => item.symbol === 'MNQ');
export function inspectSixMonths(bundle) {
  if (bundle.schema !== 'jeu09-data-v1' || bundle.protocol !== policy.version || !Array.isArray(bundle.calendar) || bundle.calendar.length !== days.length || bundle.calendar.some((v, i) => v.date !== days[i] || v.open !== `${v.date}T09:30:00` || v.close !== `${v.date}T${policy.earlyCloses[v.date] === 780 ? '13' : '16'}:00:00`) || !Array.isArray(bundle.segments) || bundle.segments.length !== segments.length || !Array.isArray(bundle.scheduleEvents)) throw new Error('Historique du Jeu 09 invalide.');
  const groups = segments.map((segment, i) => {
    const raw = bundle.segments[i], calendarDays = days.filter(day => day >= segment.prep && day < segment.end);
    if (raw.ticker !== segment.ticker || raw.expiry !== segment.expiry || raw.paginationComplete !== true) throw new Error('Contrat, expiration ou pagination du Jeu 09 invalide.');
    const inspected = inspectConfirmation({ schema: 'jeu07-data-v1', ticker: raw.ticker, bars: raw.bars, calendar: bundle.calendar.filter(item => calendarDays.includes(item.date)), scheduleEvents: bundle.scheduleEvents.filter(item => calendarDays.includes(item.session_end_date)) }, { ...segment, calendarDays, earlyCloses: policy.earlyCloses });
    return { ...segment, ...inspected };
  });
  return { ready: groups.every(g => g.ready && g.quality.warmup >= RULES.warmup), groups, sessions: days.filter(day => windows.some(w => epoch(day) >= w.start && epoch(day) < w.end)).length, bars: groups.reduce((n, g) => n + g.candles.length, 0) };
}
function describe(trades) {
  let losing = 0, maxLosingStreak = 0;
  for (const trade of trades) { losing = trade.resultR < 0 ? losing + 1 : 0; maxLosingStreak = Math.max(maxLosingStreak, losing); }
  return { ...metrics(trades), maxLosingStreak, cost: trades.reduce((n, t) => n + t.costR, 0) };
}
export function runSixMonths(bundle) {
  const quality = inspectSixMonths(bundle);
  if (!quality.ready) return { policy, quality, calculated: false, normal: null, stress: null, windows: [], trades: [], stressTrades: [], checks: [], status: 'Données incomplètes', paperEnabled: false };
  const groups = quality.groups.map(g => ({ ...g, context: contextFor(g.candles) }));
  const results = windows.map(window => {
    const calculate = factor => groups.flatMap(group => {
      const start = Math.max(window.start, epoch(group.start)), end = Math.min(window.end, epoch(group.end));
      return start < end ? simulateMarket(group.candles, group.context, { ...window, start, end }, product, factor, group.ticker) : [];
    }).sort((a, b) => a.entryTime - b.entryTime);
    const trades = calculate(1), stressTrades = calculate(2);
    return { ...window, trades, stressTrades, normal: describe(trades), stress: describe(stressTrades) };
  });
  const trades = results.flatMap(w => w.trades), stressTrades = results.flatMap(w => w.stressTrades), normal = describe(trades), stress = describe(stressTrades);
  const checks = [
    { label: 'Au moins 40 transactions au total', pass: normal.count >= 40 },
    { label: 'Au moins 12 transactions par période', pass: results.every(w => w.normal.count >= 12) },
    { label: 'Résultat net positif dans chaque période', pass: results.every(w => w.normal.total > 0) },
    { label: 'Profit factor au moins égal à 1,10', pass: normal.pf !== null && normal.pf >= 1.1 },
    { label: 'Baisse maximale réalisée limitée à 8 R', pass: normal.dd <= 8 },
    { label: 'Résultat positif avec coûts doublés', pass: stress.total > 0 }
  ];
  return { policy, quality: { ...quality, groups: quality.groups.map(({ candles, ...g }) => g) }, calculated: true, normal, stress, windows: results, trades, stressTrades, checks, status: checks.every(c => c.pass) ? 'Piste rétrospective à examiner' : 'Non confirmé', paperEnabled: false };
}
