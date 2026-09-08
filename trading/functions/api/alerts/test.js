import { authorized } from '../lab/jeu04.js';
import { json, saveAlert } from '../../../alerts/alert-service.mjs';

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  if (!await authorized(request)) return json({ error: 'Reconnecte-toi au site.' }, 401);
  if (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('X-Nykuto-Action') !== 'test-alert') return json({ error: 'Action non autorisée.' }, 403);
  try {
    await saveAlert(env.TRADING_ALERTS, { name: 'Essai de la boîte de réception', symbol: 'DEMO', price: null, interval: 'test', triggeredAt: new Date().toISOString() }, 'Test du site');
    return json({ accepted: true });
  } catch { return json({ error: 'L’alerte de test n’a pas pu être enregistrée.' }, 503); }
}
