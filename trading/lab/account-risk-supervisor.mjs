import { JEU23_PRODUCTS } from './jeu23-policy.mjs';

// Research preflight only. No order transport or live account authority.
export const SHARED_RISK_POLICY = Object.freeze({
  perTradeUSD: 150, dailyLossUSD: 300, floorReserveUSD: 100,
  maxPositionsAndPending: 1, maxEntriesPerDay: 2, maxLossStreak: 2, maxDailyLossR: 2
});
const identifier = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value);
const money = value => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const cents = Math.round(value * 100);
  return Number.isSafeInteger(cents) && Math.abs(cents - value * 100) < 1e-6 ? cents : null;
};
const integer = value => Number.isSafeInteger(value) && value >= 0;
function validSession(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const fail = (reason, details = {}) => ({ riskPassed: false, executionAllowed: false, reason, ...details });

export function assessAccountRisk(state, intent) {
  const p = SHARED_RISK_POLICY;
  if (!state || !identifier(state.accountId) || !validSession(state.session) || !integer(state.revision) || state.revision === Number.MAX_SAFE_INTEGER
    || !integer(state.entriesToday) || !integer(state.lossStreak) || !Number.isFinite(state.realizedR)
    || !Array.isArray(state.commitments)) return fail('invalid-state');
  const [balance, dayStart, floor] = [state.balanceUSD, state.dayStartUSD, state.floorUSD].map(money);
  if ([balance, dayStart, floor].some(v => v === null || v <= 0)) return fail('invalid-state');
  const ids = new Set(); let reserved = 0, pending = 0;
  for (const c of state.commitments) {
    const reserve = money(c?.riskUSD);
    if (!c || !identifier(c.id) || ids.has(c.id) || !JEU23_PRODUCTS.some(x => x.symbol === c.symbol)
      || !['pending', 'position'].includes(c.status) || reserve === null || reserve <= 0) return fail('invalid-state');
    ids.add(c.id); reserved += reserve; if (c.status === 'pending') pending++;
  }
  if (!Number.isSafeInteger(reserved)) return fail('invalid-state');
  if (!intent || !identifier(intent.id) || intent.accountId !== state.accountId || intent.session !== state.session) return fail('account-or-session-mismatch');
  if (intent.expectedRevision !== state.revision) return fail('stale-revision');
  if (ids.has(intent.id)) return fail('duplicate-intent');
  const product = JEU23_PRODUCTS.find(x => x.symbol === intent.symbol);
  if (!product || !['Long', 'Short'].includes(intent.side) || intent.quantity !== 1 || ![1, 2].includes(intent.costFactor)) return fail('invalid-intent');
  if ([intent.entry, intent.stop].some(price => money(price) === null || price <= 0
    || !Number.isSafeInteger(Math.round(price / product.tick)) || Math.abs(price / product.tick - Math.round(price / product.tick)) > 1e-7)) return fail('invalid-price-grid');
  const sign = intent.side === 'Long' ? 1 : -1;
  const distance = sign * (intent.entry - intent.stop);
  if (distance <= 0) return fail('invalid-stop-side');
  const costUSD = (product.fees + 2 * product.tick * product.multiplier) * intent.costFactor;
  const risk = money(Math.round((distance * product.multiplier + costUSD) * 100) / 100);
  if (risk === null || risk <= 0) return fail('invalid-intent');
  const details = { riskUSD: risk / 100, costUSD, reservedUSD: reserved / 100,
    dailyRemainingUSD: (balance - dayStart + p.dailyLossUSD * 100 - reserved) / 100,
    floorRemainingUSD: (balance - floor - p.floorReserveUSD * 100 - reserved) / 100 };
  if (balance <= floor) return fail('account-floor', details);
  if (state.lossStreak >= p.maxLossStreak || state.realizedR <= -p.maxDailyLossR) return fail('daily-brake', details);
  if (risk > p.perTradeUSD * 100) return fail('trade-risk', details);
  if (risk > details.dailyRemainingUSD * 100 + 1e-7) return fail('daily-budget', details);
  if (risk > details.floorRemainingUSD * 100 + 1e-7) return fail('floor-reserve', details);
  if (state.entriesToday + pending >= p.maxEntriesPerDay) return fail('daily-entry-limit', details);
  if (state.commitments.length >= p.maxPositionsAndPending) return fail('position-or-pending', details);
  return { riskPassed: true, executionAllowed: false, reason: 'research-risk-pass', ...details };
}

// Caller must carry forward the returned state. A future server adapter must
// apply revisions atomically to authoritative account data; this is not that adapter.
export function reserveResearchRisk(state, intent) {
  const check = assessAccountRisk(state, intent);
  if (!check.riskPassed) return { ...check, state };
  return { ...check, state: { ...state, revision: state.revision + 1,
    commitments: [...state.commitments.map(c => ({ ...c })), {
      id: intent.id, symbol: intent.symbol, status: 'pending', riskUSD: check.riskUSD
    }] } };
}
