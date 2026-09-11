import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { verifyVwapReport } from '../trading/lab/jeu18-report-validation.mjs';
const raw = await readFile(new URL('../trading/lab/jeu18-report.json', import.meta.url));
test('the exact VWAP report verifies and damaged reports fail closed', async () => {
  const r = await verifyVwapReport(raw);
  assert.equal(r.confirmed, false); assert.equal(r.results.length, 2);
  assert.equal(r.filterSummary.considered, 1544); assert.equal(r.filterSummary.priceSide, 147);
  const damaged = Buffer.from(raw); damaged[damaged.indexOf('137.5')] = 57;
  await assert.rejects(verifyVwapReport(damaged), /fingerprint/);
  await assert.rejects(verifyVwapReport(raw.subarray(1)), /Unverifiable/);
});
class Element {
  constructor() { this.textContent = ''; this.value = ''; this.children = []; this.listeners = {}; }
  append(n) { this.children.push(n); }
  replaceChildren(...ns) { this.children = ns; }
  addEventListener(name, f) { this.listeners[name] = f; }
}
test('both cost views show the exact results and a failed load hides them', async () => {
  const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/id="(vwap[^"]*)"/g)].map(m => m[1]);
  const before = { document: globalThis.document, fetch: globalThis.fetch };
  try {
    for (const mode of ['valid', 'invalid']) {
      const elements = new Map(ids.map(id => [id, new Element()])), done = Promise.withResolvers();
      const el = id => elements.get(id);
      Object.defineProperty(el('vwapResults'), 'hidden', { set(v) { this.isHidden = v; done.resolve(); } });
      el('vwapCosts').value = 'normal';
      globalThis.document = { getElementById(id) { assert.ok(elements.has(id), `Missing ${id}`); return el(id); }, createElement() { return new Element(); } };
      globalThis.fetch = async () => new Response(mode === 'valid' ? raw : Buffer.from('<html>Login</html>'), { headers: { 'Content-Type': 'application/json' } });
      await import(`../trading/lab/lab-vwap.mjs?fixture=${mode}`); await done.promise;
      if (mode === 'invalid') { assert.equal(el('vwapResults').isHidden, true); assert.equal(el('vwapStatus').textContent, 'Bilan indisponible'); continue; }
      for (const [cost, count, net] of [['normal', 63, '+14,00 $'], ['stress', 52, '-137,50 $']]) {
        el('vwapCosts').value = cost; el('vwapCosts').listeners.change();
        assert.equal(el('vwapTrades').textContent, `${count} trades`); assert.equal(el('vwapNet').textContent, net);
        assert.equal(el('vwapComparison').children.length, 2); assert.equal(el('vwapAccounts').children.length, 8);
        assert.equal(el('vwapChecks').children.length, 7); assert.equal(el('vwapStatus').textContent, 'Filtre non retenu');
        assert.match(el('vwapSignals').textContent, /1544/); assert.match(el('vwapSignals').textContent, /147/);
      }
    }
  } finally { globalThis.document = before.document; globalThis.fetch = before.fetch; }
});
