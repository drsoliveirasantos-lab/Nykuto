import { authorized } from '../lab/jeu04.js';
import { json, listAlerts } from '../../../alerts/alert-service.mjs';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return json({ error: 'Méthode non autorisée.' }, 405);
  if (!await authorized(request)) return json({ error: 'Reconnecte-toi au site.' }, 401);
  try { return json(await listAlerts(env.TRADING_ALERTS)); }
  catch { return json({ error: 'La boîte de réception est momentanément indisponible.' }, 503); }
}
