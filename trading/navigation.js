(() => {
  'use strict';

  const nav = document.querySelector('.section-nav');
  const moduleIds = ['dashboard', 'risk', 'journal', 'plan'];
  const modules = moduleIds.map(id => document.getElementById(id)).filter(Boolean);

  function ensureLink(href, label) {
    if (!nav || nav.querySelector(`a[href="${href}"]`)) return;
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    nav.appendChild(link);
  }

  if (nav && modules.length) {
    ensureLink('/replay/', 'Replay');
    ensureLink('/lab/', 'Lab');
  }
  ensureLink('/analysis/', 'Analyse');
  ensureLink('/alerts/', 'Alertes');
  ensureLink('/discipline/', 'Avant un trade');
  ensureLink('/account/#feedback', 'Retours');
  ensureLink('/account/', 'Mon compte');
  ensureLink('/cdn-cgi/access/logout', 'Déconnexion');

  function showModule(id, updateHash = true) {
    if (!modules.length || !moduleIds.includes(id)) return;
    modules.forEach(section => {
      const selected = section.id === id;
      section.classList.toggle('is-module-hidden', !selected);
      section.setAttribute('aria-hidden', String(!selected));
    });
    if (nav) {
      nav.querySelectorAll('a[href^="#"]').forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    }
    if (updateHash) history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  if (modules.length) {
    const initial = moduleIds.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard';
    showModule(initial, false);
    nav?.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const id = link.getAttribute('href').slice(1);
        if (!moduleIds.includes(id)) return;
        event.preventDefault();
        showModule(id);
      });
    });
    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (moduleIds.includes(id)) showModule(id, false);
    });
  }
})();
