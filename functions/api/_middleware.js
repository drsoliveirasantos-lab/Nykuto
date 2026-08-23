import { isDemoHost, json } from '../_lib/security.js';

export async function onRequest(context) {
  if (!isDemoHost(context.request)) return json({ ok: false, code: 'NOT_FOUND' }, 404);
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, private');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
