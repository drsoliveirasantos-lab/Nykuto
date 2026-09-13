import { authorizeDataset, DATASET_HEADERS } from './jeu04.js';
import { COLLECTION_KEY, inspectCollection } from '../../../lab/prospective-collection.mjs';

export async function onRequest(context) {
  const { request, env } = context;
  const headers = { ...DATASET_HEADERS, 'Content-Type': 'application/json; charset=utf-8' };
  const reply = (body, status = 200) => Response.json(body, { status, headers });
  if (request.method !== 'GET') return reply({ error: 'Lecture uniquement.' }, 405);
  const rejection = await authorizeDataset(context);
  if (rejection) return reply({ error: rejection.status === 403 ? 'Collecte réservée au propriétaire.' : 'Reconnecte-toi au site pour lire la collecte.' }, rejection.status);
  try {
    const stored = await env.TRADING_DATASETS?.get(COLLECTION_KEY);
    if (!stored) return reply({ error: 'Collecte non initialisée.' }, 503);
    return reply(inspectCollection(JSON.parse(stored)));
  } catch { return reply({ error: 'Journal de collecte indisponible ou invalide.' }, 503); }
}
