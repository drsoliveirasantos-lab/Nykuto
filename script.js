const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const revealItems = document.querySelectorAll('.reveal');
const checkboxes = document.querySelectorAll('[data-price]');
const estimate = document.getElementById('estimate');
const translate = (source) => window.NykutoI18n?.t(source) || source;

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

function updateEstimate() {
  let base = 1490;
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

  if (estimate) {
    estimate.textContent = window.NykutoI18n?.formatStartingAt(total)
      || `à partir de ${total.toLocaleString('fr-FR')} €`;
  }
}

checkboxes.forEach((box) => box.addEventListener('change', updateEstimate));
if (estimate) updateEstimate();
window.addEventListener('nykuto:languagechange', updateEstimate);

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

    const subject = encodeURIComponent(`${translate('Projet Nykuto')} — ${fields.company || fields.name}`);
    const body = encodeURIComponent([
      `${translate('Nom :')} ${fields.name}`,
      `${translate('Entreprise :')} ${fields.company || translate('Non précisée')}`,
      `${translate('Email :')} ${fields.email}`,
      `${translate('Téléphone / WhatsApp :')} ${fields.phone || translate('Non précisé')}`,
      `${translate('Pays :')} ${fields.country || translate('Non précisé')}`,
      `${translate('Besoin :')} ${fields.need ? translate(fields.need) : translate('Non précisé')}`,
      `${translate('Budget indicatif :')} ${fields.budget ? translate(fields.budget) : translate('Non précisé')}`,
      `${translate('Échéance :')} ${fields.deadline || translate('Non précisée')}`,
      '',
      translate('Message :'),
      fields.message
    ].join('\n'));

    const status = contactForm.querySelector('.form-status');
    if (status) status.textContent = translate('Votre messagerie va s’ouvrir avec le récapitulatif. Vérifiez-le avant l’envoi.');
    window.location.href = `mailto:contact@nykuto.com?subject=${subject}&body=${body}`;
  });
}
