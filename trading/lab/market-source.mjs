export const MARKET_SOURCE = Object.freeze({ sha256: '68336737884c2beb1ea0323c0079441b985e834e4940b2214cad82e1ee6a6b3b', bars: 13440, sessions: 148, bytes: 688525 });

export async function readMarketBundle(text, expected = MARKET_SOURCE) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 2000000) throw new Error('Historique du Jeu 06 trop volumineux.');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const sha256 = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  if (sha256 !== expected.sha256) throw new Error('L’historique reçu ne correspond pas aux données vérifiées du Jeu 06.');
  const data = JSON.parse(text);
  if (data.schema !== 'jeu06-data-v1' || !Array.isArray(data.products) || data.products.length !== 3 || !Array.isArray(data.calendar) || data.calendar.length !== expected.sessions) throw new Error('Historique du Jeu 06 incomplet.');
  const bars = data.products.reduce((sum, p) => sum + (Array.isArray(p.segments) ? p.segments.reduce((n, s) => n + (Array.isArray(s.bars) ? s.bars.length : 0), 0) : 0), 0);
  if (bars !== expected.bars) throw new Error('Nombre de bougies du Jeu 06 incorrect.');
  return { ...data, sha256 };
}

export async function loadMarketHistory(fetcher = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetcher('/api/lab/jeu06', { credentials: 'same-origin', cache: 'no-store', redirect: 'error', signal: controller.signal });
    if (response.status === 401 || response.status === 403) throw new Error('Ta session a expiré. Recharge la page pour te reconnecter.');
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('L’historique du Jeu 06 est momentanément indisponible. Réessaie dans un instant.');
    return await readMarketBundle(await response.text());
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Chargement interrompu. Recharge la page puis relance le Jeu 06.');
    throw error;
  } finally { clearTimeout(timer); }
}
