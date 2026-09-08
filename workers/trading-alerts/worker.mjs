import { AlertError, hash, json, normalizeAlert, readBody, saveAlert } from '../../trading/alerts/alert-service.mjs';

// Official TradingView webhook addresses, verified 2026-09-08.
const SOURCES = new Set(['52.89.214.238', '34.212.75.30', '54.218.53.128', '52.32.178.7']);
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    const match = /^\/hook\/([a-f0-9]{64})$/.exec(url.pathname);
    if (request.method !== 'POST' || !match || url.search || !SOURCES.has(request.headers.get('CF-Connecting-IP')) ||
        !env.WEBHOOK_TOKEN_HASH || await hash(match[1]) !== env.WEBHOOK_TOKEN_HASH) return json({ error: 'Not found' }, 404);
    try {
      const alert = normalizeAlert(await readBody(request));
      const saved = await saveAlert(env.TRADING_ALERTS, alert, 'TradingView');
      return json({ accepted: true, duplicate: saved.duplicate }, 200);
    } catch (error) {
      return json({ error: error instanceof AlertError ? error.message : 'Réception indisponible. Réessaie.' }, error instanceof AlertError ? error.status : 503);
    }
  }
};
