(() => {
  const assetBase = '/assets/demo-imobiliaria/';
  const ciudadDelEsteCenter = [-25.5135, -54.632];
  const openStreetMapTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const publicDemoOrigin = 'https://demo.nykuto.com';
  const whatsappPhone = document.body.dataset.whatsappPhone || '33768345608';
  const pageMode = document.body.dataset.demoPage || 'home';
  const studioPrivacyMasks = [
    { left: 66, top: 36, width: 34, height: 28 },
    { left: 58, top: 70, width: 35, height: 26 },
    { left: 57, top: 4, width: 32, height: 31 },
    { left: 61, top: 31, width: 34, height: 27 },
    { left: 3, top: 15, width: 42, height: 32 },
    { left: 40, top: 67, width: 33, height: 28 }
  ];

  const properties = [
    {
      id: 'NYK-CDE-01',
      title: 'Monoambiente mobiliado · KM 7',
      location: 'Zona aproximada da Av. São José · KM 7',
      type: 'Apartamento',
      status: 'Entrada imediata',
      availability: 'Entrada imediata',
      currency: 'PYG',
      rent: 1500000,
      deposit: 1500000,
      fee: 1500000,
      rooms: 0,
      bathrooms: 1,
      furnished: true,
      pet: false,
      kids: false,
      garage: true,
      included: ['Água', 'Coleta de lixo'],
      separate: ['Energia conforme consumo'],
      campuses: ['UPE'],
      distance: '1 km da Av. São José',
      immediate: true,
      zoneRadius: '1 km',
      map: { lat: -25.5018, lng: -54.6567, radiusMeters: 1000 },
      coverIndex: 5,
      media: Array.from({ length: 6 }, (_, index) => ({
        type: 'image',
        src: `${assetBase}local-studio-${String(index + 1).padStart(2, '0')}.webp`,
        alt: `Foto real neutralizada ${index + 1} de um monoambiente mobiliado em Ciudad del Este`,
        privacyMask: studioPrivacyMasks[index]
      }))
    },
    {
      id: 'NYK-CDE-02',
      title: 'Apartamento 2 quartos · Parque Linear',
      location: 'Região do Parque Linear · rota do ônibus',
      type: 'Apartamento',
      status: 'Consulta necessária',
      availability: 'Disponibilidade a confirmar',
      currency: 'PYG',
      rent: 3650000,
      deposit: 3650000,
      fee: null,
      rooms: 2,
      bathrooms: 2,
      furnished: false,
      pet: true,
      kids: null,
      garage: false,
      included: ['Água'],
      separate: ['Energia conforme consumo', 'Coleta de lixo'],
      campuses: ['UNINTER', 'UNIDA'],
      distance: '1,7 km da UNINTER · 2 km da UNIDA',
      immediate: false,
      zoneRadius: '1,2 km',
      map: { lat: -25.5275, lng: -54.638, radiusMeters: 1200 },
      media: [
        { type: 'video', src: `${assetBase}local-tour-apartamento-a.mp4`, poster: `${assetBase}local-tour-apartamento-a-poster.webp`, alt: 'Visita real neutralizada de um apartamento semimobiliado em Ciudad del Este', privacyMask: { left: 31, top: 64, width: 39, height: 23 } }
      ]
    },
    {
      id: 'NYK-CDE-03',
      title: 'Apartamento 2 quartos · Lago',
      location: 'Zona aproximada do Lago da República',
      type: 'Apartamento',
      status: 'A partir de 28/08',
      availability: 'Disponível a partir de 28/08',
      currency: 'PYG',
      rent: 2500000,
      deposit: 2500000,
      fee: 2500000,
      rooms: 2,
      bathrooms: 1,
      furnished: false,
      pet: false,
      kids: null,
      garage: false,
      included: ['Água', 'Coleta de lixo', 'Vaga para moto'],
      separate: ['Energia conforme consumo'],
      campuses: ['UCP', 'UNIDA'],
      distance: 'Próximo ao Lago da República',
      immediate: false,
      zoneRadius: '800 m',
      map: { lat: -25.5164, lng: -54.621, radiusMeters: 800 },
      media: [
        { type: 'video', src: `${assetBase}local-tour-apartamento-b.mp4`, poster: `${assetBase}local-tour-apartamento-b-poster.webp`, alt: 'Visita real neutralizada de outro apartamento semimobiliado em Ciudad del Este', privacyMask: { left: 58, top: 82, width: 42, height: 18 } }
      ]
    },
    {
      id: 'NYK-CDE-04',
      title: 'Casa mobiliada · Temporada',
      location: 'Zona universitária · Ciudad del Este',
      type: 'Temporada',
      status: 'Até novembro',
      availability: 'Contrato demonstrativo até novembro',
      currency: 'PYG',
      rent: 2200000,
      deposit: 0,
      fee: null,
      feeLabel: 'Taxa reduzida',
      rooms: 1,
      bathrooms: 1,
      furnished: true,
      pet: false,
      kids: null,
      garage: false,
      included: ['Água', 'Coleta de lixo', 'Internet', 'Vaga para moto'],
      separate: [],
      campuses: ['UCP', 'UNIDA'],
      distance: '2,6 km da UCP Lago · 2,8 km da UNIDA',
      immediate: true,
      zoneRadius: '1,5 km',
      map: { lat: -25.5098, lng: -54.635, radiusMeters: 1500 },
      media: [
        { type: 'video', src: `${assetBase}local-tour-mobiliado.mp4`, poster: `${assetBase}local-tour-mobiliado-poster.webp`, alt: 'Visita real neutralizada de uma casa mobiliada em Ciudad del Este', privacyMask: { left: 47, top: 34, width: 38, height: 30 } }
      ]
    },
    {
      id: 'NYK-CDE-05',
      title: 'Apartamento premium · Zona do Lago',
      location: 'Zona Lago da República · Ciudad del Este',
      type: 'Alto padrão',
      status: 'Destaque',
      availability: 'Disponibilidade a confirmar',
      currency: 'USD',
      rent: 1150,
      deposit: 1150,
      fee: 1100,
      monthlyExtra: 'Internet e TV: Gs. 250.000',
      rooms: 2,
      bathrooms: 2,
      furnished: true,
      pet: null,
      kids: null,
      garage: true,
      included: ['Mobiliário', 'Coworking', 'Área de lazer'],
      separate: ['Expensas', 'Energia elétrica', 'Internet e TV'],
      campuses: ['UCP', 'UNIDA'],
      distance: '8 min da UCP Lago · 5 min da UNIDA',
      immediate: false,
      zoneRadius: '1 km',
      map: { lat: -25.5105, lng: -54.6115, radiusMeters: 1000 },
      coverIndex: 7,
      media: Array.from({ length: 11 }, (_, index) => ({
        type: 'image',
        src: `${assetBase}local-premium-${String(index + 1).padStart(2, '0')}.webp`,
        alt: `Foto real neutralizada ${index + 1} de um residencial premium em Ciudad del Este`
      }))
    }
  ];

  const state = {
    campus: 'all',
    budget: 'all',
    rooms: 'all',
    currency: 'all',
    pet: false,
    furnished: false,
    included: false,
    immediate: false,
    favoritesOnly: pageMode === 'favorites',
    view: pageMode === 'map' ? 'map' : 'split'
  };

  const initialParams = new URLSearchParams(window.location.search);
  ['campus', 'budget', 'rooms', 'currency'].forEach((key) => {
    if (initialParams.has(key)) state[key] = initialParams.get(key);
  });
  ['pet', 'furnished', 'included', 'immediate'].forEach((key) => {
    if (initialParams.get(key) === '1') state[key] = true;
  });

  const compared = new Set();
  const cardMediaIndexes = new Map();
  const mapMarkers = new Map();
  const mapAreas = new Map();
  const favoriteStorageKey = 'nykuto-demo-imobiliaria-favorites';
  let favorites = readFavorites();
  let toastTimer;

  const propertyList = document.querySelector('[data-property-list]');
  const resultsSummary = document.querySelector('[data-results-summary]');
  const resultsLayout = document.querySelector('[data-results-layout]');
  const mapCanvas = document.querySelector('[data-map-canvas]');
  const emptyState = document.querySelector('[data-empty-state]');
  const propertyDialog = document.querySelector('[data-property-dialog]');
  const propertyDialogContent = document.querySelector('[data-property-dialog-content]');
  const compareDialog = document.querySelector('[data-compare-dialog]');
  const compareTable = document.querySelector('[data-compare-table]');
  const compareDock = document.querySelector('[data-compare-dock]');
  const compareCount = document.querySelector('[data-compare-count]');
  const whatsappFab = document.querySelector('[data-whatsapp-fab]');
  const whatsappFabCount = document.querySelector('[data-whatsapp-fab-count]');
  const whatsappFabLabel = document.querySelector('[data-whatsapp-fab-label]');
  const whatsappDialog = document.querySelector('[data-whatsapp-dialog]');
  const whatsappSelectionList = document.querySelector('[data-whatsapp-selection-list]');
  const whatsappSelectionSummary = document.querySelector('[data-whatsapp-selection-summary]');
  const whatsappSendAll = document.querySelector('[data-whatsapp-send-all]');
  const managerDialog = document.querySelector('[data-manager-dialog]');
  const filterDialog = document.querySelector('[data-filter-dialog]');
  const managerList = document.querySelector('[data-manager-list]');
  const toastOutput = document.querySelector('[data-demo-toast-output]');
  let realMap;
  let realMapLayers;
  let activeMapPropertyId = null;

  function readFavorites() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(favoriteStorageKey) || '[]');
      const validIds = new Set(properties.map((property) => property.id));
      return new Set(Array.isArray(saved) ? saved.filter((propertyId) => validIds.has(propertyId)) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveFavorites() {
    try { window.localStorage.setItem(favoriteStorageKey, JSON.stringify([...favorites])); } catch (_) { /* Storage can be unavailable. */ }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[character]));
  }

  function formatMoney(amount, currency) {
    if (amount === null || amount === undefined) return 'A consultar';
    if (currency === 'USD') return `US$ ${Number(amount).toLocaleString('pt-BR')}`;
    return `Gs. ${Number(amount).toLocaleString('pt-BR')}`;
  }

  function formatMapPrice(property) {
    if (property.currency === 'USD') return `US$ ${property.rent.toLocaleString('pt-BR')}`;
    const millions = property.rent / 1000000;
    return `Gs. ${millions.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi`;
  }

  function totalEntry(property) {
    if (property.fee === null || property.fee === undefined) return null;
    return property.rent + (property.deposit || 0) + property.fee;
  }

  function propertyPermalink(property) {
    return `${publicDemoOrigin}/imovel/${property.id.toLowerCase()}/`;
  }

  function guaranteeLabel(property) {
    if (property.deposit === 0) return 'Sem garantia';
    return formatMoney(property.deposit, property.currency);
  }

  function feeLabel(property) {
    return property.feeLabel || formatMoney(property.fee, property.currency);
  }

  function entryCostLabel(property) {
    const total = totalEntry(property);
    return total === null ? 'A confirmar' : formatMoney(total, property.currency);
  }

  function roomLabel(property) {
    if (property.rooms === 0) return 'Monoambiente';
    return `${property.rooms} ${property.rooms === 1 ? 'quarto' : 'quartos'}`;
  }

  function yesNoUnknown(value) {
    if (value === true) return 'Sim';
    if (value === false) return 'Não';
    return 'A confirmar';
  }

  function firstVisual(property) {
    const media = property.media[property.coverIndex || 0];
    return media.type === 'video' ? media.poster : media.src;
  }

  function selectedCardMedia(property) {
    const fallback = property.coverIndex || 0;
    const selected = cardMediaIndexes.has(property.id) ? cardMediaIndexes.get(property.id) : fallback;
    const index = Math.max(0, Math.min(property.media.length - 1, selected));
    return { media: property.media[index], index };
  }

  function privacyMaskMarkup(media, context = 'detail') {
    if (!media?.privacyMask) return '';
    const { left, top, width, height } = media.privacyMask;
    return `<span class="demo-media-privacy demo-media-privacy-${escapeHtml(context)}" style="--mask-left:${left}%;--mask-top:${top}%;--mask-width:${width}%;--mask-height:${height}%"><i aria-hidden="true">N</i><b>Identidade protegida</b></span>`;
  }

  function mediaLabel(property) {
    const videoCount = property.media.filter((item) => item.type === 'video').length;
    const imageCount = property.media.length - videoCount;
    if (videoCount && imageCount) return `${imageCount} fotos · ${videoCount} vídeo`;
    if (videoCount) return `${videoCount} vídeo`;
    return `${imageCount} fotos`;
  }

  function matchesFilters(property) {
    if (state.favoritesOnly && !favorites.has(property.id)) return false;
    if (state.campus !== 'all' && !property.campuses.includes(state.campus)) return false;
    if (state.currency !== 'all' && property.currency !== state.currency) return false;
    if (state.rooms !== 'all') {
      const requestedRooms = Number(state.rooms);
      if (requestedRooms === 2 ? property.rooms < 2 : property.rooms !== requestedRooms) return false;
    }
    if (state.budget === 'usd' && property.currency !== 'USD') return false;
    if (state.budget !== 'all' && state.budget !== 'usd') {
      if (property.currency !== 'PYG' || property.rent > Number(state.budget)) return false;
    }
    if (state.pet && property.pet !== true) return false;
    if (state.furnished && !property.furnished) return false;
    if (state.included && property.included.length < 2) return false;
    if (state.immediate && !property.immediate) return false;
    return true;
  }

  function listingCard(property) {
    const isFavorite = favorites.has(property.id);
    const isCompared = compared.has(property.id);
    const { media, index: mediaIndex } = selectedCardMedia(property);
    const visual = media.type === 'video' ? media.poster : media.src;
    const specs = [
      roomLabel(property),
      `${property.bathrooms} ${property.bathrooms === 1 ? 'banheiro' : 'banheiros'}`,
      property.furnished ? 'Mobiliado' : 'Semimobiliado',
      property.pet === true ? 'Aceita pet' : property.pet === false ? 'Sem pet' : 'Pet a confirmar'
    ];

    return `
      <article class="demo-listing-card${isFavorite ? ' is-favorite' : ''}" data-card-id="${escapeHtml(property.id)}">
        <div class="demo-listing-media">
          <button class="demo-listing-open-media" type="button" data-action="details" data-property-id="${escapeHtml(property.id)}" data-media-index="${mediaIndex}" aria-label="Abrir ${escapeHtml(property.title)}">
            <img src="${escapeHtml(visual)}" alt="${escapeHtml(media.alt)}" width="720" height="560" loading="lazy" decoding="async" />
            ${privacyMaskMarkup(media, 'card')}
            ${media.type === 'video' ? '<span class="demo-card-play" aria-hidden="true">▶</span>' : ''}
          </button>
          <span class="demo-listing-status">${escapeHtml(property.status)}</span>
          <span class="demo-listing-type">${escapeHtml(property.type)}</span>
          <button class="demo-favorite-button${isFavorite ? ' active' : ''}" type="button" data-action="favorite" data-property-id="${escapeHtml(property.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${isFavorite ? '♥' : '♡'}</button>
          ${property.media.length > 1 ? `
            <button class="demo-card-media-nav previous" type="button" data-action="media-previous" data-property-id="${escapeHtml(property.id)}" aria-label="Mídia anterior">‹</button>
            <button class="demo-card-media-nav next" type="button" data-action="media-next" data-property-id="${escapeHtml(property.id)}" aria-label="Próxima mídia">›</button>
          ` : ''}
          <span class="demo-media-count">${property.media.length > 1 ? `${mediaIndex + 1} / ${property.media.length}` : escapeHtml(mediaLabel(property))}</span>
        </div>
        <div class="demo-listing-content">
          <div class="demo-listing-ref"><span>${escapeHtml(property.id)}</span><span>Zona ${escapeHtml(property.zoneRadius)}</span></div>
          <h3>${escapeHtml(property.title)}</h3>
          <p class="demo-listing-location">⌖ ${escapeHtml(property.location)}</p>
          <p class="demo-listing-distance">${escapeHtml(property.distance)}</p>
          <div class="demo-listing-specs">${specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join('')}</div>
          <div class="demo-listing-price">
            <div><strong>${escapeHtml(formatMoney(property.rent, property.currency))}</strong><small>por mês</small></div>
            <div class="demo-listing-actions">
              <button type="button" data-action="details" data-property-id="${escapeHtml(property.id)}" data-media-index="${mediaIndex}">Ver imóvel</button>
              <button class="${isCompared ? 'active' : ''}" type="button" data-action="compare" data-property-id="${escapeHtml(property.id)}" aria-pressed="${isCompared}" aria-label="${isCompared ? 'Remover da comparação' : 'Adicionar à comparação'}">${isCompared ? '✓' : '＋'}</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function initializeRealMap() {
    if (!mapCanvas) return;
    if (!window.L) {
      mapCanvas.innerHTML = '<div class="demo-map-unavailable"><p>O mapa real não pôde ser carregado. As zonas continuam disponíveis nas fichas dos imóveis.</p></div>';
      mapCanvas.dataset.mapReady = 'false';
      return;
    }

    mapCanvas.replaceChildren();
    realMap = window.L.map(mapCanvas, {
      zoomControl: true,
      scrollWheelZoom: false,
      minZoom: 12,
      maxZoom: 17
    }).setView(ciudadDelEsteCenter, 13);

    window.L.tileLayer(openStreetMapTiles, {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(realMap);

    window.L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(realMap);
    realMapLayers = window.L.featureGroup().addTo(realMap);
    mapCanvas.dataset.mapReady = 'true';
  }

  function mapPreview(property) {
    const { media } = selectedCardMedia(property);
    const preview = document.createElement('article');
    preview.className = 'demo-map-preview';
    preview.innerHTML = `
      <figure><img src="${escapeHtml(media.type === 'video' ? media.poster : media.src)}" alt="" width="220" height="140" />${privacyMaskMarkup(media, 'popup')}</figure>
      <div><span>${escapeHtml(property.status)}</span><strong>${escapeHtml(property.title)}</strong><small>${escapeHtml(property.distance)}</small><b>${escapeHtml(formatMoney(property.rent, property.currency))}<em>/mês</em></b><button type="button">Ver imóvel</button></div>
    `;
    preview.querySelector('button')?.addEventListener('click', () => openProperty(property.id));
    return preview;
  }

  function styleMapSelection(propertyId) {
    activeMapPropertyId = propertyId || null;
    mapMarkers.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('is-active', id === activeMapPropertyId);
    });
    mapAreas.forEach((area, id) => {
      const active = id === activeMapPropertyId;
      area.setStyle({
        weight: active ? 2 : 1,
        opacity: active ? 0.78 : 0.18,
        fillOpacity: active ? 0.17 : 0.035
      });
    });
    document.querySelectorAll('[data-card-id]').forEach((card) => {
      card.classList.toggle('is-map-active', card.dataset.cardId === activeMapPropertyId);
    });
  }

  function focusPropertyOnMap(propertyId, { openPreview = false, scrollCard = false } = {}) {
    const property = getProperty(propertyId);
    const marker = mapMarkers.get(propertyId);
    if (!property || !marker || !realMap) return;
    styleMapSelection(propertyId);
    if (openPreview) {
      marker.openPopup();
      realMap.panTo([property.map.lat, property.map.lng], { animate: true, duration: 0.35 });
    }
    if (scrollCard && state.view !== 'map') {
      const card = document.querySelector(`[data-card-id="${CSS.escape(propertyId)}"]`);
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function renderMap(filteredProperties) {
    if (!realMap || !realMapLayers || !window.L) return;
    realMapLayers.clearLayers();
    mapMarkers.clear();
    mapAreas.clear();

    filteredProperties.forEach((property) => {
      const coordinates = [property.map.lat, property.map.lng];
      const area = window.L.circle(coordinates, {
        radius: property.map.radiusMeters,
        color: '#174f43',
        weight: 1,
        opacity: 0.18,
        fillColor: '#40987d',
        fillOpacity: 0.035,
        interactive: false
      });
      const marker = window.L.marker(coordinates, {
        keyboard: true,
        title: `${property.title} · ${formatMoney(property.rent, property.currency)}`,
        icon: window.L.divIcon({
          className: 'demo-map-price-icon',
          html: `<span data-currency="${escapeHtml(property.currency)}">${escapeHtml(formatMapPrice(property))}</span>`,
          iconSize: [70, 34],
          iconAnchor: [35, 17]
        })
      });

      marker.bindPopup(mapPreview(property), { closeButton: false, offset: [0, -12], maxWidth: 250, minWidth: 230 });
      marker.on('click', () => focusPropertyOnMap(property.id, { openPreview: true, scrollCard: true }));
      marker.on('mouseover', () => styleMapSelection(property.id));
      marker.on('mouseout', () => { if (!marker.isPopupOpen()) styleMapSelection(null); });
      marker.on('popupclose', () => styleMapSelection(null));
      marker.on('add', () => {
        const element = marker.getElement();
        if (!element) return;
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', `Abrir ${property.title}, ${formatMoney(property.rent, property.currency)}, zona aproximada de ${property.zoneRadius}`);
      });
      area.addTo(realMapLayers);
      marker.addTo(realMapLayers);
      mapAreas.set(property.id, area);
      mapMarkers.set(property.id, marker);
    });

    window.setTimeout(() => {
      realMap.invalidateSize({ animate: false });
      if (!filteredProperties.length) {
        realMap.setView(ciudadDelEsteCenter, 13, { animate: false });
        return;
      }
      const bounds = realMapLayers.getBounds();
      if (bounds.isValid()) realMap.fitBounds(bounds, { padding: [28, 28], maxZoom: 14, animate: false });
      styleMapSelection(activeMapPropertyId && mapMarkers.has(activeMapPropertyId) ? activeMapPropertyId : null);
    }, 0);
  }

  function renderManagerList() {
    if (!managerList) return;
    managerList.innerHTML = properties.map((property, index) => `
      <article class="demo-manager-row">
        <img src="${escapeHtml(firstVisual(property))}" alt="" width="84" height="72" loading="lazy" />
        <div><strong>${escapeHtml(property.title)}</strong><span>${escapeHtml(property.id)} · ${escapeHtml(formatMoney(property.rent, property.currency))}</span><small>Ficha ${Math.min(100, 68 + property.media.length * 3)}% completa</small></div>
        <b>${index < 3 ? 'Publicado' : 'Verificar'}</b>
        <button type="button" data-demo-toast="Na versão ativa, este botão abre a edição do imóvel ${escapeHtml(property.id)}." aria-label="Editar ${escapeHtml(property.title)}">⋮</button>
      </article>
    `).join('');
  }

  function render() {
    const filtered = properties.filter(matchesFilters);
    propertyList.innerHTML = filtered.map(listingCard).join('');
    renderMap(filtered);
    resultsSummary.textContent = state.favoritesOnly
      ? `${filtered.length} ${filtered.length === 1 ? 'favorito salvo' : 'favoritos salvos'}`
      : `${filtered.length} ${filtered.length === 1 ? 'opção encontrada' : 'opções encontradas'}`;
    const emptyTitle = emptyState?.querySelector('h3');
    const emptyCopy = emptyState?.querySelector('p');
    if (emptyTitle && emptyCopy) {
      emptyTitle.textContent = state.favoritesOnly ? 'Você ainda não salvou nenhum imóvel' : 'Nenhum imóvel com estes filtros';
      emptyCopy.textContent = state.favoritesOnly ? 'Toque no coração de um anúncio para encontrá-lo aqui.' : 'Remova um critério para visualizar outras opções.';
    }
    emptyState.hidden = filtered.length > 0;
    resultsLayout.hidden = filtered.length === 0;
    resultsLayout.classList.toggle('map-only', state.view === 'map');
    updateFilterControls();
    updateCompareDock();
    updateWhatsAppFab();
    window.requestAnimationFrame(() => document.querySelectorAll('.demo-listing-card').forEach((card) => card.classList.add('is-visible')));
  }

  function updateFilterControls() {
    document.querySelectorAll('[data-filter]').forEach((control) => {
      const key = control.dataset.filter;
      if (key in state) control.value = state[key];
    });
    document.querySelectorAll('[data-filter-toggle]').forEach((button) => {
      const key = button.dataset.filterToggle;
      const active = Boolean(state[key]);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-quick-filter]').forEach((button) => {
      const key = button.dataset.quickFilter;
      const active = Boolean(state[key]);
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const mainSearch = document.querySelector('[data-main-search]');
    if (mainSearch) {
      mainSearch.elements.campus.value = state.campus;
      mainSearch.elements.budget.value = state.budget;
    }
    const activeFilterCount = [
      state.campus !== 'all', state.budget !== 'all' || state.currency !== 'all', state.rooms !== 'all',
      state.pet, state.furnished, state.included, state.immediate, state.favoritesOnly
    ].filter(Boolean).length;
    document.querySelectorAll('[data-filter-count]').forEach((badge) => {
      badge.textContent = String(activeFilterCount);
      badge.hidden = activeFilterCount === 0;
    });
    document.querySelectorAll('[data-clear-filters]').forEach((button) => {
      if (button.closest('.demo-filter-dialog-actions')) return;
      button.hidden = activeFilterCount === 0;
    });
    document.querySelectorAll('[data-show-favorites]').forEach((button) => {
      button.classList.toggle('active', state.favoritesOnly);
      button.setAttribute('aria-pressed', String(state.favoritesOnly));
    });
  }

  function resetFilters() {
    Object.assign(state, { campus: 'all', budget: 'all', rooms: 'all', currency: 'all', pet: false, furnished: false, included: false, immediate: false, favoritesOnly: false });
    render();
  }

  function toggleFavorite(propertyId) {
    if (favorites.has(propertyId)) favorites.delete(propertyId);
    else favorites.add(propertyId);
    saveFavorites();
    render();
    showToast(favorites.has(propertyId) ? 'Imóvel salvo. Toque no WhatsApp para enviar.' : 'Imóvel removido dos favoritos.');
  }

  function toggleCompare(propertyId) {
    if (compared.has(propertyId)) compared.delete(propertyId);
    else if (compared.size >= 3) {
      showToast('Você pode comparar até três imóveis por vez.');
      return;
    } else compared.add(propertyId);
    render();
  }

  function updateCompareDock() {
    const count = compared.size;
    compareDock.hidden = count === 0;
    compareCount.textContent = `${count} ${count === 1 ? 'imóvel selecionado' : 'imóveis selecionados'}`;
    document.body.classList.toggle('has-compare-selection', count > 0);
  }

  function selectedFavoriteProperties() {
    return properties.filter((property) => favorites.has(property.id));
  }

  function updateWhatsAppFab() {
    if (!whatsappFab || !whatsappFabCount || !whatsappFabLabel) return;
    const count = favorites.size;
    whatsappFab.classList.toggle('has-selection', count > 0);
    whatsappFabCount.hidden = count === 0;
    whatsappFabCount.textContent = String(count);
    whatsappFabLabel.textContent = count === 0
      ? 'Falar agora'
      : count === 1
        ? 'Enviar 1 favorito'
        : `Enviar ${count} favoritos`;
    whatsappFab.setAttribute('aria-label', count === 0
      ? 'Falar com a Assessoria Nykuto pelo WhatsApp'
      : `Consultar ${count} ${count === 1 ? 'imóvel favorito' : 'imóveis favoritos'} pelo WhatsApp`);
  }

  function getProperty(propertyId) {
    return properties.find((property) => property.id === propertyId);
  }

  function renderMainMedia(media) {
    const privacyMask = privacyMaskMarkup(media, 'detail');
    if (media.type === 'video') {
      return `<video controls playsinline preload="metadata" poster="${escapeHtml(media.poster)}" aria-label="${escapeHtml(media.alt)}"><source src="${escapeHtml(media.src)}" type="video/mp4" />Seu navegador não consegue reproduzir este vídeo.</video>${privacyMask}<span class="demo-detail-media-kind">▶ Vídeo real</span>`;
    }
    return `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt)}" width="1200" height="900" />${privacyMask}<span class="demo-detail-media-kind">Foto real</span>`;
  }

  function detailMainMediaMarkup(property, index) {
    return `${renderMainMedia(property.media[index])}${property.media.length > 1 ? '<button class="demo-detail-media-nav previous" type="button" data-detail-media-direction="-1" aria-label="Mídia anterior">‹</button><button class="demo-detail-media-nav next" type="button" data-detail-media-direction="1" aria-label="Próxima mídia">›</button>' : ''}`;
  }

  function selectDetailMedia(index) {
    const property = getProperty(propertyDialogContent?.dataset.propertyId);
    const mainMedia = propertyDialogContent?.querySelector('[data-detail-main-media]');
    if (!property || !mainMedia) return;
    const normalizedIndex = (index + property.media.length) % property.media.length;
    mainMedia.querySelector('video')?.pause();
    mainMedia.innerHTML = detailMainMediaMarkup(property, normalizedIndex);
    propertyDialogContent.dataset.mediaIndex = String(normalizedIndex);
    propertyDialogContent.querySelectorAll('[data-gallery-index]').forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.galleryIndex) === normalizedIndex);
    });
    propertyDialogContent.querySelector(`[data-gallery-index="${normalizedIndex}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  function propertyDetailsMarkup(property, selectedIndex = 0) {
    const includedLabel = property.included.join(' · ');
    const separateLabel = property.separate.length ? property.separate.join(' · ') : 'Nenhuma despesa adicional informada';
    const tags = [
      ...property.included.map((item) => `Incluso: ${item}`),
      property.furnished ? 'Mobiliado' : 'Semimobiliado',
      property.pet === true ? 'Aceita pet' : property.pet === false ? 'Não aceita pet' : 'Pet a confirmar',
      property.garage ? 'Garagem' : 'Sem garagem para carro'
    ];

    return `
      <div class="demo-detail-layout">
        <section class="demo-detail-media">
          <button class="demo-detail-close demo-detail-close-floating" type="button" data-close-dialog aria-label="Fechar detalhes">×</button>
          <div class="demo-detail-main-media" data-detail-main-media>${detailMainMediaMarkup(property, selectedIndex)}</div>
          <div class="demo-detail-gallery-bar"><span><strong>${property.media.length}</strong> ${property.media.length === 1 ? 'mídia' : 'mídias'} neutralizadas</span><small>Deslize para explorar</small></div>
          ${property.media.length > 1 ? `<div class="demo-detail-gallery" aria-label="Galeria do imóvel">${property.media.map((media, index) => `<button class="${index === selectedIndex ? 'active' : ''}" type="button" data-gallery-index="${index}" aria-label="Mostrar mídia ${index + 1}"><img src="${escapeHtml(media.type === 'video' ? media.poster : media.src)}" alt="" width="140" height="108" loading="lazy" />${media.type === 'video' ? '<i aria-hidden="true">▶</i>' : ''}</button>`).join('')}</div>` : ''}
        </section>
        <section class="demo-detail-copy">
          <header><div><span class="demo-detail-status">${escapeHtml(property.status)}</span><h2>${escapeHtml(property.title)}</h2><p class="demo-detail-location">⌖ ${escapeHtml(property.location)} · ${escapeHtml(property.id)}</p></div><button class="demo-detail-favorite${favorites.has(property.id) ? ' active' : ''}" type="button" data-favorite-detail data-property-id="${escapeHtml(property.id)}" aria-pressed="${favorites.has(property.id)}" aria-label="${favorites.has(property.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${favorites.has(property.id) ? '♥' : '♡'}</button></header>
          <div class="demo-detail-price"><div><span>Aluguel mensal</span><strong>${escapeHtml(formatMoney(property.rent, property.currency))}</strong><small>${escapeHtml(property.availability)}</small></div><b>${escapeHtml(property.distance)}</b></div>
          <div class="demo-detail-trust"><span>✓ Custos organizados</span><span>✓ Zona protegida</span><span>✓ Mídias reais</span></div>
          <div class="demo-detail-grid">
            <div><span>Configuração</span><strong>${escapeHtml(roomLabel(property))} · ${property.bathrooms} ${property.bathrooms === 1 ? 'banheiro' : 'banheiros'}</strong></div>
            <div><span>Faculdades</span><strong>${escapeHtml(property.campuses.join(' · '))}</strong></div>
            <div><span>Pet</span><strong>${escapeHtml(yesNoUnknown(property.pet))}</strong></div>
            <div><span>Crianças</span><strong>${escapeHtml(yesNoUnknown(property.kids))}</strong></div>
            <div><span>Incluso</span><strong>${escapeHtml(includedLabel)}</strong></div>
            <div><span>Pago à parte</span><strong>${escapeHtml(separateLabel)}</strong></div>
          </div>
          <div class="demo-entry-breakdown">
            <strong>Custo de entrada</strong>
            <dl>
              <div><dt>Primeiro aluguel</dt><dd>${escapeHtml(formatMoney(property.rent, property.currency))}</dd></div>
              <div><dt>Garantia</dt><dd>${escapeHtml(guaranteeLabel(property))}</dd></div>
              <div><dt>Taxa imobiliária</dt><dd>${escapeHtml(feeLabel(property))}</dd></div>
              <div class="total"><dt>Total calculável</dt><dd>${escapeHtml(entryCostLabel(property))}</dd></div>
            </dl>
            ${property.monthlyExtra ? `<small>${escapeHtml(property.monthlyExtra)}</small>` : ''}
          </div>
          <div class="demo-detail-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          <div class="demo-detail-zone"><i aria-hidden="true"><b></b></i><div><strong>Zona aproximada · raio ${escapeHtml(property.zoneRadius)}</strong><span>${escapeHtml(property.distance)}. O endereço exato é enviado somente durante o atendimento.</span></div><button type="button" data-focus-map data-property-id="${escapeHtml(property.id)}">Ver no mapa</button></div>
          <p class="demo-detail-concept-note">Mídias reais neutralizadas; preços, disponibilidade e dados da ficha são ilustrativos.</p>
          <div class="demo-contact-simulation"><button type="button" data-whatsapp-property data-property-id="${escapeHtml(property.id)}"><span aria-hidden="true">◉</span> Consultar no WhatsApp</button><button type="button" data-schedule-visit data-property-id="${escapeHtml(property.id)}">Agendar visita</button><button type="button" data-share-property data-property-id="${escapeHtml(property.id)}" aria-label="Compartilhar imóvel">↗</button></div>
        </section>
      </div>
    `;
  }

  function openProperty(propertyId, mediaIndex) {
    const property = getProperty(propertyId);
    if (!property || !propertyDialog) return;
    const preferredIndex = Number.isInteger(mediaIndex) ? mediaIndex : (property.coverIndex || 0);
    const selectedIndex = Math.max(0, Math.min(property.media.length - 1, preferredIndex));
    propertyDialogContent.innerHTML = propertyDetailsMarkup(property, selectedIndex);
    propertyDialogContent.dataset.propertyId = property.id;
    propertyDialogContent.dataset.mediaIndex = String(selectedIndex);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#imovel=${encodeURIComponent(property.id)}`);
    openDialog(propertyDialog);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    const playingVideo = dialog.querySelector('video');
    if (playingVideo) playingVideo.pause();
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    if (dialog === propertyDialog && window.location.hash.startsWith('#imovel=')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  }

  function openComparison() {
    const selected = properties.filter((property) => compared.has(property.id));
    if (!selected.length) return;
    const rows = [
      ['Aluguel', (property) => formatMoney(property.rent, property.currency)],
      ['Entrada', (property) => totalEntry(property) === null ? 'A confirmar' : formatMoney(totalEntry(property), property.currency)],
      ['Configuração', (property) => `${roomLabel(property)} · ${property.bathrooms} banheiro${property.bathrooms > 1 ? 's' : ''}`],
      ['Mobiliado', (property) => yesNoUnknown(property.furnished)],
      ['Aceita pet', (property) => yesNoUnknown(property.pet)],
      ['Garagem', (property) => property.garage ? 'Sim' : 'Não'],
      ['Localização', (property) => property.distance],
      ['Despesas inclusas', (property) => property.included.join(', ')]
    ];
    compareTable.innerHTML = `
      <table class="demo-compare-table">
        <tbody>
          <tr><th>Imóvel</th>${selected.map((property) => `<td class="demo-compare-property"><img src="${escapeHtml(firstVisual(property))}" alt="" width="360" height="225" /><strong>${escapeHtml(property.title)}</strong><span>${escapeHtml(property.id)}</span></td>`).join('')}</tr>
          ${rows.map(([label, resolver]) => `<tr><th>${escapeHtml(label)}</th>${selected.map((property) => `<td>${escapeHtml(resolver(property))}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    `;
    openDialog(compareDialog);
  }

  function propertyContactMessage(property, intent = 'informações') {
    const included = property.included.length ? property.included.join(', ') : 'Nenhuma informada';
    const separate = property.separate.length ? property.separate.join(', ') : 'Nenhuma informada';
    const lines = [
      'Olá! Tenho interesse neste imóvel da Assessoria Nykuto:',
      '',
      `🏠 ${property.title}`,
      `🔖 Referência: ${property.id}`,
      `📍 ${property.location} (localização aproximada)`,
      `🛏 ${roomLabel(property)} · 🚿 ${property.bathrooms} ${property.bathrooms === 1 ? 'banheiro' : 'banheiros'}`,
      `🪑 Mobiliado: ${yesNoUnknown(property.furnished)} · 🐾 Pet: ${yesNoUnknown(property.pet)} · 🚗 Garagem: ${property.garage ? 'Sim' : 'Não'}`,
      `💰 Aluguel: ${formatMoney(property.rent, property.currency)}`,
      `🔐 Garantia: ${guaranteeLabel(property)}`,
      `🧾 Taxa de assessoria: ${feeLabel(property)}`,
      `💳 Custo total de entrada: ${entryCostLabel(property)}`,
      `✅ Despesas inclusas: ${included}`,
      `➕ Despesas à parte: ${separate}`,
      `📅 Disponibilidade: ${property.availability}`,
      property.monthlyExtra ? `ℹ️ ${property.monthlyExtra}` : '',
      `🔗 ${propertyPermalink(property)}`,
      '',
      intent === 'visita'
        ? 'Este imóvel ainda está disponível? Gostaria de agendar uma visita.'
        : 'Este imóvel ainda está disponível? Gostaria de receber mais informações e, se possível, agendar uma visita.'
    ];
    return lines.filter((line, index) => line || index === 1 || index === lines.length - 2).join('\n');
  }

  function multiplePropertiesContactMessage(selected) {
    const propertyBlocks = selected.map((property, index) => [
      `${index + 1}. ${property.id} — ${property.title}`,
      `📍 ${property.location}`,
      `💰 Aluguel: ${formatMoney(property.rent, property.currency)} · Garantia: ${guaranteeLabel(property)} · Taxa: ${feeLabel(property)}`,
      `💳 Entrada: ${entryCostLabel(property)}`,
      `✅ Inclusos: ${property.included.length ? property.included.join(', ') : 'Nenhum informado'}`,
      `🔗 ${propertyPermalink(property)}`
    ].join('\n')).join('\n\n');

    return [
      `Olá! Salvei ${selected.length} imóveis no site da Assessoria Nykuto e gostaria de verificar a disponibilidade:`,
      '',
      propertyBlocks,
      '',
      'Esses imóveis ainda estão disponíveis? Poderia me orientar sobre as melhores opções, o custo total de entrada e o agendamento de visitas?'
    ].join('\n');
  }

  function genericContactMessage() {
    return [
      'Olá! Estou procurando um imóvel em Ciudad del Este.',
      '',
      'Poderia me ajudar a encontrar uma opção de acordo com meu orçamento e minhas preferências?'
    ].join('\n');
  }

  function openWhatsApp(message) {
    if (window.NykutoWhatsApp?.open) {
      window.NykutoWhatsApp.open(whatsappPhone, message);
      return;
    }
    window.location.href = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
  }

  function contactProperty(propertyId, intent = 'informações') {
    const property = getProperty(propertyId);
    if (!property) return;
    openWhatsApp(propertyContactMessage(property, intent));
  }

  function renderWhatsAppSelection() {
    const selected = selectedFavoriteProperties();
    if (!selected.length || !whatsappSelectionList || !whatsappSelectionSummary || !whatsappSendAll) return;
    whatsappSelectionSummary.textContent = selected.length === 1
      ? 'Seu imóvel favorito está pronto para ser enviado.'
      : `Você salvou ${selected.length} imóveis. Escolha um deles ou envie todos em uma única mensagem.`;
    whatsappSelectionList.innerHTML = selected.map((property) => `
      <article class="demo-whatsapp-choice">
        <img src="${escapeHtml(firstVisual(property))}" alt="" width="112" height="88" loading="lazy" />
        <div><span>${escapeHtml(property.id)}</span><strong>${escapeHtml(property.title)}</strong><small>${escapeHtml(formatMoney(property.rent, property.currency))} · ${escapeHtml(property.availability)}</small></div>
        <button type="button" data-whatsapp-property="${escapeHtml(property.id)}">Consultar este</button>
      </article>
    `).join('');
    whatsappSendAll.textContent = `Enviar os ${selected.length} imóveis`;
    whatsappSendAll.hidden = selected.length < 2;
  }

  function handleWhatsAppFab() {
    const selected = selectedFavoriteProperties();
    if (!selected.length) {
      openWhatsApp(genericContactMessage());
      return;
    }
    if (selected.length === 1) {
      openWhatsApp(propertyContactMessage(selected[0]));
      return;
    }
    renderWhatsAppSelection();
    openDialog(whatsappDialog);
  }

  async function shareProperty(propertyId) {
    const property = getProperty(propertyId);
    if (!property) return;
    const shareData = {
      title: `${property.title} · Assessoria Nykuto`,
      text: `${property.title} — ${formatMoney(property.rent, property.currency)}. Confira a ficha e consulte a disponibilidade.`,
      url: propertyPermalink(property)
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        showToast('Link demonstrativo copiado.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Não foi possível compartilhar neste navegador.');
    }
  }

  function showToast(message) {
    if (!toastOutput) return;
    window.clearTimeout(toastTimer);
    toastOutput.textContent = message;
    toastOutput.hidden = false;
    toastTimer = window.setTimeout(() => { toastOutput.hidden = true; }, 4200);
  }

  function setView(view, { scroll = false } = {}) {
    state.view = view;
    resultsLayout.classList.toggle('map-only', state.view === 'map');
    document.querySelectorAll('[data-view]').forEach((viewButton) => {
      const active = viewButton.dataset.view === state.view;
      viewButton.classList.toggle('active', active);
      viewButton.setAttribute('aria-pressed', String(active));
    });
    if (scroll) document.querySelector('#demo-mapa')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => realMap?.invalidateSize({ animate: false }), 220);
  }

  document.querySelector('[data-main-search]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (pageMode === 'home') {
      const params = new URLSearchParams();
      if (form.elements.campus.value !== 'all') params.set('campus', form.elements.campus.value);
      if (form.elements.budget.value !== 'all') params.set('budget', form.elements.budget.value);
      window.location.href = `/imoveis/${params.size ? `?${params.toString()}` : ''}`;
      return;
    }
    state.campus = form.elements.campus.value;
    state.budget = form.elements.budget.value;
    if (state.budget === 'usd') state.currency = 'USD';
    else if (state.budget !== 'all') state.currency = 'PYG';
    else state.currency = 'all';
    render();
    document.querySelector('#demo-imoveis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.querySelectorAll('[data-filter]').forEach((control) => {
    control.addEventListener('change', () => {
      state[control.dataset.filter] = control.value;
      if (control.dataset.filter === 'currency' && control.value !== 'all') state.budget = control.value === 'USD' ? 'usd' : 'all';
      if (control.dataset.filter === 'budget') {
        if (control.value === 'usd') state.currency = 'USD';
        else if (control.value !== 'all') state.currency = 'PYG';
        else state.currency = 'all';
      }
      render();
    });
  });

  document.querySelectorAll('[data-filter-toggle], [data-quick-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.filterToggle || button.dataset.quickFilter;
      state[key] = !state[key];
      render();
    });
  });

  document.querySelectorAll('[data-clear-filters]').forEach((button) => button.addEventListener('click', resetFilters));

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      setView(button.dataset.view, { scroll: button.dataset.view === 'map' });
    });
  });

  propertyList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const propertyId = button.dataset.propertyId;
    if (button.dataset.action === 'favorite') toggleFavorite(propertyId);
    if (button.dataset.action === 'compare') toggleCompare(propertyId);
    if (button.dataset.action === 'details') openProperty(propertyId, Number(button.dataset.mediaIndex));
    if (button.dataset.action === 'media-previous' || button.dataset.action === 'media-next') {
      const property = getProperty(propertyId);
      if (!property) return;
      const current = selectedCardMedia(property).index;
      const direction = button.dataset.action === 'media-next' ? 1 : -1;
      cardMediaIndexes.set(propertyId, (current + direction + property.media.length) % property.media.length);
      render();
      focusPropertyOnMap(propertyId);
    }
  });

  propertyList?.addEventListener('pointerover', (event) => {
    const card = event.target.closest('[data-card-id]');
    if (card && !card.contains(event.relatedTarget)) focusPropertyOnMap(card.dataset.cardId);
  });

  propertyList?.addEventListener('pointerout', (event) => {
    const card = event.target.closest('[data-card-id]');
    if (card && !card.contains(event.relatedTarget)) styleMapSelection(null);
  });

  propertyList?.addEventListener('focusin', (event) => {
    const card = event.target.closest('[data-card-id]');
    if (card) focusPropertyOnMap(card.dataset.cardId);
  });

  propertyList?.addEventListener('focusout', (event) => {
    const card = event.target.closest('[data-card-id]');
    if (card && !card.contains(event.relatedTarget)) styleMapSelection(null);
  });

  document.querySelectorAll('[data-property-id]:not([data-action])').forEach((button) => {
    button.addEventListener('click', () => openProperty(button.dataset.propertyId));
  });

  propertyDialogContent?.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) {
      event.stopPropagation();
      return closeDialog(propertyDialog);
    }

    const galleryButton = event.target.closest('[data-gallery-index]');
    if (galleryButton) {
      selectDetailMedia(Number(galleryButton.dataset.galleryIndex));
      return;
    }

    const detailDirection = event.target.closest('[data-detail-media-direction]');
    if (detailDirection) {
      selectDetailMedia(Number(propertyDialogContent.dataset.mediaIndex || 0) + Number(detailDirection.dataset.detailMediaDirection));
      return;
    }

    const whatsAppButton = event.target.closest('[data-whatsapp-property]');
    if (whatsAppButton) return contactProperty(whatsAppButton.dataset.propertyId);
    const scheduleButton = event.target.closest('[data-schedule-visit]');
    if (scheduleButton) return contactProperty(scheduleButton.dataset.propertyId, 'visita');
    const shareButton = event.target.closest('[data-share-property]');
    if (shareButton) return shareProperty(shareButton.dataset.propertyId);
    const favoriteButton = event.target.closest('[data-favorite-detail]');
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.propertyId);
      const active = favorites.has(favoriteButton.dataset.propertyId);
      favoriteButton.classList.toggle('active', active);
      favoriteButton.setAttribute('aria-pressed', String(active));
      favoriteButton.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      favoriteButton.textContent = active ? '♥' : '♡';
      return;
    }
    const mapButton = event.target.closest('[data-focus-map]');
    if (mapButton) {
      closeDialog(propertyDialog);
      setView('map', { scroll: true });
      window.setTimeout(() => focusPropertyOnMap(mapButton.dataset.propertyId, { openPreview: true }), 320);
    }
  });

  document.querySelector('[data-open-compare]')?.addEventListener('click', openComparison);
  document.querySelector('[data-clear-compare]')?.addEventListener('click', () => { compared.clear(); render(); });
  whatsappFab?.addEventListener('click', handleWhatsAppFab);
  whatsappSelectionList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-whatsapp-property]');
    if (!button) return;
    closeDialog(whatsappDialog);
    contactProperty(button.dataset.whatsappProperty);
  });
  whatsappSendAll?.addEventListener('click', () => {
    const selected = selectedFavoriteProperties();
    if (!selected.length) return;
    closeDialog(whatsappDialog);
    openWhatsApp(multiplePropertiesContactMessage(selected));
  });
  document.querySelectorAll('[data-open-manager]').forEach((button) => button.addEventListener('click', () => openDialog(managerDialog)));
  document.querySelectorAll('[data-open-filters]').forEach((button) => button.addEventListener('click', () => openDialog(filterDialog)));
  document.querySelectorAll('[data-apply-filters]').forEach((button) => button.addEventListener('click', () => {
    closeDialog(filterDialog);
    document.querySelector('#demo-imoveis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  document.querySelectorAll('[data-show-favorites]').forEach((button) => button.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    render();
    document.querySelector('#demo-imoveis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  document.querySelectorAll('[data-mobile-map]').forEach((button) => button.addEventListener('click', () => setView('map', { scroll: true })));
  document.querySelector('[data-map-info]')?.addEventListener('click', () => showToast('O mapa e as ruas são reais. Cada círculo mostra apenas uma zona aproximada; o endereço exato não é exibido.'));

  document.querySelectorAll('.demo-dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
      const closeButton = event.target.closest('[data-close-dialog]');
      if (closeButton) closeDialog(dialog);
    });
  });

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-demo-toast]');
    if (trigger) showToast(trigger.dataset.demoToast);
  });

  const radiusInput = document.querySelector('[data-radius-preview]');
  const radiusOutput = document.querySelector('[data-radius-output]');
  radiusInput?.addEventListener('input', () => {
    const meters = Number(radiusInput.value);
    radiusOutput.textContent = meters >= 1000 ? `${(meters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km` : `${meters} m`;
  });

  initializeRealMap();
  renderManagerList();
  render();

  const propertyHash = window.location.hash.match(/^#imovel=(.+)$/);
  if (propertyHash && getProperty(decodeURIComponent(propertyHash[1]))) {
    window.setTimeout(() => openProperty(decodeURIComponent(propertyHash[1])), 250);
  }
})();
