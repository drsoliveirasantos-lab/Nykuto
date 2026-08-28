(() => {
  const form = document.querySelector('[data-profile-form]');
  const status = document.querySelector('[data-profile-status]');
  const announceLink = document.querySelector('[data-profile-announce]');
  if (!form || !status) return;

  const storageKey = 'nykuto-local-profile-v1';

  function normalizedWhatsapp(value) {
    const digits = String(value || '').replace(/\D/g, '');
    const repeatedDigit = /^(\d)\1+$/.test(digits);
    return /^[1-9]\d{7,14}$/.test(digits) && !repeatedDigit ? `+${digits}` : '';
  }

  function setStatus(message, success = false) {
    status.textContent = message;
    status.classList.toggle('is-success', success);
  }

  function loadProfile() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) || 'null');
      if (!saved || typeof saved !== 'object') return;
      ['firstName', 'lastName', 'email', 'whatsapp'].forEach((name) => {
        if (typeof saved[name] === 'string') form.elements[name].value = saved[name];
      });
      form.elements.publicContact.checked = saved.publicContact === true;
      setStatus('Perfil encontrado neste aparelho. Você pode atualizar os dados abaixo.', true);
    } catch (_error) {
      setStatus('O navegador bloqueou o acesso ao perfil local. Você ainda pode preencher o anúncio normalmente.');
    }
  }

  function saveProfile() {
    if (!form.reportValidity()) return false;
    const firstName = String(form.elements.firstName.value || '').trim();
    const lastName = String(form.elements.lastName.value || '').trim();
    const email = String(form.elements.email.value || '').trim();
    const whatsapp = normalizedWhatsapp(form.elements.whatsapp.value);
    if (firstName.length < 2 || lastName.length < 2) {
      setStatus('Informe seu nome e sobrenome.');
      return false;
    }
    if (!whatsapp) {
      setStatus('Informe o WhatsApp com código do país e entre 8 e 15 dígitos.');
      form.elements.whatsapp.focus();
      return false;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ firstName, lastName, email, whatsapp, publicContact: true }));
      form.elements.whatsapp.value = whatsapp;
      setStatus('Perfil salvo neste aparelho. O próximo anúncio será preenchido automaticamente.', true);
      return true;
    } catch (_error) {
      setStatus('Não foi possível salvar neste navegador. Você ainda pode preencher o anúncio normalmente.');
      return false;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    saveProfile();
  });

  announceLink?.addEventListener('click', (event) => {
    event.preventDefault();
    if (saveProfile()) window.location.href = announceLink.href;
  });

  loadProfile();
})();
