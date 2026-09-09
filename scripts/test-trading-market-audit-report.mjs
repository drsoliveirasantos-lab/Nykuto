import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyMarketAudit } from '../trading/lab/market-audit-validation.mjs';
const raw = await readFile(new URL('../trading/lab/market-audit-report.json', import.meta.url)), report = JSON.parse(raw);
test('market audit reconciles all 67 archived trials, 126 distinct observations and immutable sources', async () => {
  const r = await verifyMarketAudit(raw), freeze = JSON.parse(await readFile(new URL('../trading/lab/market-audit-freeze.json', import.meta.url)));
  for (const [path, sha] of Object.entries(freeze.files)) assert.equal(createHash('sha256').update(await readFile(new URL('../' + path, import.meta.url))).digest('hex'), sha, path);
  for (const [path, sha] of Object.entries(r.source.publicFiles)) assert.equal(createHash('sha256').update(await readFile(new URL('../' + path, import.meta.url))).digest('hex'), sha, path);
  assert.equal(r.primary.observations, 126); assert.equal(r.newStrategyTrials, 0); assert.equal(r.inventory.length, 67);
  assert.equal(r.audit.executionChecks, 264); assert.equal(r.audit.contextPrefixChecks, 138);
  const august = r.views.find(v => v.id === 'august' && v.mode === 'diagnostic');
  assert.equal(august.costs.normal.summary.net, -561.5); assert.equal(august.costs.stress.summary.net, -975);
  assert.equal(r.views.find(v => v.mode === 'account').costs.stress.summary.net, -887);
  assert.equal(august.costs.normal.markets.reduce((n, m) => n + m.classes.find(c => c.outcome === 'loss').path.oneRNotReached, 0), 18);
  const inspect = x => { if (!x || typeof x !== 'object') return; for (const [k, v] of Object.entries(x)) {
    assert.ok(!['entryTime', 'exitTime', 'entry', 'exit', 'open', 'high', 'low', 'close', 'candles', 'decisions', 'ticker'].includes(k), 'Private execution detail: ' + k); inspect(v);
  } }; inspect(r);
  const damaged = Buffer.from(raw); damaged[damaged.indexOf('primary')] = 88;
  await assert.rejects(verifyMarketAudit(damaged), /fingerprint/);
  await assert.rejects(verifyMarketAudit(raw.subarray(1)), /Unverifiable/);
});
const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/id="(audit[^"]*)"/g)].map(m => m[1]);
class Element { constructor() { this.value = ''; this.textContent = ''; this.children = []; this.listeners = {}; }
  append(child) { this.children.push(child); } replaceChildren(...children) { this.children = children; }
  addEventListener(name, fn) { this.listeners[name] = fn; } }
const money = n => `${n > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} $`;
test('all 32 market/window/cost views show exact winners, losers, confirmations and refusal counts', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch }, elements = new Map(ids.map(id => [id, new Element()])), ready = Promise.withResolvers();
  const el = id => elements.get('audit' + id);
  try {
    el('Market').value = 'MNQ'; el('View').value = 'august/diagnostic'; el('Costs').value = 'normal';
    Object.defineProperty(el('Retry'), 'disabled', { set(v) { if (!v) ready.resolve(); } });
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async () => new Response(raw, { headers: { 'Content-Type': 'application/json' } });
    await import('../trading/lab/lab-market-audit.mjs?test=views'); await ready.promise;
    let views = 0;
    for (const v of report.views) for (const cost of ['normal', 'stress']) for (const m of v.costs[cost].markets) {
      el('Market').value = m.symbol; el('View').value = v.id + '/' + v.mode; el('Costs').value = cost; el('Market').listeners.change(); views++;
      assert.equal(el('Results').hidden, false); assert.ok(el('Summary').textContent.includes(money(m.total.net)));
      assert.equal(el('Overview').children.length, 4); assert.equal(el('Outcomes').children.length, 3);
      assert.equal(el('Confirmations').children.length, 5); assert.equal(el('Features').children.length, 10);
      for (const [i, c] of m.classes.entries()) assert.equal(el('Outcomes').children[i].children[1].textContent, String(c.count));
      assert.equal(el('Refusals').children.length, m.refusals.length); assert.equal(el('CostEffects').children.length, 5);
      assert.ok(el('Finding').textContent.length > 30);
    }
    assert.equal(views, 32); assert.match(html, /126 trades distincts/); assert.match(html, /premier motif/i);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});
test('failed audit refresh removes stale conclusions and statistics and preserves selected choices on recovery', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch }, elements = new Map(ids.map(id => [id, new Element()])), ready = Promise.withResolvers();
  const el = id => elements.get('audit' + id); let good = true;
  try {
    el('Market').value = 'MGC'; el('View').value = 'august/account'; el('Costs').value = 'stress';
    Object.defineProperty(el('Retry'), 'disabled', { set(v) { if (!v) ready.resolve(); } });
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async () => new Response(good ? raw : 'bad', { headers: { 'Content-Type': 'application/json' } });
    await import('../trading/lab/lab-market-audit.mjs?test=recovery'); await ready.promise;
    good = false; await el('Retry').listeners.click(); assert.equal(el('Results').hidden, true);
    for (const id of ['Overview', 'Outcomes', 'Confirmations', 'Features', 'Groups', 'Refusals', 'CostEffects']) assert.equal(el(id).children.length, 0);
    assert.equal(el('Finding').textContent, ''); assert.equal(el('Summary').textContent, ''); assert.equal(el('Market').disabled, true);
    good = true; await el('Retry').listeners.click(); assert.equal(el('Results').hidden, false);
    assert.equal(el('Market').value, 'MGC'); assert.equal(el('View').value, 'august/account'); assert.equal(el('Costs').value, 'stress');
    assert.ok(el('Summary').textContent.includes(money(-233))); assert.match(el('Status').textContent, /non qualifié/);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});
