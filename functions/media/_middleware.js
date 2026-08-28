import { isDemoHost } from '../_lib/security.js';

export async function onRequest(context) {
  if (!isDemoHost(context.request)) return new Response('Not found', { status: 404 });
  return context.next();
}
