import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { verifyStructuralReport } from '../trading/lab/jeu16-report-validation.mjs';
const raw = await readFile(new URL('../trading/lab/jeu16-report.json', import.meta.url));
test('the exact published report verifies; modified or truncated reports fail closed', async () => {
  const v = await verifyStructuralReport(raw);
  assert.equal(v.confirmed, false); assert.equal(v.results.length, 2);
  const damaged = Buffer.from(raw); damaged[damaged.indexOf('279.5')] = 48;
  await assert.rejects(verifyStructuralReport(damaged), /fingerprint/);
  await assert.rejects(verifyStructuralReport(raw.subarray(1)), /Unverifiable/);
});
class Element {
  constructor() { this.textContent = ''; this.value = ''; this.children = []; this.listeners = {}; }
  append(n) { this.children.push(n); }
  replaceChildren(...ns) { this.children = ns; }
  addEventListener(name, f) { this.listeners[name] = f; }
}
test('all four report selections display their actual values and a failed load hides the result', async () => {
  const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/id="(structural[^"]*)"/g)].map(m => m[1]);
  const before = { document: globalThis.document, fetch: globalThis.fetch };
  try {
    for (const mode of ['valid', 'invalid']) {
      const elements = new Map(ids.map(id => [id, new Element()]));
      const done = Promise.withResolvers();
      Object.defineProperty(elements.get('structuralResults'), 'hidden', { set(value) { this.isHidden = value; done.resolve(); } });
      elements.get('structuralScenario').value = 'pivot5'; elements.get('structuralCosts').value = 'normal';
      globalThis.document = { getElementById(id) { assert.ok(elements.has(id), `Missing ${id}`); return elements.get(id); }, createElement() { return new Element(); } };
      const payload = mode === 'valid' ? raw : Buffer.from('<html>Login required</html>');
      globalThis.fetch = async () => new Response(payload, { headers: { 'Content-Type': 'application/json' } });
      await import(`../trading/lab/lab-structural.mjs?fixture=${mode}`);
      await done.promise;
      const el = id => elements.get(id);
      if (mode === 'invalid') { assert.equal(el('structuralResults').isHidden, true); assert.equal(el('structuralStatus').textContent, 'Bilan indisponible'); continue; }
      for (const [scenario, factor, count, net] of [['pivot5', 'normal', 91, '-279,50 $'], ['pivot5', 'stress', 71, '-455,00 $'], ['atr5', 'normal', 63, '+14,00 $'], ['atr5', 'stress', 57, '-178,00 $']]) {
        el('structuralScenario').value = scenario; el('structuralCosts').value = factor;
        el('structuralCosts').listeners.change();
        assert.equal(el('structuralTrades').textContent, `${count} trades`); assert.equal(el('structuralNet').textContent, net);
        assert.equal(el('structuralComparison').children.length, 2); assert.equal(el('structuralAccounts').children.length, 8);
        assert.equal(el('structuralWindows').children.length, 5); assert.equal(el('structuralChecks').children.length, 7);
        assert.equal(el('structuralStatus').textContent, 'Non confirmé');
      }
    }
  } finally { globalThis.document = before.document; globalThis.fetch = before.fetch; }
});
