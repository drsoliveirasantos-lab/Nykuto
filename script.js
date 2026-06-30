const animationStylesheet = 'animations.css';

if (!document.querySelector(`link[href="${animationStylesheet}"]`)) {
  const animationLink = document.createElement('link');
  animationLink.rel = 'stylesheet';
  animationLink.href = animationStylesheet;
  document.head.appendChild(animationLink);
}

const checkboxes = document.querySelectorAll('[data-price]');
const estimate = document.getElementById('estimate');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const revealItems = document.querySelectorAll('.reveal');

function updateEstimate() {
  let base = 390;
  let total = 390;

  checkboxes.forEach((box) => {
    if (!box.checked) return;
    const baseValue = Number(box.dataset.base || 0);
    const price = Number(box.dataset.price || 0);

    if (baseValue > base) {
      total = total - base + baseValue;
      base = baseValue;
    } else {
      total += price;
    }
  });

  if (estimate) estimate.textContent = `à partir de ${total} €`;
}

checkboxes.forEach((box) => box.addEventListener('change', updateEstimate));

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });
}

document.querySelectorAll('a[href]').forEach((link) => {
  link.addEventListener('click', () => {
    if (mainNav && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      document.body.classList.remove('menu-open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

if ('IntersectionObserver' in window && revealItems.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
