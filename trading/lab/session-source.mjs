import { parseCandles } from './validation-data.mjs';
import { loadHostedDataset } from './validation-source.mjs';

export const SESSION_SOURCE = Object.freeze({ sha256: 'd2ce90483ff835e3e867fde80ca85d81bbe4ab768de02488ab92f9f43d3c9e60', bars: 3706, sessions: 143 });
export async function readSessionBundle(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 1000000) throw new Error('Historique du Jeu 05 trop volumineux.');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (sha256 !== SESSION_SOURCE.sha256) throw new Error('Les données reçues ne correspondent pas à l’historique vérifié du Jeu 05.');
  const data = JSON.parse(text);
  if (data.schema !== 'jeu05-data-v1' || !Array.isArray(data.calendar) || !Array.isArray(data.developmentCalendar) || data.calendar.length !== SESSION_SOURCE.sessions) throw new Error('Calendrier du Jeu 05 invalide.');
  const parsed = parseCandles(data.csv);
  if (!parsed.symbolVerified || parsed.candles.length !== SESSION_SOURCE.bars || parsed.duplicateCount) throw new Error('Historique du Jeu 05 incomplet.');
  return { candles: parsed.candles, calendar: data.calendar, developmentCalendar: data.developmentCalendar, metadata: data.metadata, sha256 };
}

export async function loadSessionHistories(fetcher = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const [response, development] = await Promise.all([
      fetcher('/api/lab/jeu05', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal }),
      loadHostedDataset(fetcher)
    ]);
    if (response.status === 401 || response.status === 403) throw new Error('Ta session a expiré. Recharge la page pour te reconnecter.');
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('L’historique du Jeu 05 est momentanément indisponible. Réessaie dans un instant.');
    const validation = await readSessionBundle(await response.text());
    return { validation, development: { ...development, calendar: validation.developmentCalendar } };
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Chargement interrompu. Recharge la page puis relance le Jeu 05.');
    throw error;
  } finally { clearTimeout(timer); }
}
