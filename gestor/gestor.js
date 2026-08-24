(() => {
  const page = document.body.dataset.managerPage;
  const coverChoices = [
    '/assets/demo-imobiliaria/local-premium-08.webp',
    '/assets/demo-imobiliaria/local-premium-09.webp',
    '/assets/demo-imobiliaria/local-studio-01.webp',
    '/assets/demo-imobiliaria/local-studio-06.webp',
    '/assets/demo-imobiliaria/local-tour-apartamento-a-poster.webp'
  ];
  const state = { session: null, csrfToken: '', listings: [], filter: 'all' };
  let toastTimer;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function formatMoney(amount, currency) {
    if (currency === 'USD') return `US$ ${Number(amount).toLocaleString('pt-BR')}`;
    if (currency === 'BRL') return `R$ ${Number(amount).toLocaleString('pt-BR')}`;
    return `Gs. ${Number(amount).toLocaleString('pt-BR')}`;
  }

  function formatDate(timestamp, includeTime = false) {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Asuncion',
      day: '2-digit', month: '2-digit', year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {})
    }).format(new Date(Number(timestamp) * 1000));
  }

  function remainingDays(expiresAt) {
    return Math.max(0, Math.ceil((Number(expiresAt) * 1000 - Date.now()) / 86400000));
  }

  function ageInDays(timestamp) {
    if (!timestamp) return Infinity;
    return Math.max(0, Math.floor((Date.now() - Number(timestamp) * 1000) / 86400000));
  }

  function verificationLabel(timestamp) {
    const days = ageInDays(timestamp);
    if (!Number.isFinite(days)) return 'Ainda não verificado';
    if (days === 0) return 'Verificado hoje';
    if (days === 1) return 'Verificado ontem';
    return `Verificado há ${days} dias`;
  }

  function showToast(text, type = 'success') {
    const toast = document.querySelector('[data-manager-toast]');
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = text;
    toast.dataset.type = type;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  }

  async function api(path, options = {}) {
    const method = options.method || 'GET';
    const headers = { Accept: 'application/json', ...(options.headers || {}) };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (method !== 'GET' && state.csrfToken) headers['X-CSRF-Token'] = state.csrfToken;
    const response = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) {
      window.location.replace('/gestor/login/?estado=login');
      throw new Error('AUTH_REQUIRED');
    }
    if (response.status === 403 && payload.code === 'PASS_EXPIRED') {
      window.location.replace('/gestor/login/?estado=expirado');
      throw new Error('PASS_EXPIRED');
    }
    if (!response.ok) {
      const error = new Error(payload.message || 'Não foi possível concluir esta ação.');
      error.code = payload.code;
      throw error;
    }
    return payload;
  }

  async function loadSession() {
    const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      window.location.replace(`/gestor/login/?estado=${payload.code === 'PASS_EXPIRED' ? 'expirado' : 'login'}`);
      throw new Error(payload.code || 'AUTH_REQUIRED');
    }
    state.session = payload;
    state.csrfToken = payload.csrfToken;
    if (page !== 'account' && !payload.user.whatsappE164) {
      window.location.replace('/gestor/conta/?perfil=obrigatorio');
      throw new Error('PROFILE_REQUIRED');
    }
    document.querySelectorAll('[data-manager-name]').forEach((element) => { element.textContent = payload.user.displayName.split(' ')[0]; });
    const days = remainingDays(payload.pass.expiresAt);
    document.querySelectorAll('[data-pass-summary]').forEach((element) => {
      const lastLogin = payload.user.lastLoginAt ? ` · último acesso ${formatDate(payload.user.lastLoginAt, true)}` : '';
      element.textContent = `Válido até ${formatDate(payload.pass.expiresAt)} · ${days} ${days === 1 ? 'dia restante' : 'dias restantes'}${lastLogin}`;
    });
  }

  function statsMarkup(listings) {
    const totals = {
      published: listings.filter((item) => item.publicationStatus === 'published').length,
      reserved: listings.filter((item) => item.publicationStatus === 'reserved').length,
      draft: listings.filter((item) => item.publicationStatus === 'draft').length,
      review: listings.filter((item) => ['published', 'reserved'].includes(item.publicationStatus) && ageInDays(item.verifiedAt) >= 14).length
    };
    return [
      ['Publicados', totals.published, 'visíveis no site', 'is-green'],
      ['A revisar', totals.review, '14 dias sem confirmar', 'is-gold'],
      ['Rascunhos', totals.draft, 'aguardando publicação', 'is-gray']
    ].map(([label, value, detail, className]) => `<article class="${className}"><span>${label}</span><strong>${value}</strong><small>${detail}</small></article>`).join('');
  }

  function statusOptions(active) {
    return [
      ['draft', 'Rascunho'], ['published', 'Disponível'], ['reserved', 'Reservado'], ['rented', 'Alugado'], ['archived', 'Arquivado']
    ].map(([value, label]) => `<option value="${value}"${value === active ? ' selected' : ''}>${label}</option>`).join('');
  }

  function listingMarkup(listing, compact = false) {
    return `<article class="manager-property${compact ? ' is-compact' : ''}" data-listing-id="${listing.id}">
      <img src="${escapeHtml(listing.coverUrl)}" alt="" width="120" height="92" loading="lazy" />
      <div class="manager-property-copy"><span>${escapeHtml(listing.reference)}</span><strong>${escapeHtml(listing.title)}</strong><small>${escapeHtml(listing.zoneLabel)} · ${escapeHtml(formatMoney(listing.priceAmount, listing.currency))}</small><small class="manager-verification${ageInDays(listing.verifiedAt) >= 14 ? ' needs-review' : ''}">${escapeHtml(verificationLabel(listing.verifiedAt))}</small></div>
      <label class="manager-status-select"><span class="sr-only">Status de ${escapeHtml(listing.reference)}</span><select data-status-id="${listing.id}" data-version="${listing.version}">${statusOptions(listing.publicationStatus)}</select></label>
      ${compact ? '<a href="/gestor/imoveis/" aria-label="Abrir imóveis">→</a>' : `<div class="manager-property-actions">${['published', 'reserved'].includes(listing.publicationStatus) ? `<button class="manager-verify-button" type="button" data-verify-id="${listing.id}" data-version="${listing.version}">✓ Ainda disponível</button>` : ''}<button class="manager-cover-button" type="button" data-cover-id="${listing.id}" data-version="${listing.version}" aria-label="Trocar capa de ${escapeHtml(listing.reference)}">Trocar capa</button></div>`}
    </article>`;
  }

  function renderListings() {
    const target = document.querySelector('[data-manager-list]');
    if (!target) return;
    let visible = page === 'dashboard' ? state.listings.slice(0, 3) : state.listings;
    if (page === 'listings' && state.filter !== 'all') visible = visible.filter((item) => item.publicationStatus === state.filter);
    target.innerHTML = visible.length
      ? visible.map((item) => listingMarkup(item, page === 'dashboard')).join('')
      : '<div class="manager-empty"><span>⌂</span><strong>Nenhum imóvel neste filtro</strong><p>Escolha outro status ou crie um rascunho.</p></div>';
  }

  async function loadListings() {
    const payload = await api('/api/manager/listings');
    state.listings = payload.listings;
    const stats = document.querySelector('[data-manager-stats]');
    if (stats) stats.innerHTML = statsMarkup(state.listings);
    renderListings();
  }

  async function updateListing(id, changes, version, trigger) {
    trigger?.setAttribute('disabled', '');
    try {
      const payload = await api(`/api/manager/listings/${id}`, { method: 'PATCH', body: { ...changes, version: Number(version) } });
      const index = state.listings.findIndex((item) => item.id === Number(id));
      if (index >= 0) state.listings[index] = payload.listing;
      renderListings();
      const stats = document.querySelector('[data-manager-stats]');
      if (stats) stats.innerHTML = statsMarkup(state.listings);
      showToast(changes.verifyAvailable ? 'Disponibilidade confirmada hoje.' : changes.coverUrl ? 'Nova capa salva.' : 'Status atualizado e salvo.');
    } catch (error) {
      showToast(error.message, 'error');
      if (error.code === 'VERSION_CONFLICT') await loadListings();
      else renderListings();
    } finally {
      trigger?.removeAttribute('disabled');
    }
  }

  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-status-id]');
    if (!select) return;
    updateListing(select.dataset.statusId, { publicationStatus: select.value }, select.dataset.version, select);
  });

  document.addEventListener('click', (event) => {
    const coverButton = event.target.closest('[data-cover-id]');
    if (coverButton) {
      const listing = state.listings.find((item) => item.id === Number(coverButton.dataset.coverId));
      if (!listing) return;
      const nextIndex = (coverChoices.indexOf(listing.coverUrl) + 1) % coverChoices.length;
      updateListing(listing.id, { coverUrl: coverChoices[nextIndex] }, coverButton.dataset.version, coverButton);
    }
    const verifyButton = event.target.closest('[data-verify-id]');
    if (verifyButton) updateListing(verifyButton.dataset.verifyId, { verifyAvailable: true }, verifyButton.dataset.version, verifyButton);
    const filter = event.target.closest('[data-listing-filter]');
    if (filter) {
      state.filter = filter.dataset.listingFilter;
      document.querySelectorAll('[data-listing-filter]').forEach((button) => {
        const active = button === filter;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      renderListings();
    }
  });

  function prepareNewListingForm() {
    const form = document.querySelector('[data-new-listing-form]');
    if (!form) return;
    const selectedMedia = { photos: [] };
    const photoInput = form.elements.photos;
    const previewContainer = document.querySelector('[data-media-previews]');
    const previewImage = document.querySelector('[data-new-preview-image]');
    let previewCoverUrl = '';

    const clearPreviewCover = () => {
      if (previewCoverUrl) URL.revokeObjectURL(previewCoverUrl);
      previewCoverUrl = '';
    };

    const renderMedia = () => {
      document.querySelector('[data-photo-count]').textContent = `${selectedMedia.photos.length}/5 fotos`;
      previewContainer.hidden = !selectedMedia.photos.length;
      previewContainer.innerHTML = '';
      selectedMedia.photos.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'manager-media-preview';
        const url = URL.createObjectURL(file);
        item.innerHTML = `<img alt="Prévia da foto ${index + 1}" /><button type="button" data-remove-photo="${index}" aria-label="Remover foto ${index + 1}">×</button><span>${index === 0 ? 'Capa' : `Foto ${index + 1}`}</span>`;
        const image = item.querySelector('img');
        image.src = url;
        image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        image.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          item.classList.add('is-unavailable');
          image.removeAttribute('src');
          image.alt = '';
          item.insertAdjacentHTML('afterbegin', '<strong class="manager-preview-error">Formato não visualizado</strong>');
        }, { once: true });
        previewContainer.append(item);
      });
      clearPreviewCover();
      if (selectedMedia.photos[0]) {
        previewCoverUrl = URL.createObjectURL(selectedMedia.photos[0]);
        previewImage.src = previewCoverUrl;
      } else {
        previewImage.src = form.elements.coverUrl.value;
      }
    };

    photoInput.addEventListener('change', () => {
      const files = Array.from(photoInput.files || []);
      const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
      const valid = files.filter((file) => allowedPhotoTypes.has(file.type) && file.size <= 10 * 1024 * 1024);
      if (files.length > 5 || valid.length !== files.length) showToast('Use até 5 fotos em JPEG, PNG ou WebP, com no máximo 10 MB cada.', 'error');
      selectedMedia.photos = valid.slice(0, 5);
      renderMedia();
    });
    previewContainer.addEventListener('click', (event) => {
      const photoButton = event.target.closest('[data-remove-photo]');
      if (photoButton) selectedMedia.photos.splice(Number(photoButton.dataset.removePhoto), 1);
      renderMedia();
    });

    const updatePreview = () => {
      const currency = form.elements.currency.value;
      const bedrooms = Number(form.elements.bedrooms.value || 0);
      const bathrooms = Number(form.elements.bathrooms.value || 0);
      const availabilityDate = form.elements.availabilityDate.value;
      const entryTotal = Number(form.elements.priceAmount.value || 0) + Number(form.elements.guaranteeAmount.value || 0) + Number(form.elements.agencyFeeAmount.value || 0);
      document.querySelector('[data-new-preview-title]').textContent = form.elements.title.value || 'Novo imóvel';
      document.querySelector('[data-new-preview-zone]').textContent = form.elements.zoneLabel.value || 'Zona aproximada';
      document.querySelector('[data-new-preview-price]').textContent = formatMoney(Number(form.elements.priceAmount.value || 0), currency);
      document.querySelector('[data-new-entry-total]').textContent = formatMoney(entryTotal, currency);
      document.querySelector('[data-new-preview-rooms]').textContent = `${bedrooms} ${bedrooms === 1 ? 'quarto' : 'quartos'}`;
      document.querySelector('[data-new-preview-baths]').textContent = `${bathrooms} ${bathrooms === 1 ? 'banheiro' : 'banheiros'}`;
      document.querySelector('[data-new-preview-date]').textContent = availabilityDate
        ? `Disponível em ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${availabilityDate}T00:00:00Z`))}`
        : 'Disponibilidade a consultar';
      if (!selectedMedia.photos.length) previewImage.src = form.elements.coverUrl.value;
    };
    form.addEventListener('input', updatePreview);
    form.addEventListener('change', updatePreview);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const submit = document.querySelector('[data-create-submit]');
      const formMessage = document.querySelector('[data-editor-message]');
      submit.disabled = true;
      submit.textContent = 'Salvando…';
      formMessage.hidden = true;
      try {
        await api('/api/manager/listings', {
          method: 'POST',
          body: {
            title: form.elements.title.value,
            zoneLabel: form.elements.zoneLabel.value,
            priceAmount: Number(form.elements.priceAmount.value),
            currency: form.elements.currency.value,
            coverUrl: form.elements.coverUrl.value,
            propertyType: form.elements.propertyType.value,
            bedrooms: Number(form.elements.bedrooms.value),
            bathrooms: Number(form.elements.bathrooms.value),
            floorLabel: form.elements.floorLabel.value,
            availabilityDate: form.elements.availabilityDate.value,
            locationNotes: form.elements.locationNotes.value,
            guaranteeAmount: Number(form.elements.guaranteeAmount.value),
            agencyFeeAmount: Number(form.elements.agencyFeeAmount.value),
            petsPolicy: form.elements.petsPolicy.value,
            childrenPolicy: form.elements.childrenPolicy.value,
            parkingType: form.elements.parkingType.value,
            furnished: form.elements.furnished.checked,
            waterIncluded: form.elements.waterIncluded.checked,
            electricityIncluded: form.elements.electricityIncluded.checked,
            internetIncluded: form.elements.internetIncluded.checked,
            trashIncluded: form.elements.trashIncluded.checked,
            condominiumIncluded: form.elements.condominiumIncluded.checked,
            utilityNotes: form.elements.utilityNotes.value,
            description: form.elements.description.value
          }
        });
        window.location.assign('/gestor/imoveis/?criado=1');
      } catch (error) {
        formMessage.textContent = error.message;
        formMessage.hidden = false;
        submit.disabled = false;
        submit.innerHTML = 'Salvar rascunho <span>→</span>';
      }
    });
  }

  function renderAccount() {
    if (page !== 'account') return;
    const { user, pass } = state.session;
    const days = remainingDays(pass.expiresAt);
    const duration = Math.max(1, pass.expiresAt - pass.startsAt);
    const elapsed = Math.max(0, Math.floor(Date.now() / 1000) - pass.startsAt);
    const remainingPercent = Math.max(0, Math.min(100, 100 - (elapsed / duration) * 100));
    document.querySelector('[data-account-name]').textContent = user.displayName;
    document.querySelector('[data-account-username]').textContent = user.username;
    document.querySelector('[data-pass-start]').textContent = formatDate(pass.startsAt);
    document.querySelector('[data-pass-end]').textContent = formatDate(pass.expiresAt, true);
    document.querySelector('[data-pass-days]').textContent = `${days} ${days === 1 ? 'dia' : 'dias'}`;
    const lastLogin = document.querySelector('[data-account-last-login]');
    if (lastLogin) lastLogin.textContent = user.lastLoginAt ? formatDate(user.lastLoginAt, true) : 'Primeiro acesso';
    document.querySelector('[data-pass-progress]').style.width = `${remainingPercent}%`;
  }

  function compactPhone(value) {
    return String(value || '').replace(/\D/g, '').replace(/^0+/, '');
  }

  function selectedCountryCode(form) {
    return form.elements.whatsappCountryCode.value === 'other'
      ? compactPhone(form.elements.customCountryCode.value)
      : form.elements.whatsappCountryCode.value;
  }

  function profilePhone(form) {
    const countryCode = selectedCountryCode(form);
    const nationalNumber = compactPhone(form.elements.whatsappNationalNumber.value);
    const e164 = `${countryCode}${nationalNumber}`;
    return /^[1-9]\d{7,14}$/.test(e164) ? { countryCode, nationalNumber, e164 } : null;
  }

  function openWhatsapp(phone, message) {
    if (window.NykutoWhatsApp?.open) {
      window.NykutoWhatsApp.open(phone, message);
      return;
    }
    window.location.href = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  }

  function prepareProfileForm() {
    if (page !== 'account') return;
    const form = document.querySelector('[data-manager-profile-form]');
    if (!form) return;
    const user = state.session.user;
    const status = document.querySelector('[data-profile-status]');
    const preview = document.querySelector('[data-profile-phone-preview]');
    const help = document.querySelector('[data-profile-phone-help]');
    const message = document.querySelector('[data-profile-message]');
    const customCode = document.querySelector('[data-custom-country-code]');
    const testButton = document.querySelector('[data-test-whatsapp]');
    const verificationButton = document.querySelector('[data-request-whatsapp-verification]');
    const commonCodes = [...form.elements.whatsappCountryCode.options].map((option) => option.value);

    form.elements.agencyName.value = user.agencyName || '';
    if (user.whatsappCountryCode && commonCodes.includes(user.whatsappCountryCode)) {
      form.elements.whatsappCountryCode.value = user.whatsappCountryCode;
    } else if (user.whatsappCountryCode) {
      form.elements.whatsappCountryCode.value = 'other';
      form.elements.customCountryCode.value = user.whatsappCountryCode;
    }
    form.elements.whatsappNationalNumber.value = user.whatsappNationalNumber || '';

    const renderProfileState = () => {
      const phone = profilePhone(form);
      const other = form.elements.whatsappCountryCode.value === 'other';
      const savedPhone = Boolean(phone && phone.e164 === user.whatsappE164);
      customCode.hidden = !other;
      form.elements.customCountryCode.required = other;
      preview.textContent = phone ? `+${phone.e164}` : '+—';
      testButton.disabled = !phone;
      verificationButton.disabled = !savedPhone || Boolean(user.whatsappVerifiedAt);
      if (phone && !savedPhone) {
        status.textContent = 'Alterações não salvas';
        status.className = 'manager-profile-status is-missing';
        help.textContent = 'Salve o novo número. A confirmação anterior será removida por segurança.';
      } else if (user.whatsappVerifiedAt) {
        status.textContent = `Verificado em ${formatDate(user.whatsappVerifiedAt)}`;
        status.className = 'manager-profile-status is-verified';
        help.textContent = 'As consultas dos seus imóveis são enviadas para este número.';
      } else if (user.whatsappE164) {
        status.textContent = user.whatsappVerificationRequestedAt ? 'Confirmação solicitada' : 'Aguardando confirmação';
        status.className = 'manager-profile-status';
        help.textContent = 'Teste o destino e solicite a confirmação gratuita para poder publicar.';
      } else {
        status.textContent = 'Perfil incompleto';
        status.className = 'manager-profile-status is-missing';
        help.textContent = 'Salve um WhatsApp válido para vincular suas futuras ofertas.';
      }
    };

    const showProfileMessage = (text, type = 'success') => {
      message.textContent = text;
      message.dataset.type = type;
      message.hidden = false;
    };

    form.addEventListener('input', renderProfileState);
    form.addEventListener('change', renderProfileState);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const phone = profilePhone(form);
      if (!phone) return showProfileMessage('Confira o indicativo e o número informado.', 'error');
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      try {
        const payload = await api('/api/manager/profile', {
          method: 'PATCH',
          body: {
            agencyName: form.elements.agencyName.value,
            whatsappCountryCode: phone.countryCode,
            whatsappNationalNumber: phone.nationalNumber
          }
        });
        Object.assign(user, payload.profile);
        form.elements.whatsappNationalNumber.value = payload.profile.whatsappNationalNumber;
        showProfileMessage(payload.profile.whatsappVerifiedAt ? 'Perfil salvo. O WhatsApp continua verificado.' : 'Perfil salvo. Agora teste o número e solicite a confirmação.');
        renderProfileState();
      } catch (error) {
        showProfileMessage(error.message, 'error');
      } finally { submit.disabled = false; }
    });

    testButton.addEventListener('click', () => {
      const phone = profilePhone(form);
      if (!phone) return showProfileMessage('Salve ou corrija o número antes do teste.', 'error');
      openWhatsapp(phone.e164, 'Teste de contato do perfil Nykuto. Se esta conversa abriu no número correto, o link está funcionando.');
    });

    verificationButton.addEventListener('click', async () => {
      verificationButton.disabled = true;
      try {
        const payload = await api('/api/manager/profile/verification', { method: 'POST', body: {} });
        if (payload.alreadyVerified) {
          user.whatsappVerifiedAt = payload.verifiedAt;
          showProfileMessage('Este número já está verificado.');
          renderProfileState();
          return;
        }
        user.whatsappVerificationRequestedAt = payload.requestedAt;
        showProfileMessage('WhatsApp aberto. Envie a mensagem pronta para solicitar a confirmação.');
        renderProfileState();
        openWhatsapp(payload.supportPhone, payload.message);
      } catch (error) {
        showProfileMessage(error.message, 'error');
        verificationButton.disabled = false;
      }
    });

    if (new URLSearchParams(window.location.search).get('perfil') === 'obrigatorio') {
      showProfileMessage('Complete seu WhatsApp profissional antes de continuar. Você poderá criar rascunhos após salvar o perfil.');
    }
    renderProfileState();
  }

  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST' }); } catch (_) { /* The cookie is cleared by the login redirect too. */ }
    window.location.replace('/gestor/login/');
  }
  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', logout));

  async function start() {
    try {
      await loadSession();
      renderAccount();
      prepareProfileForm();
      prepareNewListingForm();
      if (page === 'dashboard' || page === 'listings') await loadListings();
      if (new URLSearchParams(window.location.search).get('criado') === '1') showToast('Rascunho criado e salvo.');
    } catch (error) {
      if (!['AUTH_REQUIRED', 'PASS_EXPIRED'].includes(error.message)) showToast('Não foi possível carregar a gestão.', 'error');
    }
  }
  start();
})();
