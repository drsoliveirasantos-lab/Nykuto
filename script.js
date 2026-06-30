const checkboxes = document.querySelectorAll('[data-price]');
const estimate = document.getElementById('estimate');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

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
  });
}

document.querySelectorAll('a[href]').forEach((link) => {
  link.addEventListener('click', () => {
    if (mainNav && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});
