(() => {
  const assetBase = 'assets/demo-imobiliaria/';
  const ciudadDelEsteCenter = [-25.5135, -54.632];
  const openStreetMapTiles = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

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
      media: Array.from({ length: 6 }, (_, index) => ({
        type: 'image',
        src: `${assetBase}local-studio-${String(index + 1).padStart(2, '0')}.webp`,
        alt: `Foto real neutralizada ${index + 1} de um monoambiente mobiliado em Ciudad del Este`
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
        { type: 'video', src: `${assetBase}local-tour-apartamento-a.mp4`, poster: `${assetBase}local-tour-apartamento-a-poster.webp`, alt: 'Visita real neutralizada de um apartamento semimobiliado em Ciudad del Este' }
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
        { type: 'video', src: `${assetBase}local-tour-apartamento-b.mp4`, poster: `${assetBase}local-tour-apartamento-b-poster.webp`, alt: 'Visita real neutralizada de outro apartamento semimobiliado em Ciudad del Este' }
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
        { type: 'video', src: `${assetBase}local-tour-mobiliado.mp4`, poster: `${assetBase}local-tour-mobiliado-poster.webp`, alt: 'Visita real neutralizada de uma casa mobiliada em Ciudad del Este' }
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
      map: { lat: -25.514, lng: -54.6177, radiusMeters: 1000 },
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
    view: 'split'
  };

  const compared = new Set();
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
  const managerDialog = document.querySelector('[data-manager-dialog]');
  const managerList = document.querySelector('[data-manager-list]');
  const toastOutput = document.querySelector('[data-demo-toast-output]');
  let realMap;
  let realMapLayers;

  function readFavorites() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(favoriteStorageKey) || '[]');
      return new Set(Array.isArray(saved) ? saved : []);
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
    const media = property.media[0];
    return media.type === 'video' ? media.poster : media.src;
  }

  function mediaLabel(property) {
    const videoCount = property.media.filter((item) => item.type === 'video').length;
    const imageCount = property.media.length - videoCount;
    if (videoCount && imageCount) return `${imageCount} fotos · ${videoCount} vídeo`;
    if (videoCount) return `${videoCount} vídeo`;
    return `${imageCount} fotos`;
  }

  function matchesFilters(property) {
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
    const specs = [
      roomLabel(property),
      `${property.bathrooms} ${property.bathrooms === 1 ? 'banheiro' : 'banheiros'}`,
      property.furnished ? 'Mobiliado' : 'Semimobiliado',
      property.pet === true ? 'Aceita pet' : property.pet === false ? 'Sem pet' : 'Pet a confirmar',
      property.garage ? 'Garagem' : 'Sem vaga para carro'
    ];

    return `
      <article class="demo-listing-card" data-card-id="${escapeHtml(property.id)}">
        <div class="demo-listing-media">
          <img src="${escapeHtml(firstVisual(property))}" alt="${escapeHtml(property.media[0].alt)}" width="720" height="560" loading="lazy" decoding="async" />
          <span class="demo-listing-status">${escapeHtml(property.status)}</span>
          <span class="demo-listing-type">${escapeHtml(property.type)}</span>
          <button class="demo-favorite-button${isFavorite ? ' active' : ''}" type="button" data-action="favorite" data-property-id="${escapeHtml(property.id)}" aria-pressed="${isFavorite}" aria-label="${isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${isFavorite ? '♥' : '♡'}</button>
          <span class="demo-media-count">${escapeHtml(mediaLabel(property))}</span>
        </div>
        <div class="demo-listing-content">
          <div class="demo-listing-ref"><span>${escapeHtml(property.id)}</span><span>Zona ${escapeHtml(property.zoneRadius)}</span></div>
          <h3>${escapeHtml(property.title)}</h3>
          <p class="demo-listing-location">⌖ ${escapeHtml(property.location)}</p>
          <div class="demo-listing-specs">${specs.map((spec) => `<span>${escapeHtml(spec)}</span>`).join('')}</div>
          <div class="demo-listing-price">
            <div><strong>${escapeHtml(formatMoney(property.rent, property.currency))}</strong><small>por mês</small></div>
            <div class="demo-listing-actions">
              <button type="button" data-action="details" data-property-id="${escapeHtml(property.id)}">Detalhes</button>
              <button class="${isCompared ? 'active' : ''}" type="button" data-action="compare" data-property-id="${escapeHtml(property.id)}" aria-pressed="${isCompared}">${isCompared ? '✓ Comparar' : 'Comparar'}</button>
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

  function renderMap(filteredProperties) {
    if (!realMap || !realMapLayers || !window.L) return;
    realMapLayers.clearLayers();

    filteredProperties.forEach((property) => {
      const coordinates = [property.map.lat, property.map.lng];
      const area = window.L.circle(coordinates, {
        radius: property.map.radiusMeters,
        color: '#174f43',
        weight: 1,
        opacity: 0.54,
        fillColor: '#40987d',
        fillOpacity: 0.14,
        interactive: false
      });
      const marker = window.L.marker(coordinates, {
        keyboard: true,
        title: `${property.title} · ${formatMoney(property.rent, property.currency)}`,
        icon: window.L.divIcon({
          className: 'demo-map-price-icon',
          html: `<span data-currency="${escapeHtml(property.currency)}">${escapeHtml(formatMapPrice(property))}</span>`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      });

      marker.on('click', () => openProperty(property.id));
      marker.on('add', () => {
        const element = marker.getElement();
        if (!element) return;
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', `Abrir ${property.title}, ${formatMoney(property.rent, property.currency)}, zona aproximada de ${property.zoneRadius}`);
      });
      area.addTo(realMapLayers);
      marker.addTo(realMapLayers);
    });

    window.setTimeout(() => {
      realMap.invalidateSize({ animate: false });
      if (!filteredProperties.length) {
        realMap.setView(ciudadDelEsteCenter, 13, { animate: false });
        return;
      }
      const bounds = realMapLayers.getBounds();
      if (bounds.isValid()) realMap.fitBounds(bounds, { padding: [28, 28], maxZoom: 14, animate: false });
    }, 0);
  }

  function renderManagerList() {
    if (!managerList) return;
    managerList.innerHTML = properties.map((property, index) => `
      <article class="demo-manager-row">
        <img src="${escapeHtml(firstVisual(property))}" alt="" width="84" height="72" loading="lazy" />
        <div><strong>${escapeHtml(property.title)}</strong><span>${escapeHtml(property.id)} · ${escapeHtml(formatMoney(property.rent, property.currency))}</span></div>
        <b>${index < 3 ? 'Publicado' : 'Verificar'}</b>
        <button type="button" data-demo-toast="Na versão ativa, este botão abre a edição do imóvel ${escapeHtml(property.id)}." aria-label="Editar ${escapeHtml(property.title)}">⋮</button>
      </article>
    `).join('');
  }

  function render() {
    const filtered = properties.filter(matchesFilters);
    propertyList.innerHTML = filtered.map(listingCard).join('');
    renderMap(filtered);
    resultsSummary.textContent = `${filtered.length} ${filtered.length === 1 ? 'opção encontrada' : 'opções encontradas'}`;
    emptyState.hidden = filtered.length > 0;
    resultsLayout.hidden = filtered.length === 0;
    updateFilterControls();
    updateCompareDock();
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
  }

  function resetFilters() {
    Object.assign(state, { campus: 'all', budget: 'all', rooms: 'all', currency: 'all', pet: false, furnished: false, included: false, immediate: false });
    render();
  }

  function toggleFavorite(propertyId) {
    if (favorites.has(propertyId)) favorites.delete(propertyId);
    else favorites.add(propertyId);
    saveFavorites();
    render();
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
  }

  function getProperty(propertyId) {
    return properties.find((property) => property.id === propertyId);
  }

  function renderMainMedia(media) {
    if (media.type === 'video') {
      return `<video controls playsinline preload="metadata" poster="${escapeHtml(media.poster)}" aria-label="${escapeHtml(media.alt)}"><source src="${escapeHtml(media.src)}" type="video/mp4" />Seu navegador não consegue reproduzir este vídeo.</video>`;
    }
    return `<img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt)}" width="1200" height="900" />`;
  }

  function propertyDetailsMarkup(property) {
    const total = totalEntry(property);
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
          <div class="demo-detail-main-media" data-detail-main-media>${renderMainMedia(property.media[0])}</div>
          ${property.media.length > 1 ? `<div class="demo-detail-gallery" aria-label="Galeria do imóvel">${property.media.map((media, index) => `<button class="${index === 0 ? 'active' : ''}" type="button" data-gallery-index="${index}" aria-label="Mostrar mídia ${index + 1}"><img src="${escapeHtml(media.type === 'video' ? media.poster : media.src)}" alt="" width="140" height="108" loading="lazy" /></button>`).join('')}</div>` : ''}
        </section>
        <section class="demo-detail-copy">
          <header><div><span class="demo-detail-status">${escapeHtml(property.status)}</span><h2>${escapeHtml(property.title)}</h2><p class="demo-detail-location">⌖ ${escapeHtml(property.location)} · ${escapeHtml(property.id)}</p></div><button class="demo-detail-close" type="button" data-close-dialog aria-label="Fechar detalhes">×</button></header>
          <div class="demo-detail-price"><span>Aluguel mensal</span><strong>${escapeHtml(formatMoney(property.rent, property.currency))}</strong><small>${escapeHtml(property.availability)} · informação demonstrativa</small></div>
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
              <div><dt>Garantia</dt><dd>${escapeHtml(formatMoney(property.deposit, property.currency))}</dd></div>
              <div><dt>Taxa imobiliária</dt><dd>${escapeHtml(property.feeLabel || formatMoney(property.fee, property.currency))}</dd></div>
              <div class="total"><dt>Total calculável</dt><dd>${total === null ? 'A confirmar' : escapeHtml(formatMoney(total, property.currency))}</dd></div>
            </dl>
            ${property.monthlyExtra ? `<small>${escapeHtml(property.monthlyExtra)}</small>` : ''}
          </div>
          <div class="demo-detail-tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          <div class="demo-detail-zone"><i aria-hidden="true"></i><div><strong>Localização aproximada · raio ${escapeHtml(property.zoneRadius)}</strong><span>${escapeHtml(property.distance)}. Endereço exato não publicado.</span></div></div>
          <div class="demo-contact-simulation"><button type="button" data-simulate-whatsapp data-property-id="${escapeHtml(property.id)}">Simular contato pelo WhatsApp</button><button type="button" data-share-property data-property-id="${escapeHtml(property.id)}" aria-label="Compartilhar imóvel">↗</button></div>
          <p class="demo-detail-concept-note">Mídias reais neutralizadas; preços, disponibilidade e dados da ficha são ilustrativos. Nenhuma reserva ou pagamento é realizado neste portal.</p>
        </section>
      </div>
    `;
  }

  function openProperty(propertyId) {
    const property = getProperty(propertyId);
    if (!property || !propertyDialog) return;
    propertyDialogContent.innerHTML = propertyDetailsMarkup(property);
    propertyDialogContent.dataset.propertyId = property.id;
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

  async function simulateWhatsApp(propertyId) {
    const property = getProperty(propertyId);
    if (!property) return;
    const message = `Olá, tenho interesse no imóvel ${property.id}, ${property.title}, por ${formatMoney(property.rent, property.currency)}. Gostaria de confirmar a disponibilidade e agendar uma visita.`;
    try {
      await navigator.clipboard.writeText(message);
      showToast('Simulação concluída: a mensagem preparada foi copiada. Nenhum WhatsApp foi aberto.');
    } catch (_) {
      showToast(`Mensagem simulada: ${message}`);
    }
  }

  async function shareProperty(propertyId) {
    const property = getProperty(propertyId);
    if (!property) return;
    const shareData = {
      title: `${property.title} · demonstração`,
      text: `${property.title} — ${formatMoney(property.rent, property.currency)}. Conteúdo demonstrativo Nykuto.`,
      url: `${window.location.origin}${window.location.pathname}#imovel=${property.id}`
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

  document.querySelector('[data-main-search]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
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
      state.view = button.dataset.view;
      resultsLayout.classList.toggle('map-only', state.view === 'map');
      document.querySelectorAll('[data-view]').forEach((viewButton) => {
        const active = viewButton === button;
        viewButton.classList.toggle('active', active);
        viewButton.setAttribute('aria-pressed', String(active));
      });
      if (state.view === 'map') {
        document.querySelector('#demo-mapa')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => realMap?.invalidateSize({ animate: false }), 220);
      }
    });
  });

  propertyList?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const propertyId = button.dataset.propertyId;
    if (button.dataset.action === 'favorite') toggleFavorite(propertyId);
    if (button.dataset.action === 'compare') toggleCompare(propertyId);
    if (button.dataset.action === 'details') openProperty(propertyId);
  });

  document.querySelectorAll('[data-property-id]:not([data-action])').forEach((button) => {
    button.addEventListener('click', () => openProperty(button.dataset.propertyId));
  });

  propertyDialogContent?.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-close-dialog]');
    if (closeButton) return closeDialog(propertyDialog);

    const galleryButton = event.target.closest('[data-gallery-index]');
    if (galleryButton) {
      const property = getProperty(propertyDialogContent.dataset.propertyId);
      const index = Number(galleryButton.dataset.galleryIndex);
      const media = property?.media[index];
      const mainMedia = propertyDialogContent.querySelector('[data-detail-main-media]');
      if (media && mainMedia) {
        const previousVideo = mainMedia.querySelector('video');
        if (previousVideo) previousVideo.pause();
        mainMedia.innerHTML = renderMainMedia(media);
        propertyDialogContent.querySelectorAll('[data-gallery-index]').forEach((button) => button.classList.toggle('active', button === galleryButton));
      }
      return;
    }

    const whatsAppButton = event.target.closest('[data-simulate-whatsapp]');
    if (whatsAppButton) return simulateWhatsApp(whatsAppButton.dataset.propertyId);
    const shareButton = event.target.closest('[data-share-property]');
    if (shareButton) shareProperty(shareButton.dataset.propertyId);
  });

  document.querySelector('[data-open-compare]')?.addEventListener('click', openComparison);
  document.querySelector('[data-clear-compare]')?.addEventListener('click', () => { compared.clear(); render(); });
  document.querySelectorAll('[data-open-manager]').forEach((button) => button.addEventListener('click', () => openDialog(managerDialog)));
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
