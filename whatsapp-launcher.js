(() => {
  const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

  function open(phone, message) {
    const normalizedPhone = normalizePhone(phone);
    const encodedMessage = encodeURIComponent(String(message || ''));
    const appUrl = `whatsapp://send?phone=${normalizedPhone}&text=${encodedMessage}`;
    window.location.href = appUrl;
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-whatsapp-direct]');
    if (!link) return;
    event.preventDefault();
    open(link.dataset.whatsappPhone, link.dataset.whatsappMessage);
  });

  window.NykutoWhatsApp = { open };
})();
