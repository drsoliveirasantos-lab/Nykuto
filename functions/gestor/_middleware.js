import { getAccessState } from '../_lib/auth.js';
import { isDemoHost } from '../_lib/security.js';

function redirect(location, status = 302) {
  return new Response(null, { status, headers: { Location: location, 'Cache-Control': 'no-store, private' } });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (!isDemoHost(context.request)) return redirect(`https://demo.nykuto.com${url.pathname}${url.search}`);

  const isAsset = /\.(?:css|js|png|webp|svg)$/i.test(url.pathname);
  const isLogin = url.pathname === '/gestor/login/' || url.pathname === '/gestor/login/index.html';
  if (!isAsset) {
    const access = await getAccessState(context.request, context.env);
    if (isLogin && access.state === 'active') return redirect('/gestor/');
    if (!isLogin && access.state !== 'active') {
      const reason = access.state === 'pass_expired' ? 'expirado' : 'login';
      return redirect(`/gestor/login/?estado=${reason}`);
    }
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-store, private');
  headers.set('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
