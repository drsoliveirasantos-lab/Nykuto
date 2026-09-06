import assert from 'node:assert/strict';
import test from 'node:test';
import { SERVICES, STORAGE_KEY, getService, normalizeCart, toggleService, summarizeCart, readDraft, saveDraft, readCarriedDraft, carryDraft, appointmentMessage, whatsappHref } from '../ellen-studio/ellen-cart-model.mjs';
import { initCart } from '../ellen-studio/ellen-cart.mjs';

function memoryStorage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
test('selection is unique, validated, and ignores injected prices or removed services', () => {
  assert.deepEqual(normalizeCart(['nails-nude', 'nails-nude', 'unhas-fibra', { id: 'brows-design', brl: 0 }, 'brows-design']), ['nails-nude', 'brows-design']);
  assert.deepEqual(normalizeCart({}), []);
  assert.deepEqual(toggleService(['nails-nude'], 'nails-nude'), []);
  assert.deepEqual(toggleService(['nails-nude'], '__proto__'), ['nails-nude']);
});
test('totals sum displayed reais and explicitly distinguish unpriced services', () => {
  assert.equal(getService('nails-nude').brl, 50);
  assert.equal(getService('brows-design').brl, 40);
  assert.equal(getService('cilios-lift').brl, 130);
  assert.equal(getService('cilios-russo').brl, 430);
  assert.match(appointmentMessage(['cilios-russo']), /Total estimado: R\$\s*430\n/);
  const mixed = summarizeCart(['nails-nude', 'brows-design', 'cilios-hibrida']);
  assert.equal(mixed.total, 90);
  assert.equal(mixed.known, 2);
  assert.equal(mixed.unknown, 1);
  const allUnknown = summarizeCart(['cilios-classica', 'nails-french-cor']);
  assert.equal(allUnknown.known, 0);
  assert.equal(allUnknown.unknown, 2);
  assert.doesNotMatch(appointmentMessage(['cilios-classica']), /R\$\s*0|Total estimado:/);
});
test('temporary drafts survive page changes and malformed or blocked storage fails safely', () => {
  const storage = memoryStorage();
  assert.equal(saveDraft(storage, ['nails-nude', 'nails-nude']), true);
  assert.deepEqual(readDraft(storage).ids, ['nails-nude']);
  assert.equal(storage.getItem(STORAGE_KEY), '["nails-nude"]');
  storage.setItem(STORAGE_KEY, '{invalid');
  assert.deepEqual(readDraft(storage).ids, []);
  assert.equal(saveDraft(undefined, ['nails-nude']), false);
  const url = carryDraft('/ellen-studio/cilios/#techniques-title', ['nails-nude', 'unknown'], 'https://nykuto.com');
  assert.deepEqual(readCarriedDraft(new URL(url, 'https://nykuto.com').search), ['nails-nude']);
  assert.equal(readCarriedDraft(''), null);
  assert.deepEqual(readCarriedDraft('?cuidados='), []);
  assert.equal(carryDraft('https://example.com/', ['nails-nude'], 'https://nykuto.com'), 'https://example.com/');
});
test('WhatsApp draft contains the right recipient, item details, partial total and preferences', () => {
  const name = 'Ana & Júlia';
  const notes = 'French rose + pois? #1\nTenho uma dúvida: <script>não executar</script> 🩷';
  const url = new URL(whatsappHref(['nails-nude', 'brows-design', 'cilios-hibrida'], { name, notes, date: '2026-09-10', period: 'afternoon' }));
  assert.equal(url.origin + url.pathname, 'https://wa.me/595973877606');
  assert.equal([...url.searchParams.keys()].length, 1);
  const message = url.searchParams.get('text');
  assert.ok(message.includes(name) && message.includes(notes));
  assert.match(message, /Nails — Nude natural/);
  assert.match(message, /Sobrancelhas — Design natural/);
  assert.match(message, /Extensão híbrida: sob consulta/);
  assert.match(message, /Subtotal estimado dos itens com referência: R\$\s*90/);
  assert.match(message, /não incluído\(s\) no subtotal/);
  assert.match(message, /10\/09\/2026/);
  assert.match(message, /Tarde/);
  assert.match(message, /valor final.*a confirmar/);
  assert.throws(() => whatsappHref([]), /Escolha pelo menos/);
});

