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
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  applySecurityHeaders(headers);
  const htmlResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
  const path = new URL(context.request.url).pathname;
  const labScripts = path === '/lab' || path.startsWith('/lab/')
    ? '<script src="/lab/lab-filtered.js?v=2" defer></script><script src="/lab/lab-ablation.js?v=1" defer></script>'
    : '';

  return new HTMLRewriter()
    .on('head', {
      element(element) {
        element.append(
          `<link rel="icon" type="image/png" href="${MED_NYKUTO_ICON}">` +
          `<link rel="shortcut icon" type="image/png" href="${MED_NYKUTO_ICON}">` +
          `<link rel="apple-touch-icon" href="${MED_NYKUTO_ICON}">` +
          `<link rel="stylesheet" href="/compact.css?v=1">` +
          `<script src="/navigation.js?v=1" defer></script>` +
          labScripts,
          { html: true }
        );
      }
    })
    .transform(htmlResponse);
}
