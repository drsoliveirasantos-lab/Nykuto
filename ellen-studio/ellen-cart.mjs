import { getService, money, normalizeCart, toggleService, summarizeCart, readDraft, saveDraft, readCarriedDraft, carryDraft, whatsappHref } from './ellen-cart-model.mjs';

export function initCart(document, window) {
  let storage;
  try { storage = window.sessionStorage; } catch { /* URL handoff keeps the temporary selection available. */ }
  const saved = readDraft(storage);
  const carried = readCarriedDraft(window.location.search);
  let ids = carried ?? saved.ids;
  let canSave = saveDraft(storage, ids);
  // A carried draft takes precedence, including an explicitly empty selection.
  if (carried !== null && canSave) {
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('cuidados');
    try { window.history.replaceState(null, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash); }
    catch { /* A blocked history API must not prevent the saved draft from opening. */ }
  }
  const root = document.querySelector('[data-cart-root]');
  const list = document.querySelector('[data-cart-items]');
  const form = document.querySelector('[data-appointment-form]');
  const status = document.querySelector('[data-cart-status]');
  const error = document.querySelector('[data-cart-error]');
  const addButtons = [...document.querySelectorAll('[data-add-service]')];
  let pendingFocus;

  const say = message => { if (status) status.textContent = message; };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const setHidden = (selector, hidden) => document.querySelectorAll(selector).forEach(node => { node.hidden = hidden; });
  const refresh = () => {
    const summary = summarizeCart(ids);
    document.querySelectorAll('[data-cart-count]').forEach(node => { node.textContent = String(ids.length); });
    document.querySelectorAll('.cart-link').forEach(node => { node.setAttribute('aria-label', `Ver carrinho: ${ids.length} cuidado(s)`); });
    addButtons.forEach(button => {
      const selected = ids.includes(button.dataset.addService);
      button.setAttribute('aria-pressed', String(selected));
      button.textContent = selected ? 'No carrinho · remover' : 'Adicionar ao carrinho';
      const shortcut = button.parentElement.querySelector('[data-cart-shortcut]');
      if (shortcut) shortcut.hidden = !selected;
    });
    setHidden('[data-cart-empty]', ids.length !== 0);
    setHidden('[data-cart-filled]', ids.length === 0);
    setHidden('[data-cart-summary-link]', ids.length === 0);
    document.querySelectorAll('[data-cart-total-label]').forEach(node => { node.textContent = summary.unknown ? 'Subtotal estimado' : 'Total estimado'; });
    document.querySelectorAll('[data-cart-total]').forEach(node => { node.textContent = summary.known ? money(summary.total) : 'Sob consulta'; });
    document.querySelectorAll('[data-cart-unknown]').forEach(node => {
      node.textContent = summary.unknown ? `${summary.unknown} cuidado(s) sob consulta${summary.known ? ', a acrescentar ao subtotal' : ''}.` : '';
      node.hidden = summary.unknown === 0;
    });
    if (list) {
      list.replaceChildren();
      summary.items.forEach(item => {
        const row = element('li', 'cart-item');
        const content = element('div', 'cart-item-copy');
        content.append(element('p', 'cart-category', item.category), element('h3', '', item.name), element('p', 'cart-item-detail', item.detail));
        const actions = element('div', 'cart-item-actions');
        actions.append(element('p', 'cart-item-price', item.brl === null ? 'Sob consulta' : `≈ ${money(item.brl)}`));
        const remove = element('button', 'cart-remove', 'Remover');
        remove.type = 'button';
        remove.dataset.removeService = item.id;
        remove.setAttribute('aria-label', `Remover ${item.name} do carrinho`);
        remove.addEventListener('click', () => {
          const index = ids.indexOf(item.id);
          ids = ids.filter(id => id !== item.id);
          pendingFocus = ids[Math.min(index, ids.length - 1)];
          changed(`${item.name} removido do carrinho.`);
          const next = pendingFocus && list.querySelector(`[data-remove-service="${pendingFocus}"]`);
          (next || document.querySelector('[data-cart-choose]')).focus();
        });
        actions.append(remove);
        row.append(content, actions);
        list.append(row);
      });
    }
    // Carry only validated service IDs. Names and date preferences never enter URLs.
    document.querySelectorAll('a[href]').forEach(link => {
      if (!link.dataset.cartOriginalHref) link.dataset.cartOriginalHref = link.getAttribute('href');
      const original = link.dataset.cartOriginalHref;
      if (original.startsWith('/ellen-studio/')) {
        link.setAttribute('href', canSave ? original : carryDraft(original, ids, window.location.origin));
      }
    });
    if (!canSave) {
      try { window.history.replaceState(null, '', carryDraft(window.location.href, ids, window.location.origin)); }
      catch { /* Navigation links still carry the selection when history is unavailable. */ }
    }
    if (error) error.hidden = true;
  };
  const changed = message => {
    canSave = saveDraft(storage, ids);
    refresh();
    say(message);
  };
  addButtons.forEach(button => {
    const service = getService(button.dataset.addService);
    if (!service) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      ids = toggleService(ids, service.id);
      changed(`${service.name} ${ids.includes(service.id) ? 'adicionado ao' : 'removido do'} carrinho.`);
    });
  });
  if (root) root.hidden = false;
  refresh();
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    if (canSave) ids = readDraft(storage).ids;
    refresh();
  });
  if (form) {
    const date = form.elements.namedItem('date');
    const today = () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    };
    date.min = today();
    const validateDate = () => date.setCustomValidity(date.value && date.value < today() ? 'Escolha uma data de hoje em diante.' : '');
    date.addEventListener('input', validateDate);
    form.addEventListener('submit', event => {
      event.preventDefault();
      validateDate();
      if (!form.reportValidity()) return;
      try {
        const values = Object.fromEntries(new FormData(form));
        const href = whatsappHref(ids, values);
        // User action opens a draft in WhatsApp. The website never sends a message.
        window.location.assign(href);
      } catch (failure) {
        error.textContent = failure.message || 'Não foi possível abrir o pedido. Tente novamente.';
        error.hidden = false;
        error.focus();
      }
    });
  }
  return { getIds: () => normalizeCart(ids) };
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') initCart(document, window);
