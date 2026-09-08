// Shared by the private inbox and the isolated TradingView receiver. No credentials here.
export const CONFIG_KEY = 'config/webhook-v1';
export const MAX_BODY_BYTES = 4096;
const encoder = new TextEncoder();
export const json = (value, status = 200) => Response.json(value, { status, headers: {
  'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive', 'Referrer-Policy': 'no-referrer',
  'Vary': 'Cookie, Cf-Access-Jwt-Assertion'
} });
export class AlertError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export async function hash(text) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(text));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function readBody(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new AlertError('Un message JSON est requis.', 415);
  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) throw new AlertError('Message trop long.', 413);
  if (!request.body) throw new AlertError('Message vide.');
  const reader = request.body.getReader();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new AlertError('Message trop long.', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new AlertError('Message JSON invalide.'); }
}
export function normalizeAlert(input, now = Date.now()) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AlertError('Message invalide.');
  const allowed = ['name', 'symbol', 'price', 'interval', 'triggeredAt'];
  if (Object.keys(input).some(key => !allowed.includes(key))) throw new AlertError('Champ non reconnu. Utilise le modèle du site.');
  const { name, symbol, price, interval, triggeredAt } = input;
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || /[\u0000-\u001f\u007f]/.test(name)) throw new AlertError('Nom invalide (100 caractères maximum).');
  if (typeof symbol !== 'string' || !/^[A-Za-z0-9_:.!/+\-]{1,80}$/.test(symbol)) throw new AlertError('Symbole invalide.');
  if (!['number', 'string'].includes(typeof price) || (typeof price === 'string' && !/^-?\d+(?:\.\d+)?$/.test(price)) || !Number.isFinite(Number(price))) throw new AlertError('Prix invalide.');
  if (typeof interval !== 'string' || !/^[A-Za-z0-9.]{1,12}$/.test(interval)) throw new AlertError('Unité de temps invalide.');
  if (typeof triggeredAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(triggeredAt)) throw new AlertError('Date invalide. Utilise {{timenow}}.');
  const time = Date.parse(triggeredAt);
  if (!Number.isFinite(time) || time < now - 86400000 || time > now + 300000) throw new AlertError('Alerte trop ancienne ou date incorrecte.');
  return { name: name.trim(), symbol, price: Number(price), interval, triggeredAt: new Date(time).toISOString() };
}
export async function saveAlert(kv, alert, source, now = Date.now()) {
  if (!kv || !['TradingView', 'Test du site'].includes(source)) throw new Error('Storage unavailable');
  const id = await hash(JSON.stringify({ source, ...alert }));
  // Identical deliveries address one key. KV is eventually consistent, not an order ledger.
  const reverseTime = String(9999999999999 - Date.parse(alert.triggeredAt)).padStart(13, '0');
  const key = `events/${reverseTime}/${id}`;
  if (await kv.get(key)) return { id, duplicate: true };
  const event = { id, ...alert, source, receivedAt: new Date(now).toISOString() };
  await kv.put(key, JSON.stringify(event), { metadata: event });
  return { id, duplicate: false };
}
export async function listAlerts(kv) {
  if (!kv) throw new Error('Storage unavailable');
  const page = await kv.list({ prefix: 'events/', limit: 50 });
  if (!Array.isArray(page.keys)) throw new Error('Invalid storage response');
  const events = page.keys.map(key => key.metadata).filter(event => event && typeof event.id === 'string');
  return { events, hasMore: !page.list_complete, checkedAt: new Date().toISOString() };
}
export async function readSetup(kv) {
  const raw = await kv?.get(CONFIG_KEY);
  if (!raw) throw new Error('Setup unavailable');
  const config = JSON.parse(raw);
  if (config.schema !== 'trading-alerts-v1' || typeof config.webhookUrl !== 'string' || !/^https:\/\/nykuto-trading-alerts\.[a-z0-9-]+\.workers\.dev\/(?:hook|personal\/[a-f0-9-]{36})\/[a-f0-9]{64}$/.test(config.webhookUrl)) throw new Error('Invalid setup');
  return { webhookUrl: config.webhookUrl };
}

// Existing owner's inbox keeps its original keys; every tester gets a separate prefix.
export function personalAlerts(kv, user) {
  if (!kv) throw new Error('Storage unavailable');
  if (user.role === 'owner') return kv;
  if (!/^[a-f0-9-]{36}$/.test(user.id)) throw new Error('Invalid account');
  const prefix = `users/${user.id}/`;
  return { get: key => kv.get(prefix + key), put: (key, value, options) => kv.put(prefix + key, value, options), list: options => kv.list({ ...options, prefix: prefix + options.prefix }) };
}
