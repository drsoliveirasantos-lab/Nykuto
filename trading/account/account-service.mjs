import { APPEARANCE_KEY, validateAppearance } from '../performance/appearance-core.mjs';
import { authenticate } from '../functions/api/lab/jeu04.js';
export { json } from '../alerts/alert-service.mjs';
export class AccountError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const STATE_KEYS = new Set([APPEARANCE_KEY, 'nykuto-trading-settings-v1', 'nykuto-trading-trades-v1', 'nykuto-trading-checklist-v1', 'nykuto-trading-preparations-v1', 'nykuto-trading-pause-until-v1', 'nykuto-trading-strategy-lab-v1', 'connections']);
export async function member(context, complete = true) {
  const claims = await authenticate(context.request);
  if (!claims || typeof claims.email !== 'string' || !claims.email.trim()) throw new AccountError('Reconnecte-toi au site.', 401);
  if (!context.env.TRADING_USERS) throw new AccountError('Les comptes sont momentanément indisponibles.', 503);
  const user = await context.env.TRADING_USERS.prepare('SELECT id, email, role, active, first_name, last_name FROM trading_users WHERE email = ? COLLATE NOCASE').bind(claims.email.trim().toLowerCase()).first();
  if (!user || !user.active) throw new AccountError('Cette adresse ne dispose pas d’un accès actif.', 403);
  const expected = context.request.headers.get('X-Nykuto-User');
  if (expected && expected !== user.id) throw new AccountError('Le compte a changé. Recharge la page.', 409);
  if (complete && (!user.first_name || !user.last_name)) throw new AccountError('Complète ton prénom et ton nom dans Mon compte.', 428);
  return user;
}
export function publicProfile(user) {
  return { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, complete: Boolean(user.first_name && user.last_name) };
}
export function mutation(request, user) {
  if (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('X-Nykuto-Action') !== 'account-write') throw new AccountError('Action non autorisée.', 403);
  if (request.headers.get('X-Nykuto-User') !== user.id) throw new AccountError('Le compte connecté a changé. Recharge la page.', 409);
}
export async function body(request, max = 1500000) {
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') throw new AccountError('Un message JSON est requis.', 415);
  if (!request.body || Number(request.headers.get('Content-Length')) > max) throw new AccountError('Message vide ou trop volumineux.', 413);
  const reader = request.body.getReader(), chunks = []; let size = 0;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > max) { await reader.cancel(); throw new AccountError('Message trop volumineux.', 413); } chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; } catch { throw new AccountError('Message invalide.'); }
}
export function boundedText(value, max, label, required = true) {
  if (typeof value !== 'string' || value.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) || (required && !value.trim())) throw new AccountError(`${label} invalide.`);
  return value.trim();
}
export function validateState(key, value) {
  if (!STATE_KEYS.has(key)) throw new AccountError('Réglage inconnu.');
  if (key === 'nykuto-trading-pause-until-v1') {
    if (!Number.isFinite(value) || value < 0 || value > Date.now() + 86400000) throw new AccountError('Pause invalide.');
  } else if (key.includes('-trades-') || key.includes('-preparations-')) {
    if (!Array.isArray(value) || value.length > 10000 || value.some(v => !v || typeof v !== 'object' || typeof v.id !== 'string' || v.id.length > 100 || !Number.isFinite(Date.parse(v.createdAt)))) throw new AccountError('Historique invalide.');
    if (new Set(value.map(v => v.id)).size !== value.length) throw new AccountError('Historique avec des doublons.');
  } else if (!value || typeof value !== 'object' || Array.isArray(value)) throw new AccountError('Réglages invalides.');
  if (key === APPEARANCE_KEY) {
    try { validateAppearance(value); } catch (error) { throw new AccountError(error.message); }
  }
  if (key === 'connections') {
    if (Object.keys(value).some(k => !['tradingViewName', 'broker', 'mode'].includes(k))) throw new AccountError('Ne transmets aucun mot de passe ni clé API.');
    boundedText(value.tradingViewName, 80, 'Nom TradingView', false);
    boundedText(value.broker, 80, 'Broker', false);
    if (!['paper', 'manual'].includes(value.mode)) throw new AccountError('Mode invalide.');
  }
  const encoded = JSON.stringify(value);
  if (new TextEncoder().encode(encoded).length > 1000000) throw new AccountError('La sauvegarde dépasse la limite de taille.', 413);
  return encoded;
}
export async function handle(fn) {
  try { return await fn(); } catch (error) { const { json } = await import('../alerts/alert-service.mjs'); return json({ error: error instanceof AccountError ? error.message : 'Service indisponible. Tes saisies sont conservées à l’écran ; réessaie.' }, error instanceof AccountError ? error.status : 503); }
}
