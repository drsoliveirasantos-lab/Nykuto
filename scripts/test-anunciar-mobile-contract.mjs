#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, publisher, photoUtils, feedback, basemap, css, headers] = await Promise.all([
  readFile(new URL('../anunciar/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/anunciar.js', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/photo-utils.js', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/live-feedback.js', import.meta.url), 'utf8'),
  readFile(new URL('../anunciar/openfreemap-basemap.js', import.meta.url), 'utf8'),
  readFile(new URL('../demo-imobiliaria.css', import.meta.url), 'utf8'),
  readFile(new URL('../_headers', import.meta.url), 'utf8')
]);

assert.match(html, /data-current-location/);
assert.match(html, /accept="image\/\*,\.heic,\.heif,\.dng"/);
assert.match(html, /Importar imagens <small>\(até 2\)<\/small>/);
assert.match(headers, /geolocation=\(self\)/);
assert.match(publisher, /getCurrentPosition/);
assert.match(publisher, /MAX_OPTIMIZED_PHOTO_BYTES = 180000/);
assert.match(publisher, /resizeWidth: 960/);
assert.match(publisher, /PHOTO_RAW_DECODE_FAILED/);
assert.match(publisher, /selectSourcePhotos/);
assert.match(feedback, /PHOTO_RAW_DECODE_FAILED/);
assert.match(photoUtils, /MAX_PHOTO_COUNT = 2/);
assert.match(photoUtils, /MAX_SOURCE_PHOTO_BYTES = 100 \* 1024 \* 1024/);
assert.match(photoUtils, /application\/x-adobe-dng/);
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
