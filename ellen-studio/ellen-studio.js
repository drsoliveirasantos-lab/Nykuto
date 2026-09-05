(() => {
  'use strict';
  // Visual prototype only: no accounts, persistence, analytics, or booking API.
  const body = document.body;
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#main-nav');
  if (menuButton && menu) {
    body.classList.add('enhanced');
    menuButton.hidden = false;
    const closeMenu = (restoreFocus = false) => {
      menu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.querySelector('.sr-only').textContent = 'Abrir menu';
      if (restoreFocus) menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menu.classList.toggle('is-open', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      closeMenu();
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
    }));
    window.matchMedia('(max-width: 900px)').addEventListener('change', () => closeMenu());
  }

  const filters = [...document.querySelectorAll('[data-filter]')];
  const panels = [...document.querySelectorAll('.service-panel')];
  const selectCategory = (category) => {
    if (!filters.some((button) => button.dataset.filter === category)) return false;
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    panels.forEach((panel) => { panel.hidden = panel.id !== `menu-${category}`; });
    return true;
  };
  const categoryFromHash = () => window.location.hash.replace(/^#menu-/, '');
  if (filters.length && panels.length) {
    document.querySelector('.service-tabs').hidden = false;
    if (!selectCategory(categoryFromHash())) selectCategory('nails');
    filters.forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.filter)));
    document.querySelectorAll('[data-category-link]').forEach((link) => {
      link.addEventListener('click', () => selectCategory(link.dataset.categoryLink));
    });
    window.addEventListener('hashchange', () => selectCategory(categoryFromHash()));
  }
})();
