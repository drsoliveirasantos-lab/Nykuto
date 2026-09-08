import { authorized } from '../lab/jeu04.js';
import { json, readSetup } from '../../../alerts/alert-service.mjs';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ error: 'Méthode non autorisée.' }, 405);
  if (!await authorized(request)) return json({ error: 'Reconnecte-toi au site.' }, 401);
  try { return json(await readSetup(env.TRADING_ALERTS)); }
  catch { return json({ error: 'La connexion TradingView n’est pas encore disponible.' }, 503); }
}
