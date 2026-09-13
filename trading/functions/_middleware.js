import { member, AccountError, json } from '../account/account-service.mjs';
const MED_NYKUTO_ICON = 'https://med.nykuto.com/assets/logo-medcursos-icon.png?v=trading-1';
const CSP = "default-src 'self'; script-src 'self' https://s3.tradingview.com https://unpkg.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://med.nykuto.com https://*.tradingview.com https://s3-symbol-logo.tradingview.com; font-src 'self'; frame-src https://*.tradingview.com; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests";
const OWNER_ONLY_PREFIXES = Object.freeze(['/analysis', '/historique', '/lab', '/live', '/models', '/suivi', '/api/lab']);

export function ownerOnlyPath(path) {
  // Authorize the same decoded path that an asset router may subsequently serve.
  // A malformed or repeatedly encoded path fails closed for non-owners.
  let decoded = path;
  try {
    for (let pass = 0; pass < 4; pass++) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      if (/[?#\u0000]/.test(decoded)) return true;
      if (pass === 3) return true;
    }
    const normalized = new URL(decoded.replace(/\\/g, '/').replace(/\/{2,}/g, '/'), 'https://trading.nykuto.com').pathname.toLowerCase();
    return OWNER_ONLY_PREFIXES.some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`));
  } catch { return true; }
}

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
  let user;
  try {
    user = await member(context, false);
    if (ownerOnlyPath(path) && user.role !== 'owner') {
      const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive', Vary: 'Cookie, Cf-Access-Jwt-Assertion' };
      return path.startsWith('/api/')
        ? json({ error: 'Ressource réservée au propriétaire.' }, 403)
        : new Response('Page introuvable.', { status: 404, headers });
    }
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
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  headers.set('Vary', 'Cookie, Cf-Access-Jwt-Assertion');
  if (!contentType.includes('text/html')) return new Response(response.body, { status: response.status, statusText: response.statusText, headers });

  applySecurityHeaders(headers);
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
          `<link rel="stylesheet" href="/compact.css?v=2">` +
          `<script src="/navigation.js?v=14" defer></script>` +
          labScripts,
          { html: true }
        );
      }
    })
    .transform(htmlResponse);
}
