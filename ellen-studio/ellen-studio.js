(() => {
  'use strict';
  // Shared navigation and image viewer. Temporary enquiries use ellen-cart.mjs.
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

  // Links remain ordinary image links without native modal support or JavaScript.
  const previews = [...document.querySelectorAll('.technique-preview')];
  if (previews.length) {
    const viewer = document.createElement('dialog');
    if (typeof viewer.showModal === 'function') {
      viewer.className = 'image-view';
      viewer.setAttribute('aria-labelledby', 'image-view-title');
      viewer.setAttribute('aria-describedby', 'image-view-description image-view-note');
      viewer.innerHTML = `
        <button class="image-view-close" type="button" autofocus>Fechar ×</button>
        <img class="image-view-photo" alt="">
        <h2 id="image-view-title"></h2>
        <p id="image-view-description" class="image-view-description"></p>
        <p id="image-view-note" class="image-view-note">Imagem ilustrativa gerada por IA. Não representa um trabalho realizado pelo Studio.</p>`;
      body.append(viewer);
      let opener;
      const photo = viewer.querySelector('.image-view-photo');
      const title = viewer.querySelector('#image-view-title');
      const description = viewer.querySelector('#image-view-description');
      previews.forEach((link) => {
        link.setAttribute('aria-haspopup', 'dialog');
        link.addEventListener('click', (event) => {
          if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          const card = link.closest('.technique-card');
          const thumbnail = link.querySelector('img');
          photo.src = link.href;
          photo.alt = thumbnail.alt;
          title.textContent = card.querySelector('h3').textContent;
          description.textContent = card.querySelector('p').textContent;
          opener = link;
          viewer.showModal();
          body.classList.add('image-view-open');
          event.preventDefault();
        });
      });
      viewer.querySelector('.image-view-close').addEventListener('click', () => viewer.close());
      viewer.addEventListener('click', (event) => {
        if (event.target !== viewer) return;
        const bounds = viewer.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) viewer.close();
      });
      // Native dialog handles Escape and contains focus while open.
      viewer.addEventListener('close', () => {
        body.classList.remove('image-view-open');
        opener?.focus({ preventScroll: true });
      });
    }
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
