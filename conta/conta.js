(() => {
  const form = document.querySelector('[data-profile-form]');
  const status = document.querySelector('[data-profile-status]');
  const badge = document.querySelector('[data-profile-badge]');
  const saveButton = document.querySelector('[data-profile-save]');
  const announceLink = document.querySelector('[data-profile-announce]');
  const logoutButton = document.querySelector('[data-profile-logout]');
  const listingsSection = document.querySelector('[data-my-listings]');
  const listingsGrid = document.querySelector('[data-my-listings-grid]');
  const danger = document.querySelector('[data-profile-danger]');
  const deleteProfileButton = document.querySelector('[data-delete-profile]');
  const turnstileContainer = document.querySelector('[data-profile-turnstile]');
  const turnstileStatus = document.querySelector('[data-profile-turnstile-status]');
  if (!form || !status) return;

  const legacyStorageKey = 'nykuto-local-profile-v1';
  let authenticated = false;
  let csrfToken = '';
  let turnstileSiteKey = '';
  let turnstileToken = '';
  let turnstileWidgetId = null;

  function normalizedWhatsapp(value) {
    const digits = String(value || '').replace(/\D/g, '').replace(/^00/, '');
    const repeatedDigit = /^(\d)\1+$/.test(digits);
    return /^[1-9]\d{7,14}$/.test(digits) && !repeatedDigit ? `+${digits}` : '';
  }

  function setStatus(message, success = false) {
    status.textContent = message;
    status.classList.toggle('is-success', success);
  }

  function loadLegacyProfile() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(legacyStorageKey) || 'null');
      if (!saved || typeof saved !== 'object') return;
      ['firstName', 'lastName', 'email', 'whatsapp'].forEach((name) => {
        if (typeof saved[name] === 'string') form.elements[name].value = saved[name];
      });
      form.elements.publicContact.checked = saved.publicContact === true;
    } catch (_) {
      // The online profile remains available when legacy storage is blocked.
    }
  }

  function clearLegacyProfile() {
    try { window.localStorage.removeItem(legacyStorageKey); } catch (_) { /* Optional cleanup. */ }
  }

  function loadTurnstileScript() {
    if (window.turnstile) return Promise.resolve();
    if (loadTurnstileScript.promise) return loadTurnstileScript.promise;
    loadTurnstileScript.promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.append(script);
    });
    return loadTurnstileScript.promise;
  }

  async function ensureTurnstile() {
    if (authenticated || !turnstileSiteKey || turnstileWidgetId !== null || !turnstileContainer) return;
    try {
      await loadTurnstileScript();
      turnstileStatus?.remove();
      turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token) => { turnstileToken = token; },
        'expired-callback': () => { turnstileToken = ''; },
        'error-callback': () => { turnstileToken = ''; }
      });
    } catch (_) {
      if (turnstileStatus) turnstileStatus.textContent = 'Não foi possível carregar a verificação de segurança.';
    }
  }

  function resetTurnstile() {
    turnstileToken = '';
    if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  }

  async function loadConfig() {
    try {
      const response = await fetch('/api/local/config', { headers: { Accept: 'application/json' } });
      const payload = await response.json();
      if (!response.ok || !payload.ready) throw new Error('UNAVAILABLE');
      turnstileSiteKey = payload.turnstileSiteKey || '';
      ensureTurnstile();
    } catch (_) {
      if (turnstileStatus) turnstileStatus.textContent = 'O cadastro está temporariamente indisponível.';
    }
  }

  function profilePayload() {
    return {
      firstName: String(form.elements.firstName.value || '').trim(),
      lastName: String(form.elements.lastName.value || '').trim(),
      email: String(form.elements.email.value || '').trim(),
      whatsapp: normalizedWhatsapp(form.elements.whatsapp.value),
      contactConsent: form.elements.publicContact.checked,
      turnstileToken
    };
  }

  function fillProfile(profile) {
    form.elements.firstName.value = profile.firstName || '';
    form.elements.lastName.value = profile.lastName || '';
    form.elements.email.value = profile.email || '';
    form.elements.whatsapp.value = profile.whatsapp || '';
    form.elements.publicContact.checked = true;
  }

  function priceLabel(listing) {
    if (listing.priceMode === 'free') return 'Grátis';
    if (listing.priceMode === 'quote') return 'Sob consulta';
    const symbols = { BRL: 'R$', PYG: 'Gs.', USD: 'US$' };
    const formatted = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(listing.priceAmount || 0);
    return `${symbols[listing.currency] || listing.currency} ${formatted}${listing.priceMode === 'negotiable' ? ' · negociável' : ''}`;
  }

  function statusLabel(value) {
    return ({ published: 'Publicado', paused: 'Pausado', sold: 'Concluído', hidden: 'Oculto', expired: 'Expirado' })[value] || value;
  }

  function actionButton(label, action, listingId, className = '') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.dataset.listingAction = action;
    button.dataset.listingId = listingId;
    if (className) button.className = className;
    return button;
  }

  function listingCard(listing) {
    const article = document.createElement('article');
    const media = document.createElement('div');
    const body = document.createElement('div');
    const actions = document.createElement('div');
    article.className = 'nykuto-profile-listing';
    media.className = 'nykuto-profile-listing-media';
    body.className = 'nykuto-profile-listing-body';
    actions.className = 'nykuto-profile-listing-actions';
    if (listing.media?.[0]?.url) {
      const image = document.createElement('img');
      image.src = listing.media[0].url;
      image.alt = '';
      image.loading = 'lazy';
      media.append(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.textContent = listing.category.slice(0, 1);
      media.append(placeholder);
    }
    const meta = document.createElement('small');
    const title = document.createElement('h3');
    const price = document.createElement('strong');
    meta.textContent = `${statusLabel(listing.status)} · ${listing.subcategory}`;
    title.textContent = listing.title;
    price.textContent = priceLabel(listing);
    body.append(meta, title, price);
    const view = document.createElement('a');
    view.href = `/anuncio/?id=${encodeURIComponent(listing.id)}`;
    view.textContent = 'Ver';
    actions.append(view);
    if (listing.status === 'published') actions.append(actionButton('Pausar', 'paused', listing.id));
    if (['paused', 'sold', 'expired'].includes(listing.status)) actions.append(actionButton('Publicar', 'published', listing.id));
    if (['published', 'paused'].includes(listing.status)) actions.append(actionButton('Concluído', 'sold', listing.id));
    actions.append(actionButton('Excluir', 'delete', listing.id, 'is-danger'));
    body.append(actions);
    article.append(media, body);
    return article;
  }

  function renderListings(listings) {
    listingsGrid.replaceChildren();
    listingsSection.hidden = false;
    if (!listings.length) {
      const empty = document.createElement('div');
      empty.className = 'nykuto-profile-listings-empty';
      empty.innerHTML = '<strong>Nenhum anúncio ainda.</strong><span>Seu primeiro anúncio aparecerá aqui para você administrar.</span><a href="/anunciar/">Publicar agora</a>';
      listingsGrid.append(empty);
      return;
    }
    listingsGrid.append(...listings.map(listingCard));
  }

  function applyAuthenticatedState(payload) {
    authenticated = true;
    csrfToken = payload.csrfToken || csrfToken;
    fillProfile(payload.profile);
    badge.textContent = 'Perfil ativo';
    turnstileContainer.hidden = true;
    logoutButton.hidden = false;
    danger.hidden = false;
    renderListings(payload.listings || []);
    setStatus('Perfil ativo. Seus próximos anúncios usarão estes dados.', true);
    clearLegacyProfile();
  }

  async function refreshProfile() {
    try {
      const response = await fetch('/api/local/profile', { headers: { Accept: 'application/json' } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Não foi possível abrir o perfil.');
      if (payload.authenticated) {
        applyAuthenticatedState(payload);
      } else {
        authenticated = false;
        badge.textContent = 'Novo perfil';
        logoutButton.hidden = true;
        danger.hidden = true;
        listingsSection.hidden = true;
        setStatus('Preencha uma vez para criar seu perfil sem senha.');
        ensureTurnstile();
      }
    } catch (error) {
      badge.textContent = 'Indisponível';
      setStatus(error.message);
    }
  }

  function validateProfile() {
    if (!form.reportValidity()) return false;
    const profile = profilePayload();
    if (profile.firstName.length < 2 || profile.lastName.length < 2) return setStatus('Informe seu nome e sobrenome.'), false;
    if (!profile.whatsapp) return setStatus('Informe o WhatsApp com código do país e entre 8 e 15 dígitos.'), false;
    if (!authenticated && !turnstileToken) return setStatus('Conclua a verificação de segurança.'), false;
    return true;
  }

  async function saveProfile() {
    if (!validateProfile()) return false;
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando…';
    const method = authenticated ? 'PATCH' : 'POST';
    const headers = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (authenticated) headers['X-CSRF-Token'] = csrfToken;
    try {
      const response = await fetch('/api/local/profile', { method, headers, body: JSON.stringify(profilePayload()) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Não foi possível salvar o perfil.');
      if (authenticated) {
        fillProfile(payload.profile);
        setStatus('Perfil atualizado.', true);
      } else {
        applyAuthenticatedState({ ...payload, listings: [] });
      }
      return true;
    } catch (error) {
      setStatus(error.message);
      resetTurnstile();
      return false;
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Salvar perfil';
    }
  }

  async function updateListing(listingId, action) {
    if (action === 'delete' && !window.confirm('Excluir definitivamente este anúncio e suas fotos?')) return;
    const method = action === 'delete' ? 'DELETE' : 'PATCH';
    const options = { method, headers: { Accept: 'application/json', 'X-CSRF-Token': csrfToken } };
    if (method === 'PATCH') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({ status: action });
    }
    try {
      const response = await fetch(`/api/local/listings/${encodeURIComponent(listingId)}`, options);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Não foi possível atualizar o anúncio.');
      await refreshProfile();
    } catch (error) {
      setStatus(error.message);
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await saveProfile();
  });

  announceLink?.addEventListener('click', async (event) => {
    if (authenticated) return;
    event.preventDefault();
    if (await saveProfile()) window.location.href = announceLink.href;
  });

  listingsGrid?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-listing-action]');
    if (button) updateListing(button.dataset.listingId, button.dataset.listingAction);
  });

  logoutButton?.addEventListener('click', async () => {
    await fetch('/api/local/logout', { method: 'POST', headers: { Accept: 'application/json' } });
    window.location.reload();
  });

  deleteProfileButton?.addEventListener('click', async () => {
    if (!window.confirm('Excluir definitivamente seu perfil, anúncios e fotos? Esta ação não pode ser desfeita.')) return;
    try {
      const response = await fetch('/api/local/profile', { method: 'DELETE', headers: { Accept: 'application/json', 'X-CSRF-Token': csrfToken } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || 'Não foi possível excluir o perfil.');
      window.location.href = '/';
    } catch (error) {
      setStatus(error.message);
    }
  });

  loadLegacyProfile();
  Promise.all([loadConfig(), refreshProfile()]);
})();
