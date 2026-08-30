#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, publisher, feedback, basemap, css, headers] = await Promise.all([
  readFile(new URL('../anunciar/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/anunciar.js', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/live-feedback.js', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/openfreemap-basemap.js', import.meta.url), 'utf8'),
  readFile(new URL('../demo-imobiliaria.css', import.meta.url), 'utf8'),
  readFile(new URL('../_headers', import.meta.url), 'utf8')
]);

assert.match(html, /data-current-location/);
assert.match(html, /image\/heic/);
assert.match(html, /Importar imagens <small>\(até 2\)<\/small>/);
assert.match(headers, /geolocation=\(self\)/);
assert.match(publisher, /getCurrentPosition/);
assert.match(publisher, /resizeWidth: 1280/);
assert.match(publisher, /MAX_PHOTO_COUNT = 2/);
assert.match(publisher, /optimizedPhotos\(files = selectedFiles\.slice\(\)\)/);
assert.match(publisher, /const photoSnapshot = selectedFiles\.slice\(\)/);
assert.match(publisher, /const payloadSnapshot = \{/);
assert.match(publisher, /form\.setAttribute\('inert', ''\)/);
assert.match(publisher, /currentLocationRequestId/);
assert.match(publisher, /addressSearchRequestId/);
assert.doesNotMatch(basemap, /installLargePhotoDecodeGuard/);
assert.doesNotMatch(basemap, /Date\.now\(\)/);
assert.doesNotMatch(feedback, /nominatim|scheduleSuggestions|reverseGeocode/i);
assert.doesNotMatch(css, /\[data-photo-help\]\s*\{\s*display:\s*none/);
assert.match(css, /\.nykuto-wizard-form\[aria-busy="true"\]\s*\{\s*pointer-events:\s*none/);

console.log('Publisher mobile contract tests passed.');
