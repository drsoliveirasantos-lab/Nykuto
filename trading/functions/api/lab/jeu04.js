// Private snapshot: no market data or Alpaca credential is included in Git.
// Research datasets require both a signed Access identity and the server-side owner role.
import { authenticate } from '../../../account/access-auth.mjs';
import { member, AccountError } from '../../../account/account-service.mjs';

export { authenticate };
export const DATASET_KEY = 'jeu04/spy-15m-2025-12-2026-06-v1.csv';

export const DATASET_HEADERS = Object.freeze({
  'Cache-Control': 'private, no-store',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Vary': 'Cookie, Cf-Access-Jwt-Assertion',
});

const denied = (message, status) => new Response(message, { status, headers: DATASET_HEADERS });

/** Return null only for the active owner recorded in D1. */
export async function authorizeDataset(context) {
  try {
    const user = await member(context);
    return user.role === 'owner' ? null : denied('Owner access required', 403);
  } catch (error) {
    return denied(error instanceof AccountError ? error.message : 'Dataset unavailable', error instanceof AccountError ? error.status : 503);
  }
}

export async function serveDataset({ request, env } = {}, key, contentType, { ownerVerified = false } = {}) {
  const context = { request, env };
  const headers = DATASET_HEADERS;
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'GET' } });
  if (!ownerVerified) {
    const rejection = await authorizeDataset(context);
    if (rejection) return rejection;
  }
  try {
    const csv = await env.TRADING_DATASETS?.get(key);
    if (!csv) return new Response('Dataset unavailable', { status: 503, headers });
    return new Response(csv, { headers: { ...headers, 'Content-Type': contentType } });
  } catch { return new Response('Dataset unavailable', { status: 503, headers }); }
}

export const onRequest = context => serveDataset(context, DATASET_KEY, 'text/csv; charset=utf-8');
