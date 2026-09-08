import test from 'node:test';
import assert from 'node:assert/strict';
import { readDataset, loadHostedDataset } from '../trading/lab/validation-source.mjs';
import { onRequest, DATASET_KEY } from '../trading/functions/api/lab/jeu04.js';
import { onRequest as onRequest05, DATASET_KEY as DATASET_KEY05 } from '../trading/functions/api/lab/jeu05.js';
import { onRequest as onRequest06, DATASET_KEY as DATASET_KEY06 } from '../trading/functions/api/lab/jeu06.js';

test('hosted data failures cannot become a successful dataset', async () => {
  await assert.rejects(loadHostedDataset(async () => new Response('<html>login</html>', { headers: { 'Content-Type': 'text/html' } })), /indisponibles/);
  await assert.rejects(loadHostedDataset(async () => new Response('', { status: 401 })), /session/);
  await assert.rejects(loadHostedDataset(async () => { throw new TypeError('network'); }), /interrompu/);
  await assert.rejects(loadHostedDataset(async () => new Response('changed', { headers: { 'Content-Type': 'text/csv' } })), /ne correspond pas/);
});

test('CSV integrity and declared row count are checked before use', async () => {
  const csv = 'timestamp,open,high,low,close,symbol\n2026-01-02T14:30:00Z,100,101,99,100,SPY\n';
  const read = await readDataset(csv, { filename: 'local.csv' });
  assert.equal(read.candles.length, 1);
  assert.equal(read.symbolVerified, true);
  await assert.rejects(readDataset(csv, { sha256: 'invalid' }), /ne correspond pas/);
  await assert.rejects(readDataset(csv, { sha256: read.sha256, bars: 2 }), /incomplet/);
});

test('private endpoint verifies the Access signature and fails closed', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'test' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    assert.equal(url, 'https://nykuto.cloudflareaccess.com/cdn-cgi/access/certs');
    return Response.json({ keys: [jwk] });
  };
  try {
    const base = { iss: 'https://nykuto.cloudflareaccess.com', aud: ['c32e7605f403b5782f17f3ba017488d62e13599d14811f0a15a3d914c4b50190'], iat: Math.floor(Date.now() / 1000) - 10, exp: Math.floor(Date.now() / 1000) + 300 };
    const encode = object => Buffer.from(JSON.stringify(object)).toString('base64url');
    const sign = async (claims = base, header = { alg: 'RS256', kid: 'test' }) => {
      const input = `${encode(header)}.${encode(claims)}`;
      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(input));
      return `${input}.${Buffer.from(signature).toString('base64url')}`;
    };
    let reads = 0;
    const env = { TRADING_DATASETS: { get: async key => { reads++; assert.equal(key, DATASET_KEY); return 'verified snapshot'; } } };
    const request = token => new Request('https://trading-nykuto.pages.dev/api/lab/jeu04', { headers: token ? { 'Cf-Access-Jwt-Assertion': token } : {} });
    const valid = await sign();
    for (const token of [null, 'bad', await sign({ ...base, exp: 1 }), await sign({ ...base, aud: ['other-app'] }), await sign({ ...base, iss: 'https://attacker.example' }), await sign(base, { alg: 'none', kid: 'test' }), valid.replace(/\.[^.]+$/, '.AA')]) {
      assert.equal((await onRequest({ request: request(token), env })).status, 401);
    }
    assert.equal(reads, 0, 'unauthenticated requests must not read the dataset');
    const response = await onRequest({ request: request(valid), env });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'verified snapshot');
    assert.match(response.headers.get('cache-control'), /private, no-store/);
    assert.match(response.headers.get('content-type'), /text\/csv/);
    assert.equal(reads, 1);
    assert.equal((await onRequest05({ request: request(null), env })).status, 401);
    const response05 = await onRequest05({ request: request(valid), env: { TRADING_DATASETS: { get: async key => { assert.equal(key, DATASET_KEY05); return '{"schema":"jeu05-data-v1"}'; } } } });
    assert.equal(response05.status, 200);
    assert.match(response05.headers.get('content-type'), /application\/json/);
    assert.deepEqual(await response05.json(), { schema: 'jeu05-data-v1' });
    assert.equal((await onRequest06({ request: request(null), env })).status, 401);
    const response06 = await onRequest06({ request: request(valid), env: { TRADING_DATASETS: { get: async key => { assert.equal(key, DATASET_KEY06); return '{"schema":"jeu06-data-v1"}'; } } } });
    assert.equal(response06.status, 200);
    assert.deepEqual(await response06.json(), { schema: 'jeu06-data-v1' });
    assert.equal((await onRequest({ request: request(valid), env: {} })).status, 503);
    assert.equal((await onRequest({ request: new Request('https://trading.nykuto.com/api/lab/jeu04', { method: 'POST' }), env })).status, 405);
  } finally { globalThis.fetch = originalFetch; }
});
