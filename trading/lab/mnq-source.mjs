export const CONFIRMATION_SOURCE = Object.freeze({ sha256: '770306897634833cca092cdd5730bb8d30d5a9a72d8a56e571f87a6ef0c79390', bytes: 86442, bars: 1522, sessions: 59 });
export async function readConfirmation(text, expected = CONFIRMATION_SOURCE) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length !== expected.bytes || bytes.length > 1000000) throw new Error('Taille de l’historique du Jeu 07 incorrecte.');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (sha256 !== expected.sha256) throw new Error('L’historique du Jeu 07 ne correspond pas aux données vérifiées.');
  const bundle = JSON.parse(text);
  if (bundle.schema !== 'jeu07-data-v1' || bundle.bars?.length !== expected.bars || bundle.calendar?.length !== expected.sessions) throw new Error('Historique du Jeu 07 invalide.');
  return { ...bundle, sha256 };
}
export async function loadConfirmation(fetcher = fetch) {
  try {
    const response = await fetcher('/api/lab/jeu07', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if ([401, 403].includes(response.status)) throw new Error('Recharge la page pour te reconnecter au site.');
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('Les données du Jeu 07 sont momentanément indisponibles.');
    return await readConfirmation(await response.text());
  } catch (error) {
    if (['AbortError', 'TimeoutError'].includes(error.name) || error instanceof TypeError) throw new Error('Chargement interrompu. Recharge la page puis réessaie.');
    throw error;
  }
}
