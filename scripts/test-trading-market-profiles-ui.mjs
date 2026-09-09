import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const raw = Object.fromEntries(await Promise.all([23, 26, 27, 28].map(async game => [game, await readFile(new URL(`../trading/lab/jeu${game}-report.json`, import.meta.url))])));
const html = await readFile(new URL('../trading/lab/index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/id="(profiles[^"]*)"/g)].map(m => m[1]);
const money = n => `${n > 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} $`;
class Element {
  constructor() { this.value = ''; this.textContent = ''; this.children = []; this.listeners = {}; }
  append(child) { this.children.push(child); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(name, fn) { this.listeners[name] = fn; }
}

test('market menus display exact reports independently and risk examples use the shared supervisor', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch };
  const elements = new Map(ids.map(id => [id, new Element()])), el = id => elements.get('profiles' + id);
  const done = Promise.withResolvers(); let fetches = 0;
  try {
    Object.defineProperty(el('Retry'), 'disabled', { set(value) { if (!value) done.resolve(); } });
    el('RiskScenario').value = 'simultaneous';
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async url => { fetches++; const game = /jeu(\d+)-report/.exec(url)[1]; return new Response(raw[game], { headers: { 'Content-Type': 'application/json' } }); };
    await import('../trading/lab/lab-market-profiles.mjs?test=valid'); await done.promise;
    assert.equal(fetches, 4); assert.equal(el('Status').textContent, '4 profils distincts · aucune stratégie qualifiée');
    for (const [symbol, net, strategy] of [['MNQ', 931.5, 'protect'], ['MES', -206.25, 'base'], ['MYM', -213, 'protect'], ['MGC', 636.5, 'failure']]) {
      assert.equal(el('Choice' + symbol).value, strategy); assert.equal(el('Data' + symbol).hidden, false);
      assert.equal(el('Rows' + symbol).children.length, 2); assert.equal(el('Rows' + symbol).children[0].children[2].textContent, money(net));
      assert.match(el('Status' + symbol).textContent, /Non qualifiée/);
    }
    const mnq = el('RowsMNQ').children[0].children[2].textContent;
    el('ChoiceMGC').value = 'base'; el('ChoiceMGC').listeners.change();
    assert.equal(el('RowsMGC').children[0].children[2].textContent, money(-370));
    assert.equal(el('RowsMNQ').children[0].children[2].textContent, mnq);
    assert.equal(el('LinkMGC').href, './JEU23_RESULTS.md'); assert.equal(fetches, 4);
    assert.match(el('RiskResult').textContent, /83,50/); assert.match(el('RiskResult').textContent, /105,00/);
    for (const scenario of ['daily', 'floor']) {
      el('RiskScenario').value = scenario; el('RiskScenario').listeners.change();
      assert.match(el('RiskResult').textContent, /50,00/); assert.match(el('RiskResult').textContent, /83,50/);
      assert.match(el('RiskResult').textContent, /Aucun ordre ne peut partir/);
    }
    await el('Retry').listeners.click();
    assert.equal(el('ChoiceMGC').value, 'base'); assert.equal(fetches, 8);
    assert.match(html, /ne constituent pas un nouveau backtest/);
    assert.match(html, /les gains ne s’additionnent pas en portefeuille/);
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});

test('partial and total data failures hide affected values, preserve other markets and recover without fallback', async () => {
  const original = { document: globalThis.document, fetch: globalThis.fetch };
  const elements = new Map(ids.map(id => [id, new Element()])), el = id => elements.get('profiles' + id);
  const done = Promise.withResolvers(); let mode = 'partial';
  try {
    Object.defineProperty(el('Retry'), 'disabled', { set(value) { if (!value) done.resolve(); } });
    el('RiskScenario').value = 'simultaneous';
    globalThis.document = { getElementById(id) { assert.ok(elements.has(id), id); return elements.get(id); }, createElement() { return new Element(); } };
    globalThis.fetch = async url => {
      const game = /jeu(\d+)-report/.exec(url)[1];
      if (mode === 'none' || (mode === 'partial' && game === '28')) return new Response('<html>Unavailable</html>', { status: 503 });
      return new Response(raw[game], { headers: { 'Content-Type': 'application/json' } });
    };
    await import('../trading/lab/lab-market-profiles.mjs?test=partial'); await done.promise;
    assert.equal(el('ChoiceMNQ').value, 'protect'); assert.equal(el('DataMNQ').hidden, true);
    assert.equal(el('DataMYM').hidden, true); assert.equal(el('DataMES').hidden, false); assert.equal(el('DataMGC').hidden, false);
    assert.match(el('Status').textContent, /^2 profil/);
    el('ChoiceMNQ').value = 'base'; el('ChoiceMNQ').listeners.change();
    assert.equal(el('DataMNQ').hidden, false); assert.match(el('Status').textContent, /^1 profil/);
    assert.equal(el('RowsMNQ').children[0].children[2].textContent, money(887.5));
    mode = 'none'; await el('Retry').listeners.click();
    for (const symbol of ['MNQ', 'MES', 'MYM', 'MGC']) {
      assert.equal(el('Data' + symbol).hidden, true); assert.equal(el('Rows' + symbol).children.length, 0);
    }
    assert.match(el('Status').textContent, /^4 profil\(s\) consulté/);
    mode = 'valid'; await el('Retry').listeners.click();
    assert.equal(el('ChoiceMNQ').value, 'base'); assert.equal(el('DataMYM').hidden, false);
    assert.equal(el('RowsMNQ').children[0].children[2].textContent, money(887.5));
    assert.equal(el('Status').textContent, '4 profils distincts · aucune stratégie qualifiée');
  } finally { globalThis.document = original.document; globalThis.fetch = original.fetch; }
});
