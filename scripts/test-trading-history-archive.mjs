import test from 'node:test';
import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { readFile, access } from 'node:fs/promises';
import { sha256, decodePart, loadManifest, loadHistory, toCsv } from '../trading/historique/history-source.mjs';
import { onRequest } from '../trading/functions/api/lab/history.js';
import { HISTORY_PREFIX, PART_COUNTS } from '../trading/historique/catalog.mjs';

async function fixture(rows, index = 0) {
  const raw = JSON.stringify(rows), encoded = gzipSync(raw).toString('base64');
  return { encoded, part: { index, from: rows[0][0], to: rows.at(-1)[0], count: rows.length,
    bytes: Buffer.byteLength(raw), sha256: await sha256(raw), encodedSha256: await sha256(encoded) } };
}
const synthetic = [[1769903700,100,102,99,101,null], [1769904000,101,103,100,102,0], [1769904300,102,104,101,103,20]];

test('archive decoding preserves missing volume and rejects corrupt or mismatched blocks', async () => {
  const { encoded, part } = await fixture(synthetic);
  assert.deepEqual(await decodePart(encoded, part), synthetic);
  await assert.rejects(decodePart(encoded + 'A', part), /Empreinte/);
  await assert.rejects(decodePart(encoded, { ...part, sha256: 'wrong' }), /Contenu/);
  await assert.rejects(decodePart(encoded, { ...part, count: 4 }), /Couverture/);
  assert.match(toCsv(synthetic), /1769903700,100,102,99,101,\n1769904000,101,103,100,102,0\n/);
});

test('archive assembly checks whole-series identity and filters the UTC month boundary', async () => {
  const blocks = [await fixture(synthetic.slice(0, 2)), await fixture(synthetic.slice(2), 1)];
  const dataset = { id: 'm5', parts: blocks.map(b => b.part), count: 3, rowsSha256: await sha256(JSON.stringify(synthetic)) };
  const requests = [];
  const fetcher = async (url, options) => {
    requests.push(url); assert.equal(options.credentials, 'same-origin'); assert.equal(options.cache, 'no-store');
    return new Response(blocks[Number(new URL(url, 'https://trading.nykuto.com').searchParams.get('part'))].encoded);
  };
  assert.deepEqual(await loadHistory(dataset, { fetcher }), synthetic);
  requests.length = 0;
  const february = Date.parse('2026-02-01T00:00:00Z') / 1000;
  assert.deepEqual(await loadHistory(dataset, { from: february, to: february + 300, fetcher }), [synthetic[1]]);
  assert.equal(requests.length, 1);
  await assert.rejects(loadHistory({ ...dataset, rowsSha256: 'wrong' }, { fetcher }), /assemblé/);
  await assert.rejects(loadHistory(dataset, { fetcher: async () => new Response('', { status: 503 }) }), /Bloc indisponible/);
});

test('login pages and changed manifests cannot be treated as verified history', async () => {
  await assert.rejects(loadManifest(async () => new Response('<html>login</html>')), /manifeste/);
  await assert.rejects(loadManifest(async () => new Response('', { status: 401 })), /401/);
});

test('private history API restricts keys and requires signed Access identity before reading KV', async () => {
  let reads = 0;
  const request = (query = '', token, method = 'GET') => new Request('https://trading.nykuto.com/api/lab/history' + query, { method, headers: token ? { 'Cf-Access-Jwt-Assertion': token } : {} });
  const env = { TRADING_DATASETS: { get: async key => { reads++; return key; } } };
  for (const query of ['', '?dataset=m1&part=0']) assert.equal((await onRequest({ request: request(query), env })).status, 401);
  for (const query of ['?key=other', '?dataset=../other&part=0', '?dataset=m1&part=-1', '?dataset=m1&part=53', '?dataset=m1&part=00', '?dataset=m1&part=0&part=1', '?dataset=m1', '?part=0']) {
    assert.equal((await onRequest({ request: request(query), env })).status, 400, query);
  }
  assert.equal((await onRequest({ request: request('', undefined, 'POST'), env })).status, 405);
  assert.equal(reads, 0);
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'history-test' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => { assert.equal(url, 'https://nykuto.cloudflareaccess.com/cdn-cgi/access/certs'); return Response.json({ keys: [jwk] }); };
  try {
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const input = encode({ alg: 'RS256', kid: jwk.kid }) + '.' + encode({ iss: 'https://nykuto.cloudflareaccess.com', aud: ['c32e7605f403b5782f17f3ba017488d62e13599d14811f0a15a3d914c4b50190'], iat: now - 10, exp: now + 300 });
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(input));
    const token = input + '.' + Buffer.from(signature).toString('base64url');
    for (const [dataset, count] of Object.entries(PART_COUNTS)) {
      const response = await onRequest({ request: request(`?dataset=${dataset}&part=${count - 1}`, token), env });
      assert.equal(response.status, 200);
      assert.equal(await response.text(), `${HISTORY_PREFIX}/${dataset}/part-${String(count - 1).padStart(3, '0')}`);
      assert.match(response.headers.get('cache-control'), /private, no-store/);
    }
    const response = await onRequest({ request: request('', token), env });
    assert.equal(await response.text(), `${HISTORY_PREFIX}/manifest`);
    assert.match(response.headers.get('content-type'), /application\/json/);
    assert.equal((await onRequest({ request: request('', token), env: {} })).status, 503);
  } finally { globalThis.fetch = originalFetch; }
});

test('published calendar and tracker links resolve inside the Trading project', async () => {
  for (const path of ['trading/historique/index.html', 'trading/suivi/index.html']) {
    const url = new URL('../' + path, import.meta.url), html = await readFile(url, 'utf8');
    for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(?:https?:|#|\/)/.test(href)) continue;
      await access(new URL(href.endsWith('/') ? href + 'index.html' : href, url));
    }
  }
  const { PROJECT_STATUS: status } = await import('../trading/suivi/status-data.mjs');
  for (const source of status.sources.filter(s => s.href && !s.href.startsWith('https:'))) {
    await access(new URL('../trading/suivi/' + source.href + (source.href.endsWith('/') ? 'index.html' : ''), import.meta.url));
  }
});
