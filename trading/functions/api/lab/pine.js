import { authorizeDataset, DATASET_HEADERS } from './jeu04.js';
import { PINE_VERSION, PINE_SHA256, PINE_KEY } from '../../../historique/pine-catalog.mjs';

export async function serveVerifiedPine(context, reference = { version: PINE_VERSION, sha256: PINE_SHA256, key: PINE_KEY }) {
  const { request, env } = context;
  if (request.method !== 'GET') return new Response('Method not allowed', { status:405, headers:{...DATASET_HEADERS,Allow:'GET'} });
  const rejection = await authorizeDataset(context);
  if (rejection) return rejection;
  if (new URL(request.url).search) return new Response('Invalid query', {status:400,headers:DATASET_HEADERS});
  if (!reference.key || !/^[a-f0-9]{64}$/.test(reference.sha256 ?? '')) return new Response('Pine source not yet activated', {status:503,headers:DATASET_HEADERS});
  try {
    const source = await env.TRADING_DATASETS?.get(reference.key);
    if (typeof source !== 'string' || !source.startsWith('//@version=')) throw new Error('Missing Pine source');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
    const hash = Array.from(new Uint8Array(digest), byte=>byte.toString(16).padStart(2,'0')).join('');
    if (hash !== reference.sha256) throw new Error('Pine source integrity mismatch');
    return new Response(source, {headers:{
      ...DATASET_HEADERS,
      'Content-Type':'text/plain; charset=utf-8',
      'Content-Disposition':`attachment; filename="Nykuto_V${reference.version}_TradingView.txt"`,
      'X-Pine-SHA256':reference.sha256,
    }});
  } catch {
    return new Response('Verified Pine source unavailable', {status:503,headers:DATASET_HEADERS});
  }
}
export const onRequest = context => serveVerifiedPine(context);
