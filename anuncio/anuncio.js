(() => {
  const loadingState = document.querySelector('[data-listing-loading]');
  const errorState = document.querySelector('[data-listing-error]');
  const errorTitle = document.querySelector('[data-listing-error-title]');
  const errorMessage = document.querySelector('[data-listing-error-message]');
  const content = document.querySelector('[data-listing-content]');
  if (!loadingState || !errorState || !content) return;

  const canonical = document.querySelector('[data-listing-canonical]');
  const titleElement = document.querySelector('[data-listing-title]');
  const categoryElement = document.querySelector('[data-listing-category]');
  const statusElement = document.querySelector('[data-listing-status]');
  const locationElement = document.querySelector('[data-listing-location]');
  const priceElement = document.querySelector('[data-listing-price]');
  const priceLabel = document.querySelector('[data-listing-price-label]');
  const priceNote = document.querySelector('[data-listing-price-note]');
  const kindElement = document.querySelector('[data-listing-kind]');
  const trustElement = document.querySelector('.nykuto-listing-detail-trust');
  const factsElement = document.querySelector('[data-listing-facts]');
  const descriptionSection = document.querySelector('[data-description-section]');
  const descriptionElement = document.querySelector('[data-listing-description]');
  const logisticsSection = document.querySelector('[data-logistics-section]');
  const logisticsElement = document.querySelector('[data-listing-logistics]');
  const logisticsTitle = document.querySelector('[data-logistics-title]');
  const feesSection = document.querySelector('[data-fees-section]');
  const feesElement = document.querySelector('[data-listing-fees]');
  const sellerElement = document.querySelector('[data-listing-seller]');
  const sellerInitial = document.querySelector('[data-seller-initial]');
  const sellerRole = document.querySelector('[data-listing-seller-role]');
  const whatsappLink = document.querySelector('[data-listing-whatsapp]');
  const whatsappLabel = document.querySelector('[data-listing-whatsapp-label]');
  const contactNote = document.querySelector('[data-listing-contact-note]');
  const sourceLink = document.querySelector('[data-listing-source]');
  const gallery = document.querySelector('[data-listing-gallery]');
  const mainMedia = document.querySelector('[data-listing-main-media]');
  const thumbnails = document.querySelector('[data-listing-thumbnails]');
  const mediaCount = document.querySelector('[data-listing-media-count]');
  const mapElement = document.querySelector('[data-listing-map]');
  const mapNote = document.querySelector('[data-listing-map-note]');
  const mapTitle = document.querySelector('[data-listing-map-title]');
  const routeSection = document.querySelector('[data-route-section]');
  const routeFacts = document.querySelector('[data-route-facts]');
  const showRouteButton = document.querySelector('[data-show-route]');
  const routeStatus = document.querySelector('[data-route-status]');
  const reportDialog = document.querySelector('[data-report-dialog]');
  const reportForm = document.querySelector('[data-report-form]');
  const reportStatus = document.querySelector('[data-report-status]');
  const reportSubmit = document.querySelector('[data-report-submit]');
  const reportTurnstile = document.querySelector('[data-report-turnstile]');
  const openReportButton = document.querySelector('[data-open-report]');

  const statusLabels = {
    published: 'Publicado',
    paused: 'Pausado',
    sold: 'Vendido',
    hidden: 'Oculto',
    expired: 'Expirado'
  };
  const priceModeLabels = {
    fixed: 'Preço fixo',
    negotiable: 'Negociável',
    quote: 'Sob consulta',
    free: 'Grátis'
  };
  const kindLabels = { offer: 'Oferta local', request: 'Pedido local' };

  let listing = null;
  let listingId = '';
  let selectedMediaIndex = 0;
  let listingMap = null;
  let routeLayer = null;
  let routeDestination = '';
  let routeLookupPending = false;
  let lastRouteLookupAt = 0;
  let turnstileWidgetId = null;
  let turnstileToken = '';
  let reportReadyPromise = null;
  let reportSent = false;

  function cleanText(value) {
    return String(value ?? '').trim();
  }

  function normalizedText(value) {
    return cleanText(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }

  function isSharedRide(item) {
    return normalizedText(item?.category) === 'carona compartilhada';
  }

  function resolveListingId() {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = cleanText(params.get('id') || params.get('anuncio'));
    if (fromQuery) return fromQuery;
    const segments = window.location.pathname.split('/').filter(Boolean);
    const routeIndex = segments.lastIndexOf('anuncio');
    return routeIndex >= 0 ? cleanText(segments[routeIndex + 1]) : '';
  }

  function publicPageUrl(id) {
    const url = new URL('/anuncio/', window.location.origin);
    url.searchParams.set('id', id);
    return url.toString();
  }

  function safeHttpsUrl(value, { sameOrigin = false } = {}) {
    try {
      const url = new URL(cleanText(value), window.location.origin);
      if (sameOrigin) {
        if (!['http:', 'https:'].includes(url.protocol) || url.origin !== window.location.origin) return '';
      } else if (url.protocol !== 'https:') return '';
      return url.toString();
    } catch (_error) {
      return '';
    }
  }

  function showError(title, message) {
    loadingState.hidden = true;
    content.hidden = true;
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorState.hidden = false;
  }

  function formatAmount(amount, currency) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return '';
    const rounded = Math.round(value).toLocaleString(currency === 'PYG' ? 'es-PY' : 'pt-BR');
    if (currency === 'PYG') return `${rounded} Gs.`;
    if (currency === 'USD') return `US$ ${rounded}`;
    if (currency === 'BRL') return `R$ ${rounded}`;
    return rounded;
  }

  function pricePresentation(item) {
    const amount = formatAmount(item.priceAmount, item.currency);
    if (isSharedRide(item)) {
      if (item.priceMode === 'free') return { value: 'Sem contribuição', note: '' };
      if (item.priceMode === 'quote') return { value: 'A combinar', note: 'Combine diretamente pelo WhatsApp' };
      if (item.priceMode === 'negotiable') return { value: amount || 'A combinar', note: amount ? 'por pessoa · valor a combinar' : 'Combine diretamente pelo WhatsApp' };
      return { value: amount || 'A combinar', note: amount ? 'por pessoa' : 'Combine diretamente pelo WhatsApp' };
    }
    if (item.priceMode === 'free') return { value: 'Grátis', note: '' };
    if (item.priceMode === 'quote') return { value: 'Sob consulta', note: '' };
    if (item.priceMode === 'negotiable') return { value: amount || 'A combinar', note: 'Preço negociável' };
    return { value: amount || 'Preço não informado', note: priceModeLabels[item.priceMode] || '' };
  }

  function formatDate(timestamp) {
    const value = Number(timestamp);
    if (!Number.isFinite(value) || value <= 0) return '';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value * 1000));
  }

  function formatRideDate(value) {
    const raw = cleanText(value);
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
    return raw;
  }

  function addFact(label, value) {
    const cleaned = cleanText(value);
    if (!cleaned) return;
    const wrapper = document.createElement('div');
    const span = document.createElement('span');
    const strong = document.createElement('strong');
    span.textContent = label;
    strong.textContent = cleaned;
    wrapper.append(span, strong);
    factsElement.append(wrapper);
  }

  function renderTrust(ride) {
    if (!trustElement) return;
    const labels = ride
      ? ['✓ Contato pelo WhatsApp', '✓ Trajeto aproximado', '✓ Combinação direta']
      : ['✓ Contato direto', '✓ Zona aproximada', '✓ Sem comissão Nykuto'];
    trustElement.replaceChildren(...labels.map((label) => {
      const span = document.createElement('span');
      span.textContent = label;
      return span;
    }));
  }

  function normalizedWhatsapp(value) {
    const digits = cleanText(value).replace(/\D/g, '');
    return /^[1-9]\d{7,14}$/.test(digits) && !/^(\d)\1+$/.test(digits) ? digits : '';
  }

  function sellerMessage(item) {
    const url = publicPageUrl(item.id);
    if (isSharedRide(item)) {
      const details = sharedRideDetails(item);
      const request = item.kind === 'request';
      const lines = [request
        ? 'Olá! Vi que você procura carona no Nykuto Local. Posso oferecer uma carona.'
        : 'Olá! Vi sua carona no Nykuto Local e gostaria de pedir uma vaga.'];
      if (details.origin || details.destination) lines.push(`Trajeto: ${details.origin || 'origem a combinar'} → ${details.destination || 'destino a combinar'}`);
      if (details.date) lines.push(`Data: ${details.date}`);
      if (details.time) lines.push(`Horário: ${details.time}`);
      if (details.seats) lines.push(`${request ? 'Passageiros' : 'Vagas'}: ${details.seats}`);
      lines.push('', url);
      return lines.join('\n');
    }
    return [
      `Olá! Tenho interesse no seu anúncio “${cleanText(item.title)}” no Nykuto Local.`,
      '',
      url
    ].join('\n');
  }

  function renderSeller(item) {
    const seller = item.seller && typeof item.seller === 'object' ? item.seller : {};
    const sellerName = cleanText(seller.name) || 'Anunciante local';
    sellerElement.textContent = sellerName;
    sellerInitial.textContent = sellerName.slice(0, 1).toLocaleUpperCase('pt-BR') || 'N';
    const ride = isSharedRide(item);
    if (sellerRole) sellerRole.textContent = ride
      ? `${item.kind === 'request' ? 'Passageiro' : 'Motorista'} · WhatsApp informado pelo usuário`
      : 'Anunciante · WhatsApp informado pelo usuário, ainda não verificado';
    if (whatsappLabel) whatsappLabel.textContent = ride
      ? (item.kind === 'request' ? 'Oferecer carona no WhatsApp' : 'Pedir uma vaga no WhatsApp')
      : 'Falar no WhatsApp';
    const phone = normalizedWhatsapp(seller.whatsapp);
    if (!phone) {
      whatsappLink.removeAttribute('href');
      whatsappLink.setAttribute('aria-disabled', 'true');
      if (whatsappLabel) whatsappLabel.textContent = 'WhatsApp indisponível';
      return;
    }
    whatsappLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(sellerMessage(item))}`;
    whatsappLink.removeAttribute('aria-disabled');
  }

  function mediaItems(item) {
    if (!Array.isArray(item.media)) return [];
    return item.media.map((media) => ({
      id: cleanText(media?.id),
      mimeType: cleanText(media?.mimeType),
      url: safeHttpsUrl(media?.url, { sameOrigin: true })
    })).filter((media) => media.url);
  }

  function mediaPlaceholder(item) {
    const fallback = document.createElement('span');
    fallback.className = 'nykuto-listing-detail-media-empty';
    fallback.textContent = cleanText(item.category).slice(0, 1).toLocaleUpperCase('pt-BR') || 'N';
    fallback.setAttribute('aria-label', 'Nenhuma foto disponível');
    mainMedia.replaceChildren(fallback);
  }

  function showMedia(index) {
    const media = mediaItems(listing);
    if (!media.length) {
      selectedMediaIndex = 0;
      mediaPlaceholder(listing);
      return;
    }
    selectedMediaIndex = (index + media.length) % media.length;
    const current = media[selectedMediaIndex];
    const image = document.createElement('img');
    image.src = current.url;
    image.alt = `${cleanText(listing.title)}, foto ${selectedMediaIndex + 1} de ${media.length}`;
    image.width = 1200;
    image.height = 900;
    image.decoding = 'async';
    image.addEventListener('error', () => mediaPlaceholder(listing), { once: true });

    const controls = [];
    if (media.length > 1) {
      const previous = document.createElement('button');
      const next = document.createElement('button');
      previous.type = 'button';
      next.type = 'button';
      previous.className = 'nykuto-listing-detail-media-nav';
      next.className = 'nykuto-listing-detail-media-nav';
      previous.dataset.mediaPrevious = '';
      next.dataset.mediaNext = '';
      previous.setAttribute('aria-label', 'Foto anterior');
      next.setAttribute('aria-label', 'Próxima foto');
      previous.textContent = '‹';
      next.textContent = '›';
      previous.addEventListener('click', () => showMedia(selectedMediaIndex - 1));
      next.addEventListener('click', () => showMedia(selectedMediaIndex + 1));
      controls.push(previous, next);
    }
    mainMedia.replaceChildren(image, ...controls);
    [...thumbnails.querySelectorAll('button')].forEach((button, buttonIndex) => {
      const active = buttonIndex === selectedMediaIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'true' : 'false');
    });
  }

  function renderMedia(item) {
    const media = mediaItems(item);
    const hideEmptyRideGallery = isSharedRide(item) && media.length === 0;
    if (gallery) gallery.hidden = hideEmptyRideGallery;
    content.classList.toggle('is-ride-without-media', hideEmptyRideGallery);
    thumbnails.replaceChildren();
    mediaCount.textContent = String(media.length);
    if (hideEmptyRideGallery) {
      mainMedia.replaceChildren();
      selectedMediaIndex = 0;
      return;
    }
    if (media.length > 1) {
      media.forEach((entry, index) => {
        const button = document.createElement('button');
        const image = document.createElement('img');
        button.type = 'button';
        button.setAttribute('aria-label', `Mostrar foto ${index + 1}`);
        image.src = entry.url;
        image.alt = '';
        image.width = 140;
        image.height = 108;
        image.loading = 'lazy';
        image.addEventListener('error', () => button.remove(), { once: true });
        button.append(image);
        button.addEventListener('click', () => showMedia(index));
        thumbnails.append(button);
      });
    }
    showMedia(0);
  }

  function renderLogistics(item) {
    const values = Array.isArray(item.logistics) ? item.logistics.map(cleanText).filter(Boolean) : [];
    logisticsElement.replaceChildren();
    logisticsSection.hidden = values.length === 0;
    if (logisticsTitle) logisticsTitle.textContent = isSharedRide(item) ? 'Detalhes da carona' : 'Entrega ou atendimento';
    values.forEach((value) => {
      const chip = document.createElement('span');
      chip.textContent = value;
      logisticsElement.append(chip);
    });
  }

  function approximatePlaceLabel(value) {
    const cleaned = cleanText(value)
      .replace(/\b(?:casa|apartamento|apto|ap\.|n[º°o]?\.?|número|numero)\s*[\w-]*/gi, '')
      .replace(/\b\d{1,6}[a-z]?\b/gi, '')
      .replace(/\s+,/g, ',')
      .replace(/\s{2,}/g, ' ')
      .replace(/^\s*[,;-]+|[,;-]+\s*$/g, '')
      .trim();
    return cleaned || 'Região informada';
  }

  function routeFieldKind(label) {
    const normalized = normalizedText(label);
    if (normalized.includes('ponto de partida') || normalized === 'partida' || normalized === 'origem') return 'origin';
    if (normalized.includes('destino') || normalized.includes('chegada')) return 'destination';
    if (normalized.includes('dia') && normalized.includes('recorr')) return 'days';
    if (normalized.includes('data') || normalized.includes('dia da viagem')) return 'date';
    if (normalized.includes('horario') || normalized.includes('hora')) return 'time';
    if (normalized.includes('lugar') || normalized.includes('vaga') || normalized.includes('passageir') || normalized.includes('pessoa')) return 'seats';
    return 'other';
  }

  function sharedRideDetails(item) {
    const details = {
      origin: approximatePlaceLabel(item.zone?.label),
      destination: '',
      destinationQuery: '',
      date: '',
      time: '',
      seats: '',
      days: ''
    };
    const fees = Array.isArray(item.fees) ? item.fees : [];
    fees.forEach((fee) => {
      const label = cleanText(fee?.label);
      const value = cleanText(fee?.value);
      if (!label || !value) return;
      const kind = routeFieldKind(label);
      if (kind === 'origin') details.origin = approximatePlaceLabel(value);
      if (kind === 'destination') {
        details.destination = approximatePlaceLabel(value);
        details.destinationQuery = value;
      }
      if (kind === 'date') details.date = formatRideDate(value);
      if (kind === 'time') details.time = value;
      if (kind === 'seats') details.seats = value;
      if (kind === 'days') details.days = value;
    });
    return details;
  }

  function addRouteFact(kind, label, value) {
    const cleaned = cleanText(value);
    if (!cleaned) return;
    const wrapper = document.createElement('div');
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    wrapper.dataset.routeKind = kind;
    term.textContent = label;
    description.textContent = cleaned;
    wrapper.append(term, description);
    routeFacts.append(wrapper);
  }

  function renderSharedRide(item) {
    if (!routeSection || !routeFacts || !showRouteButton || !routeStatus) return;
    const ride = isSharedRide(item);
    routeSection.hidden = !ride;
    routeFacts.replaceChildren();
    routeDestination = '';
    if (!ride) {
      mapTitle.textContent = 'Zona aproximada';
      return;
    }

    mapTitle.textContent = 'Trajeto aproximado';
    mapElement.setAttribute('aria-label', 'Mapa do trajeto aproximado da carona compartilhada');
    const details = sharedRideDetails(item);
    routeDestination = details.destinationQuery;
    addRouteFact('origin', 'Saída', details.origin || 'Origem a combinar');
    addRouteFact('destination', 'Destino', details.destination || 'Destino a combinar');
    addRouteFact('date', 'Data', details.date);
    addRouteFact('time', 'Horário', details.time);
    addRouteFact('seats', item.kind === 'request' ? 'Passageiros' : 'Lugares', details.seats);
    addRouteFact('frequency', 'Frequência', details.days || cleanText(item.availability));
    showRouteButton.hidden = !routeDestination;
    showRouteButton.disabled = false;
    showRouteButton.textContent = 'Mostrar rota aproximada';
    routeStatus.textContent = routeDestination
      ? 'Toque para consultar uma rota aproximada. Nenhum endereço exato será exibido.'
      : 'O destino não permite mostrar a rota. Combine o trajeto pelo WhatsApp.';
    mapNote.textContent = 'A partida aparece como zona aproximada. O destino só será consultado se você tocar em “Mostrar rota aproximada”.';
  }

  function renderFees(item) {
    const values = Array.isArray(item.fees) ? item.fees.filter((fee) => cleanText(fee?.label) && cleanText(fee?.value)) : [];
    feesElement.replaceChildren();
    feesSection.hidden = values.length === 0 || isSharedRide(item);
    values.forEach((fee) => {
      const wrapper = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = cleanText(fee.label);
      description.textContent = cleanText(fee.value);
      wrapper.append(term, description);
      feesElement.append(wrapper);
    });
  }

  function renderSource(item) {
    const sourceUrl = safeHttpsUrl(item.sourceUrl);
    sourceLink.hidden = !sourceUrl;
    if (sourceUrl) sourceLink.href = sourceUrl;
    else sourceLink.removeAttribute('href');
  }

  function renderMap(item) {
    const latitude = Number(item.zone?.latitude);
    const longitude = Number(item.zone?.longitude);
    const valid = Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
    if (!valid || !mapElement) {
      mapElement.hidden = true;
      mapNote.textContent = 'A zona foi informada pelo anunciante, mas o mapa não está disponível para esta ficha.';
      return;
    }
    if (!window.L) {
      mapElement.hidden = true;
      mapNote.textContent = 'O mapa não pôde ser carregado. Somente a zona aproximada indicada na ficha é pública.';
      return;
    }
    const radiusMeters = 5000;
    listingMap = window.L.map(mapElement, { zoomControl: true, scrollWheelZoom: false, attributionControl: true }).setView([latitude, longitude], 11);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(listingMap);
    const circle = window.L.circle([latitude, longitude], {
      radius: radiusMeters,
      color: '#174f43',
      fillColor: '#5ba388',
      fillOpacity: .2,
      weight: 2
    }).addTo(listingMap);
    listingMap.fitBounds(circle.getBounds(), { padding: [18, 18] });
    window.setTimeout(() => listingMap.invalidateSize(), 100);
  }

  async function showApproximateRoute() {
    if (!listing || !isSharedRide(listing) || !routeDestination || routeLookupPending) return;
    if (!listingMap || !window.L) {
      routeStatus.textContent = 'O mapa não está disponível para desenhar este trajeto.';
      return;
    }
    const originLatitude = Number(listing.zone?.latitude);
    const originLongitude = Number(listing.zone?.longitude);
    if (!Number.isFinite(originLatitude) || !Number.isFinite(originLongitude)) {
      routeStatus.textContent = 'A zona de partida não está disponível para desenhar este trajeto.';
      return;
    }
    const elapsed = Date.now() - lastRouteLookupAt;
    if (elapsed < 1000) return;
    lastRouteLookupAt = Date.now();
    routeLookupPending = true;
    showRouteButton.disabled = true;
    showRouteButton.textContent = 'Carregando trajeto…';
    routeStatus.textContent = 'Carregando uma rota aproximada, sem exibir endereços exatos.';
    try {
      const params = new URLSearchParams({
        q: routeDestination,
        format: 'jsonv2',
        addressdetails: '0',
        limit: '1',
        countrycodes: 'py,br',
        viewbox: '-55.0,-24.9,-54.3,-25.8',
        bounded: '1',
        'accept-language': 'pt-BR'
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('ROUTE_LOOKUP_FAILED');
      const payload = await response.json();
      const result = Array.isArray(payload) ? payload[0] : null;
      const rawLatitude = Number(result?.lat);
      const rawLongitude = Number(result?.lon);
      if (!Number.isFinite(rawLatitude) || !Number.isFinite(rawLongitude)) throw new Error('ROUTE_NOT_FOUND');

      const destinationLatitude = Math.round(rawLatitude * 100) / 100;
      const destinationLongitude = Math.round(rawLongitude * 100) / 100;
      let routeCoordinates = [
        [originLatitude, originLongitude],
        [destinationLatitude, destinationLongitude]
      ];
      let roadRoute = false;
      try {
        const routeUrl = `https://router.project-osrm.org/route/v1/driving/${originLongitude},${originLatitude};${destinationLongitude},${destinationLatitude}?overview=simplified&geometries=geojson`;
        const routeResponse = await fetch(routeUrl, { headers: { Accept: 'application/json' } });
        const routePayload = routeResponse.ok ? await routeResponse.json() : null;
        const coordinates = routePayload?.routes?.[0]?.geometry?.coordinates;
        if (Array.isArray(coordinates) && coordinates.length > 1) {
          routeCoordinates = coordinates.map(([longitude, latitude]) => [latitude, longitude]);
          roadRoute = true;
        }
      } catch (_) {
        // A straight approximate connection remains available if routing is busy.
      }
      if (routeLayer) listingMap.removeLayer(routeLayer);
      const line = window.L.polyline(routeCoordinates, {
        color: '#b78728',
        weight: 4,
        opacity: .82,
        dashArray: roadRoute ? undefined : '9 8'
      });
      const destinationZone = window.L.circle([destinationLatitude, destinationLongitude], {
        radius: 1800,
        color: '#b78728',
        fillColor: '#dfbd6c',
        fillOpacity: .17,
        weight: 2
      });
      routeLayer = window.L.featureGroup([line, destinationZone]).addTo(listingMap);
      listingMap.fitBounds(routeLayer.getBounds(), { padding: [24, 24] });
      showRouteButton.textContent = 'Rota aproximada exibida';
      routeStatus.textContent = roadRoute
        ? 'Rota aproximada. Combine o ponto exato pelo WhatsApp.'
        : 'Ligação aproximada entre as zonas. Combine o caminho pelo WhatsApp.';
    } catch (error) {
      showRouteButton.disabled = false;
      showRouteButton.textContent = 'Tentar mostrar novamente';
      routeStatus.textContent = error.message === 'ROUTE_NOT_FOUND'
        ? 'Destino não encontrado. Combine o trajeto pelo WhatsApp.'
        : 'Não foi possível mostrar a rota agora. Combine pelo WhatsApp.';
    } finally {
      routeLookupPending = false;
    }
  }

  function renderListing(item, ownerView) {
    listing = item;
    const ride = isSharedRide(item);
    const price = pricePresentation(item);
    const canonicalUrl = publicPageUrl(item.id);
    const zoneLabel = cleanText(item.zone?.label) || 'Zona aproximada';
    const publishedAt = formatDate(item.publishedAt);

    document.title = `${cleanText(item.title) || 'Anúncio'} — Nykuto Local`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', cleanText(item.description).slice(0, 155) || `${price.value} · ${zoneLabel} · contato direto pelo WhatsApp.`);
    canonical.href = canonicalUrl;
    titleElement.textContent = cleanText(item.title) || 'Anúncio sem título';
    content.classList.toggle('is-shared-ride', ride);
    categoryElement.textContent = ride ? 'Carona compartilhada' : ([cleanText(item.category), cleanText(item.subcategory)].filter(Boolean).join(' · ') || 'Anúncio local');
    statusElement.textContent = ownerView ? `Seu anúncio · ${statusLabels[item.status] || cleanText(item.status)}` : (statusLabels[item.status] || 'Publicado');
    openReportButton.hidden = ownerView || item.status !== 'published';
    locationElement.textContent = ride ? `⌖ Saída em ${zoneLabel} · zona aproximada` : `⌖ ${zoneLabel} · zona aproximada de 5 km`;
    priceElement.textContent = price.value;
    priceLabel.textContent = ride ? 'Contribuição por pessoa' : (item.kind === 'request' ? 'Orçamento' : 'Preço anunciado');
    priceNote.textContent = price.note;
    kindElement.textContent = ride ? (item.kind === 'request' ? 'Passageiro' : 'Motorista') : (kindLabels[item.kind] || 'Anúncio local');
    renderTrust(ride);

    factsElement.replaceChildren();
    if (ride) {
      addFact('Frequência', cleanText(item.availability));
      addFact('Publicado em', publishedAt);
    } else {
      addFact('Categoria', cleanText(item.category));
      addFact('Tipo', cleanText(item.subcategory));
      addFact('Estado', cleanText(item.condition));
      addFact('Disponibilidade', cleanText(item.availability));
      addFact('Forma do preço', priceModeLabels[item.priceMode] || cleanText(item.priceMode));
      addFact('Publicado em', publishedAt);
    }

    const description = cleanText(item.description);
    descriptionSection.hidden = !description;
    descriptionElement.textContent = description;
    renderLogistics(item);
    renderSharedRide(item);
    renderFees(item);
    renderSeller(item);
    renderSource(item);
    renderMedia(item);
    if (contactNote) contactNote.textContent = ride
      ? 'Combine o ponto exato, a contribuição e os demais detalhes diretamente pelo WhatsApp.'
      : 'A conversa e a negociação acontecem diretamente com o anunciante. A Nykuto não recebe o pagamento nem cobra comissão.';

    loadingState.hidden = true;
    errorState.hidden = true;
    content.hidden = false;
    renderMap(item);
  }

  function setReportStatus(message, type = '') {
    reportStatus.textContent = message;
    reportStatus.classList.toggle('is-error', type === 'error');
    reportStatus.classList.toggle('is-success', type === 'success');
  }

  function waitForTurnstileScript() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-nykuto-turnstile]');
      const script = existing || document.createElement('script');
      let timeoutId;
      const handleLoad = () => {
        window.clearTimeout(timeoutId);
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error('Turnstile unavailable'));
      };
      const handleError = () => {
        window.clearTimeout(timeoutId);
        script.remove();
        reject(new Error('Turnstile unavailable'));
      };
      script.addEventListener('load', handleLoad, { once: true });
      script.addEventListener('error', handleError, { once: true });
      if (!existing) {
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.nykutoTurnstile = '';
        document.head.append(script);
      }
      timeoutId = window.setTimeout(handleError, 10000);
    });
  }

  async function prepareReportForm() {
    if (reportSent || turnstileWidgetId !== null) return;
    if (reportReadyPromise) return reportReadyPromise;
    reportReadyPromise = (async () => {
      reportSubmit.disabled = true;
      setReportStatus('Carregando a verificação de segurança…');
      try {
        const response = await fetch('/api/local/config', { headers: { Accept: 'application/json' }, credentials: 'same-origin' });
        const payload = await response.json().catch(() => ({}));
        const siteKey = cleanText(payload.turnstileSiteKey || payload.siteKey);
        if (!response.ok || !payload.ok || payload.ready !== true || !siteKey) throw new Error('Report verification unavailable');
        const turnstile = await waitForTurnstileScript();
        turnstileWidgetId = turnstile.render(reportTurnstile, {
          sitekey: siteKey,
          callback(token) {
            turnstileToken = cleanText(token);
            reportSubmit.disabled = !turnstileToken;
            setReportStatus(turnstileToken ? 'Verificação concluída. Você pode enviar a denúncia.' : 'Conclua a verificação de segurança.');
          },
          'expired-callback'() {
            turnstileToken = '';
            reportSubmit.disabled = true;
            setReportStatus('A verificação expirou. Faça novamente.', 'error');
          },
          'error-callback'() {
            turnstileToken = '';
            reportSubmit.disabled = true;
            setReportStatus('A verificação não pôde ser carregada. Tente novamente.', 'error');
          }
        });
      } catch (_error) {
        reportSubmit.disabled = true;
        setReportStatus('A denúncia está temporariamente indisponível. Tente mais tarde.', 'error');
      }
    })();
    try {
      await reportReadyPromise;
    } finally {
      reportReadyPromise = null;
    }
  }

  function openReportDialog() {
    if (!reportDialog || reportSent) return;
    if (typeof reportDialog.showModal === 'function') reportDialog.showModal();
    else reportDialog.setAttribute('open', '');
    prepareReportForm();
  }

  function closeReportDialog() {
    if (!reportDialog) return;
    if (typeof reportDialog.close === 'function') reportDialog.close();
    else reportDialog.removeAttribute('open');
  }

  async function sendReport(event) {
    event.preventDefault();
    if (reportSent || !listing || !reportForm.reportValidity()) return;
    const reason = cleanText(new FormData(reportForm).get('reason'));
    if (!turnstileToken) {
      setReportStatus('Conclua a verificação de segurança antes de enviar.', 'error');
      return;
    }
    reportSubmit.disabled = true;
    setReportStatus('Enviando denúncia…');
    try {
      const response = await fetch('/api/local/reports', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id, reason, turnstileToken })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'Report failed');
      reportSent = true;
      reportSubmit.hidden = true;
      reportForm.elements.reason.disabled = true;
      openReportButton.disabled = true;
      openReportButton.textContent = 'Anúncio denunciado';
      setReportStatus(payload.alreadyReported ? 'Você já havia denunciado este anúncio.' : 'Obrigado. Sua denúncia foi registrada.', 'success');
    } catch (error) {
      turnstileToken = '';
      reportSubmit.disabled = true;
      setReportStatus(cleanText(error.message) || 'A denúncia não pôde ser enviada.', 'error');
      if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
    }
  }

  async function loadListing() {
    listingId = resolveListingId();
    if (!listingId) {
      showError('Link incompleto', 'Este endereço não contém o identificador do anúncio. Volte ao catálogo e abra a ficha novamente.');
      return;
    }
    try {
      const response = await fetch(`/api/local/listings/${encodeURIComponent(listingId)}`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok || !payload.listing) {
        const unavailable = response.status === 404;
        throw new Error(unavailable ? 'NOT_FOUND' : (payload.message || 'UNAVAILABLE'));
      }
      renderListing(payload.listing, payload.ownerView === true);
    } catch (error) {
      if (error.message === 'NOT_FOUND') showError('Anúncio indisponível', 'Este anúncio foi removido, pausado, vendido ou o link não é mais válido.');
      else showError('Não foi possível carregar o anúncio', 'Confira sua conexão e tente novamente em instantes.');
    }
  }

  mainMedia?.addEventListener('keydown', (event) => {
    if (!listing || mediaItems(listing).length < 2) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showMedia(selectedMediaIndex - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showMedia(selectedMediaIndex + 1);
    }
  });
  showRouteButton?.addEventListener('click', showApproximateRoute);
  openReportButton?.addEventListener('click', openReportDialog);
  document.querySelectorAll('[data-close-report]').forEach((button) => button.addEventListener('click', closeReportDialog));
  reportDialog?.addEventListener('click', (event) => {
    if (event.target === reportDialog) closeReportDialog();
  });
  reportForm?.addEventListener('submit', sendReport);

  loadListing();
})();
