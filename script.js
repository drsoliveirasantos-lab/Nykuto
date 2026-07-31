const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const revealItems = document.querySelectorAll('.reveal');
const checkboxes = document.querySelectorAll('[data-price]');
const estimate = document.getElementById('estimate');

function closeMenu() {
  if (!mainNav || !menuToggle) return;
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const dialogTriggers = document.querySelectorAll('[data-dialog-open]');
const capabilityDialogs = document.querySelectorAll('.capability-dialog');

function syncDialogState() {
  const hasOpenDialog = Array.from(capabilityDialogs).some((dialog) => dialog.open);
  document.body.classList.toggle('dialog-open', hasOpenDialog);
}

dialogTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const target = trigger.getAttribute('data-dialog-open');
    const dialog = document.getElementById(`dialog-${target}`);
    if (!(dialog instanceof HTMLDialogElement)) return;

    dialog.returnFocusTarget = trigger;
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    syncDialogState();
  });
});

capabilityDialogs.forEach((dialog) => {
  dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    syncDialogState();
    if (dialog.returnFocusTarget instanceof HTMLElement) dialog.returnFocusTarget.focus();
  });
});

const projectTabs = Array.from(document.querySelectorAll('[data-project-tab]'));
const projectPanels = Array.from(document.querySelectorAll('[data-project-panel]'));

function activateProjectTab(tab, moveFocus = false) {
  const target = tab.dataset.projectTab;

  projectTabs.forEach((item) => {
    const isActive = item === tab;
    item.setAttribute('aria-selected', String(isActive));
    item.tabIndex = isActive ? 0 : -1;
  });

  projectPanels.forEach((panel) => {
    const isActive = panel.dataset.projectPanel === target;
    panel.hidden = !isActive;
    panel.classList.toggle('is-active', isActive);
  });

  if (moveFocus) tab.focus();
}

projectTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateProjectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % projectTabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + projectTabs.length) % projectTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = projectTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    activateProjectTab(projectTabs[nextIndex], true);
  });
});

function updateEstimate() {
  let base = 390;
  let total = base;

  checkboxes.forEach((box) => {
    if (!box.checked) return;
    const newBase = Number(box.dataset.base || 0);
    const price = Number(box.dataset.price || 0);
    if (newBase > base) {
      total = total - base + newBase;
      base = newBase;
    } else {
      total += price;
    }
  });

  if (estimate) estimate.textContent = `à partir de ${total.toLocaleString('fr-FR')} €`;
}

checkboxes.forEach((box) => box.addEventListener('change', updateEstimate));

if ('IntersectionObserver' in window && revealItems.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const contactForm = document.querySelector('[data-contact-form]');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(contactForm);
    const fields = {
      name: String(form.get('name') || '').trim(),
      company: String(form.get('company') || '').trim(),
      email: String(form.get('email') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      country: String(form.get('country') || '').trim(),
      need: String(form.get('need') || '').trim(),
      budget: String(form.get('budget') || '').trim(),
      deadline: String(form.get('deadline') || '').trim(),
      message: String(form.get('message') || '').trim()
    };

    const subject = encodeURIComponent(`Projet Nykuto — ${fields.company || fields.name}`);
    const body = encodeURIComponent([
      `Nom : ${fields.name}`,
      `Entreprise : ${fields.company || 'Non précisée'}`,
      `Email : ${fields.email}`,
      `Téléphone / WhatsApp : ${fields.phone || 'Non précisé'}`,
      `Pays : ${fields.country || 'Non précisé'}`,
      `Besoin : ${fields.need || 'Non précisé'}`,
      `Budget indicatif : ${fields.budget || 'Non précisé'}`,
      `Échéance : ${fields.deadline || 'Non précisée'}`,
      '',
      'Message :',
      fields.message
    ].join('\n'));

    const status = contactForm.querySelector('.form-status');
    if (status) status.textContent = 'Votre messagerie va s’ouvrir avec le récapitulatif. Vérifiez-le avant l’envoi.';
    window.location.href = `mailto:contact@nykuto.com?subject=${subject}&body=${body}`;
  });
}
