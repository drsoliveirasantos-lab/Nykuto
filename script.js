const checkboxes = document.querySelectorAll('[data-price]');
const estimate = document.getElementById('estimate');

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
