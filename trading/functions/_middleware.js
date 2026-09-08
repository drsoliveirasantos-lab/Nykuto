const MED_NYKUTO_ICON = 'https://med.nykuto.com/assets/logo-medcursos-icon.png?v=trading-1';

function allowMedNykutoIcon(headers) {
  const csp = headers.get('Content-Security-Policy');
  if (!csp || csp.includes('https://med.nykuto.com')) return;
  headers.set(
    'Content-Security-Policy',
    csp.replace(
      "img-src 'self' data:",
      "img-src 'self' data: https://med.nykuto.com"
    )
  );
}

export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const headers = new Headers(response.headers);
  allowMedNykutoIcon(headers);
  const htmlResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });

  return new HTMLRewriter()
    .on('head', {
      element(element) {
        element.append(
          `<link rel="icon" type="image/png" href="${MED_NYKUTO_ICON}">` +
          `<link rel="shortcut icon" type="image/png" href="${MED_NYKUTO_ICON}">` +
          `<link rel="apple-touch-icon" href="${MED_NYKUTO_ICON}">`,
          { html: true }
        );
      }
    })
    .transform(htmlResponse);
}
