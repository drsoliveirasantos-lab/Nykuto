import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../workers/trading-alerts/worker.mjs';
import { hash, normalizeAlert, listAlerts, CONFIG_KEY } from '../trading/alerts/alert-service.mjs';
import { onRequest as inbox } from '../trading/functions/api/alerts/index.js';
import { onRequest as setup } from '../trading/functions/api/alerts/setup.js';
import { onRequest as createTest } from '../trading/functions/api/alerts/test.js';

const token = 'a'.repeat(64);
const payload = () => ({ name: 'Seuil Nasdaq', symbol: 'CME_MINI:MNQ1!', price: '24000.25', interval: '15', triggeredAt: new Date().toISOString() });
function storage() {
  const data = new Map();
  return { data, reads: 0, writes: 0,
    async get(key) { this.reads++; return data.get(key)?.value || null; },
    async put(key, value, options = {}) { this.writes++; data.set(key, { value, metadata: options.metadata }); },
    async list({ prefix, limit }) { const keys = [...data].filter(([key]) => key.startsWith(prefix)).sort(([a], [b]) => a.localeCompare(b)); return { keys: keys.slice(0, limit).map(([name, value]) => ({ name, metadata: value.metadata })), list_complete: keys.length <= limit }; }
  };
}
async function environment() { return { TRADING_ALERTS: storage(), WEBHOOK_TOKEN_HASH: await hash(token) }; }
function request(body = payload(), options = {}) {
  const { headers, path = `/hook/${token}`, method = 'POST' } = options;
  return new Request(`https://receiver.example${path}`, { method, headers: { 'CF-Connecting-IP': '52.89.214.238', 'Content-Type': 'application/json', ...headers }, ...(method === 'POST' ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}) });
}
test('TradingView deliveries persist before success and identical retries share one event', async () => {
  const env = await environment(), message = payload();
  let response = await worker.fetch(request(message), env);
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { accepted: true, duplicate: false });
  response = await worker.fetch(request(message), env);
  assert.deepEqual(await response.json(), { accepted: true, duplicate: true });
  assert.equal(env.TRADING_ALERTS.writes, 1);
  const feed = await listAlerts(env.TRADING_ALERTS);
  assert.equal(feed.events.length, 1); assert.equal(feed.events[0].source, 'TradingView'); assert.equal(feed.events[0].price, 24000.25);
  assert(!JSON.stringify(feed).includes(token)); assert(!response.headers.has('Access-Control-Allow-Origin'));
});
test('receiver requires both the secret address and the trusted edge source IP, and exposes no reads', async () => {
  const env = await environment();
  for (const options of [{ headers: { 'CF-Connecting-IP': '203.0.113.4' } }, { headers: { 'CF-Connecting-IP': '' } }, { path: `/hook/${'b'.repeat(64)}` }, { path: `/hook/${token}?read=true` }, { method: 'GET' }, { path: '/api/alerts' }]) {
    assert.equal((await worker.fetch(request(payload(), options), env)).status, 404);
  }
  assert.equal(env.TRADING_ALERTS.reads, 0); assert.equal(env.TRADING_ALERTS.writes, 0);
  assert.equal((await worker.fetch(new Request('https://receiver.example/health'), env)).status, 204);
});
test('invalid, oversized and unexpected execution fields cannot be saved', async () => {
  const env = await environment();
  for (const [body, status, headers] of [
    ['not json', 400], [' '.repeat(4097), 413], [payload(), 415, { 'Content-Type': 'text/plain' }],
    [{ ...payload(), action: 'buy' }, 400], [{ ...payload(), price: '' }, 400], [{ ...payload(), price: true }, 400],
    [{ ...payload(), name: '<img>\n' }, 400], [{ ...payload(), symbol: '<script>' }, 400],
    [{ ...payload(), triggeredAt: '2020-01-01T00:00:00Z' }, 400], [{ ...payload(), triggeredAt: new Date(Date.now() + 3600000).toISOString() }, 400]
  ]) assert.equal((await worker.fetch(request(body, { headers }), env)).status, status);
  assert.equal(env.TRADING_ALERTS.writes, 0);
  // UTF-8 bytes, not JS character count; no Content-Length header needed.
  assert.equal((await worker.fetch(request({ ...payload(), name: 'é'.repeat(2200) }), env)).status, 413);
  assert.throws(() => normalizeAlert({ ...payload(), interval: '{{interval}}' }));
});
test('storage failure never acknowledges an alert as accepted', async () => {
  const env = await environment(); env.TRADING_ALERTS.put = async () => { throw new Error('private detail'); };
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 503); const body = await response.json(); assert(!body.accepted); assert(!body.error.includes('private detail'));
});
test('private inbox, setup and test action verify Access and reject cross-origin writes', async () => {
  const pair = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...await crypto.subtle.exportKey('jwk', pair.publicKey), kid: 'alerts-test' };
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => { assert.equal(url, 'https://nykuto.cloudflareaccess.com/cdn-cgi/access/certs'); return Response.json({ keys: [jwk] }); };
  try {
    const env = await environment(), origin = 'https://trading.nykuto.com';
    const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
    const claims = { iss: 'https://nykuto.cloudflareaccess.com', aud: ['c32e7605f403b5782f17f3ba017488d62e13599d14811f0a15a3d914c4b50190'], iat: Math.floor(Date.now() / 1000) - 1, exp: Math.floor(Date.now() / 1000) + 300 };
    const unsigned = `${encode({ alg: 'RS256', kid: jwk.kid })}.${encode(claims)}`;
    const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, new TextEncoder().encode(unsigned));
    const jwt = `${unsigned}.${Buffer.from(signature).toString('base64url')}`;
    const context = (route, method = 'GET', jwtValue = jwt, extraHeaders = {}) => ({ env, request: new Request(`${origin}/api/alerts${route}`, { method, headers: { 'Cf-Access-Jwt-Assertion': jwtValue, Origin: origin, 'X-Nykuto-Action': 'test-alert', ...extraHeaders } }) });
    for (const fn of [inbox, setup, createTest]) {
      const method = fn === createTest ? 'POST' : 'GET';
      assert.equal((await fn(context('', method, ''))).status, 401);
      assert.equal((await fn(context('', method, `${unsigned}.AA`))).status, 401);
    }
    assert.equal(env.TRADING_ALERTS.reads, 0);
    assert.equal((await setup(context('/setup'))).status, 503);
    await env.TRADING_ALERTS.put(CONFIG_KEY, JSON.stringify({ schema: 'trading-alerts-v1', webhookUrl: `https://nykuto-trading-alerts.test.workers.dev/hook/${token}` }));
    const setupResponse = await setup(context('/setup'));
    assert.equal(setupResponse.status, 200); assert.match(setupResponse.headers.get('Cache-Control'), /private, no-store/);
    assert.equal((await setupResponse.json()).webhookUrl.endsWith(token), true);
    assert.equal((await createTest(context('/test', 'POST', jwt, { Origin: 'https://attacker.example' }))).status, 403);
    assert.equal((await createTest(context('/test', 'POST', jwt, { 'X-Nykuto-Action': '' }))).status, 403);
    assert.equal((await createTest(context('/test', 'GET'))).status, 405);
    const result = await createTest(context('/test', 'POST')); assert.equal(result.status, 200);
    const feed = await (await inbox(context(''))).json();
    assert.equal(feed.events.length, 1); assert.equal(feed.events[0].source, 'Test du site'); assert.equal(feed.events[0].price, null);
    assert(!JSON.stringify(feed).includes(token));
  } finally { globalThis.fetch = originalFetch; }
});
