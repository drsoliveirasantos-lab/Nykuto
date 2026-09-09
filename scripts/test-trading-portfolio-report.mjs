import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyPortfolioReport } from '../trading/lab/jeu29-report-validation.mjs';
const raw = await readFile(new URL('../trading/lab/jeu29-report.json', import.meta.url)), report = JSON.parse(raw);
test('portfolio report verifies frozen dependencies, one retained trial, missing dates and exact reconciled totals', async () => {
  const r = await verifyPortfolioReport(raw), freeze = JSON.parse(await readFile(new URL('../trading/lab/jeu29-freeze.json', import.meta.url)));
  for (const [path, hash] of Object.entries(freeze.files)) assert.equal(createHash('sha256').update(await readFile(new URL('../' + path, import.meta.url))).digest('hex'), hash, path);
  assert.equal(r.diagnostic.normal.net, 492.75); assert.equal(r.diagnostic.normal.trades, 100);
  assert.equal(r.diagnostic.stress.net, 591.75); assert.equal(r.diagnostic.stress.trades, 77);
  assert.deepEqual(r.coverage.missing.map(d => d.day), ['2026-02-25', '2026-03-06']); assert.equal(r.coverage.scored, 80);
  assert.ok(r.windows.every(w => !w.complete && w.account === null)); assert.equal(r.researchPassed, false);
  assert.equal(r.selection.id, null); assert.equal(r.holdout.status, 'not-opened');
  const ledger = JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json', import.meta.url)));
  assert.equal(ledger.configurationCount, ledger.entries.length); assert.equal(ledger.entries.filter(x => x.game <= 29).length, 66);
  const entries = ledger.entries.filter(x => x.game === 29); assert.equal(entries.length, 1);
  assert.equal(entries[0].id, r.policy.id); assert.equal(entries[0].freezeSha256, r.freezeSha256);
  assert.equal(entries[0].selected, false); assert.equal(entries[0].confirmed, false);
  const inspect = value => {
    if (!value || typeof value !== 'object') return;
    for (const [k, v] of Object.entries(value)) {
      assert.ok(!['entry', 'exit', 'open', 'high', 'low', 'close', 'signalOpen', 'signalClose', 'decisions', 'candles', 'days'].includes(k), 'Private details: ' + k);
      if (k === 'trades') assert.equal(typeof v, 'number'); inspect(v);
    }
  }; inspect(r);
  const damaged = Buffer.from(raw); damaged[damaged.indexOf('diagnostic')] = 88;
  await assert.rejects(verifyPortfolioReport(damaged), /fingerprint/);
  await assert.rejects(verifyPortfolioReport(raw.subarray(1)), /Unverifiable/);
});

const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/id="(portfolio[^"]*)"/g)].map(m => m[1]);
const money = n => `${n > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} $`;
class Element {
  constructor() { this.value = ''; this.textContent = ''; this.children = []; this.listeners = {}; }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
}
test('portfolio UI shows both costs and changes contributions, windows and daily activity together', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch }, elements = new Map(ids.map(id => [id, new Element()]));
  const el = id => elements.get('portfolio' + id), done = Promise.withResolvers(); let fetches = 0;
  try {
    Object.defineProperty(el('Retry'), 'disabled', { set(v) { if (!v) done.resolve(); } }); el('Costs').value = 'normal';
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async url => { assert.equal(url, './jeu29-report.json'); fetches++; return new Response(raw, { headers: { 'Content-Type': 'application/json' } }); };
    await import('../trading/lab/lab-portfolio.mjs?test=valid'); await done.promise;
    assert.equal(el('Results').hidden, false); assert.equal(el('Status').textContent, 'Portefeuille non qualifié');
    assert.match(el('Message').textContent, /5 critères/); assert.match(el('Coverage').textContent, /80\/82/);
    for (const cost of ['normal', 'stress']) {
      el('Costs').value = cost; el('Costs').listeners.change();
      assert.equal(el('Summary').children[0].children[2].textContent, money(492.75));
      assert.equal(el('Summary').children[1].children[2].textContent, money(591.75));
      for (const [i, c] of report.diagnostic[cost].contributions.entries()) {
        const cells = el('Contributions').children[i].children;
        assert.equal(cells[0].textContent, c.symbol); assert.equal(cells[1].textContent, String(c.trades)); assert.equal(cells[2].textContent, money(c.net));
      }
      assert.equal(el('Activity').children[0].children[1].textContent, String(report.diagnostic[cost].daily.positive));
      assert.equal(el('Windows').children[1].children[3].textContent, money(report.windows[1].diagnostic[cost].net));
      assert.equal(el('Windows').children[1].children[5].textContent, 'Non évaluable');
      assert.equal(el('Checks').children.length, 8);
    }
    assert.equal(fetches, 1); await el('Retry').listeners.click(); assert.equal(fetches, 2); assert.equal(el('Costs').value, 'stress');
    assert.match(html, /restriction de qualité est connue après coup/); assert.match(html, /Les coûts doublés changent les admissions/);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});

test('failed refresh clears old figures and recovers the selected cost without activating execution', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch }, elements = new Map(ids.map(id => [id, new Element()]));
  const el = id => elements.get('portfolio' + id), done = Promise.withResolvers(); let valid = true;
  try {
    Object.defineProperty(el('Retry'), 'disabled', { set(v) { if (!v) done.resolve(); } }); el('Costs').value = 'stress';
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async () => new Response(valid ? raw : Buffer.from('<html>Login</html>'), { headers: { 'Content-Type': 'application/json' } });
    await import('../trading/lab/lab-portfolio.mjs?test=recovery'); await done.promise;
    valid = false; await el('Retry').listeners.click();
    assert.equal(el('Results').hidden, true); assert.equal(el('Costs').disabled, true); assert.equal(el('Status').textContent, 'Bilan indisponible');
    for (const id of ['Summary', 'Contributions', 'Activity', 'Windows', 'Refusals', 'Checks']) assert.equal(el(id).children.length, 0);
    assert.equal(el('Coverage').textContent, ''); valid = true; await el('Retry').listeners.click();
    assert.equal(el('Results').hidden, false); assert.equal(el('Costs').value, 'stress');
    assert.equal(el('Contributions').children[2].children[2].textContent, money(800)); assert.match(el('Message').textContent, /aucun ordre/);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});
