import { authorized } from './jeu04.js';
import { COLLECTION_KEY, inspectCollection } from '../../../lab/prospective-collection.mjs';

export async function onRequest({ request, env }) {
  const headers = { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow, noarchive', Vary: 'Cookie, Cf-Access-Jwt-Assertion' };
  const reply = (body, status = 200) => Response.json(body, { status, headers });
  if (request.method !== 'GET') return reply({ error: 'Lecture uniquement.' }, 405);
  if (!await authorized(request)) return reply({ error: 'Reconnecte-toi au site pour lire la collecte.' }, 401);
  try {
    const stored = await env.TRADING_DATASETS?.get(COLLECTION_KEY);
    if (!stored) return reply({ error: 'Collecte non initialisée.' }, 503);
    return reply(inspectCollection(JSON.parse(stored)));
  } catch { return reply({ error: 'Journal de collecte indisponible ou invalide.' }, 503); }
}
