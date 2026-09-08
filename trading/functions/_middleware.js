import { member, AccountError, json } from '../account/account-service.mjs';
const MED_NYKUTO_ICON = 'https://med.nykuto.com/assets/logo-medcursos-icon.png?v=trading-1';
const CSP = "default-src 'self'; script-src 'self' https://s3.tradingview.com https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://med.nykuto.com https://*.tradingview.com https://s3-symbol-logo.tradingview.com; font-src 'self'; frame-src https://*.tradingview.com; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests";

function applySecurityHeaders(headers) {
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  headers.set('Content-Security-Policy', CSP);
}

export async function onRequest(context) {
  const path = new URL(context.request.url).pathname;
  try {
    const user = await member(context, false);
    const profileRoute = path === '/account' || path.startsWith('/account/') || path === '/api/account' || path === '/api/account/';
    const asset = /\.(?:js|mjs|css|png|svg|ico|woff2?)$/.test(path);
    if (!user.first_name || !user.last_name) {
      if (path.startsWith('/api/') && !profileRoute) return json({ error: 'Complète ton prénom et ton nom dans Mon compte.' }, 428);
      if (!profileRoute && !asset) return new Response(null, { status: 303, headers: { Location: '/account/', 'Cache-Control': 'private, no-store' } });
    }
  } catch (error) {
    return json({ error: error instanceof AccountError ? error.message : 'Les comptes sont momentanément indisponibles.' }, error instanceof AccountError ? error.status : 503);
  }
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  applySecurityHeaders(headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Vary', 'Cookie, Cf-Access-Jwt-Assertion');
  const htmlResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
  const labScripts = path === '/lab' || path.startsWith('/lab/')
    ? '<script src="/lab/lab-filtered.js?v=3" defer></script><script src="/lab/lab-ablation.js?v=2" defer></script>'
    : '';

  return new HTMLRewriter()
    .on('head', {
      element(element) {
        element.prepend('<script src="/account/session.js?v=1"></script>', { html: true });
        element.append(
          `<link rel="icon" type="image/png" href="${MED_NYKUTO_ICON}">` +
          `<link rel="shortcut icon" type="image/png" href="${MED_NYKUTO_ICON}">` +
          `<link rel="apple-touch-icon" href="${MED_NYKUTO_ICON}">` +
          `<link rel="stylesheet" href="/compact.css?v=1">` +
          `<script src="/navigation.js?v=4" defer></script>` +
          labScripts,
          { html: true }
        );
      }
    })
    .transform(htmlResponse);
}
