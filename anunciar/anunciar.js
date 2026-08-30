import { deriveCdeLocalReference } from '/cde-local-reference.js?v=20260830-2';
import {
  deviceAccuracyLabel,
  geolocationErrorMessage,
  isPilotCoordinate,
  roundPublicCoordinate
} from '/anunciar/location-utils.js?v=20260830-4';

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
  const directSubcategoryField = form.querySelector('[data-direct-subcategory-field]');
  const directSubcategorySelect = form.elements.directSubcategory;
  const photoInput = form.elements.photos;
  const photoPreview = form.querySelector('[data-photo-preview]');
  const photoHelp = form.querySelector('[data-photo-help]');
  const conditionField = form.querySelector('[data-condition-field]');
  const conditionLabel = form.querySelector('[data-condition-label]');
  const conditionSelect = form.querySelector('[data-condition-select]');
  const priceModeField = form.querySelector('[data-price-mode-field]');
  const sourceUrlField = form.querySelector('[data-source-url-field]');
  const logisticsOptions = form.querySelector('[data-logistics-options]');
  const extraCosts = form.querySelector('[data-extra-costs]');
  const customsNotice = form.querySelector('[data-listing-foz-notice]');
  const caronaNotice = form.querySelector('[data-listing-carona-notice]');
  const priceLabel = form.querySelector('[data-price-label]');
  const priceModeLabel = form.querySelector('[data-price-mode-label]');
  const locationHeading = form.querySelector('[data-location-heading]');
  const locationCopy = form.querySelector('[data-location-copy]');
  const addressLabel = form.querySelector('[data-address-label]');
  const availabilityLabel = form.querySelector('[data-availability-label]');
  const preview = form.querySelector('[data-listing-preview]');
  const currentLocationButton = form.querySelector('[data-current-location]');
  const addressSearchButton = form.querySelector('[data-address-search]');
  const locationStatus = form.querySelector('[data-location-status]');
  const locationResults = form.querySelector('[data-location-results]');
  const mapElement = form.querySelector('[data-listing-map]');
  const mapPanel = form.querySelector('[data-map-panel]');
  const mapToggleButton = form.querySelector('[data-map-toggle]');
  const mapPrivacyCopy = form.querySelector('[data-map-privacy-copy]');
  const mapPointSelector = form.querySelector('[data-map-point-selector]');
  const mapPointButtons = [...form.querySelectorAll('[data-map-point]')];
  const radiusLabelElement = form.querySelector('[data-radius-label]');
  const rideDestinationSearchButton = form.querySelector('[data-ride-destination-search]');
  const rideRouteStatus = form.querySelector('[data-ride-route-status]');
  const campusDestinationSelect = form.querySelector('[data-campus-destination-select]');
  const turnstileContainer = form.querySelector('[data-turnstile-container]');
  const turnstileStatus = form.querySelector('[data-turnstile-status]');
  const successPanel = document.querySelector('[data-listing-success]');
  const successView = document.querySelector('[data-success-view]');
  const successShare = document.querySelector('[data-success-share]');
  const sourceConsent = form.querySelector('[data-source-consent]');
  const wizard = document.querySelector('[data-listing-wizard]');
  const genericDetails = form.querySelector('[data-generic-details]');
  const genericLogistics = form.querySelector('[data-generic-logistics]');
  const carpoolDestination = form.querySelector('[data-carona-destination]');
  const carpoolScheduleFields = form.querySelector('[data-carona-schedule-fields]');
  const rideDateField = form.querySelector('[data-ride-date-field]');
  const rideSeatsLabel = form.querySelector('[data-ride-seats-label]');
  const emailField = form.querySelector('[data-email-field]');
  const geocodeNote = form.querySelector('[data-geocode-note]');
  const contactNote = form.querySelector('[data-contact-note]');
  const confirmCopy = form.querySelector('[data-confirm-copy]');
  const reviewNote = form.querySelector('[data-review-note]');
  const profileStorageKey = 'nykuto-local-profile-v1';
  const initialParams = new URLSearchParams(window.location.search);
  const requestModeFromUrl = initialParams.get('tipo') === 'pedido';
  const carpoolMode = initialParams.get('categoria') === 'Carona compartilhada';
  const directPublishMode = !carpoolMode;
  const wizardSequence = carpoolMode ? [2, 4, 5] : [1, 2, 3, 4, 5];
  const MAX_PHOTO_COUNT = 2;
  const MAX_SOURCE_PHOTO_BYTES = 25 * 1024 * 1024;
  const MAX_OPTIMIZED_PHOTO_BYTES = 300000;
  const MAX_TOTAL_PHOTO_BYTES = MAX_PHOTO_COUNT * MAX_OPTIMIZED_PHOTO_BYTES;
  const photoOptimizationCache = new WeakMap();

  const subcategories = {
    Produto: ['Móveis e decoração', 'Eletrodomésticos', 'Eletrônicos e informática', 'Celular e acessórios', 'Moda e acessórios', 'Veículos e peças', 'Outro produto'],
    Imóvel: ['Apartamento para alugar', 'Casa para alugar', 'Quarto ou kitnet', 'Imóvel para vender', 'Terreno', 'Comercial'],
    'Frete ou mudança': ['Pequeno frete', 'Mudança completa', 'Entrega ou retirada', 'Rota CDE ↔ Foz', 'Motorista com veículo', 'Outro transporte'],
    'Serviço local': ['Montagem e instalação', 'Manutenção e reparo', 'Limpeza', 'Elétrica ou hidráulica', 'Climatização', 'Aulas ou atendimento', 'Outro serviço'],
    'Carona compartilhada': ['Ofereço carona recorrente', 'Ofereço carona ocasional', 'Procuro carona recorrente', 'Procuro carona ocasional'],
    'Compra ou retirada em Foz': ['Comprar em Foz', 'Retirar uma compra', 'Entregar CDE ↔ Foz', 'Documento permitido', 'Outro pedido permitido'],
    Outro: ['Evento ou aluguel', 'Oportunidade local', 'Doação', 'Outro anúncio']
  };

  const subcategoryLabels = {
    'Celular e acessórios': 'Celulares e acessórios',
    'Eletrônicos e informática': 'Informática, TV e áudio'
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
    'Carona compartilhada': {
      conditionLabel: 'Horário',
      conditions: ['Horário confirmado'],
      availability: ['Uma vez', 'Dias úteis', 'Toda semana', 'Todos os dias'],
      logistics: [],
      extras: []
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

  let currentStep = wizardSequence[0];
  let selectedFiles = [];
  let photoUrls = [];
  let listingMap;
  let locationMarker;
  let privacyCircle;
  let rideRouteLayer;
  let rideDestinationMarker;
  let activeMapPoint = 'origin';
  let rideRouteRequestId = 0;
  let rideDestinationRequestId = 0;
  let rideRoutePending = false;
  let lastGeocodeAt = 0;
  let geocodeQueue = Promise.resolve();
  let geocodePending = false;
  let currentLocationPending = false;
  let currentLocationRequestId = 0;
  let addressSearchRequestId = 0;
  const reverseGeocodeRequestIds = { origin: 0, destination: 0 };
  let renderedCategory = '';
  let csrfToken = '';
  let turnstileSiteKey = '';
  let turnstileToken = '';
  let turnstileWidgetId = null;
  let turnstileAvailability = 'loading';
  let publishedUrl = '';
  const geocodeCache = new Map();
  const reverseGeocodeCache = new Map();

  const getValue = (name) => String(form.elements[name]?.value || '').trim();
  const getCategory = () => getValue('category');
  const getSubcategory = () => directPublishMode ? getValue('directSubcategory') : getValue('subcategory');

  function zoneRadiusMeters() {
    const value = Number(getValue('zoneRadiusMeters'));
    return [50, 200, 500, 1000, 2000, 3000, 5000].includes(value) ? value : 500;
  }

  function radiusLabel(value = zoneRadiusMeters()) {
    if (value === 50) return 'ponto preciso (~50 m)';
    if (value < 1000 || carpoolMode) return `raio de ${value.toLocaleString('pt-BR')} m`;
    return `raio de ${value / 1000} km`;
  }

  function localReferenceLabel(latitude = getValue('latitude'), longitude = getValue('longitude')) {
    return deriveCdeLocalReference(latitude, longitude) || '';
  }

  function publicZoneSummary(latitude = getValue('latitude'), longitude = getValue('longitude')) {
    return [localReferenceLabel(latitude, longitude), radiusLabel()].filter(Boolean).join(' · ');
  }

  function sequenceIndex(step = currentStep) {
    return wizardSequence.indexOf(step);
  }

  function nextWizardStep(step = currentStep) {
    return wizardSequence[Math.min(wizardSequence.length - 1, sequenceIndex(step) + 1)];
  }

  function previousWizardStep(step = currentStep) {
    return wizardSequence[Math.max(0, sequenceIndex(step) - 1)];
  }

  function isCarpoolRequest() {
    return /^Procuro\b/i.test(getSubcategory());
  }

  function resolvedCarpoolSubcategory() {
    const action = isCarpoolRequest() ? 'Procuro' : 'Ofereço';
    const frequency = getValue('rideFrequency');
    return `${action} carona ${frequency && frequency !== 'once' ? 'recorrente' : 'ocasional'}`;
  }

  function rideFrequencyLabel() {
    return ({ once: 'Uma vez', weekdays: 'Dias úteis', weekly: 'Toda semana', daily: 'Todos os dias' })[getValue('rideFrequency')] || '';
  }

  function publicRidePlace(value) {
    const protectedPrefixes = new Set(['área', 'area', 'km', 'ruta', 'rota']);
    const streetNameConnectors = new Set(['de', 'da', 'do', 'das', 'dos']);
    const normalizedWord = (word) => String(word || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
    const cleaned = String(value || '').normalize('NFKC').trim().replace(/\s+/g, ' ')
      .replace(/\b(?:(?:casa|apartamento|apto|número|numero)\b|ap\.|n[º°]|n[o]?\.)\s*[:.#-]?\s*[^\s,]+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.split(',').map((segment) => {
      const words = segment.trim().split(/\s+/).filter(Boolean);
      const addressNumberIndex = words.findIndex((word, index) => {
        if (!/^\d{1,6}(?:[a-z]|[-/][a-z0-9]+)?$/i.test(word)) return false;
        if (protectedPrefixes.has(normalizedWord(words[index - 1]))) return false;
        if (streetNameConnectors.has(normalizedWord(words[index + 1]))) return false;
        return true;
      });
      const publicWords = addressNumberIndex >= 0 ? words.slice(0, addressNumberIndex) : words;
      if (['n', 'no', 'num', 'numero', 'ap', 'apto', 'casa'].includes(normalizedWord(publicWords[publicWords.length - 1]))) publicWords.pop();
      return publicWords.join(' ');
    }).filter(Boolean).join(', ').trim();
  }

  function syncCarpoolDefaults() {
    if (!carpoolMode) return;
    const origin = publicRidePlace(getValue('locationLabel')) || 'Origem';
    const destination = publicRidePlace(getValue('rideDestination')) || 'Destino';
    const time = getValue('rideTime');
    const contribution = getValue('rideContribution');
    const requestPrefix = isCarpoolRequest() ? 'Procuro carona' : 'Carona';
    form.elements.title.value = `${requestPrefix}: ${origin} → ${destination}${time ? ` · ${time}` : ''}`.slice(0, 80);
    form.elements.priceMode.value = contribution ? 'Preço fixo' : 'Sob consulta';
    form.elements.price.value = contribution;
    form.elements.currency.value = getValue('rideCurrency') || 'R$';
    form.elements.condition.value = 'Horário confirmado';
    form.elements.availability.value = rideFrequencyLabel() || 'Uma vez';
  }

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

  function syncDirectDefaults() {
    if (!directPublishMode) return;
    const price = getValue('price');
    form.elements.priceMode.value = price ? 'Preço fixo' : 'Sob consulta';
    if (![...conditionSelect.options].some((option) => option.value === 'A combinar')) conditionSelect.append(new Option('A combinar', 'A combinar'));
    conditionSelect.value = 'A combinar';
    form.elements.availability.value = 'Sob consulta';
  }

  function loadLegacyProfile() {
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

  async function loadOnlineProfile() {
    try {
      const response = await fetch('/api/local/profile', { headers: { Accept: 'application/json' } });
      const payload = await response.json();
      if (!response.ok || !payload.authenticated || !payload.profile) return;
      ['firstName', 'lastName', 'email'].forEach((name) => {
        form.elements[name].value = payload.profile[name] || '';
      });
      form.elements.whatsapp.value = payload.profile.whatsapp || '';
      form.elements.publicContact.checked = true;
      csrfToken = payload.csrfToken || '';
      try { window.localStorage.removeItem(profileStorageKey); } catch (_) { /* Legacy cleanup is optional. */ }
    } catch (_) {
      // The form remains usable and creates the profile during publication.
    }
  }

  async function loadTurnstileConfig() {
    try {
      const response = await fetch('/api/local/config', { headers: { Accept: 'application/json' } });
      const payload = await response.json();
      if (!response.ok || !payload.ready || !payload.turnstileSiteKey) throw new Error('UNAVAILABLE');
      turnstileSiteKey = payload.turnstileSiteKey;
    } catch (_) {
      turnstileAvailability = 'unavailable';
      if (turnstileStatus) {
        turnstileStatus.hidden = false;
        turnstileStatus.textContent = 'A publicação está temporariamente indisponível. Tente novamente em alguns instantes.';
      }
    }
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
    if (!turnstileContainer || !turnstileSiteKey || turnstileWidgetId !== null) return;
    try {
      await loadTurnstileScript();
      turnstileWidgetId = window.turnstile.render(turnstileContainer, {
        sitekey: turnstileSiteKey,
        theme: 'light',
        callback: (token) => {
          turnstileToken = token;
          turnstileAvailability = 'ready';
          if (turnstileStatus) turnstileStatus.hidden = true;
        },
        'expired-callback': () => { turnstileToken = ''; },
        'error-callback': () => {
          turnstileToken = '';
          turnstileAvailability = 'unavailable';
          if (turnstileStatus) {
            turnstileStatus.hidden = false;
            turnstileStatus.textContent = 'Não foi possível carregar a verificação de segurança.';
          }
        }
      });
      turnstileAvailability = 'ready';
      if (turnstileStatus) turnstileStatus.hidden = true;
    } catch (_) {
      turnstileAvailability = 'unavailable';
      if (turnstileStatus) {
        turnstileStatus.hidden = false;
        turnstileStatus.textContent = 'Não foi possível carregar a verificação de segurança.';
      }
    }
  }

  function resetTurnstile() {
    turnstileToken = '';
    if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  }

  function clearLegacyProfile() {
    try {
      window.localStorage.removeItem(profileStorageKey);
    } catch (_) {
      // Legacy browser storage cleanup is optional.
    }
  }

  function sourceConsentVisibility() {
    if (!sourceConsent) return;
    if (directPublishMode) {
      sourceConsent.hidden = true;
      form.elements.sourceOwnerConsent.checked = false;
      return;
    }
    const visible = Boolean(getValue('sourceUrl'));
    sourceConsent.hidden = !visible;
    if (!visible) form.elements.sourceOwnerConsent.checked = false;
  }

  function prepareOnlineProfile() {
    return {
      firstName: getValue('firstName'),
      lastName: getValue('lastName'),
      email: getValue('email'),
      whatsapp: normalizedWhatsapp(getValue('whatsapp')),
      contactConsent: form.elements.publicContact.checked
    };
  }

  function profileForPreview() {
    return {
      name: `${getValue('firstName')} ${getValue('lastName')}`.trim(),
      whatsapp: normalizedWhatsapp(getValue('whatsapp'))
    };
  }

  function persistProfile() {
    try {
      if (csrfToken) {
        clearLegacyProfile();
        return;
      }
      window.localStorage.setItem(profileStorageKey, JSON.stringify({
        firstName: getValue('firstName'),
        lastName: getValue('lastName'),
        email: getValue('email'),
        whatsapp: normalizedWhatsapp(getValue('whatsapp')),
        publicContact: form.elements.publicContact.checked
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
    currentStep = wizardSequence.includes(nextStep) ? nextStep : wizardSequence[0];
    const currentIndex = sequenceIndex(currentStep);
    steps.forEach((step) => {
      const active = Number(step.dataset.wizardStep) === currentStep;
      step.hidden = !active;
      step.classList.toggle('is-active', active);
    });
    progressItems.forEach((item) => {
      const number = Number(item.dataset.wizardProgress);
      const itemIndex = wizardSequence.indexOf(number);
      item.classList.toggle('is-current', number === currentStep);
      item.classList.toggle('is-complete', itemIndex >= 0 && itemIndex < currentIndex);
      if (number === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    backButton.hidden = currentIndex === 0;
    nextButton.hidden = currentIndex === wizardSequence.length - 1;
    submitButton.hidden = currentIndex !== wizardSequence.length - 1;
    setError();

    if (currentStep === 4) {
      syncCarpoolDefaults();
      initMap();
    }
    if (currentStep === 5) {
      syncCarpoolDefaults();
      renderPreview();
      ensureTurnstile();
    }
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

  function createCarpoolChoice(value, title, copy) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    const body = document.createElement('div');
    const strong = document.createElement('strong');
    const small = document.createElement('small');
    const arrow = document.createElement('span');
    input.type = 'radio';
    input.name = 'subcategory';
    input.value = value;
    input.checked = requestModeFromUrl ? /^Procuro\b/i.test(value) : false;
    strong.textContent = title;
    small.textContent = copy;
    arrow.textContent = '→';
    arrow.setAttribute('aria-hidden', 'true');
    body.append(strong, small);
    label.append(input, body, arrow);
    return label;
  }

  function renderSubcategories() {
    const category = getCategory();
    const subcategoryStep = steps.find((step) => Number(step.dataset.wizardStep) === 2);
    if (directPublishMode && subcategoryStep) subcategoryStep.hidden = !category;
    if (directPublishMode) {
      subcategoryGrid.hidden = true;
      directSubcategoryField.hidden = !category;
      if (renderedCategory === category && directSubcategorySelect.options.length > 1) return;
      renderedCategory = category;
      renderSelectOptions(directSubcategorySelect, [...(subcategories[category] || subcategories.Outro)]);
      updateConditionalFields();
      return;
    }
    directSubcategoryField.hidden = true;
    subcategoryGrid.hidden = false;
    if (renderedCategory === category && subcategoryGrid.querySelector('input[name="subcategory"]')) return;
    renderedCategory = category;
    subcategoryGrid.replaceChildren();
    const legend = document.createElement('legend');
    legend.className = 'sr-only';
    legend.textContent = 'Tipo de anúncio';
    subcategoryGrid.append(legend);
    if (carpoolMode && category === 'Carona compartilhada') {
      subcategoryGrid.append(
        createCarpoolChoice('Ofereço carona ocasional', 'Vou dirigir', 'Tenho lugares disponíveis'),
        createCarpoolChoice('Procuro carona ocasional', 'Preciso de carona', 'Procuro alguém que faça este trajeto')
      );
    } else {
      const choices = [...(subcategories[category] || subcategories.Outro)];
      choices.forEach((value) => subcategoryGrid.append(createChoice('subcategory', value)));
    }
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
      option.textContent = subcategoryLabels[value] || value;
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
      const wrapper = document.createElement(field.type === 'checkboxes' ? 'fieldset' : 'label');
      wrapper.className = `nykuto-field${field.type === 'checkboxes' ? ' nykuto-field-wide nykuto-check-options' : ''}`;
      wrapper.dataset.extraField = field.name;
      if (field.required) wrapper.dataset.extraRequired = 'true';
      const span = document.createElement('span');
      span.textContent = field.label;
      if (field.type === 'checkboxes') {
        const legend = document.createElement('legend');
        legend.textContent = field.label;
        wrapper.append(legend);
        field.options.forEach((option) => {
          const optionLabel = document.createElement('label');
          const input = document.createElement('input');
          const optionText = document.createElement('span');
          input.type = 'checkbox';
          input.name = field.name;
          input.value = option;
          optionText.textContent = option;
          optionLabel.append(input, optionText);
          wrapper.append(optionLabel);
        });
      } else if (field.type === 'select') {
        const select = document.createElement('select');
        select.name = field.name;
        select.append(new Option('Selecione', ''));
        field.options.forEach((option) => select.append(new Option(option, option)));
        wrapper.append(span, select);
      } else {
        const input = document.createElement('input');
        input.type = field.type || 'text';
        input.name = field.name;
        if (field.type !== 'number') input.maxLength = 80;
        input.placeholder = field.placeholder || '';
        if (field.min === 'today') {
          const today = new Date();
          input.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
        else if (field.min !== undefined) input.min = String(field.min);
        if (field.max !== undefined) input.max = String(field.max);
        if (field.type === 'number') input.inputMode = 'numeric';
        wrapper.append(span, input);
      }
      extraCosts.append(wrapper);
    });
  }

  function updateConditionalFields() {
    const category = getCategory() || 'Outro';
    const config = fieldConfig[category] || fieldConfig.Outro;
    const isCarona = category === 'Carona compartilhada';
    if (genericDetails) genericDetails.hidden = isCarona;
    if (genericLogistics) genericLogistics.hidden = isCarona || directPublishMode;
    if (carpoolDestination) carpoolDestination.hidden = !isCarona;
    if (carpoolScheduleFields) carpoolScheduleFields.hidden = !isCarona;
    if (mapPointSelector) mapPointSelector.hidden = !isCarona;
    if (emailField) emailField.hidden = isCarona || directPublishMode;
    if (radiusLabelElement) radiusLabelElement.textContent = isCarona ? 'Raio da saída' : 'Precisão mostrada no anúncio';
    if (mapElement) mapElement.setAttribute('aria-label', isCarona
      ? 'Mapa para marcar a saída e o destino da carona'
      : 'Mapa para ajustar a localização aproximada do anúncio');
    const carpoolRadiusLabels = {
      50: 'Ponto preciso (~50 m)',
      200: 'Raio de 200 m',
      500: 'Raio de 500 m',
      1000: 'Raio de 1.000 m',
      2000: 'Raio de 2.000 m',
      3000: 'Raio de 3.000 m',
      5000: 'Raio de 5.000 m'
    };
    const standardRadiusLabels = {
      50: 'Ponto preciso (~50 m)',
      200: 'Raio de 200 m',
      500: 'Raio de 500 m',
      1000: 'Raio de 1 km',
      2000: 'Raio de 2 km',
      3000: 'Raio de 3 km',
      5000: 'Raio de 5 km'
    };
    [...form.elements.zoneRadiusMeters.options].forEach((option) => {
      const labels = isCarona ? carpoolRadiusLabels : standardRadiusLabels;
      option.textContent = labels[Number(option.value)] || option.textContent;
    });
    conditionLabel.textContent = config.conditionLabel;
    renderSelectOptions(conditionSelect, config.conditions);
    renderSelectOptions(form.elements.availability, config.availability || ['Disponível agora', 'Hoje', 'Esta semana', 'Data flexível', 'Sob consulta']);
    conditionField.hidden = directPublishMode || !config.conditions.length;
    logisticsOptions.replaceChildren();
    const legend = document.createElement('legend');
    legend.textContent = category === 'Imóvel' ? 'Condições da oferta' : isCarona ? 'Encontro, bagagem e trajeto' : 'Entrega ou atendimento';
    logisticsOptions.append(legend, ...config.logistics.map(createCheckbox));
    renderExtraFields(config.extras);
    customsNotice.hidden = category !== 'Compra ou retirada em Foz';
    caronaNotice.hidden = !isCarona;
    priceLabel.textContent = isCarona ? 'Ajuda de custo por pessoa' : 'Preço';
    priceModeLabel.textContent = isCarona ? 'Como dividir os custos' : 'Forma do preço';
    form.elements.price.placeholder = isCarona ? 'Ex.: 5,00' : '0,00';
    form.elements.price.setAttribute('aria-label', isCarona ? 'Ajuda de custo por pessoa, somente números' : 'Preço, somente números');
    form.elements.title.placeholder = isCarona
      ? listingKind() === 'request' ? 'Ex.: Procuro carona até a faculdade às 6h50' : 'Ex.: Carona diária até a faculdade às 6h50'
      : 'Ex.: Sofá 3 lugares em ótimo estado';
    if (!selectedFiles.length) photoHelp.textContent = isCarona
      ? 'A foto do veículo é opcional. Não envie documentos, placas legíveis ou dados pessoais.'
      : 'As fotos serão otimizadas antes da publicação.';
    locationHeading.textContent = isCarona ? 'Qual é o trajeto?' : 'Onde está disponível?';
    locationCopy.textContent = isCarona
      ? 'Informe a saída, o destino e a hora. A rota aparece assim que os dois pontos forem marcados.'
      : 'Localize a zona e escolha a precisão que aparecerá no anúncio.';
    addressLabel.textContent = isCarona ? 'De onde você sai?' : 'Endereço, bairro ou referência';
    availabilityLabel.textContent = isCarona ? 'Frequência' : 'Disponibilidade';
    if (isCarona) {
      form.elements.address.placeholder = 'Bairro, faculdade ou ponto conhecido';
      form.elements.condition.value = 'Horário confirmado';
      if (rideSeatsLabel) rideSeatsLabel.textContent = isCarpoolRequest() ? 'Quantas pessoas?' : 'Lugares disponíveis';
      if (geocodeNote) geocodeNote.textContent = 'O GPS e a busca só são acionados por você. As coordenadas são consultadas no OpenStreetMap/Nominatim; o endereço exato não é publicado.';
      if (contactNote) contactNote.innerHTML = '<strong>Contato direto:</strong> a pessoa interessada falará com você pelo WhatsApp informado.';
      if (confirmCopy) confirmCopy.textContent = 'Confirmo que os dados do trajeto estão corretos.';
      if (reviewNote) reviewNote.innerHTML = '<strong>Pronto para publicar</strong><p>Seu trajeto ficará visível e o contato seguirá diretamente pelo WhatsApp.</p>';
      syncCarpoolDefaults();
      updateRideDateVisibility();
    }
    syncDirectDefaults();
  }

  function updateRideDateVisibility() {
    if (!rideDateField) return;
    const recurring = ['weekdays', 'weekly', 'daily'].includes(getValue('rideFrequency'));
    rideDateField.hidden = recurring;
    if (recurring) form.elements.rideDate.value = '';
  }

  function clearPhotoUrls() {
    photoUrls.forEach((url) => URL.revokeObjectURL(url));
    photoUrls = [];
  }

  function showOptimizedPhotoPreview(index, file) {
    const figure = photoPreview.querySelectorAll('figure')[index];
    if (!figure || !file) return;
    const currentImage = figure.querySelector(':scope > img');
    if (currentImage?.dataset.photoUrl) URL.revokeObjectURL(currentImage.dataset.photoUrl);
    currentImage?.remove();
    figure.querySelector(':scope > .nykuto-photo-fallback')?.remove();
    const image = document.createElement('img');
    const url = URL.createObjectURL(file);
    photoUrls.push(url);
    image.dataset.photoUrl = url;
    image.src = url;
    image.alt = `Prévia otimizada da foto ${index + 1}`;
    image.addEventListener('error', () => {
      image.remove();
      const fallback = document.createElement('span');
      fallback.className = 'nykuto-photo-fallback';
      fallback.textContent = 'Foto pronta';
      figure.prepend(fallback);
    }, { once: true });
    figure.prepend(image);
  }

  function renderPhotos() {
    clearPhotoUrls();
    photoPreview.replaceChildren();
    photoHelp.classList.remove('is-valid', 'is-invalid');
    selectedFiles.forEach((_, index) => {
      const figure = document.createElement('figure');
      const button = document.createElement('button');
      const fallback = document.createElement('span');
      fallback.className = 'nykuto-photo-fallback';
      fallback.textContent = 'A verificar';
      figure.append(fallback);
      button.type = 'button';
      button.dataset.removePhoto = String(index);
      button.setAttribute('aria-label', `Remover foto ${index + 1}`);
      button.textContent = '×';
      figure.append(button);
      photoPreview.append(figure);
    });
    photoHelp.textContent = selectedFiles.length
      ? `${selectedFiles.length} foto${selectedFiles.length > 1 ? 's' : ''} pronta${selectedFiles.length > 1 ? 's' : ''} para otimização e publicação.`
      : getCategory() === 'Carona compartilhada'
        ? 'A foto do veículo é opcional. Não envie documentos, placas legíveis ou dados pessoais.'
        : 'As fotos serão otimizadas antes da publicação.';
    photoPreview.dispatchEvent(new CustomEvent('nykuto:photos-rendered'));
  }

  function handlePhotos() {
    const incoming = [...(photoInput.files || [])];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence'];
    const invalid = incoming.find((file) => {
      const allowedExtension = /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name);
      return (!allowedTypes.includes(String(file.type || '').toLocaleLowerCase('en-US')) && !allowedExtension)
        || file.size > MAX_SOURCE_PHOTO_BYTES;
    });
    if (invalid) {
      selectedFiles = [];
      photoInput.value = '';
      renderPhotos();
      photoHelp.classList.remove('is-valid');
      photoHelp.classList.add('is-invalid');
      photoHelp.textContent = 'Use fotos JPG, PNG, WebP ou HEIC/HEIF com até 25 MB cada.';
      setError('Use fotos JPG, PNG, WebP ou HEIC/HEIF com até 25 MB cada.');
      return;
    }
    selectedFiles = incoming.slice(0, MAX_PHOTO_COUNT);
    photoHelp.classList.remove('is-valid', 'is-invalid');
    if (incoming.length > MAX_PHOTO_COUNT) setError('Somente as duas primeiras fotos foram mantidas.');
    else setError();
    renderPhotos();
  }

  function extraFieldValue(wrapper) {
    const checked = [...wrapper.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
    if (wrapper.querySelector('input[type="checkbox"]')) return checked.join(', ');
    return String(wrapper.querySelector('input, select')?.value || '').trim();
  }

  function validateStep(step) {
    if (step === 1 && !getCategory()) return 'Escolha uma categoria para continuar.';
    if (step === 2 && !getSubcategory()) return carpoolMode ? 'Escolha se você vai dirigir ou se precisa de carona.' : 'Escolha o tipo do anúncio.';
    if (step === 3) {
      if (carpoolMode) return '';
      if (getValue('title').length < 4) return 'Escreva um título com pelo menos 4 caracteres.';
      if (listingKind() === 'offer' && ['Produto', 'Imóvel'].includes(getCategory()) && selectedFiles.length === 0) return 'Adicione pelo menos uma foto para este tipo de anúncio.';
      if (directPublishMode) {
        syncDirectDefaults();
        if (getValue('price') && !hasValidPrice(getValue('price'))) return 'Informe um preço válido, somente com números e separadores, ou deixe o preço em branco.';
        return '';
      }
      if (!getValue('priceMode')) return 'Escolha como o preço será apresentado.';
      if (['Preço fixo', 'Negociável'].includes(getValue('priceMode')) && !hasValidPrice(getValue('price'))) return 'Informe um preço válido, somente com números e separadores, ou escolha “Sob consulta”.';
      if (!getValue('condition')) return 'Escolha o estado ou a modalidade do anúncio.';
      if (getValue('sourceUrl') && !form.elements.sourceUrl.checkValidity()) return 'Confira o link do anúncio original.';
      if (getValue('sourceUrl') && !form.elements.sourceOwnerConsent.checked) return 'Confirme que você é o autor antes de republicar um anúncio existente.';
    }
    if (step === 4) {
      if (!getValue('latitude') || !getValue('longitude')) return 'Localize o endereço ou toque no mapa para definir a zona aproximada.';
      if (carpoolMode) {
        if (publicRidePlace(getValue('rideDestination')).length < 2) return 'Informe uma zona ou um ponto público de destino, sem endereço exato.';
        if (!getValue('rideDestinationLatitude') || !getValue('rideDestinationLongitude')) return 'Escolha um destino frequente, localize o destino ou marque-o diretamente no mapa.';
        if (!getValue('rideFrequency')) return 'Escolha a frequência da carona.';
        if (getValue('rideFrequency') === 'once' && !getValue('rideDate')) return 'Escolha a data da viagem.';
        if (!/^\d{2}:\d{2}$/.test(getValue('rideTime'))) return 'Informe o horário de saída.';
        const seats = Number(getValue('rideSeats'));
        if (!Number.isInteger(seats) || seats < 1 || seats > 8) return 'Informe entre 1 e 8 lugares ou pessoas.';
        const contribution = getValue('rideContribution');
        if (contribution && (!/^\d+$/.test(contribution) || Number(contribution) < 1)) return 'Use um valor inteiro positivo ou deixe a contribuição em branco.';
        const rideDate = getValue('rideDate');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (rideDate && new Date(`${rideDate}T00:00:00`).getTime() < today.getTime()) return 'Escolha uma data de viagem de hoje em diante.';
        syncCarpoolDefaults();
        return '';
      }
      if (!directPublishMode && !getValue('availability')) return 'Escolha quando a oferta estará disponível.';
      if (!directPublishMode && getCategory() === 'Produto' && form.querySelectorAll('input[name="logistics"]:checked').length === 0) return 'Escolha pelo menos uma opção de retirada, entrega ou envio.';
    }
    if (step === 5) {
      if (getValue('firstName').length < 2) return 'Informe seu nome.';
      if (getValue('lastName').length < 2) return 'Informe seu sobrenome.';
      if (getValue('email') && !form.elements.email.checkValidity()) return 'Confira o endereço de e-mail.';
      if (!normalizedWhatsapp(getValue('whatsapp'))) return 'Informe o WhatsApp com código do país e entre 8 e 15 dígitos.';
      if (!form.elements.publicContact.checked) return 'Autorize o contato direto pelo WhatsApp para publicar.';
      if (!form.elements.confirm.checked) return 'Confirme as informações antes de continuar.';
      if (turnstileAvailability === 'loading') return 'Aguarde o carregamento da verificação de segurança.';
      if (turnstileAvailability === 'unavailable') return 'A publicação está temporariamente indisponível. Tente novamente em alguns instantes.';
      if (!turnstileToken) return 'Conclua a verificação de segurança antes de publicar.';
    }
    return '';
  }

  function focusDirectSection(step) {
    if (!directPublishMode) return;
    const section = steps.find((entry) => Number(entry.dataset.wizardStep) === step);
    if (!section) return;
    let control = section.querySelector('input:not([type="hidden"]), textarea, select, button');
    if (step === 3) {
      if (getValue('title').length < 4) control = form.elements.title;
      else if (listingKind() === 'offer' && ['Produto', 'Imóvel'].includes(getCategory()) && selectedFiles.length === 0) control = photoInput;
      else if (getValue('price') && !hasValidPrice(getValue('price'))) control = form.elements.price;
    }
    if (step === 4) control = form.elements.address;
    if (step === 5) {
      if (getValue('firstName').length < 2) control = form.elements.firstName;
      else if (getValue('lastName').length < 2) control = form.elements.lastName;
      else if (!normalizedWhatsapp(getValue('whatsapp'))) control = form.elements.whatsapp;
      else if (!form.elements.publicContact.checked) control = form.elements.publicContact;
      else if (!form.elements.confirm.checked) control = form.elements.confirm;
      else if (!turnstileToken) {
        turnstileContainer.tabIndex = -1;
        control = turnstileContainer;
      }
    }
    if (control === turnstileContainer) {
      turnstileContainer.scrollIntoView({ block: 'center', behavior: 'smooth' });
      window.setTimeout(() => control.focus({ preventScroll: true }), 220);
      return;
    }
    section.scrollIntoView({ block: 'start', behavior: 'smooth' });
    window.setTimeout(() => control?.focus({ preventScroll: true }), 220);
  }

  function storedRideDestinationCoordinates() {
    const latitude = Number(getValue('rideDestinationLatitude'));
    const longitude = Number(getValue('rideDestinationLongitude'));
    return getValue('rideDestinationLatitude') && getValue('rideDestinationLongitude')
      && Number.isFinite(latitude) && Number.isFinite(longitude)
      ? [latitude, longitude]
      : null;
  }

  function setMapPointMode(mode) {
    if (!carpoolMode || !['origin', 'destination'].includes(mode)) return;
    activeMapPoint = mode;
    mapPointButtons.forEach((button) => {
      const active = button.dataset.mapPoint === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (mapElement) mapElement.dataset.mapPoint = mode;
    if (mode === 'origin') locationStatus.textContent = 'Toque no mapa para marcar de onde você sai.';
    else if (rideRouteStatus) rideRouteStatus.textContent = 'Toque no mapa para marcar para onde você vai.';
  }

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function useNominatimSlot(task) {
    const run = geocodeQueue.then(async () => {
      const elapsed = Date.now() - lastGeocodeAt;
      if (elapsed < 1000) await wait(1000 - elapsed);
      lastGeocodeAt = Date.now();
      try {
        return await task();
      } finally {
        const remaining = 1000 - (Date.now() - lastGeocodeAt);
        if (remaining > 0) await wait(remaining);
      }
    });
    geocodeQueue = run.catch(() => undefined);
    return run;
  }

  function ensureMapPanelVisible() {
    if (!mapPanel) return;
    if (directPublishMode) {
      mapPanel.hidden = false;
      mapToggleButton?.setAttribute('aria-expanded', 'true');
      if (mapToggleButton) mapToggleButton.textContent = 'Ocultar mapa';
    }
    initMap();
    window.setTimeout(() => listingMap?.invalidateSize(), 80);
  }

  function initMap() {
    if (directPublishMode && mapPanel?.hidden) return;
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
      if (carpoolMode && activeMapPoint === 'destination') {
        if (!isPilotCoordinate(event.latlng.lat, event.latlng.lng)) {
          if (rideRouteStatus) rideRouteStatus.textContent = 'Esse ponto fica fora da região atendida. Escolha outro ponto entre CDE e Foz.';
          return;
        }
        void setRideDestination(event.latlng.lat, event.latlng.lng, getValue('rideDestination') || 'Destino escolhido no mapa', { manual: true })
          .then((updated) => {
            if (updated) return reverseGeocodePoint(event.latlng.lat, event.latlng.lng, { destination: true });
            return null;
          });
        return;
      }
      if (setLocation(event.latlng.lat, event.latlng.lng, carpoolMode ? 'Saída escolhida no mapa' : 'Zona escolhida no mapa', true)) {
        void reverseGeocodePoint(event.latlng.lat, event.latlng.lng);
      } else {
        locationStatus.textContent = 'Esse ponto fica fora da região atendida. Escolha outro ponto entre Ciudad del Este e Foz.';
      }
    });
    const storedCoordinates = [Number(getValue('latitude')), Number(getValue('longitude'))];
    if (storedCoordinates.every(Number.isFinite) && getValue('latitude') && getValue('longitude')) {
      setLocation(storedCoordinates[0], storedCoordinates[1], getValue('locationLabel') || 'Zona escolhida');
    }
    setTimeout(() => listingMap.invalidateSize(), 100);
  }

  function setLocation(lat, lng, label, manual = false) {
    if (!isPilotCoordinate(lat, lng)) return false;
    const coordinates = [roundPublicCoordinate(lat), roundPublicCoordinate(lng)];
    if (!coordinates.every(Number.isFinite)) return false;
    currentLocationRequestId += 1;
    addressSearchRequestId += 1;
    if (currentLocationPending) setCurrentLocationPending(false);
    reverseGeocodeRequestIds.origin += 1;
    const previousCoordinates = [Number(getValue('latitude')), Number(getValue('longitude'))];
    if (carpoolMode && previousCoordinates.every(Number.isFinite) && getValue('latitude') && getValue('longitude')
      && (Math.abs(previousCoordinates[0] - coordinates[0]) > .00001 || Math.abs(previousCoordinates[1] - coordinates[1]) > .00001)) clearRideRoute({ clearDestination: false });
    form.elements.confirm.checked = false;
    form.elements.latitude.value = coordinates[0].toFixed(4);
    form.elements.longitude.value = coordinates[1].toFixed(4);
    form.elements.locationLabel.value = label;
    syncCarpoolDefaults();
    if (manual) form.elements.address.value = '';
    if (!listingMap) initMap();
    if (!listingMap || !window.L) {
      locationStatus.textContent = directPublishMode && mapPanel?.hidden
        ? `Zona definida · ${publicZoneSummary(coordinates[0], coordinates[1])}. Use “Ajustar no mapa” se quiser mover o ponto.`
        : 'Zona definida. O mapa não pôde ser exibido, mas a referência foi mantida.';
      if (carpoolMode && storedRideDestinationCoordinates() && rideRouteStatus) {
        rideRouteStatus.textContent = 'Saída e destino salvos. O mapa não conseguiu mostrar a rota agora.';
      }
      locationResults.hidden = true;
      return true;
    }
    if (!locationMarker) {
      locationMarker = window.L.marker(coordinates, { draggable: true, autoPan: true }).addTo(listingMap);
      locationMarker.on('dragend', (event) => {
        const point = event.target.getLatLng();
        if (setLocation(point.lat, point.lng, carpoolMode ? 'Saída ajustada no mapa' : 'Zona ajustada no mapa', true)) {
          void reverseGeocodePoint(point.lat, point.lng);
        } else {
          const previous = [Number(getValue('latitude')), Number(getValue('longitude'))];
          if (previous.every(Number.isFinite) && getValue('latitude') && getValue('longitude')) event.target.setLatLng(previous);
          locationStatus.textContent = 'Esse ponto fica fora da região atendida. O marcador voltou à posição anterior.';
        }
      });
    }
    else locationMarker.setLatLng(coordinates);
    if (!privacyCircle) {
      privacyCircle = window.L.circle(coordinates, {
        radius: zoneRadiusMeters(),
        color: '#174f43',
        fillColor: '#5ba388',
        fillOpacity: 0.18,
        weight: 2
      }).addTo(listingMap);
    } else {
      privacyCircle.setLatLng(coordinates);
      privacyCircle.setRadius(zoneRadiusMeters());
    }
    listingMap.fitBounds(privacyCircle.getBounds(), { padding: [18, 18] });
    locationStatus.textContent = `${manual ? 'Ponto definido' : 'Endereço localizado'} · ${publicZoneSummary(coordinates[0], coordinates[1])}.`;
    locationResults.hidden = true;
    if (carpoolMode) {
      const destination = storedRideDestinationCoordinates();
      if (destination) void refreshRideRoute(destination[0], destination[1]);
      else setMapPointMode('destination');
    }
    return true;
  }

  function clearResolvedLocation() {
    currentLocationRequestId += 1;
    addressSearchRequestId += 1;
    if (currentLocationPending) setCurrentLocationPending(false);
    reverseGeocodeRequestIds.origin += 1;
    if (!getValue('latitude') && !getValue('longitude')) return;
    if (carpoolMode) clearRideRoute({ clearDestination: false });
    form.elements.latitude.value = '';
    form.elements.longitude.value = '';
    form.elements.locationLabel.value = '';
    if (listingMap && locationMarker) listingMap.removeLayer(locationMarker);
    if (listingMap && privacyCircle) listingMap.removeLayer(privacyCircle);
    locationMarker = null;
    privacyCircle = null;
    locationResults.hidden = true;
    locationStatus.textContent = 'Endereço alterado. Toque em “Buscar” para atualizar a zona aproximada.';
    if (carpoolMode) setMapPointMode('origin');
  }

  function publicLocationFromResult(result) {
    const address = result.address || {};
    const district = address.neighbourhood || address.suburb || address.quarter || address.city_district;
    const city = address.city || address.town || address.municipality || address.village;
    return [district, city].filter(Boolean).join(', ') || city || 'Região de CDE/Foz';
  }

  async function reverseGeocodePoint(lat, lng, { destination = false } = {}) {
    if (!isPilotCoordinate(lat, lng)) return null;
    const coordinates = [roundPublicCoordinate(lat), roundPublicCoordinate(lng)];
    const target = destination ? 'destination' : 'origin';
    const requestId = ++reverseGeocodeRequestIds[target];
    const cacheKey = `${coordinates[0].toFixed(4)},${coordinates[1].toFixed(4)}`;
    try {
      let result = reverseGeocodeCache.get(cacheKey);
      if (!result) {
        result = await useNominatimSlot(async () => {
          const params = new URLSearchParams({
            lat: coordinates[0].toFixed(4),
            lon: coordinates[1].toFixed(4),
            format: 'jsonv2',
            addressdetails: '1',
            zoom: '16',
            'accept-language': 'pt-BR'
          });
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, { headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('REVERSE_GEOCODING_UNAVAILABLE');
          return response.json();
        });
        reverseGeocodeCache.set(cacheKey, result);
      }
      if (requestId !== reverseGeocodeRequestIds[target]) return null;
      const publicLabel = publicLocationFromResult(result);
      if (destination) {
        form.elements.rideDestination.value = publicRidePlace(publicLabel) || 'Destino escolhido no mapa';
        syncCarpoolDefaults();
        if (rideRouteStatus) rideRouteStatus.textContent = `Destino definido · ${form.elements.rideDestination.value}.`;
      } else {
        form.elements.address.value = result.display_name || publicLabel;
        form.elements.locationLabel.value = publicLabel;
        syncCarpoolDefaults();
        locationStatus.textContent = `Ponto definido · ${publicLabel} · ${publicZoneSummary(coordinates[0], coordinates[1])}.`;
      }
      return result;
    } catch (_) {
      if (requestId !== reverseGeocodeRequestIds[target]) return null;
      if (destination && rideRouteStatus) rideRouteStatus.textContent = 'Destino definido no mapa. O nome da zona não pôde ser carregado agora.';
      else locationStatus.textContent = `Ponto definido · ${publicZoneSummary(coordinates[0], coordinates[1])}. O nome da zona não pôde ser carregado agora.`;
      return null;
    }
  }

  function setCurrentLocationPending(pending) {
    currentLocationPending = pending;
    if (!currentLocationButton) return;
    currentLocationButton.disabled = pending;
    currentLocationButton.setAttribute('aria-busy', String(pending));
    const title = currentLocationButton.querySelector('strong');
    const detail = currentLocationButton.querySelector('small');
    if (title) title.textContent = pending ? 'Localizando…' : 'Usar minha localização';
    if (detail) detail.textContent = pending ? 'Aguarde a resposta do aparelho' : 'O navegador pedirá sua autorização';
  }

  function locateCurrentPosition() {
    if (currentLocationPending) return;
    addressSearchRequestId += 1;
    setError();
    const requestId = ++currentLocationRequestId;
    if (!window.isSecureContext || !navigator.geolocation) {
      locationStatus.textContent = 'Este navegador não liberou o GPS. Abra no Safari/Chrome, busque uma referência ou marque o ponto no mapa.';
      return;
    }
    setCurrentLocationPending(true);
    locationStatus.textContent = 'Aguardando a autorização de localização…';
    navigator.geolocation.getCurrentPosition((position) => {
      if (requestId !== currentLocationRequestId) return;
      setCurrentLocationPending(false);
      const { latitude, longitude, accuracy } = position.coords || {};
      if (!isPilotCoordinate(latitude, longitude)) {
        locationStatus.textContent = 'Sua posição atual está fora da região atendida entre Ciudad del Este e Foz. Busque uma referência dentro da região.';
        return;
      }
      ensureMapPanelVisible();
      if (!setLocation(latitude, longitude, 'Localização atual')) {
        locationStatus.textContent = 'Não foi possível marcar esta posição. Busque uma referência ou toque no mapa.';
        return;
      }
      const accuracyText = deviceAccuracyLabel(accuracy);
      locationStatus.textContent = `Localização encontrada${accuracyText ? ` · ${accuracyText}` : ''}. Você pode mover o ponto ou mudar o raio.`;
      void reverseGeocodePoint(latitude, longitude);
    }, (error) => {
      if (requestId !== currentLocationRequestId) return;
      setCurrentLocationPending(false);
      locationStatus.textContent = geolocationErrorMessage(error);
    }, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    });
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
    locationResults.hidden = directPublishMode;
    locationStatus.textContent = directPublishMode
      ? `Zona localizada · ${publicZoneSummary(firstResult.lat, firstResult.lon)}. Use “Ajustar no mapa” se quiser mover o ponto.`
      : 'O primeiro resultado já aparece no mapa. Escolha outro abaixo se necessário.';
  }

  async function searchAddress() {
    if (geocodePending) return;
    currentLocationRequestId += 1;
    if (currentLocationPending) setCurrentLocationPending(false);
    const query = getValue('address');
    if (query.length < 4) {
      setError('Digite pelo menos 4 caracteres para buscar o endereço.');
      form.elements.address.focus();
      return;
    }
    const requestId = ++addressSearchRequestId;
    setError();
    const cacheKey = query.toLocaleLowerCase('pt-BR');
    if (geocodeCache.has(cacheKey)) {
      if (requestId !== addressSearchRequestId || getValue('address') !== query) return;
      renderLocationResults(geocodeCache.get(cacheKey));
      return;
    }
    geocodePending = true;
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
      const payload = await useNominatimSlot(async () => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Geocoding unavailable');
        return response.json();
      });
      const results = Array.isArray(payload) ? payload : [];
      geocodeCache.set(cacheKey, results);
      if (requestId !== addressSearchRequestId || getValue('address') !== query) return;
      renderLocationResults(results);
    } catch (_error) {
      if (requestId !== addressSearchRequestId || getValue('address') !== query) return;
      locationResults.hidden = true;
      locationStatus.textContent = 'A busca não respondeu. Você pode tocar diretamente no mapa para marcar a zona.';
    } finally {
      addressSearchButton.disabled = false;
      addressSearchButton.textContent = 'Buscar';
      geocodePending = false;
    }
  }

  function clearRideRoute({ clearDestination = true } = {}) {
    rideRouteRequestId += 1;
    if (clearDestination) reverseGeocodeRequestIds.destination += 1;
    if (listingMap && rideRouteLayer) listingMap.removeLayer(rideRouteLayer);
    rideRouteLayer = null;
    if (clearDestination) {
      rideDestinationRequestId += 1;
      form.elements.rideDestinationLatitude.value = '';
      form.elements.rideDestinationLongitude.value = '';
      if (listingMap && rideDestinationMarker) listingMap.removeLayer(rideDestinationMarker);
      rideDestinationMarker = null;
      if (campusDestinationSelect) campusDestinationSelect.value = '';
    }
    if (rideRouteStatus && carpoolMode) rideRouteStatus.textContent = clearDestination
      ? 'Escolha um destino frequente ou marque o ponto diretamente no mapa.'
      : 'Saída alterada. O trajeto será atualizado com o destino já marcado.';
  }

  function updateRadiusPresentation() {
    if (privacyCircle) {
      privacyCircle.setRadius(zoneRadiusMeters());
      const visibleBounds = carpoolMode && rideRouteLayer ? rideRouteLayer.getBounds() : privacyCircle.getBounds();
      listingMap?.fitBounds(visibleBounds, { padding: carpoolMode && rideRouteLayer ? [28, 28] : [18, 18] });
    }
    if (getValue('latitude') && getValue('longitude')) locationStatus.textContent = `Zona definida · ${radiusLabel()} no anúncio.`;
    if (mapPrivacyCopy) mapPrivacyCopy.innerHTML = carpoolMode
      ? `<strong>Raio da saída</strong> O anúncio mostrará ${radiusLabel()} ao redor do ponto marcado. Use sempre um local público e seguro.`
      : zoneRadiusMeters() <= 200
        ? `<strong>Localização bem precisa</strong> Escolha um ponto público e seguro: o anúncio mostrará ${radiusLabel()}.`
        : `<strong>Precisão escolhida por você</strong> O anúncio mostrará ${radiusLabel()}; o endereço digitado não será publicado.`;
  }

  function toggleMapPanel() {
    if (!directPublishMode || !mapPanel) return;
    mapPanel.hidden = !mapPanel.hidden;
    mapToggleButton.setAttribute('aria-expanded', String(!mapPanel.hidden));
    mapToggleButton.textContent = mapPanel.hidden ? 'Ajustar no mapa' : 'Ocultar mapa';
    if (!mapPanel.hidden) {
      initMap();
      window.setTimeout(() => listingMap?.invalidateSize(), 80);
    }
  }

  function showRideDestinationMarker(destinationLatitude, destinationLongitude) {
    if (!listingMap || !window.L) return;
    const coordinates = [destinationLatitude, destinationLongitude];
    if (!rideDestinationMarker) {
      rideDestinationMarker = window.L.circleMarker(coordinates, {
        radius: 8,
        color: '#8d641b',
        fillColor: '#dfbd6c',
        fillOpacity: 1,
        weight: 3
      }).addTo(listingMap);
    } else rideDestinationMarker.setLatLng(coordinates);
  }

  async function drawRideRoute(destinationLatitude, destinationLongitude, requestId) {
    if (!listingMap || !window.L) initMap();
    const originLatitude = Number(getValue('latitude'));
    const originLongitude = Number(getValue('longitude'));
    if (![originLatitude, originLongitude, destinationLatitude, destinationLongitude].every(Number.isFinite)) throw new Error('ROUTE_LOCATION_MISSING');
    if (!listingMap || !window.L) return false;
    let routeCoordinates = [[originLatitude, originLongitude], [destinationLatitude, destinationLongitude]];
    let roadRoute = false;
    try {
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${originLongitude},${originLatitude};${destinationLongitude},${destinationLatitude}?overview=simplified&geometries=geojson`;
      const response = await fetch(routeUrl, { headers: { Accept: 'application/json' } });
      const payload = response.ok ? await response.json() : null;
      const coordinates = payload?.routes?.[0]?.geometry?.coordinates;
      if (Array.isArray(coordinates) && coordinates.length > 1) {
        routeCoordinates = coordinates.map(([longitude, latitude]) => [latitude, longitude]);
        roadRoute = true;
      }
    } catch (_) {
      // A straight connection remains visible when the public router is busy.
    }
    if (requestId !== rideRouteRequestId) return null;
    if (rideRouteLayer) listingMap.removeLayer(rideRouteLayer);
    rideRouteLayer = window.L.polyline(routeCoordinates, { color: '#b78728', weight: 5, opacity: .86, dashArray: roadRoute ? undefined : '9 8' }).addTo(listingMap);
    showRideDestinationMarker(destinationLatitude, destinationLongitude);
    listingMap.fitBounds(rideRouteLayer.getBounds(), { padding: [28, 28] });
    return roadRoute;
  }

  async function refreshRideRoute(destinationLatitude, destinationLongitude) {
    const requestId = ++rideRouteRequestId;
    if (!getValue('latitude') || !getValue('longitude')) {
      showRideDestinationMarker(destinationLatitude, destinationLongitude);
      listingMap?.setView([destinationLatitude, destinationLongitude], 15);
      if (rideRouteStatus) rideRouteStatus.textContent = 'Destino marcado. Agora marque de onde você sai.';
      setMapPointMode('origin');
      return false;
    }
    if (!listingMap || !window.L) {
      if (rideRouteStatus) rideRouteStatus.textContent = 'Saída e destino salvos. O mapa não conseguiu mostrar a rota agora.';
      return false;
    }
    try {
      const roadRoute = await drawRideRoute(destinationLatitude, destinationLongitude, requestId);
      if (roadRoute === null || requestId !== rideRouteRequestId) return false;
      if (rideRouteStatus) rideRouteStatus.textContent = roadRoute
        ? 'Rota sugerida pronta. Você ainda pode ajustar a saída ou o destino tocando no mapa.'
        : 'Ligação aproximada pronta. Confirme o caminho e o ponto de embarque pelo WhatsApp.';
      return roadRoute;
    } catch (_) {
      if (rideRouteStatus) rideRouteStatus.textContent = 'Os pontos foram salvos, mas não foi possível mostrar a rota agora.';
      return false;
    }
  }

  async function setRideDestination(lat, lng, label, { manual = false, requestId = null } = {}) {
    const destinationRequestId = requestId ?? ++rideDestinationRequestId;
    if (destinationRequestId !== rideDestinationRequestId || !isPilotCoordinate(lat, lng)) return false;
    const coordinates = [roundPublicCoordinate(lat), roundPublicCoordinate(lng)];
    if (!coordinates.every(Number.isFinite)) return false;
    reverseGeocodeRequestIds.destination += 1;
    const publicLabel = publicRidePlace(label) || 'Destino escolhido no mapa';
    form.elements.confirm.checked = false;
    form.elements.rideDestination.value = publicLabel;
    form.elements.rideDestinationLatitude.value = coordinates[0].toFixed(4);
    form.elements.rideDestinationLongitude.value = coordinates[1].toFixed(4);
    if (campusDestinationSelect) {
      const matchingOption = [...campusDestinationSelect.options].find((option) => option.value === publicLabel);
      campusDestinationSelect.value = matchingOption ? publicLabel : '';
    }
    if (!listingMap) initMap();
    showRideDestinationMarker(coordinates[0], coordinates[1]);
    await refreshRideRoute(coordinates[0], coordinates[1]);
    if (destinationRequestId !== rideDestinationRequestId) return false;
    if (manual && rideRouteStatus && getValue('latitude') && listingMap && window.L) rideRouteStatus.textContent = 'Destino ajustado no mapa. A rota sugerida foi atualizada.';
    syncCarpoolDefaults();
    return true;
  }

  async function searchRideDestination() {
    if (!carpoolMode || rideRoutePending) return;
    const query = getValue('rideDestination');
    if (query.length < 3) {
      setError('Informe o bairro, faculdade ou ponto conhecido de destino.');
      form.elements.rideDestination.focus();
      return;
    }
    setError();
    const requestId = ++rideDestinationRequestId;
    rideRoutePending = true;
    rideDestinationSearchButton.disabled = true;
    rideDestinationSearchButton.textContent = 'Localizando…';
    rideRouteStatus.textContent = 'Localizando o destino no mapa…';
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'jsonv2',
        addressdetails: '0',
        limit: '1',
        countrycodes: 'py,br',
        viewbox: '-55.0,-24.9,-54.3,-25.8',
        bounded: '1',
        'accept-language': 'pt-BR'
      });
      const payload = await useNominatimSlot(async () => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('ROUTE_LOOKUP_FAILED');
        return response.json();
      });
      const result = Array.isArray(payload) ? payload[0] : null;
      const latitude = Number(result?.lat);
      const longitude = Number(result?.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error('ROUTE_NOT_FOUND');
      if (requestId !== rideDestinationRequestId) return;
      await setRideDestination(latitude, longitude, query, { requestId });
    } catch (error) {
      if (requestId !== rideDestinationRequestId) return;
      clearRideRoute();
      rideRouteStatus.textContent = error.message === 'ROUTE_NOT_FOUND'
        ? 'Destino não encontrado. Tente um bairro ou ponto conhecido próximo.'
        : 'Não foi possível traçar a rota agora. Tente novamente.';
    } finally {
      rideDestinationSearchButton.disabled = false;
      rideDestinationSearchButton.textContent = 'Buscar';
      rideRoutePending = false;
    }
  }

  function checkedLogistics() {
    return [...form.querySelectorAll('input[name="logistics"]:checked')].map((input) => input.value);
  }

  function priceText() {
    if (carpoolMode) {
      const contribution = getValue('rideContribution');
      return contribution ? `Contribuição ${getValue('rideCurrency') || 'R$'} ${contribution} por pessoa` : 'Contribuição a combinar';
    }
    const mode = getValue('priceMode');
    if (mode === 'Grátis' || mode === 'Sob consulta') return mode;
    return `${getValue('currency')} ${getValue('price')} · ${mode}`;
  }

  function dynamicExtraValues() {
    if (carpoolMode) {
      const values = [
        { label: 'Ponto de partida', value: publicRidePlace(getValue('locationLabel')) },
        { label: 'Destino', value: publicRidePlace(getValue('rideDestination')) },
        { label: 'Data da viagem', value: getValue('rideDate') },
        { label: 'Horário de saída', value: getValue('rideTime') },
        { label: 'Frequência', value: rideFrequencyLabel() },
        { label: isCarpoolRequest() ? 'Número de passageiros' : 'Lugares disponíveis', value: getValue('rideSeats') }
      ];
      return values.filter((item) => item.value);
    }
    if (!extraCosts) return [];
    return [...extraCosts.querySelectorAll('[data-extra-field]')]
      .map((wrapper) => ({
        label: wrapper.querySelector('span, legend')?.textContent || wrapper.dataset.extraField,
        value: extraFieldValue(wrapper)
      }))
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
    syncCarpoolDefaults();
    preview.replaceChildren();
    const card = document.createElement('article');
    const media = document.createElement('div');
    const body = document.createElement('div');
    media.className = 'nykuto-preview-media';
    body.className = 'nykuto-preview-body';
    if (!carpoolMode) {
      if (photoUrls[0]) {
        const image = document.createElement('img');
        image.src = photoUrls[0];
        image.alt = 'Foto principal selecionada';
        image.addEventListener('error', () => {
          image.remove();
          appendText(media, 'span', getCategory().slice(0, 1), 'nykuto-preview-placeholder');
        }, { once: true });
        media.append(image);
      } else appendText(media, 'span', getCategory().slice(0, 1), 'nykuto-preview-placeholder');
      appendText(media, 'b', `${selectedFiles.length} foto${selectedFiles.length === 1 ? '' : 's'}`);
    } else {
      card.classList.add('is-carona');
      const route = document.createElement('div');
      route.className = 'nykuto-preview-route';
      const origin = document.createElement('div');
      const destination = document.createElement('div');
      appendText(origin, 'span', getValue('rideTime') || 'Saída');
      appendText(origin, 'strong', getValue('locationLabel') || 'Origem');
      appendText(destination, 'span', rideFrequencyLabel() || 'Trajeto');
      appendText(destination, 'strong', publicRidePlace(getValue('rideDestination')) || 'Destino');
      route.append(origin, destination);
      body.append(route);
    }
    appendText(body, 'small', `${getCategory()} · ${carpoolMode ? resolvedCarpoolSubcategory() : getSubcategory()}`);
    if (!carpoolMode) appendText(body, 'h3', getValue('title'));
    appendText(body, 'strong', priceText());
    if (!carpoolMode) {
      const chips = document.createElement('div');
      chips.className = 'nykuto-preview-chips';
      [getValue('condition'), [getValue('locationLabel'), localReferenceLabel(), radiusLabel()].filter(Boolean).join(' · '), ...checkedLogistics()].filter(Boolean).forEach((value) => appendText(chips, 'span', value));
      body.append(chips);
    }
    if (getValue('description')) appendText(body, 'p', getValue('description'));
    const extras = dynamicExtraValues().filter((item) => !carpoolMode || ['Data da viagem', 'Lugares disponíveis', 'Número de passageiros'].includes(item.label));
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
    if (carpoolMode) card.append(body);
    else card.append(media, body);
    preview.append(card);
  }

  function numericPrice(value) {
    const raw = String(value || '').replace(/\s/g, '');
    const lastSeparator = Math.max(raw.lastIndexOf(','), raw.lastIndexOf('.'));
    const decimalDigits = lastSeparator >= 0 ? raw.length - lastSeparator - 1 : 0;
    const normalized = lastSeparator >= 0 && decimalDigits > 0 && decimalDigits <= 2
      ? `${raw.slice(0, lastSeparator).replace(/\D/g, '')}.${raw.slice(lastSeparator + 1).replace(/\D/g, '')}`
      : raw.replace(/\D/g, '');
    const number = Number(normalized);
    return Number.isFinite(number) ? Math.round(number) : null;
  }

  function listingKind() {
    if (getCategory() === 'Carona compartilhada') return /^Procuro\b/i.test(getSubcategory()) ? 'request' : 'offer';
    if (requestModeFromUrl) return 'request';
    return 'offer';
  }

  function publishButtonLabel() {
    if (carpoolMode) return 'Publicar carona';
    return requestModeFromUrl ? 'Publicar pedido' : 'Publicar anúncio';
  }

  function listingPayload() {
    syncCarpoolDefaults();
    const priceModes = { 'Preço fixo': 'fixed', Negociável: 'negotiable', 'Sob consulta': 'quote', Grátis: 'free' };
    const currencies = { 'R$': 'BRL', 'Gs.': 'PYG', 'US$': 'USD' };
    const priceMode = priceModes[getValue('priceMode')];
    return {
      kind: listingKind(),
      category: getCategory(),
      subcategory: carpoolMode ? resolvedCarpoolSubcategory() : getSubcategory(),
      title: getValue('title'),
      description: getValue('description'),
      priceAmount: ['fixed', 'negotiable'].includes(priceMode) ? numericPrice(getValue('price')) : null,
      currency: currencies[getValue('currency')] || '',
      priceMode,
      condition: getValue('condition'),
      availability: getValue('availability'),
      logistics: checkedLogistics(),
      fees: dynamicExtraValues(),
      zoneLabel: getValue('locationLabel'),
      zoneLatitude: Number(getValue('latitude')),
      zoneLongitude: Number(getValue('longitude')),
      zoneRadiusMeters: zoneRadiusMeters(),
      rideDestinationLatitude: carpoolMode ? Number(getValue('rideDestinationLatitude')) : null,
      rideDestinationLongitude: carpoolMode ? Number(getValue('rideDestinationLongitude')) : null,
      sourceUrl: getValue('sourceUrl'),
      sourceOwnerConsent: form.elements.sourceOwnerConsent.checked
    };
  }

  function isIOSDevice() {
    const userAgent = navigator.userAgent || '';
    return /iPhone|iPad|iPod/i.test(userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function withPhotoTimeout(promise, code, milliseconds = 15000) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = window.setTimeout(() => {
        settled = true;
        reject(new Error(code));
      }, milliseconds);
      Promise.resolve(promise).then((value) => {
        if (settled) {
          value?.close?.();
          return;
        }
        settled = true;
        window.clearTimeout(timer);
        resolve(value);
      }, (error) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        reject(error);
      });
    });
  }

  async function loadImage(file) {
    if ('createImageBitmap' in window) {
      const resizeOptions = [
        { resizeWidth: 1280, resizeQuality: 'high', imageOrientation: 'from-image' },
        { resizeWidth: 1280, resizeQuality: 'high' }
      ];
      if (!isIOSDevice() && file.size <= 2 * 1024 * 1024) resizeOptions.push(null);
      for (const options of resizeOptions) {
        let bitmap;
        try {
          bitmap = await withPhotoTimeout(
            options ? createImageBitmap(file, options) : createImageBitmap(file),
            'PHOTO_DECODE_TIMEOUT'
          );
          if (bitmap.width && bitmap.height) {
            return { image: bitmap, width: bitmap.width, height: bitmap.height, cleanup: () => bitmap.close?.() };
          }
        } catch (error) {
          if (error?.message === 'PHOTO_DECODE_TIMEOUT') throw new Error('PHOTO_DECODE_FAILED');
          // Safari may decode a camera photo through <img> even when createImageBitmap rejects it.
        }
        bitmap?.close?.();
      }
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = 'async';
    try {
      await withPhotoTimeout(new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
        image.src = url;
      }), 'PHOTO_DECODE_FAILED');
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('PHOTO_DECODE_FAILED');
      return { image, width: image.naturalWidth, height: image.naturalHeight, cleanup: () => URL.revokeObjectURL(url) };
    } catch (_) {
      URL.revokeObjectURL(url);
      throw new Error('PHOTO_DECODE_FAILED');
    }
  }

  function canvasBlob(canvas, type, quality) {
    return withPhotoTimeout(new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('PHOTO_ENCODE_FAILED'));
      }, type, quality);
    }), 'PHOTO_ENCODE_TIMEOUT');
  }

  async function compressPhoto(file) {
    const source = await loadImage(file);
    const canvas = document.createElement('canvas');
    try {
      let maxDimension = 1280;
      let quality = 0.78;
      let blob = null;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
        const width = Math.max(1, Math.round(source.width * scale));
        const height = Math.max(1, Math.round(source.height * scale));
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('PHOTO_ENCODE_FAILED');
        try {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, width, height);
          context.drawImage(source.image, 0, 0, width, height);
          const encoded = await canvasBlob(canvas, 'image/jpeg', quality);
          blob = encoded?.type === 'image/jpeg' ? encoded : null;
          if (!blob) throw new Error('PHOTO_ENCODE_FAILED');
        } catch (_) {
          throw new Error('PHOTO_ENCODE_FAILED');
        }
        if (blob && blob.size <= MAX_OPTIMIZED_PHOTO_BYTES) break;
        canvas.width = 1;
        canvas.height = 1;
        maxDimension = Math.max(480, Math.round(maxDimension * 0.82));
        quality = Math.max(0.52, quality - 0.05);
      }
      if (!blob) throw new Error('PHOTO_ENCODE_FAILED');
      if (blob.size > MAX_OPTIMIZED_PHOTO_BYTES) throw new Error('PHOTO_TOO_LARGE');
      return blob;
    } finally {
      canvas.width = 1;
      canvas.height = 1;
      source.cleanup();
    }
  }

  async function optimizePhoto(file, index) {
    let pending = photoOptimizationCache.get(file);
    if (!pending) {
      pending = compressPhoto(file);
      photoOptimizationCache.set(file, pending);
      pending.catch(() => {
        if (photoOptimizationCache.get(file) === pending) photoOptimizationCache.delete(file);
      });
    }
    const blob = await pending;
    return new File([blob], `nykuto-${index + 1}.jpg`, { type: 'image/jpeg' });
  }

  window.NykutoPhotoPipeline = Object.freeze({
    maxBytes: MAX_OPTIMIZED_PHOTO_BYTES,
    optimizePhoto,
    selectedFiles: () => selectedFiles.slice(),
    showPreview: showOptimizedPhotoPreview
  });

  async function optimizedPhotos(files = selectedFiles.slice()) {
    const photos = [];
    for (let index = 0; index < files.length; index += 1) {
      photoHelp.textContent = `Otimizando foto ${index + 1} de ${files.length}…`;
      try {
        photos.push(await optimizePhoto(files[index], index));
      } catch (error) {
        const photoError = new Error(error?.message || 'PHOTO_OPTIMIZATION_FAILED');
        photoError.photoIndex = index;
        throw photoError;
      }
    }
    const total = photos.reduce((sum, photo) => sum + photo.size, 0);
    if (total > MAX_TOTAL_PHOTO_BYTES) throw new Error('PHOTOS_TOO_LARGE');
    photoHelp.textContent = `${photos.length} foto${photos.length === 1 ? '' : 's'} otimizada${photos.length === 1 ? '' : 's'} e pronta${photos.length === 1 ? '' : 's'} para publicação.`;
    return photos;
  }

  function photoPublishError(error) {
    const photoNumber = Number.isInteger(error?.photoIndex) ? error.photoIndex + 1 : null;
    const subject = photoNumber ? `A foto ${photoNumber}` : 'Uma das fotos';
    if (error?.message === 'PHOTO_DECODE_FAILED') return `${subject} não pôde ser lida neste aparelho. Remova-a e tente outra foto ou uma captura de tela.`;
    if (error?.message === 'PHOTO_ENCODE_FAILED') return `${subject} não pôde ser reduzida neste aparelho. Remova-a e escolha uma versão menor.`;
    if (['PHOTO_TOO_LARGE', 'PHOTOS_TOO_LARGE'].includes(error?.message)) return `${subject} ficou grande demais depois da otimização. Remova-a e escolha uma versão menor.`;
    return `${subject} não pôde ser preparada. Remova a foto marcada em vermelho e tente outra.`;
  }

  async function publishListing() {
    persistProfile();
    const photoSnapshot = selectedFiles.slice();
    const payloadSnapshot = {
      profile: prepareOnlineProfile(),
      listing: listingPayload(),
      turnstileToken
    };
    currentLocationRequestId += 1;
    addressSearchRequestId += 1;
    reverseGeocodeRequestIds.origin += 1;
    reverseGeocodeRequestIds.destination += 1;
    rideDestinationRequestId += 1;
    setCurrentLocationPending(false);
    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    form.setAttribute('inert', '');
    submitButton.textContent = photoSnapshot.length ? 'Otimizando fotos…' : 'Publicando…';
    try {
      let photos;
      try {
        photos = await optimizedPhotos(photoSnapshot);
      } catch (error) {
        photoHelp.classList.remove('is-valid');
        photoHelp.classList.add('is-invalid');
        photoHelp.textContent = photoPublishError(error);
        setError(photoPublishError(error));
        resetTurnstile();
        return;
      }
      submitButton.textContent = 'Publicando…';
      const body = new FormData();
      body.set('payload', JSON.stringify(payloadSnapshot));
      photos.forEach((photo) => body.append('photos', photo, photo.name));
      const headers = { Accept: 'application/json' };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
      const response = await fetch('/api/local/listings', { method: 'POST', headers, body });
      const payload = await response.json();
      if (!response.ok || !payload.listing) throw new Error(payload.message || 'Não foi possível publicar agora.');
      csrfToken = payload.csrfToken || csrfToken;
      clearLegacyProfile();
      publishedUrl = `${window.location.origin}/anuncio/?id=${encodeURIComponent(payload.listing.id)}`;
      if (successView) successView.href = publishedUrl;
      form.hidden = true;
      document.querySelector('.nykuto-wizard-progress')?.setAttribute('hidden', '');
      document.querySelector('.nykuto-wizard-header')?.classList.add('is-complete');
      successPanel.hidden = false;
      successPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      clearPhotoUrls();
    } catch (error) {
      setError(error.message || 'Não foi possível publicar agora. Tente novamente.');
      resetTurnstile();
    } finally {
      form.removeAttribute('inert');
      form.removeAttribute('aria-busy');
      submitButton.disabled = false;
      submitButton.innerHTML = `${publishButtonLabel()} <span aria-hidden="true">→</span>`;
    }
  }

  function advanceFromChoice(event, expectedStep) {
    if (currentStep !== expectedStep || event.detail === 0) return;
    window.setTimeout(() => {
      const error = validateStep(expectedStep);
      if (!error) setStep(nextWizardStep(expectedStep));
    }, 120);
  }

  form.addEventListener('click', (event) => {
    if (!directPublishMode && event.target.closest('.nykuto-category-choices label')) advanceFromChoice(event, 1);
    if (!directPublishMode && event.target.closest('[data-subcategory-grid] label')) advanceFromChoice(event, 2);
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
    if (event.target.name === 'category') {
      if (event.target.value === 'Carona compartilhada' && !carpoolMode) {
        const params = new URLSearchParams({ categoria: 'Carona compartilhada' });
        if (requestModeFromUrl) params.set('tipo', 'pedido');
        window.location.href = `/anunciar/?${params.toString()}`;
        return;
      }
      renderSubcategories();
    }
    if (event.target.name === 'subcategory' && getCategory() === 'Carona compartilhada') updateConditionalFields();
    if (event.target.name === 'rideFrequency') {
      updateRideDateVisibility();
      syncCarpoolDefaults();
    }
    if (event.target.name === 'zoneRadiusMeters') updateRadiusPresentation();
    if (event.target.name === 'priceMode') {
      const noAmount = ['Grátis', 'Sob consulta'].includes(event.target.value);
      form.elements.price.disabled = noAmount;
      if (noAmount) form.elements.price.value = '';
    }
    if (event.target.name === 'sourceOwnerConsent') form.elements.confirm.checked = false;
  });

  photoInput.addEventListener('change', handlePhotos);
  form.addEventListener('input', (event) => {
    if (event.target.name !== 'confirm') form.elements.confirm.checked = false;
    if (event.target.name === 'address') clearResolvedLocation();
    if (event.target.name === 'sourceUrl') sourceConsentVisibility();
    if (directPublishMode && event.target.name === 'price') syncDirectDefaults();
    if (carpoolMode && event.target.name === 'rideDestination') {
      clearRideRoute();
      setMapPointMode('destination');
    }
    if (carpoolMode && ['rideDestination', 'rideDate', 'rideTime', 'rideSeats', 'rideContribution', 'rideCurrency'].includes(event.target.name)) syncCarpoolDefaults();
    if (currentStep === 5 && ['firstName', 'lastName', 'whatsapp', 'rideDestination', 'rideDate', 'rideTime', 'rideSeats', 'rideContribution', 'rideCurrency'].includes(event.target.name)) renderPreview();
  });
  currentLocationButton?.addEventListener('click', locateCurrentPosition);
  addressSearchButton.addEventListener('click', searchAddress);
  mapToggleButton?.addEventListener('click', toggleMapPanel);
  rideDestinationSearchButton?.addEventListener('click', searchRideDestination);
  mapPointButtons.forEach((button) => button.addEventListener('click', () => setMapPointMode(button.dataset.mapPoint)));
  campusDestinationSelect?.addEventListener('change', () => {
    const option = campusDestinationSelect.selectedOptions[0];
    if (!option?.value) {
      form.elements.rideDestination.value = '';
      clearRideRoute();
      setMapPointMode('destination');
      syncCarpoolDefaults();
      return;
    }
    void setRideDestination(option.dataset.latitude, option.dataset.longitude, option.value);
  });
  form.elements.address.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchAddress();
    }
  });
  form.elements.rideDestination?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchRideDestination();
    }
  });

  nextButton.addEventListener('click', () => {
    const error = validateStep(currentStep);
    if (error) return setError(error);
    setStep(nextWizardStep());
  });
  backButton.addEventListener('click', () => setStep(previousWizardStep()));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!directPublishMode && currentStep !== 5) return setError('Use “Continuar” para revisar todas as etapas antes do envio.');
    syncDirectDefaults();
    for (const step of wizardSequence) {
      const error = validateStep(step);
      if (error) {
        if (directPublishMode) {
          setError(error);
          focusDirectSection(step);
        } else {
          if (step < 5) setStep(step);
          setError(error);
        }
        return;
      }
    }
    await publishListing();
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
  successShare?.addEventListener('click', async () => {
    if (!publishedUrl) return;
    const shareData = { title: getValue('title') || 'Anúncio no Nykuto Local', text: 'Veja este anúncio no Nykuto Local.', url: publishedUrl };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(publishedUrl);
        successShare.textContent = 'Link copiado';
      }
    } catch (_) {
      // Cancelling the native share sheet does not change the published listing.
    }
  });

  function showDirectPublishForm() {
    if (!directPublishMode) return;
    steps.forEach((step) => {
      const number = Number(step.dataset.wizardStep);
      const visible = number !== 2 || Boolean(getCategory());
      step.hidden = !visible;
      step.classList.toggle('is-active', visible);
    });
    backButton.hidden = true;
    nextButton.hidden = true;
    submitButton.hidden = false;
    syncDirectDefaults();
    updateRadiusPresentation();
  }

  function configureDirectPublishForm() {
    if (!directPublishMode) return;
    wizard.classList.add('is-direct');
    document.title = requestModeFromUrl ? 'Publicar um pedido — Nykuto Local' : 'Publicar um anúncio — Nykuto Local';
    const pageTitle = document.querySelector('#page-title');
    const eyebrow = document.querySelector('.nykuto-wizard-header p');
    const wizardSubtitle = document.querySelector('.nykuto-wizard-header > div > span');
    const headerBadge = document.querySelector('.nykuto-wizard-header > b');
    const progress = document.querySelector('.nykuto-wizard-progress');
    const headings = new Map([
      [1, ['Categoria', requestModeFromUrl ? 'O que você procura?' : 'O que você quer anunciar?', 'Escolha uma categoria.']],
      [2, ['Tipo', 'Escolha o tipo', 'Isso ajuda as pessoas a encontrar seu anúncio.']],
      [3, ['Anúncio', 'Mostre o essencial', 'Título, descrição, preço e imagens.']],
      [4, ['Zona', 'Onde está disponível?', 'Informe somente a zona aproximada. Seu endereço exato não será publicado.']],
      [5, ['Contato', 'Como falar com você?', 'Os interessados entrarão em contato diretamente pelo WhatsApp.']]
    ]);
    if (pageTitle) pageTitle.textContent = requestModeFromUrl ? 'Publique o que você precisa' : 'Publique seu anúncio';
    if (eyebrow) eyebrow.textContent = 'Publicação simples e gratuita';
    if (wizardSubtitle) wizardSubtitle.textContent = 'Preencha o essencial e publique em uma única página.';
    if (headerBadge) headerBadge.textContent = 'Direto';
    progress?.setAttribute('hidden', '');
    headings.forEach((config, number) => {
      const heading = steps.find((entry) => Number(entry.dataset.wizardStep) === number)?.querySelector('.nykuto-step-heading');
      if (!heading) return;
      heading.querySelector(':scope > span').textContent = config[0];
      heading.querySelector('h2').textContent = config[1];
      heading.querySelector('p').textContent = config[2];
    });
    if (priceModeField) priceModeField.hidden = true;
    if (conditionField) conditionField.hidden = true;
    if (sourceUrlField) sourceUrlField.hidden = true;
    if (sourceConsent) sourceConsent.hidden = true;
    if (genericLogistics) genericLogistics.hidden = true;
    if (emailField) emailField.hidden = true;
    if (preview) preview.hidden = true;
    if (reviewNote) reviewNote.hidden = true;
    if (contactNote) contactNote.hidden = true;
    if (mapPanel) mapPanel.hidden = true;
    if (mapToggleButton) mapToggleButton.hidden = false;
    form.elements.sourceUrl.value = '';
    form.elements.sourceOwnerConsent.checked = false;
    submitButton.innerHTML = `${publishButtonLabel()} <span aria-hidden="true">→</span>`;
    const contactTitle = form.querySelector('#contact-panel-title');
    const contactEyebrow = form.querySelector('.nykuto-contact-panel > header span');
    if (contactTitle) contactTitle.textContent = 'Seu contato';
    if (contactEyebrow) contactEyebrow.textContent = 'WhatsApp direto';
  }

  function configureCarpoolWizard() {
    if (!carpoolMode) return;
    wizard.classList.add('is-carona');
    document.title = 'Publicar uma carona — Nykuto Local';
    const pageTitle = document.querySelector('#page-title');
    const eyebrow = document.querySelector('.nykuto-wizard-header p');
    const wizardSubtitle = document.querySelector('.nykuto-wizard-header > div > span');
    const headerBadge = document.querySelector('.nykuto-wizard-header > b');
    const progress = document.querySelector('.nykuto-wizard-progress');
    const headings = new Map([
      [2, ['1 de 3', 'Você quer oferecer ou procurar uma carona?', 'Escolha o que você precisa hoje.']],
      [4, ['2 de 3', 'Qual é o trajeto?', 'Informe origem, destino e horário. O ponto exato fica para o WhatsApp.']],
      [5, ['3 de 3', 'Como falar com você?', 'Revise o trajeto e informe o WhatsApp para contato direto.']]
    ]);
    if (pageTitle) pageTitle.textContent = 'Publique uma carona';
    if (eyebrow) eyebrow.textContent = 'Carona compartilhada em CDE e Foz';
    if (wizardSubtitle) wizardSubtitle.textContent = 'Origem, destino, horário e WhatsApp. Só isso.';
    if (headerBadge) headerBadge.textContent = '3 etapas';
    if (mapPanel) mapPanel.hidden = false;
    if (mapToggleButton) mapToggleButton.hidden = true;
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.href = '#wizard-subcategory-title';
    progress?.classList.add('is-carona');
    progressItems.forEach((item) => {
      const step = Number(item.dataset.wizardProgress);
      const config = headings.get(step);
      item.hidden = !config;
      if (!config) return;
      const position = wizardSequence.indexOf(step) + 1;
      item.querySelector('span').textContent = String(position);
      item.querySelector('small').textContent = ({ 2: 'Intenção', 4: 'Trajeto', 5: 'Contato' })[step];
      const heading = steps.find((entry) => Number(entry.dataset.wizardStep) === step)?.querySelector('.nykuto-step-heading');
      if (heading) {
        heading.querySelector(':scope > span').textContent = config[0];
        heading.querySelector('h2').textContent = config[1];
        heading.querySelector('p').textContent = config[2];
      }
    });
    const today = new Date();
    form.elements.rideDate.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    submitButton.innerHTML = 'Publicar carona <span aria-hidden="true">→</span>';
    if (successPanel) {
      const title = successPanel.querySelector('h2');
      const note = successPanel.querySelector('small');
      if (title) title.textContent = 'Sua carona já está no Nykuto Local.';
      if (note) note.innerHTML = 'As pessoas interessadas poderão abrir o anúncio e falar com você pelo WhatsApp.';
    }
  }

  configureCarpoolWizard();
  configureDirectPublishForm();
  loadLegacyProfile();
  loadOnlineProfile();
  loadTurnstileConfig().then(() => { if (directPublishMode || currentStep === 5) ensureTurnstile(); });
  sourceConsentVisibility();
  const presetCategory = initialParams.get('categoria');
  const hasPresetCategory = Boolean(presetCategory && subcategories[presetCategory]);
  if (hasPresetCategory) {
    form.elements.category.value = presetCategory;
    renderSubcategories();
    if (directPublishMode) showDirectPublishForm();
    else setStep(2, { focus: false });
  } else {
    updateConditionalFields();
    if (directPublishMode) showDirectPublishForm();
    else setStep(1, { focus: false });
  }
})();
