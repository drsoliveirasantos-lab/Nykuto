import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { verifyAblationReport } from '../trading/lab/jeu17-report-validation.mjs';
const raw = await readFile(new URL('../trading/lab/jeu17-report.json', import.meta.url));
test('the exact published report verifies; modified or truncated reports fail closed', async () => {
  const v = await verifyAblationReport(raw);
  assert.equal(v.confirmed, false); assert.equal(v.results.length, 4);
  const damaged = Buffer.from(raw); damaged[damaged.indexOf('279.5')] = 48;
  await assert.rejects(verifyAblationReport(damaged), /fingerprint/);
  await assert.rejects(verifyAblationReport(raw.subarray(1)), /Unverifiable/);
});
class Element {
  constructor() { this.textContent = ''; this.value = ''; this.children = []; this.listeners = {}; }
  append(n) { this.children.push(n); }
  replaceChildren(...ns) { this.children = ns; }
  addEventListener(name, f) { this.listeners[name] = f; }
}
test('all eight report selections display their actual values and a failed load hides the result', async () => {
  const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
  const ids = [...html.matchAll(/id="(ablation[^"]*)"/g)].map(m => m[1]);
  const before = { document: globalThis.document, fetch: globalThis.fetch };
  try {
    for (const mode of ['valid', 'invalid']) {
      const elements = new Map(ids.map(id => [id, new Element()]));
      const done = Promise.withResolvers();
      Object.defineProperty(elements.get('ablationResults'), 'hidden', { set(value) { this.isHidden = value; done.resolve(); } });
      elements.get('ablationScenario').value = 'pivot5'; elements.get('ablationCosts').value = 'normal';
      globalThis.document = { getElementById(id) { assert.ok(elements.has(id), `Missing ${id}`); return elements.get(id); }, createElement() { return new Element(); } };
      const payload = mode === 'valid' ? raw : Buffer.from('<html>Login required</html>');
      globalThis.fetch = async () => new Response(payload, { headers: { 'Content-Type': 'application/json' } });
      await import(`../trading/lab/lab-ablation-report.mjs?fixture=${mode}`);
      await done.promise;
      const el = id => elements.get(id);
      if (mode === 'invalid') { assert.equal(el('ablationResults').isHidden, true); assert.equal(el('ablationStatus').textContent, 'Bilan indisponible'); continue; }
      for (const [scenario, factor, count, net] of [['atrNet5', 'normal', 63, '+14,00 $'], ['atrNet5', 'stress', 52, '-137,50 $'], ['pivotOnly5', 'normal', 92, '-296,00 $'], ['pivotOnly5', 'stress', 77, '-517,50 $'], ['pivot5', 'normal', 91, '-279,50 $'], ['pivot5', 'stress', 71, '-455,00 $'], ['atr5', 'normal', 63, '+14,00 $'], ['atr5', 'stress', 57, '-178,00 $']]) {
        el('ablationScenario').value = scenario; el('ablationCosts').value = factor;
        el('ablationCosts').listeners.change();
        assert.equal(el('ablationTrades').textContent, `${count} trades`); assert.equal(el('ablationNet').textContent, net);
        assert.equal(el('ablationComparison').children.length, 4); assert.equal(el('ablationAccounts').children.length, 8);
        assert.equal(el('ablationWindows').children.length, 5); assert.equal(el('ablationChecks').children.length, 7);
        assert.equal(el('ablationEffects').children.length, 4);
        assert.equal(el('ablationEffects').children[0].children[1].textContent, factor === 'normal' ? '0,00 $' : '+40,50 $');
        assert.equal(el('ablationStatus').textContent, 'Non confirmé');
      }
    }
  } finally { globalThis.document = before.document; globalThis.fetch = before.fetch; }
});
