import { member, handle } from '../../../account/account-service.mjs';
import { personalAlerts } from '../../../alerts/alert-service.mjs';
import { json, saveAlert } from '../../../alerts/alert-service.mjs';

export const onRequest = context => handle(async () => {
  const { request, env } = context;
  if (request.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  const user = await member(context);
  const storage = personalAlerts(env.TRADING_ALERTS, user);
  if (request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('X-Nykuto-Action') !== 'test-alert') return json({ error: 'Action non autorisée.' }, 403);
  try {
    await saveAlert(storage, { name: 'Essai de la boîte de réception', symbol: 'DEMO', price: null, interval: 'test', triggeredAt: new Date().toISOString() }, 'Test du site');
    return json({ accepted: true });
  } catch { return json({ error: 'L’alerte de test n’a pas pu être enregistrée.' }, 503); }
});
