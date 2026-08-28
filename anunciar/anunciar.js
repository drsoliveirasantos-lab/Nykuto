(() => {
  const form = document.querySelector('[data-listing-form]');
  if (!form) return;

  const steps = [...form.querySelectorAll('[data-wizard-step]')];
  const progressItems = [...document.querySelectorAll('[data-wizard-progress]')];
  const backButton = form.querySelector('[data-wizard-back]');
  const nextButton = form.querySelector('[data-wizard-next]');
  const submitButton = form.querySelector('[data-wizard-submit]');
  const errorBox = form.querySelector('[data-wizard-error]');
  const subcategoryGrid = form.querySelector('[data-subcategory-grid]');
  const photoInput = form.elements.photos;
  const photoPreview = form.querySelector('[data-photo-preview]');
  const photoHelp = form.querySelector('[data-photo-help]');
  const conditionField = form.querySelector('[data-condition-field]');
  const conditionLabel = form.querySelector('[data-condition-label]');
  const conditionSelect = form.querySelector('[data-condition-select]');
  const logisticsOptions = form.querySelector('[data-logistics-options]');
  const extraCosts = form.querySelector('[data-extra-costs]');
  const customsNotice = form.querySelector('[data-listing-foz-notice]');
  const preview = form.querySelector('[data-listing-preview]');
  const addressSearchButton = form.querySelector('[data-address-search]');
  const locationStatus = form.querySelector('[data-location-status]');
  const locationResults = form.querySelector('[data-location-results]');
  const mapElement = form.querySelector('[data-listing-map]');
  const phone = document.body.dataset.whatsappPhone || '33768345608';
  const profileStorageKey = 'nykuto-local-profile-v1';

  const subcategories = {
    Produto: ['Móveis e decoração', 'Eletrodomésticos', 'Eletrônicos e informática', 'Celular e acessórios', 'Moda e acessórios', 'Veículos e peças', 'Outro produto'],
    Imóvel: ['Apartamento para alugar', 'Casa para alugar', 'Quarto ou kitnet', 'Imóvel para vender', 'Terreno', 'Comercial'],
    'Frete ou mudança': ['Pequeno frete', 'Mudança completa', 'Entrega ou retirada', 'Rota CDE ↔ Foz', 'Motorista com veículo', 'Outro transporte'],
    'Serviço local': ['Montagem e instalação', 'Manutenção e reparo', 'Limpeza', 'Elétrica ou hidráulica', 'Climatização', 'Aulas ou atendimento', 'Outro serviço'],
    'Compra ou retirada em Foz': ['Comprar em Foz', 'Retirar uma compra', 'Entregar CDE ↔ Foz', 'Documento permitido', 'Outro pedido permitido'],
    Outro: ['Evento ou aluguel', 'Oportunidade local', 'Doação', 'Outro anúncio']
  };

  const fieldConfig = {
    Produto: {
      conditionLabel: 'Estado',
      conditions: ['Novo', 'Como novo', 'Bom estado', 'Usado', 'Precisa de reparo', 'Para peças'],
      logistics: ['Retirada no local', 'Entrega local', 'Envio possível', 'A combinar'],
      extras: [{ name: 'deliveryFee', label: 'Taxa de entrega ou envio', placeholder: 'Ex.: R$ 20 ou a combinar' }]
    },
    Imóvel: {
      conditionLabel: 'Condição do imóvel',
      conditions: ['Novo', 'Ótimo estado', 'Bom estado', 'Mobiliado', 'Precisa de reforma'],
      logistics: ['Visita agendada', 'Entrada imediata', 'Aceita pet', 'A combinar'],
      extras: [
        { name: 'guarantee', label: 'Garantia / caução', placeholder: 'Ex.: 1 aluguel' },
        { name: 'agencyFee', label: 'Taxa ou comissão', placeholder: 'Ex.: 50% ou sem taxa' },
        { name: 'condominium', label: 'Condomínio / expensas', placeholder: 'Valor ou incluso' },
        { name: 'includedCosts', label: 'Despesas incluídas', placeholder: 'Água, internet, condomínio…' }
      ]
    },
    'Frete ou mudança': {
      conditionLabel: 'Veículo',
      conditions: ['Moto', 'Carro', 'Caminhonete', 'Furgão', 'Caminhão', 'A combinar'],
      logistics: ['Atende Ciudad del Este', 'Atende Foz', 'Travessia de fronteira permitida', 'Ajuda para carregar'],
      extras: [
        { name: 'origin', label: 'Origem', placeholder: 'Bairro ou cidade' },
        { name: 'destination', label: 'Destino', placeholder: 'Bairro ou cidade' },
        { name: 'extraFee', label: 'Taxas adicionais', placeholder: 'Pedágio, ajudante ou a combinar' }
      ]
    },
    'Serviço local': {
      conditionLabel: 'Atendimento',
      conditions: ['No local do cliente', 'Em endereço próprio', 'Online', 'A combinar'],
      logistics: ['Atende Ciudad del Este', 'Atende Foz', 'Material incluído', 'Orçamento gratuito'],
      extras: [
        { name: 'serviceFee', label: 'Taxa de deslocamento', placeholder: 'Ex.: sem taxa ou R$ 30' },
        { name: 'materials', label: 'Materiais / custos extras', placeholder: 'Inclusos ou cobrados à parte' }
      ]
    },
    'Compra ou retirada em Foz': {
      conditionLabel: 'Modalidade',
      conditions: ['Compra', 'Retirada', 'Entrega', 'A combinar'],
      logistics: ['Origem em Foz', 'Destino em CDE', 'Item pequeno', 'Comprovante disponível'],
      extras: [
        { name: 'productBudget', label: 'Valor aproximado da compra', placeholder: 'Ex.: R$ 250' },
        { name: 'serviceFee', label: 'Remuneração / taxa', placeholder: 'Ex.: R$ 50 ou a combinar' },
        { name: 'destination', label: 'Destino final', placeholder: 'Bairro ou ponto de encontro' }
      ]
    },
    Outro: {
      conditionLabel: 'Condição',
      conditions: ['Disponível', 'Novo', 'Usado', 'A combinar'],
      logistics: ['Retirada', 'Entrega', 'Atendimento local', 'A combinar'],
      extras: [{ name: 'extraCosts', label: 'Taxas ou custos extras', placeholder: 'Informe se houver' }]
    }
  };

  let currentStep = 1;
  let selectedFiles = [];
  let photoUrls = [];
  let listingMap;
  let locationMarker;
  let privacyCircle;
  let lastGeocodeAt = 0;
  let geocodePending = false;
  let renderedCategory = '';
  const geocodeCache = new Map();

  const getValue = (name) => String(form.elements[name]?.value || '').trim();
  const getCategory = () => getValue('category');
  const getSubcategory = () => getValue('subcategory');

  function normalizedWhatsapp(value) {
    const digits = String(value || '').replace(/\D/g, '');
    const repeatedDigit = /^(\d)\1+$/.test(digits);
    return /^[1-9]\d{7,14}$/.test(digits) && !repeatedDigit ? `+${digits}` : '';
  }

  function hasValidPrice(value) {
    const raw = String(value || '').trim();
    if (!/^[\d\s.,]+$/.test(raw)) return false;
    const digits = raw.replace(/\D/g, '');
    return digits.length > 0 && Number(digits) > 0;
  }

  function loadSavedProfile() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(profileStorageKey) || 'null');
      if (!saved || typeof saved !== 'object') return;
      ['firstName', 'lastName', 'email', 'whatsapp'].forEach((name) => {
        if (form.elements[name] && typeof saved[name] === 'string') form.elements[name].value = saved[name];
      });
    } catch (_error) {
      // The form remains fully usable when browser storage is blocked.
    }
  }

  function persistProfile() {
    try {
      if (!form.elements.rememberProfile?.checked) {
        window.localStorage.removeItem(profileStorageKey);
        return;
      }
      window.localStorage.setItem(profileStorageKey, JSON.stringify({
        firstName: getValue('firstName'),
        lastName: getValue('lastName'),
        email: getValue('email'),
        whatsapp: normalizedWhatsapp(getValue('whatsapp'))
      }));
    } catch (_error) {
      // Saving the convenience profile is optional and never blocks submission.
    }
  }

  function setError(message = '') {
    errorBox.textContent = message;
    errorBox.hidden = !message;
    if (message) errorBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function setStep(nextStep, { focus = true } = {}) {
    currentStep = Math.max(1, Math.min(5, nextStep));
    steps.forEach((step) => {
      const active = Number(step.dataset.wizardStep) === currentStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });
    progressItems.forEach((item) => {
      const number = Number(item.dataset.wizardProgress);
      item.classList.toggle('is-current', number === currentStep);
      item.classList.toggle('is-complete', number < currentStep);
      if (number === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    backButton.hidden = currentStep === 1;
    nextButton.hidden = currentStep === 5;
    submitButton.hidden = currentStep !== 5;
    setError();

    if (currentStep === 4) initMap();
    if (currentStep === 5) renderPreview();
    if (focus) {
      const heading = steps.find((step) => Number(step.dataset.wizardStep) === currentStep)?.querySelector('h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      document.querySelector('[data-listing-wizard]')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  function createChoice(name, value) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const strong = document.createElement('strong');
    const arrow = document.createElement('span');
    input.type = 'radio';
    input.name = name;
    input.value = value;
    strong.textContent = value;
    arrow.textContent = '→';
    arrow.setAttribute('aria-hidden', 'true');
    label.append(input, strong, arrow);
    return label;
  }

  function renderSubcategories() {
    const category = getCategory();
    if (renderedCategory === category && subcategoryGrid.querySelector('input[name="subcategory"]')) return;
    renderedCategory = category;
    subcategoryGrid.replaceChildren();
    const legend = document.createElement('legend');
    legend.className = 'sr-only';
    legend.textContent = 'Tipo de anúncio';
    subcategoryGrid.append(legend);
    (subcategories[category] || subcategories.Outro).forEach((value) => subcategoryGrid.append(createChoice('subcategory', value)));
    updateConditionalFields();
  }

  function renderSelectOptions(select, values) {
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecione';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
  }

  function createCheckbox(value) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const span = document.createElement('span');
    input.type = 'checkbox';
    input.name = 'logistics';
    input.value = value;
    span.textContent = value;
    label.append(input, span);
    return label;
  }

  function renderExtraFields(fields) {
    if (!extraCosts) return;
    extraCosts.replaceChildren();
    fields.forEach((field) => {
      const label = document.createElement('label');
      label.className = 'nykuto-field';
      const span = document.createElement('span');
      const input = document.createElement('input');
      span.textContent = field.label;
      input.type = 'text';
      input.name = field.name;
      input.maxLength = 80;
      input.placeholder = field.placeholder;
      label.append(span, input);
      extraCosts.append(label);
    });
  }

  function updateConditionalFields() {
    const category = getCategory() || 'Outro';
    const config = fieldConfig[category] || fieldConfig.Outro;
    conditionLabel.textContent = config.conditionLabel;
    renderSelectOptions(conditionSelect, config.conditions);
    conditionField.hidden = !config.conditions.length;
    logisticsOptions.replaceChildren();
    const legend = document.createElement('legend');
    legend.textContent = category === 'Imóvel' ? 'Condições da oferta' : 'Entrega ou atendimento';
    logisticsOptions.append(legend, ...config.logistics.map(createCheckbox));
    renderExtraFields(config.extras);
    customsNotice.hidden = category !== 'Compra ou retirada em Foz';
  }

  function clearPhotoUrls() {
    photoUrls.forEach((url) => URL.revokeObjectURL(url));
    photoUrls = [];
  }

  function renderPhotos() {
    clearPhotoUrls();
    photoPreview.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      const button = document.createElement('button');
      const url = URL.createObjectURL(file);
      photoUrls.push(url);
      image.src = url;
      image.alt = `Prévia da foto ${index + 1}`;
      image.addEventListener('error', () => {
        image.remove();
        const fallback = document.createElement('span');
        fallback.className = 'nykuto-photo-fallback';
        fallback.textContent = /\.hei[cf]$/i.test(file.name) ? 'HEIC' : 'Foto';
        figure.prepend(fallback);
      }, { once: true });
      button.type = 'button';
      button.dataset.removePhoto = String(index);
      button.setAttribute('aria-label', `Remover foto ${index + 1}`);
      button.textContent = '×';
      figure.append(image, button);
      photoPreview.append(figure);
    });
    photoHelp.textContent = selectedFiles.length
      ? `${selectedFiles.length} foto${selectedFiles.length > 1 ? 's' : ''} pronta${selectedFiles.length > 1 ? 's' : ''}. Você deverá anexá-la${selectedFiles.length > 1 ? 's' : ''} na conversa do WhatsApp.`
      : 'As fotos ficam somente no seu aparelho até você compartilhar.';
  }

  function handlePhotos() {
    const incoming = [...(photoInput.files || [])];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const invalid = incoming.find((file) => {
      const allowedExtension = /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name);
      return (!allowedTypes.includes(file.type) && !allowedExtension) || file.size > 10 * 1024 * 1024;
    });
    if (invalid) {
      setError('Use somente fotos JPG, PNG, WebP ou HEIC com até 10 MB cada.');
      photoInput.value = '';
      return;
    }
    selectedFiles = incoming.slice(0, 5);
    if (incoming.length > 5) setError('Somente as cinco primeiras fotos foram mantidas.');
    else setError();
    renderPhotos();
  }

  function validateStep(step) {
    if (step === 1 && !getCategory()) return 'Escolha uma categoria para continuar.';
    if (step === 2 && !getSubcategory()) return 'Escolha o tipo do anúncio.';
    if (step === 3) {
      if (getValue('title').length < 4) return 'Escreva um título com pelo menos 4 caracteres.';
      if (['Produto', 'Imóvel'].includes(getCategory()) && selectedFiles.length === 0) return 'Adicione pelo menos uma foto para este tipo de anúncio.';
      if (!getValue('priceMode')) return 'Escolha como o preço será apresentado.';
      if (['Preço fixo', 'Negociável'].includes(getValue('priceMode')) && !hasValidPrice(getValue('price'))) return 'Informe um preço válido, somente com números e separadores, ou escolha “Sob consulta”.';
      if (!getValue('condition')) return 'Escolha o estado ou a modalidade do anúncio.';
    }
    if (step === 4) {
      if (!getValue('latitude') || !getValue('longitude')) return 'Localize o endereço ou toque no mapa para definir a zona aproximada.';
      if (!getValue('availability')) return 'Escolha quando a oferta estará disponível.';
      if (getCategory() === 'Produto' && form.querySelectorAll('input[name="logistics"]:checked').length === 0) return 'Escolha pelo menos uma opção de retirada, entrega ou envio.';
    }
    if (step === 5) {
      if (getValue('firstName').length < 2) return 'Informe seu nome.';
      if (getValue('lastName').length < 2) return 'Informe seu sobrenome.';
      if (getValue('email') && !form.elements.email.checkValidity()) return 'Confira o endereço de e-mail.';
      if (!normalizedWhatsapp(getValue('whatsapp'))) return 'Informe o WhatsApp com código do país e entre 8 e 15 dígitos.';
      if (!form.elements.publicContact.checked) return 'Autorize o contato direto pelo WhatsApp para publicar.';
      if (!form.elements.confirm.checked) return 'Confirme as informações antes de continuar.';
    }
    return '';
  }

  function initMap() {
    if (listingMap || !window.L || !mapElement) {
      if (listingMap) setTimeout(() => listingMap.invalidateSize(), 80);
      return;
    }
    listingMap = window.L.map(mapElement, { zoomControl: true, scrollWheelZoom: false }).setView([-25.516, -54.61], 11);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(listingMap);
    listingMap.on('click', (event) => {
      setLocation(event.latlng.lat, event.latlng.lng, 'Zona escolhida no mapa', true);
    });
    setTimeout(() => listingMap.invalidateSize(), 100);
  }

  function setLocation(lat, lng, label, manual = false) {
    const coordinates = [Number(lat), Number(lng)];
    if (!coordinates.every(Number.isFinite)) return;
    form.elements.confirm.checked = false;
    form.elements.latitude.value = coordinates[0].toFixed(6);
    form.elements.longitude.value = coordinates[1].toFixed(6);
    form.elements.locationLabel.value = label;
    if (manual) form.elements.address.value = '';
    if (!listingMap) initMap();
    if (!listingMap || !window.L) {
      locationStatus.textContent = 'Zona definida. O mapa não pôde ser exibido, mas a referência foi mantida.';
      locationResults.hidden = true;
      return;
    }
    if (!locationMarker) locationMarker = window.L.marker(coordinates).addTo(listingMap);
    else locationMarker.setLatLng(coordinates);
    if (!privacyCircle) {
      privacyCircle = window.L.circle(coordinates, {
        radius: 5000,
        color: '#174f43',
        fillColor: '#5ba388',
        fillOpacity: 0.18,
        weight: 2
      }).addTo(listingMap);
    } else privacyCircle.setLatLng(coordinates);
    listingMap.fitBounds(privacyCircle.getBounds(), { padding: [18, 18] });
    locationStatus.textContent = `${manual ? 'Ponto definido' : 'Endereço localizado'} · área pública aproximada de 5 km.`;
    locationResults.hidden = true;
  }

  function clearResolvedLocation() {
    if (!getValue('latitude') && !getValue('longitude')) return;
    form.elements.latitude.value = '';
    form.elements.longitude.value = '';
    form.elements.locationLabel.value = '';
    if (listingMap && locationMarker) listingMap.removeLayer(locationMarker);
    if (listingMap && privacyCircle) listingMap.removeLayer(privacyCircle);
    locationMarker = null;
    privacyCircle = null;
    locationResults.hidden = true;
    locationStatus.textContent = 'Endereço alterado. Toque em “Localizar” para atualizar a zona aproximada.';
  }

  function publicLocationFromResult(result) {
    const address = result.address || {};
    const district = address.neighbourhood || address.suburb || address.quarter || address.city_district;
    const city = address.city || address.town || address.municipality || address.village;
    return [district, city].filter(Boolean).join(', ') || city || 'Região de CDE/Foz';
  }

  function renderLocationResults(results) {
    locationResults.replaceChildren();
    if (!results.length) {
      locationResults.hidden = true;
      locationStatus.textContent = 'Nenhum endereço encontrado. Tente um bairro próximo ou toque no mapa.';
      return;
    }
    results.forEach((result) => {
      const button = document.createElement('button');
      const strong = document.createElement('strong');
      const small = document.createElement('small');
      button.type = 'button';
      strong.textContent = publicLocationFromResult(result);
      small.textContent = result.display_name;
      button.append(strong, small);
      button.addEventListener('click', () => {
        form.elements.address.value = result.display_name;
        setLocation(result.lat, result.lon, publicLocationFromResult(result));
      });
      locationResults.append(button);
    });
    const firstResult = results[0];
    form.elements.address.value = firstResult.display_name;
    setLocation(firstResult.lat, firstResult.lon, publicLocationFromResult(firstResult));
    locationResults.hidden = false;
    locationStatus.textContent = 'O primeiro resultado já aparece no mapa. Escolha outro abaixo se necessário.';
  }

  async function searchAddress() {
    if (geocodePending) return;
    const query = getValue('address');
    if (query.length < 4) {
      setError('Digite pelo menos 4 caracteres para buscar o endereço.');
      form.elements.address.focus();
      return;
    }
    setError();
    const cacheKey = query.toLocaleLowerCase('pt-BR');
    if (geocodeCache.has(cacheKey)) {
      renderLocationResults(geocodeCache.get(cacheKey));
      return;
    }
    geocodePending = true;
    const elapsed = Date.now() - lastGeocodeAt;
    if (elapsed < 1000) await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
    lastGeocodeAt = Date.now();
    addressSearchButton.disabled = true;
    addressSearchButton.textContent = 'Buscando…';
    locationStatus.textContent = 'Buscando na região de CDE e Foz…';
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        addressdetails: '1',
        limit: '4',
        countrycodes: 'py,br',
        viewbox: '-55.0,-24.9,-54.3,-25.8',
        bounded: '1',
        'accept-language': 'pt-BR'
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Geocoding unavailable');
      const payload = await response.json();
      const results = Array.isArray(payload) ? payload : [];
      geocodeCache.set(cacheKey, results);
      renderLocationResults(results);
    } catch (_error) {
      locationResults.hidden = true;
      locationStatus.textContent = 'A busca não respondeu. Você pode tocar diretamente no mapa para marcar a zona.';
    } finally {
      const wait = Math.max(0, 1000 - (Date.now() - lastGeocodeAt));
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      addressSearchButton.disabled = false;
      addressSearchButton.textContent = 'Localizar';
      geocodePending = false;
    }
  }

  function checkedLogistics() {
    return [...form.querySelectorAll('input[name="logistics"]:checked')].map((input) => input.value);
  }

  function priceText() {
    const mode = getValue('priceMode');
    if (mode === 'Grátis' || mode === 'Sob consulta') return mode;
    return `${getValue('currency')} ${getValue('price')} · ${mode}`;
  }

  function dynamicExtraValues() {
    if (!extraCosts) return [];
    return [...extraCosts.querySelectorAll('input')]
      .map((input) => ({ label: input.closest('label')?.querySelector('span')?.textContent || input.name, value: input.value.trim() }))
      .filter((item) => item.value);
  }

  function appendText(parent, tag, value, className = '') {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    parent.append(element);
    return element;
  }

  function renderPreview() {
    preview.replaceChildren();
    const card = document.createElement('article');
    const media = document.createElement('div');
    const body = document.createElement('div');
    media.className = 'nykuto-preview-media';
    body.className = 'nykuto-preview-body';
    if (photoUrls[0]) {
      const image = document.createElement('img');
      image.src = photoUrls[0];
      image.alt = 'Foto principal selecionada';
      image.addEventListener('error', () => {
        image.remove();
        appendText(media, 'span', /\.hei[cf]$/i.test(selectedFiles[0]?.name || '') ? 'HEIC' : getCategory().slice(0, 1), 'nykuto-preview-placeholder');
      }, { once: true });
      media.append(image);
    } else appendText(media, 'span', getCategory().slice(0, 1), 'nykuto-preview-placeholder');
    appendText(media, 'b', `${selectedFiles.length} foto${selectedFiles.length === 1 ? '' : 's'}`);
    appendText(body, 'small', `${getCategory()} · ${getSubcategory()}`);
    appendText(body, 'h3', getValue('title'));
    appendText(body, 'strong', priceText());
    const chips = document.createElement('div');
    chips.className = 'nykuto-preview-chips';
    [getValue('condition'), `${getValue('locationLabel')} · raio 5 km`, ...checkedLogistics()].filter(Boolean).forEach((value) => appendText(chips, 'span', value));
    body.append(chips);
    if (getValue('description')) appendText(body, 'p', getValue('description'));
    const extras = dynamicExtraValues();
    if (extras.length) {
      const dl = document.createElement('dl');
      extras.forEach((item) => {
        appendText(dl, 'dt', item.label);
        appendText(dl, 'dd', item.value);
      });
      body.append(dl);
    }
    const seller = document.createElement('div');
    seller.className = 'nykuto-preview-seller';
    appendText(seller, 'span', 'Contato do anunciante');
    appendText(seller, 'strong', `${getValue('firstName')} ${getValue('lastName')}`.trim() || 'Preencha seu nome');
    appendText(seller, 'small', normalizedWhatsapp(getValue('whatsapp')) || 'Preencha o WhatsApp');
    body.append(seller);
    card.append(media, body);
    preview.append(card);
  }

  function composeMessage() {
    const logistics = checkedLogistics();
    const extras = dynamicExtraValues();
    const lines = [
      'Olá! Quero pré-cadastrar um anúncio no Nykuto Local.',
      '',
      `Categoria: ${getCategory()}`,
      `Tipo: ${getSubcategory()}`,
      `Título: ${getValue('title')}`,
      getValue('description') ? `Descrição: ${getValue('description')}` : '',
      `Preço: ${priceText()}`,
      `Estado / modalidade: ${getValue('condition')}`,
      `Disponibilidade: ${getValue('availability')}`,
      logistics.length ? `Entrega / atendimento: ${logistics.join(', ')}` : '',
      ...extras.map((item) => `${item.label}: ${item.value}`),
      '',
      `Referência privada do endereço: ${getValue('address') || getValue('locationLabel')}`,
      `Zona pública desejada: ${getValue('locationLabel')} · raio aproximado de 5 km`,
      `Ponto de referência: https://www.openstreetmap.org/?mlat=${getValue('latitude')}&mlon=${getValue('longitude')}#map=15/${getValue('latitude')}/${getValue('longitude')}`,
      selectedFiles.length ? `Fotos selecionadas: ${selectedFiles.length} — vou anexá-las nesta conversa.` : 'Fotos selecionadas: nenhuma.',
      '',
      'Contato que deverá aparecer no anúncio:',
      `Nome: ${getValue('firstName')} ${getValue('lastName')}`,
      `WhatsApp: ${normalizedWhatsapp(getValue('whatsapp'))}`,
      getValue('email') ? `E-mail: ${getValue('email')}` : '',
      'Autorizo que o WhatsApp informado seja usado para o contato direto dos interessados.',
      '',
      'Entendo que este envio é uma pré-inscrição para avaliação e não garante publicação.'
    ];
    if (getCategory() === 'Compra ou retirada em Foz') lines.push('Confirmo que o pedido envolve somente atividades e produtos permitidos e respeitará as regras fiscais e aduaneiras aplicáveis.');
    return lines.filter((line, index, array) => line || (index > 0 && array[index - 1])).join('\n').trim();
  }

  function advanceFromChoice(event, expectedStep) {
    if (currentStep !== expectedStep || event.detail === 0) return;
    window.setTimeout(() => {
      const error = validateStep(expectedStep);
      if (!error) setStep(expectedStep + 1);
    }, 120);
  }

  form.addEventListener('click', (event) => {
    if (event.target.closest('.nykuto-category-choices label')) advanceFromChoice(event, 1);
    if (event.target.closest('[data-subcategory-grid] label')) advanceFromChoice(event, 2);
    const removeButton = event.target.closest('[data-remove-photo]');
    if (removeButton) {
      selectedFiles.splice(Number(removeButton.dataset.removePhoto), 1);
      photoInput.value = '';
      form.elements.confirm.checked = false;
      renderPhotos();
    }
  });

  form.addEventListener('change', (event) => {
    if (event.target.name !== 'confirm') form.elements.confirm.checked = false;
    if (event.target.name === 'category') renderSubcategories();
    if (event.target.name === 'priceMode') {
      const noAmount = ['Grátis', 'Sob consulta'].includes(event.target.value);
      form.elements.price.disabled = noAmount;
      if (noAmount) form.elements.price.value = '';
    }
  });

  photoInput.addEventListener('change', handlePhotos);
  form.addEventListener('input', (event) => {
    if (event.target.name !== 'confirm') form.elements.confirm.checked = false;
    if (event.target.name === 'address') clearResolvedLocation();
    if (currentStep === 5 && ['firstName', 'lastName', 'whatsapp'].includes(event.target.name)) renderPreview();
  });
  addressSearchButton.addEventListener('click', searchAddress);
  form.elements.address.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchAddress();
    }
  });

  nextButton.addEventListener('click', () => {
    const error = validateStep(currentStep);
    if (error) return setError(error);
    setStep(currentStep + 1);
  });
  backButton.addEventListener('click', () => setStep(currentStep - 1));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (currentStep !== 5) return setError('Use “Continuar” para revisar todas as etapas antes do envio.');
    for (let step = 1; step <= 5; step += 1) {
      const error = validateStep(step);
      if (error) {
        if (step < 5) setStep(step);
        setError(error);
        return;
      }
    }
    persistProfile();
    const message = composeMessage();
    if (window.NykutoWhatsApp?.open) window.NykutoWhatsApp.open(phone, message);
    else window.location.href = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
  });

  const statusButton = document.querySelector('[data-manager-action="status"]');
  const mediaButton = document.querySelector('[data-manager-action="media"]');
  const status = document.querySelector('[data-manager-status]');
  const previewImage = document.querySelector('[data-announce-preview-image]');
  const feedback = document.querySelector('[data-manager-feedback]');
  let reserved = false;
  let alternateCover = false;
  statusButton?.addEventListener('click', () => {
    reserved = !reserved;
    status.textContent = reserved ? 'Reservado' : 'Publicado';
    status.classList.toggle('is-reserved', reserved);
    feedback.textContent = reserved ? 'NYK-CDE-01 marcado como reservado.' : 'NYK-CDE-01 publicado novamente.';
  });
  mediaButton?.addEventListener('click', () => {
    alternateCover = !alternateCover;
    previewImage.src = alternateCover ? '/assets/demo-imobiliaria/local-premium-09.webp' : '/assets/demo-imobiliaria/local-premium-08.webp';
    feedback.textContent = alternateCover ? 'Nova imagem definida como capa.' : 'Capa original restaurada.';
  });

  window.addEventListener('beforeunload', clearPhotoUrls);
  loadSavedProfile();
  const presetCategory = new URLSearchParams(window.location.search).get('categoria');
  const presetInput = presetCategory
    ? [...form.elements.category].find((input) => input.value === presetCategory)
    : null;
  if (presetInput) {
    presetInput.checked = true;
    renderSubcategories();
    setStep(2, { focus: false });
  } else {
    updateConditionalFields();
    setStep(1, { focus: false });
  }
})();
