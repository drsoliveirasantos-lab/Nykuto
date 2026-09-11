// Read-only reception contract. This module never creates signals or orders.
export const PREFIX = 'nykuto-market-reception-v1:';
export const PRODUCTS = Object.freeze({
  MNQ: { tick: 0.25, exchange: 'CME' }, MES: { tick: 0.25, exchange: 'CME' },
  MYM: { tick: 1, exchange: 'CBOT' }, MGC: { tick: 0.1, exchange: 'COMEX' }
});
export const RETAIN = 120;
export const MINUTE = 60000;
export class FeedError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const fields = ['schema','source','root','contract','providerSymbol','startMs','endMs','open','high','low','close','volume'];
export function normalizeBar(input, now = Date.now()) {
  if (!input || Array.isArray(input) || typeof input !== 'object' ||
      Object.keys(input).length !== fields.length || fields.some(k => !Object.hasOwn(input, k)))
    throw new FeedError('Schéma de bougie invalide ; aucun identifiant broker ne doit être transmis.');
  const p = Object.hasOwn(PRODUCTS, input.root) && PRODUCTS[input.root];
  if (!p || input.schema !== 1 || input.source !== 'quantower-rithmic') throw new FeedError('Source ou marché non pris en charge.');
  const match = typeof input.contract === 'string' && /^(MNQ|MES|MYM|MGC)-(20\d{2})(0[1-9]|1[0-2])$/.exec(input.contract);
  if (!match || match[1] !== input.root) throw new FeedError('Utilise une échéance explicite, par exemple MNQ-202609, pas MNQ1!.');
  const month = Number(match[2]) * 12 + Number(match[3]) - 1;
  const current = new Date(now).getUTCFullYear() * 12 + new Date(now).getUTCMonth();
  if (month < current - 1 || month > current + 18) throw new FeedError('Échéance hors de la fenêtre autorisée.');
  if (typeof input.providerSymbol !== 'string' || !input.providerSymbol.startsWith(input.root) ||
      !/^[A-Z0-9][A-Z0-9 .:_-]{1,39}$/.test(input.providerSymbol)) throw new FeedError('Symbole fournisseur invalide.');
  if (!Number.isSafeInteger(input.startMs) || input.startMs <= 0 || input.startMs % MINUTE !== 0 ||
      input.endMs !== input.startMs + MINUTE || input.endMs > now || now - input.endMs > 10 * MINUTE)
    throw new FeedError('Seules les bougies 1 minute clôturées depuis moins de 10 minutes sont acceptées.', 422);
  for (const k of ['open','high','low','close']) {
    const v = input[k];
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0 || v > 1000000 || Math.abs(v / p.tick - Math.round(v / p.tick)) > 1e-6)
      throw new FeedError('Prix invalide ou incompatible avec le tick du contrat.');
  }
  if (input.low > Math.min(input.open,input.close) || input.high < Math.max(input.open,input.close) || input.low > input.high)
    throw new FeedError('OHLC incohérent.');
  if (!Number.isSafeInteger(input.volume) || input.volume < 0 || input.volume > 100000000)
    throw new FeedError('Volume invalide ; volume cumulé et volume de bougie ne sont pas interchangeables.');
  return Object.fromEntries(fields.map(k => [k, input[k]]));
}
export function emptyStream() { return { schema: 1, bars: [], accepted: 0, gaps: 0, rollovers: 0, receivedAt: null }; }
export function appendBar(state, bar, now) {
  if (!state || state.schema !== 1 || !Array.isArray(state.bars) || state.bars.length > RETAIN)
    throw new FeedError('État du flux illisible ; aucune donnée remplacée.', 503);
  const duplicate = state.bars.find(b => b.contract === bar.contract && b.startMs === bar.startMs);
  if (duplicate) {
    if (JSON.stringify(duplicate) !== JSON.stringify(bar)) throw new FeedError('Bougie déjà reçue avec un contenu différent.', 409);
    return { duplicate: true, state }; // A retry must never refresh market freshness.
  }
  const last = state.bars.at(-1);
  if (last && bar.startMs <= last.startMs) throw new FeedError('Bougie désordonnée ou trop ancienne ; le flux ne recule pas.', 409);
  if (last && bar.contract < last.contract) throw new FeedError('Retour à une ancienne échéance refusé.', 409);
  if (last && bar.contract === last.contract && bar.providerSymbol !== last.providerSymbol)
    throw new FeedError('Le symbole fournisseur a changé pour la même échéance.', 409);
  return { duplicate: false, state: {
    schema: 1, bars: [...state.bars, bar].slice(-RETAIN), accepted: state.accepted + 1,
    gaps: state.gaps + (last && last.endMs !== bar.startMs ? 1 : 0),
    rollovers: state.rollovers + (last && last.contract !== bar.contract ? 1 : 0), receivedAt: now
  } };
}
// UTC-aligned preview only; never crosses contracts or fills missing minutes.
export function aggregateBars(bars, minutes) {
  if (![1,5,15,60].includes(minutes)) throw new FeedError('Unité de temps invalide.');
  const width = minutes * MINUTE, groups = new Map();
  for (const b of bars) {
    const start = Math.floor(b.startMs / width) * width;
    const key = `${b.contract}:${b.providerSymbol}:${start}`;
    if (!groups.has(key)) groups.set(key, { start, bars: [] });
    groups.get(key).bars.push(b);
  }
  const result = [];
  for (const { start, bars: group } of groups.values()) {
    group.sort((a,b) => a.startMs - b.startMs);
    if (group.length !== minutes || group.some((b,i) => b.startMs !== start + i * MINUTE)) continue;
    result.push({ ...group[0], startMs: start, endMs: start + width,
      high: Math.max(...group.map(b => b.high)), low: Math.min(...group.map(b => b.low)),
      close: group.at(-1).close, volume: group.reduce((n,b) => n + b.volume, 0) });
  }
  return result.sort((a,b) => a.startMs - b.startMs);
}
export function describeStream(root, state, now = Date.now()) {
  const last = state.bars.at(-1), age = last ? Math.max(0, now - last.endMs) : null;
  return { root, exchange: PRODUCTS[root].exchange, state: !last ? 'waiting' : age > 2 * MINUTE ? 'stale' : 'recent',
    last: last || null, ageMs: age, receivedAt: state.receivedAt, accepted: state.accepted,
    retained: state.bars.length, gaps: state.gaps, rollovers: state.rollovers,
    timeframes: Object.fromEntries([1,5,15,60].map(m => [m, aggregateBars(state.bars, m).length])),
    sourceVerified: false, paperEnabled: false, shadowEnabled: false, ordersEnabled: false };
}
