(() => {
  const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');

  function open(phone, message) {
    const normalizedPhone = normalizePhone(phone);
    const encodedMessage = encodeURIComponent(String(message || ''));
    const appUrl = `whatsapp://send?phone=${normalizedPhone}&text=${encodedMessage}`;
    const webUrl = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
    let appOpened = false;

    const stopFallback = () => {
      if (document.visibilityState === 'hidden') appOpened = true;
    };

    document.addEventListener('visibilitychange', stopFallback, { once: true });
    window.addEventListener('pagehide', () => { appOpened = true; }, { once: true });
    window.location.href = appUrl;

    window.setTimeout(() => {
      if (!appOpened && document.visibilityState === 'visible') window.location.href = webUrl;
    }, 1400);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-whatsapp-direct]');
    if (!link) return;
    event.preventDefault();
    open(link.dataset.whatsappPhone, link.dataset.whatsappMessage);
  });

  window.NykutoWhatsApp = { open };
})();
