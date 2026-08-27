(() => {
  const dialog = document.querySelector('[data-request-dialog]');
  const form = document.querySelector('[data-request-form]');
  const fozNotice = document.querySelector('[data-foz-notice]');
  const phone = document.body.dataset.whatsappPhone || '33768345608';

  if (!dialog || !form) return;

  const categoryField = form.elements.category;

  function updateFozNotice() {
    if (!fozNotice) return;
    fozNotice.hidden = categoryField.value !== 'Compra ou retirada em Foz';
  }

  function openRequest(category = '') {
    if (category) categoryField.value = category;
    updateFozNotice();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeRequest() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  document.querySelectorAll('[data-open-request]').forEach((button) => {
    button.addEventListener('click', () => openRequest(button.dataset.requestCategory || ''));
  });

  document.querySelectorAll('[data-close-request]').forEach((button) => {
    button.addEventListener('click', closeRequest);
  });

  categoryField.addEventListener('change', updateFozNotice);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeRequest();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const category = String(data.get('category') || '').trim();
    const need = String(data.get('need') || '').trim();
    const origin = String(data.get('origin') || '').trim();
    const destination = String(data.get('destination') || '').trim();
    const when = String(data.get('when') || '').trim();
    const budget = String(data.get('budget') || '').trim();
    const details = String(data.get('details') || '').trim();

    const lines = [
      'Olá! Quero publicar um pedido gratuito no Nykuto Local.',
      '',
      `Categoria: ${category}`,
      `Preciso de: ${need}`,
      `Local / origem: ${origin}`,
      destination ? `Destino: ${destination}` : '',
      `Quando: ${when}`,
      budget ? `Orçamento: ${budget}` : '',
      details ? `Detalhes: ${details}` : '',
      '',
      'Pode revisar meu pedido e me orientar para a publicação?'
    ].filter(Boolean);

    if (category === 'Compra ou retirada em Foz') {
      lines.push('Confirmo que se trata de produto permitido e que respeitarei as regras fiscais e aduaneiras aplicáveis.');
    }

    closeRequest();
    const message = lines.join('\n');
    if (window.NykutoWhatsApp?.open) window.NykutoWhatsApp.open(phone, message);
    else window.location.href = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('acao') === 'preciso') {
    window.setTimeout(() => openRequest(params.get('categoria') || ''), 0);
  }
})();
