export const SIX_MONTHS_SOURCE = Object.freeze({ sha256: '43bb1959f4fbb2db25b0fbe306beb1e7599602b6d1d7df2babbc214bf4e01a15', bytes: 331299, bars: 4746, sessions: 123, calendar: 183 });
export async function readSixMonths(text, expected = SIX_MONTHS_SOURCE) {
  if (!globalThis.crypto?.subtle) throw new Error('La vérification sécurisée des données est indisponible. Ouvre le site en HTTPS dans un navigateur récent.');
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 2000000 || bytes.length !== expected.bytes) throw new Error('Taille de l’historique du Jeu 09 incorrecte.');
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
  if (sha !== expected.sha256) throw new Error('L’historique du Jeu 09 ne correspond pas au jeu vérifié.');
  const bundle = JSON.parse(text);
  if (bundle.schema !== 'jeu09-data-v1' || bundle.protocol !== 'jeu09-v2' || bundle.calendar?.length !== expected.calendar || bundle.segments?.reduce((n, s) => n + (s.bars?.length || 0), 0) !== expected.bars) throw new Error('Historique du Jeu 09 incomplet.');
  return bundle;
}
export async function loadSixMonths(fetcher = fetch) {
  const response = await fetcher('/api/lab/jeu09', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.headers.get('Content-Type')?.includes('application/json')) throw new Error('Données indisponibles. Recharge la page puis réessaie.');
  return readSixMonths(await response.text());
}
