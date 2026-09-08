import { member, handle } from '../../../account/account-service.mjs';
import { personalAlerts } from '../../../alerts/alert-service.mjs';
import { json, listAlerts } from '../../../alerts/alert-service.mjs';

export const onRequest = context => handle(async () => {
  const { request, env } = context;
  if (request.method !== 'GET') return json({ error: 'Méthode non autorisée.' }, 405);
  const user = await member(context);
  const storage = personalAlerts(env.TRADING_ALERTS, user);
  try { return json(await listAlerts(storage)); }
  catch { return json({ error: 'La boîte de réception est momentanément indisponible.' }, 503); }
});
