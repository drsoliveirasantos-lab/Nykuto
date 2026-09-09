import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { verifyAugustReport } from '../trading/lab/jeu30-report-validation.mjs';
const raw = await readFile(new URL('../trading/lab/jeu30-report.json', import.meta.url)), report = JSON.parse(raw);
test('August report preserves its frozen rules and publishes 21 daily aggregates and five continuous weeks', async () => {
  const r = await verifyAugustReport(raw), freeze = JSON.parse(await readFile(new URL('../trading/lab/jeu30-freeze.json', import.meta.url)));
  for (const [path, sha] of Object.entries(freeze.files)) assert.equal(createHash('sha256').update(await readFile(new URL('../' + path, import.meta.url))).digest('hex'), sha, path);
  assert.equal(r.account.normal.net, -561.5); assert.equal(r.account.stress.net, -887); assert.equal(r.diagnostic.stress.net, -975);
  assert.equal(r.account.normal.trades, 26); assert.equal(r.account.stress.trades, 17); assert.equal(r.coverage.scored, 21);
  for (const mode of ['account', 'diagnostic']) for (const cost of ['normal', 'stress']) {
    const x = r[mode][cost]; assert.equal(x.calendar.daily.length, 21); assert.equal(x.calendar.weeks.length, 5);
    assert.equal(x.calendar.weeks[4].first, '2026-08-31'); assert.equal(x.calendar.weeks[4].expectedSessions, 1);
  }
  const ledger = JSON.parse(await readFile(new URL('../trading/lab/research-ledger.json', import.meta.url)));
  assert.equal(ledger.entries.length, 67); assert.equal(ledger.configurationCount, 67);
  assert.equal(ledger.entries.filter(x => x.game <= 29).length, 66);
  const entry = ledger.entries.find(x => x.game === 30); assert.equal(entry.holdoutStatus, 'evaluated-by-request');
  assert.equal(entry.freezeSha256, r.freezeSha256); assert.equal(entry.economicRulesChanged, false); assert.equal(entry.selected, false);
  const inspect = x => { if (!x || typeof x !== 'object') return; for (const [k, v] of Object.entries(x)) {
    assert.ok(!['entry', 'exit', 'open', 'high', 'low', 'close', 'candles', 'decisions', 'signalOpen', 'signalClose'].includes(k), 'Private trade details: ' + k);
    if (k === 'trades') assert.ok(v === null || typeof v === 'number'); inspect(v);
  } }; inspect(r);
  const damaged = Buffer.from(raw); damaged[damaged.indexOf('diagnostic')] = 88;
  await assert.rejects(verifyAugustReport(damaged), /fingerprint/); await assert.rejects(verifyAugustReport(raw.subarray(1)), /Unverifiable/);
});

const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/id="(august[^"]*)"/g)].map(m => m[1]);
const money = n => n === null ? '—' : `${n > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} $`;
class Element {
  constructor() { this.value = ''; this.textContent = ''; this.children = []; this.listeners = {}; }
  append(child) { this.children.push(child); } replaceChildren(...children) { this.children = children; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
}
test('all four August views render exact daily, weekly and monthly results without a weekly reset', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch }, elements = new Map(ids.map(id => [id, new Element()]));
  const el = id => elements.get('august' + id), done = Promise.withResolvers(); let fetches = 0;
  try {
    el('Mode').value = 'account'; el('Costs').value = 'normal';
    Object.defineProperty(el('Retry'), 'disabled', { set(v) { if (!v) done.resolve(); } });
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async url => { assert.equal(url, './jeu30-report.json'); fetches++; return new Response(raw, { headers: { 'Content-Type': 'application/json' } }); };
    await import('../trading/lab/lab-august.mjs?test=all'); await done.promise;
    for (const mode of ['account', 'diagnostic']) for (const cost of ['normal', 'stress']) {
      el('Mode').value = mode; el('Costs').value = cost; el('Mode').listeners.change(); el('Costs').listeners.change();
      const x = report[mode][cost]; assert.equal(el('Results').hidden, false);
      assert.equal(el('Days').children.length, 21); assert.equal(el('Weeks').children.length, 5);
      for (const [i, d] of x.calendar.daily.entries()) {
        const cells = el('Days').children[i].children;
        assert.equal(cells[1].textContent, String(d.trades)); assert.equal(cells[2].textContent, money(d.net));
        assert.equal(cells[3].textContent, money(d.cumulative)); assert.equal(cells[4].textContent, money(d.balance));
      }
      for (const [i, w] of x.calendar.weeks.entries()) assert.equal(el('Weeks').children[i].children[3].textContent, money(w.net));
      assert.match(el('Weeks').children[4].children[0].textContent, /partielle/);
      assert.equal(el('Summary').children[0].children[2].textContent, money(report[mode].normal.net));
      assert.equal(el('Summary').children[1].children[2].textContent, money(report[mode].stress.net));
      assert.match(el('Message').textContent, /21\/21/); assert.match(el('Activity').textContent, /21 séances/);
    }
    assert.equal(fetches, 1); assert.match(html, /aucune remise à zéro hebdomadaire/); assert.match(html, /désormais consommé/);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});
test('an invalid August refresh clears old days and weeks and recovers the selected mode and cost', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch }, elements = new Map(ids.map(id => [id, new Element()]));
  const el = id => elements.get('august' + id), done = Promise.withResolvers(); let valid = true;
  try {
    el('Mode').value = 'diagnostic'; el('Costs').value = 'stress';
    Object.defineProperty(el('Retry'), 'disabled', { set(v) { if (!v) done.resolve(); } });
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async () => new Response(valid ? raw : Buffer.from('<html>Unavailable</html>'), { headers: { 'Content-Type': 'application/json' } });
    await import('../trading/lab/lab-august.mjs?test=recover'); await done.promise;
    valid = false; await el('Retry').listeners.click(); assert.equal(el('Results').hidden, true);
    for (const key of ['Summary', 'Weeks', 'Days', 'Contributions', 'Refusals']) assert.equal(el(key).children.length, 0);
    assert.equal(el('Activity').textContent, ''); assert.equal(el('Mode').disabled, true);
    valid = true; await el('Retry').listeners.click(); assert.equal(el('Results').hidden, false);
    assert.equal(el('Mode').value, 'diagnostic'); assert.equal(el('Costs').value, 'stress');
    assert.equal(el('Summary').children[1].children[2].textContent, money(-975)); assert.match(el('Status').textContent, /non qualifié/);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});
