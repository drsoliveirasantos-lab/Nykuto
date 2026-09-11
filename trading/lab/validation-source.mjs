import { MAX_BYTES, parseCandles } from './validation-data.mjs';

export const HOSTED_SOURCE = Object.freeze({
  filename: 'SPY_15m_Alpaca_2025-12_2026-06.csv',
  provider: 'Alpaca', feed: 'sip', bars: 3758,
  sha256: '218536e880fdc44217f427700abd375fcff156f2af1deaa68bd178f6b12ef6b9'
});

export async function readDataset(text, source) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > MAX_BYTES) throw new Error('Fichier trop volumineux (12 Mo maximum).');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (source.sha256 && source.sha256 !== sha256) throw new Error('L’historique reçu ne correspond pas aux données vérifiées du Jeu 04. Réessaie après avoir rechargé la page.');
  const parsed = parseCandles(text);
  if (source.bars && parsed.candles.length !== source.bars) throw new Error('L’historique du Jeu 04 est incomplet.');
  return { ...parsed, ...source, sha256 };
}

export async function loadHostedDataset(fetcher = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetcher('/api/lab/jeu04', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal });
    if (response.status === 401 || response.status === 403) throw new Error('Ta session a expiré. Recharge la page pour te reconnecter, puis relance le test.');
    if (!response.ok || !response.headers.get('content-type')?.includes('text/csv')) throw new Error('Les données du Jeu 04 sont momentanément indisponibles. Réessaie dans un instant.');
    return await readDataset(await response.text(), HOSTED_SOURCE);
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Chargement interrompu. Recharge la page et relance le Jeu 04.');
    throw error;
  } finally { clearTimeout(timer); }
}