// Exercise real event handlers with a small DOM fixture, without browser QA.
function pageFixture(storage, serviceIds = [], search = '') {
  let focused = null;
  let assigned = null;
  class Node {
    constructor() { this.dataset = {}; this.attrs = {}; this.handlers = {}; this.children = []; this.hidden = true; this.value = ''; }
    append(...nodes) { nodes.forEach(node => { node.parentElement = this; this.children.push(node); }); }
    replaceChildren() { this.children = []; }
    addEventListener(type, handler) { this.handlers[type] = handler; }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key]; }
    focus() { focused = this; }
    querySelector(selector) {
      if (selector === '[data-cart-shortcut]') return this.shortcut;
      const id = selector.match(/data-remove-service="([^"]+)"/)?.[1];
      for (const child of this.children) { if (child.dataset.removeService === id) return child; const result = child.querySelector(selector); if (result) return result; }
      return null;
    }
  }
  const selectors = new Map();
  for (const selector of ['[data-cart-root]', '[data-cart-items]', '[data-cart-status]', '[data-cart-error]', '[data-cart-empty]', '[data-cart-filled]', '[data-cart-count]', '[data-cart-total-label]', '[data-cart-total]', '[data-cart-unknown]', '[data-cart-choose]']) selectors.set(selector, [new Node()]);
  const anchor = new Node(); anchor.setAttribute('href', '/ellen-studio/agenda/');
  selectors.set('a[href]', [anchor]); selectors.set('.cart-link', [anchor]);
  const buttons = serviceIds.map(id => { const button = new Node(); button.dataset.addService = id; const parent = new Node(); parent.shortcut = new Node(); parent.append(button); return button; });
  selectors.set('[data-add-service]', buttons);
  const form = new Node();
  const fields = Object.fromEntries(['name', 'date', 'period', 'notes'].map(name => [name, new Node()]));
  fields.date.setCustomValidity = message => { fields.date.validationMessage = message; };
  form.elements = { namedItem: name => fields[name] };
  form.reportValidity = () => !fields.date.validationMessage;
  form.fields = fields;
  selectors.set('[data-appointment-form]', [form]);
  const location = { origin: 'https://nykuto.com', href: `https://nykuto.com/ellen-studio/agenda/${search}`, search, assign: href => { assigned = href; } };
  const events = {};
  const window = { sessionStorage: storage, location, history: { replaceState(_state, _unused, path) { const url = new URL(path, location.origin); location.href = url.href; location.search = url.search; } }, addEventListener: (name, fn) => { events[name] = fn; } };
  const document = { querySelector: selector => selectors.get(selector)?.[0] ?? null, querySelectorAll: selector => selectors.get(selector) ?? [], createElement: () => new Node() };
  const cart = initCart(document, window);
  return { cart, buttons, form, fields, document, anchor, events, window, get assigned() { return assigned; }, get focused() { return focused; } };
}
test('real add/remove handlers retain selection across pages, update totals and restore removal focus', () => {
  const storage = memoryStorage();
  const nails = pageFixture(storage, ['nails-nude']);
  assert.equal(nails.buttons[0].hidden, false);
  nails.buttons[0].handlers.click();
  assert.equal(nails.buttons[0].attrs['aria-pressed'], 'true');
  const brows = pageFixture(storage, ['brows-design']);
  brows.buttons[0].handlers.click();
  assert.deepEqual(brows.cart.getIds(), ['nails-nude', 'brows-design']);
  assert.match(brows.document.querySelector('[data-cart-total]').textContent, /R\$\s*90/);
  const list = brows.document.querySelector('[data-cart-items]');
  list.querySelector('[data-remove-service="nails-nude"]').handlers.click();
  assert.equal(brows.focused.dataset.removeService, 'brows-design');
  list.querySelector('[data-remove-service="brows-design"]').handlers.click();
  assert.equal(brows.document.querySelector('[data-cart-empty]').hidden, false);
  assert.equal(brows.focused, brows.document.querySelector('[data-cart-choose]'));
  nails.events.pageshow({ persisted: true });
  assert.deepEqual(nails.cart.getIds(), []);
});
test('blocked storage carries selection through navigation and reload URLs', () => {
  const first = pageFixture(undefined, ['nails-nude']);
  first.buttons[0].handlers.click();
  assert.match(first.anchor.getAttribute('href'), /cuidados=nails-nude/);
  assert.match(first.window.location.search, /cuidados=nails-nude/);
  const next = pageFixture(undefined, [], new URL(first.anchor.getAttribute('href'), first.window.location.origin).search);
  assert.deepEqual(next.cart.getIds(), ['nails-nude']);
});
test('submit validates the date and opens a composed WhatsApp draft only on user action', () => {
  const storage = memoryStorage(); saveDraft(storage, ['nails-nude', 'brows-design']);
  const page = pageFixture(storage);
  assert.equal(page.assigned, null);
  page.fields.date.value = '2000-01-01';
  page.form.handlers.submit({ preventDefault() {} });
  assert.equal(page.assigned, null);
  page.fields.date.value = ''; page.fields.name.value = 'Ana';
  const NativeFormData = globalThis.FormData;
  globalThis.FormData = class { constructor(form) { this.values = Object.entries(form.fields).map(([key, field]) => [key, field.value]); } [Symbol.iterator]() { return this.values[Symbol.iterator](); } };
  try { page.form.handlers.submit({ preventDefault() {} }); } finally { globalThis.FormData = NativeFormData; }
  const message = new URL(page.assigned).searchParams.get('text');
  assert.match(message, /Meu nome: Ana/);
  assert.match(message, /Total estimado: R\$\s*90/);
  assert.deepEqual(readDraft(storage).ids, ['nails-nude', 'brows-design'], 'Opening WhatsApp must not silently discard the draft');
});
