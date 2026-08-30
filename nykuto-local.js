(() => {
  const marketSearch = document.querySelector('[data-market-search]');
  const marketTitle = document.querySelector('[data-market-title]');
  const marketSubcategories = document.querySelector('[data-market-subcategories]');
  const marketExamples = document.querySelector('[data-market-examples]');
  const marketAnnounce = document.querySelector('[data-market-announce]');
  const marketPreview = document.querySelector('[data-market-preview]');
  const marketNote = document.querySelector('[data-market-note]');
  const rideSearch = document.querySelector('[data-ride-search]');
  const rideSwap = document.querySelector('[data-ride-swap]');
  const marketCategoryButtons = [...document.querySelectorAll('[data-market-category]')];
  const toast = document.querySelector('[data-demo-toast-output]');

  function requestUrl(category = '') {
    const params = new URLSearchParams({ tipo: 'pedido' });
    if (category) params.set('categoria', category);
    return `/anunciar/?${params.toString()}`;
  }

  document.querySelectorAll('[data-open-request]').forEach((button) => {
    button.addEventListener('click', () => {
      window.location.href = requestUrl(button.dataset.requestCategory || '');
    });
  });

  const initialParams = new URLSearchParams(window.location.search);
  if (initialParams.get('acao') === 'preciso') {
    window.location.replace(requestUrl(initialParams.get('categoria') || ''));
    return;
  }

  const marketCategories = {
    home: {
      label: 'Casa e móveis',
      formCategory: 'Produto',
      subcategories: ['Móveis e decoração', 'Eletrodomésticos'],
      examples: [
        { icon: '▤', title: 'Cama box casal', price: '1.200.000 Gs', meta: 'Bom estado · zona aproximada' },
        { icon: '▰', title: 'Sofá de 3 lugares', price: '850.000 Gs', meta: 'Usado · retirada no local' },
        { icon: '□', title: 'Mesa com 4 cadeiras', price: 'A combinar', meta: 'Como novo · entrega possível' }
      ]
    },
    electronics: {
      label: 'Eletrônicos',
      formCategory: 'Produto',
      queryGroup: 'electronics',
      subcategories: [
        { label: 'Celulares e acessórios', subcategory: 'Celular e acessórios' },
        { label: 'Informática, TV e áudio', subcategory: 'Eletrônicos e informática' }
      ],
      examples: [
        { icon: '▯', title: 'Smartphone 128 GB', price: 'R$ 1.850', meta: 'Como novo · com carregador' },
        { icon: '▯', title: 'Celular Samsung', price: 'R$ 980', meta: 'Bom estado · negociável' },
        { icon: '◫', title: 'Capas e acessórios', price: 'A partir de R$ 25', meta: 'Novo · envio possível' },
        { icon: '▣', title: 'Smart TV 43 polegadas', price: 'R$ 1.400', meta: 'Bom estado · retirada' },
        { icon: '▱', title: 'Notebook para estudos', price: 'US$ 320', meta: 'Usado · funcionando' },
        { icon: '◉', title: 'Caixa de som portátil', price: 'R$ 210', meta: 'Como nova · envio possível' }
      ]
    },
    fashion: {
      label: 'Moda e acessórios',
      formCategory: 'Produto',
      subcategories: ['Moda e acessórios'],
      examples: [
        { icon: '◴', title: 'Relógio esportivo', price: 'R$ 180', meta: 'Como novo · retirada' },
        { icon: '◇', title: 'Bolsa de couro', price: 'R$ 260', meta: 'Bom estado · negociável' },
        { icon: '△', title: 'Tênis casual', price: 'R$ 150', meta: 'Pouco uso · tamanho informado' }
      ]
    },
    vehicles: {
      label: 'Veículos e peças',
      formCategory: 'Produto',
      subcategories: ['Veículos e peças'],
      examples: [
        { icon: '◇', title: 'Bicicleta urbana', price: '1.100.000 Gs', meta: 'Bom estado · retirada' },
        { icon: '◈', title: 'Capacete para moto', price: 'R$ 220', meta: 'Como novo · tamanho informado' },
        { icon: '◎', title: 'Jogo de rodas', price: 'A combinar', meta: 'Usado · Ciudad del Este' }
      ]
    },
    services: {
      label: 'Serviços',
      formCategory: 'Serviço local',
      queryGroup: 'services',
      aggregateCategories: true,
      subcategories: [
        { label: 'Fretes e mudanças', formCategory: 'Frete ou mudança', section: 'freight' },
        { label: 'Outros serviços', formCategory: 'Serviço local', section: 'services' }
      ],
      examples: [
        { icon: '▤', title: 'Pequeno frete local', price: 'A combinar', meta: 'CDE e região · WhatsApp direto' },
        { icon: '◇', title: 'Mudança residencial', price: 'Sob consulta', meta: 'Veículo e ajudante sob consulta' },
        { icon: '↔', title: 'Entrega CDE ↔ Foz', price: 'Taxa a combinar', meta: 'Somente itens e rotas permitidos' },
        { icon: '✦', title: 'Reparo de ar-condicionado', price: 'Orçamento grátis', meta: 'Atendimento local · WhatsApp direto' },
        { icon: '◇', title: 'Montagem de móveis', price: 'A combinar', meta: 'CDE e região · sob consulta' },
        { icon: '◌', title: 'Limpeza residencial', price: 'Por serviço', meta: 'Agenda flexível · contato direto' }
      ]
    },
    rides: {
      label: 'Caronas compartilhadas',
      formCategory: 'Carona compartilhada',
      subcategories: ['Caronas disponíveis', 'Pedidos de carona'],
      examples: []
    },
    foz: {
      label: 'Foz e fronteira',
      formCategory: 'Compra ou retirada em Foz',
      subcategories: ['Comprar em Foz', 'Retirar uma compra', 'Entregar CDE ↔ Foz', 'Documento permitido'],
      examples: [
        { icon: '↔', title: 'Retirada de compra em Foz', price: 'Taxa a combinar', meta: 'Somente itens permitidos' },
        { icon: '▤', title: 'Entrega CDE ↔ Foz', price: 'Sob consulta', meta: 'Rota e horário combinados' },
        { icon: '□', title: 'Pequena encomenda', price: 'A combinar', meta: 'Regras aduaneiras obrigatórias' }
      ]
    }
  };

  const normalizeSearch = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
  let categoryRequest = 0;
  let currentCategoryKey = 'home';
  let currentRideKind = 'offer';

  function normalizedCategoryFilter(value) {
    return typeof value === 'string' ? { label: value, subcategory: value } : value;
  }

  function marketQueryParams(categoryKey, category, { filter = null, kind = 'offer', limit = '12' } = {}) {
    const params = new URLSearchParams({ kind, limit });
    const queryCategory = filter?.formCategory || (category.aggregateCategories ? '' : category.formCategory);
    if (queryCategory) params.set('category', queryCategory);
    if (filter?.section) params.set('section', filter.section);
    else if (category.queryGroup) params.set('group', category.queryGroup);
    else params.set('section', categoryKey);
    if (filter?.subcategory) params.set('subcategory', filter.subcategory);
    return params;
  }

  function updateMarketAnnounce(category, isRide, filter = null) {
    if (!marketAnnounce) return;
    const formCategory = filter?.formCategory || category.formCategory;
    const params = new URLSearchParams({ categoria: formCategory });
    marketAnnounce.href = `/anunciar/?${params.toString()}`;
    marketAnnounce.innerHTML = `${isRide ? 'Oferecer carona' : 'Anunciar nesta categoria'} <span aria-hidden="true">→</span>`;
  }

  function showMarketMessage(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showMarketMessage.timeout);
    showMarketMessage.timeout = window.setTimeout(() => { toast.hidden = true; }, 3600);
  }

  function createMarketExample(example) {
    const article = document.createElement('article');
    const visual = document.createElement('div');
    const body = document.createElement('div');
    const badge = document.createElement('small');
    const title = document.createElement('h3');
    const price = document.createElement('strong');
    const meta = document.createElement('p');
    article.className = 'nykuto-market-example';
    visual.className = 'nykuto-market-example-visual';
    body.className = 'nykuto-market-example-body';
    visual.textContent = example.icon;
    visual.setAttribute('aria-hidden', 'true');
    badge.textContent = 'Exemplo de anúncio';
    title.textContent = example.title;
    price.textContent = example.price;
    meta.textContent = example.meta;
    body.append(badge, title, price, meta);
    article.append(visual, body);
    return article;
  }

  function listingPrice(listing) {
    if (listing.category === 'Carona compartilhada') {
      if (listing.priceMode === 'free') return 'Sem contribuição';
      if (listing.priceMode === 'quote' || listing.priceAmount === null) return 'Contribuição a combinar';
      const symbol = ({ BRL: 'R$', PYG: 'Gs.', USD: 'US$' })[listing.currency] || listing.currency;
      const amount = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(listing.priceAmount || 0);
      return `${symbol} ${amount} por pessoa`;
    }
    if (listing.priceMode === 'free') return 'Grátis';
    if (listing.priceMode === 'quote') return 'Sob consulta';
    const symbol = ({ BRL: 'R$', PYG: 'Gs.', USD: 'US$' })[listing.currency] || listing.currency;
    const amount = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(listing.priceAmount || 0);
    return `${symbol} ${amount}${listing.priceMode === 'negotiable' ? ' · negociável' : ''}`;
  }

  function listingLocation(listing) {
    const zoneLabel = String(listing.zone?.label || '').trim();
    const localReference = String(listing.zone?.localReference || '').trim();
    const kilometre = localReference.match(/km\s*\d+/i)?.[0] || '';
    const repeatsKilometre = kilometre && normalizeSearch(zoneLabel).includes(normalizeSearch(kilometre));
    return [repeatsKilometre ? '' : localReference, zoneLabel].filter(Boolean).join(' · ') || 'Zona aproximada';
  }

  function feeValue(listing, labels) {
    const accepted = labels.map(normalizeSearch);
    return String(listing.fees?.find((fee) => accepted.includes(normalizeSearch(fee.label)))?.value || '').trim();
  }

  function rideDetails(listing) {
    return {
      origin: feeValue(listing, ['Ponto de partida', 'Origem']) || listing.zone.label,
      destination: feeValue(listing, ['Destino']),
      date: feeValue(listing, ['Data da viagem', 'Data da primeira viagem']),
      time: feeValue(listing, ['Horário de saída', 'Horário']),
      frequency: feeValue(listing, ['Frequência']) || listing.availability,
      seats: feeValue(listing, ['Lugares disponíveis', 'Número de passageiros', 'Passageiros']),
      days: feeValue(listing, ['Dias recorrentes', 'Dias da semana'])
    };
  }

  function readableRideDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(date);
  }

  function createRideListing(listing) {
    const details = rideDetails(listing);
    const article = document.createElement('article');
    const link = document.createElement('a');
    const head = document.createElement('div');
    const route = document.createElement('div');
    const origin = document.createElement('div');
    const destination = document.createElement('div');
    const meta = document.createElement('div');
    const action = document.createElement('b');
    article.className = 'nykuto-ride-card';
    head.className = 'nykuto-ride-card-head';
    route.className = 'nykuto-ride-route';
    meta.className = 'nykuto-ride-card-meta';
    link.href = `/anuncio/?id=${encodeURIComponent(listing.id)}`;
    link.setAttribute('aria-label', `Abrir trajeto de ${details.origin} para ${details.destination}`);
    const badge = document.createElement('small');
    const seller = document.createElement('span');
    badge.textContent = listing.kind === 'request' ? 'Procura carona' : 'Oferece carona';
    seller.textContent = listing.seller?.name || 'Pessoa da região';
    head.append(badge, seller);
    const originTime = document.createElement('small');
    const originName = document.createElement('strong');
    originTime.textContent = details.time || 'Horário a combinar';
    originName.textContent = details.origin || 'Origem aproximada';
    origin.append(originTime, originName);
    const destinationLabel = document.createElement('small');
    const destinationName = document.createElement('strong');
    destinationLabel.textContent = 'Destino';
    destinationName.textContent = details.destination || 'Destino a combinar';
    destination.append(destinationLabel, destinationName);
    route.append(origin, destination);
    const date = document.createElement('span');
    const seats = document.createElement('span');
    const contribution = document.createElement('strong');
    date.textContent = details.date ? readableRideDate(details.date) : details.frequency || 'Data a combinar';
    seats.textContent = details.seats ? `${details.seats} ${listing.kind === 'request' ? 'pessoa(s)' : 'lugar(es)'}` : 'Lugares a combinar';
    contribution.textContent = listingPrice(listing);
    meta.append(date, seats, contribution);
    action.textContent = listing.kind === 'request' ? 'Ver pedido →' : 'Ver carona →';
    link.append(head, route, meta, action);
    article.append(link);
    return article;
  }

  function createRideEmpty(kind = 'offer') {
    const section = document.createElement('section');
    const title = document.createElement('h3');
    const copy = document.createElement('p');
    const actions = document.createElement('div');
    const primary = document.createElement('a');
    const secondary = document.createElement('a');
    section.className = 'nykuto-ride-empty';
    actions.className = 'nykuto-ride-actions';
    title.textContent = kind === 'request' ? 'Nenhum pedido de carona por enquanto' : 'Seja a primeira carona deste trajeto';
    copy.textContent = 'Publique origem, destino e horário. O contato acontece diretamente pelo WhatsApp.';
    primary.href = '/anunciar/?categoria=Carona+compartilhada';
    primary.textContent = 'Oferecer carona';
    secondary.href = '/anunciar/?categoria=Carona+compartilhada&tipo=pedido';
    secondary.textContent = 'Preciso de carona';
    actions.append(primary, secondary);
    section.append(title, copy, actions);
    return section;
  }

  function createMarketListing(listing) {
    const article = document.createElement('article');
    const link = document.createElement('a');
    const visual = document.createElement('div');
    const body = document.createElement('div');
    const badge = document.createElement('small');
    const title = document.createElement('h3');
    const price = document.createElement('strong');
    const meta = document.createElement('p');
    article.className = 'nykuto-market-example nykuto-market-real-listing';
    link.href = `/anuncio/?id=${encodeURIComponent(listing.id)}`;
    link.setAttribute('aria-label', `Abrir anúncio: ${listing.title}`);
    visual.className = 'nykuto-market-example-visual';
    body.className = 'nykuto-market-example-body';
    if (listing.media?.[0]?.url) {
      const image = document.createElement('img');
      image.src = listing.media[0].url;
      image.alt = '';
      image.loading = 'lazy';
      image.width = 640;
      image.height = 480;
      visual.append(image);
    } else {
      visual.textContent = listing.category.slice(0, 1);
      visual.setAttribute('aria-hidden', 'true');
    }
    badge.textContent = listing.kind === 'request' ? 'Pedido publicado' : 'Anúncio publicado';
    title.textContent = listing.title;
    price.textContent = listingPrice(listing);
    meta.textContent = `⌖ ${listingLocation(listing)}`;
    body.append(badge, title, price, meta);
    link.append(visual, body);
    article.append(link);
    return article;
  }

  async function fetchListings(params) {
    const response = await fetch(`/api/local/listings?${params.toString()}`, { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Catálogo indisponível');
    return payload.listings || [];
  }

  async function fetchAllListings(params) {
    const listings = [];
    const limit = 24;
    for (let page = 1; page <= 100; page += 1) {
      const pageParams = new URLSearchParams(params);
      pageParams.set('limit', String(limit));
      pageParams.set('page', String(page));
      const batch = await fetchListings(pageParams);
      listings.push(...batch);
      if (batch.length < limit) break;
    }
    return listings;
  }

  async function renderMarketCategory(categoryKey) {
    const category = marketCategories[categoryKey] || marketCategories.home;
    if (!marketTitle || !marketSubcategories || !marketExamples) return;
    const requestId = ++categoryRequest;
    const isRide = categoryKey === 'rides';
    currentCategoryKey = categoryKey;
    if (isRide) currentRideKind = 'offer';
    marketTitle.textContent = category.label;
    marketPreview?.classList.toggle('is-rides', isRide);
    marketExamples.classList.toggle('is-rides', isRide);
    if (rideSearch) rideSearch.hidden = !isRide;
    const subcategoryControls = category.subcategories.map((value, index) => {
      const filter = normalizedCategoryFilter(value);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.textContent = filter.label;
      if (isRide && index === 0) chip.classList.add('is-active');
      chip.addEventListener('click', async () => {
        const chipRequestId = ++categoryRequest;
        marketSubcategories.querySelectorAll('button').forEach((button) => button.classList.toggle('is-active', button === chip));
        const kind = isRide ? (index === 1 ? 'request' : 'offer') : (/^Procuro\b/i.test(filter.subcategory || filter.label) ? 'request' : 'offer');
        if (isRide) currentRideKind = kind;
        const params = marketQueryParams(categoryKey, category, { filter: isRide ? null : filter, kind, limit: isRide ? '24' : '12' });
        updateMarketAnnounce(category, isRide, isRide ? null : filter);
        try {
          const listings = await fetchListings(params);
          if (chipRequestId !== categoryRequest) return;
          if (isRide) marketExamples.replaceChildren(...(listings.length ? listings.map(createRideListing) : [createRideEmpty(kind)]));
          else marketExamples.replaceChildren(...listings.map(createMarketListing));
          marketNote.textContent = listings.length
            ? `${listings.length} ${isRide ? 'trajeto' : 'anúncio'}${listings.length === 1 ? '' : 's'} encontrado${listings.length === 1 ? '' : 's'}.`
            : isRide ? 'Ainda não há trajetos publicados. Você pode começar pelo seu.' : 'Ainda não há anúncio nesta subcategoria. Você pode publicar o primeiro gratuitamente.';
        } catch (_) {
          if (chipRequestId !== categoryRequest) return;
          marketNote.textContent = isRide ? 'Não foi possível carregar os trajetos agora.' : 'Não foi possível atualizar esta subcategoria agora.';
        }
      });
      return chip;
    });
    if (isRide) {
      const requestLink = document.createElement('a');
      requestLink.className = 'nykuto-ride-request-link';
      requestLink.href = '/anunciar/?categoria=Carona+compartilhada&tipo=pedido';
      requestLink.textContent = 'Preciso de carona →';
      subcategoryControls.push(requestLink);
    }
    marketSubcategories.replaceChildren(...subcategoryControls);
    marketExamples.innerHTML = '<div class="nykuto-market-loading" aria-label="Carregando anúncios"></div><div class="nykuto-market-loading"></div><div class="nykuto-market-loading"></div>';
    if (marketNote) marketNote.textContent = 'Carregando anúncios publicados…';
    updateMarketAnnounce(category, isRide);
    marketCategoryButtons.forEach((button) => {
      const active = button.dataset.marketCategory === categoryKey;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    try {
      const params = marketQueryParams(categoryKey, category);
      const listings = await fetchListings(params);
      if (requestId !== categoryRequest) return;
      if (listings.length) {
        marketExamples.replaceChildren(...listings.map(isRide ? createRideListing : createMarketListing));
        if (marketNote) marketNote.textContent = `${listings.length} ${isRide ? 'trajeto' : 'anúncio'}${listings.length === 1 ? '' : 's'} publicado${listings.length === 1 ? '' : 's'} por pessoas da região.`;
      } else if (isRide) {
        marketExamples.replaceChildren(createRideEmpty('offer'));
        if (marketNote) marketNote.textContent = 'Ainda não há caronas publicadas. Ofereça a primeira ou publique o trajeto que você precisa.';
      } else {
        marketExamples.replaceChildren(...category.examples.map(createMarketExample));
        if (marketNote) marketNote.textContent = 'Ainda não há anúncios reais nesta categoria. Estes exemplos mostram o formato; publique o primeiro gratuitamente.';
      }
    } catch (_) {
      if (requestId !== categoryRequest) return;
      if (isRide) {
        marketExamples.replaceChildren(createRideEmpty('offer'));
        if (marketNote) marketNote.textContent = 'Não foi possível carregar as caronas agora. Você ainda pode publicar seu trajeto.';
      } else {
        marketExamples.replaceChildren(...category.examples.map(createMarketExample));
        if (marketNote) marketNote.textContent = 'O catálogo ao vivo não respondeu. Os cartões abaixo são apenas exemplos de apresentação.';
      }
    }
  }

  marketCategoryButtons.forEach((button) => {
    button.addEventListener('click', () => renderMarketCategory(button.dataset.marketCategory));
  });

  function rideMatches(listing, { origin, destination, date }) {
    const details = rideDetails(listing);
    const originMatches = !origin || normalizeSearch(details.origin).includes(origin);
    const destinationMatches = !destination || normalizeSearch(details.destination).includes(destination);
    if (!originMatches || !destinationMatches) return false;
    if (!date) return true;
    const subcategory = normalizeSearch(listing.subcategory);
    const frequency = normalizeSearch(details.frequency);
    const occasional = subcategory.includes('ocasional') || ['uma vez', 'viagem unica', 'ocasional'].includes(frequency);
    if (occasional) return details.date === date;
    const selectedDate = new Date(`${date}T12:00:00Z`);
    const selectedDay = selectedDate.getUTCDay();
    if (['dias uteis', 'segunda a sexta', 'seg a sex'].includes(frequency)) return selectedDay >= 1 && selectedDay <= 5;
    if (['todos os dias', 'diaria', 'diario', 'diariamente'].includes(frequency)) return true;
    if (['toda semana', 'semanal'].includes(frequency)) {
      if (details.days) {
        const weekdayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        return normalizeSearch(details.days).includes(weekdayNames[selectedDay]);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(details.date)) return new Date(`${details.date}T12:00:00Z`).getUTCDay() === selectedDay;
    }
    const dateMatches = subcategory.includes('recorrente') || details.date === date;
    return originMatches && destinationMatches && dateMatches;
  }

  rideSwap?.addEventListener('click', () => {
    const origin = rideSearch.elements.origin.value;
    rideSearch.elements.origin.value = rideSearch.elements.destination.value;
    rideSearch.elements.destination.value = origin;
    rideSearch.elements.origin.focus();
  });

  rideSearch?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const originRaw = String(rideSearch.elements.origin.value || '').trim();
    const destinationRaw = String(rideSearch.elements.destination.value || '').trim();
    const date = String(rideSearch.elements.date.value || '');
    if (!originRaw && !destinationRaw) {
      rideSearch.elements.origin.focus();
      showMarketMessage('Informe pelo menos a origem ou o destino.');
      return;
    }
    const criteria = { origin: normalizeSearch(originRaw), destination: normalizeSearch(destinationRaw), date };
    const searchRequestId = ++categoryRequest;
    try {
      const listings = await fetchAllListings(new URLSearchParams({
        category: 'Carona compartilhada',
        section: 'rides',
        kind: currentRideKind,
        origin: originRaw,
        destination: destinationRaw
      }));
      if (searchRequestId !== categoryRequest || currentCategoryKey !== 'rides') return;
      const matches = listings.filter((listing) => rideMatches(listing, criteria));
      const routeLabel = [originRaw || 'Qualquer origem', destinationRaw || 'qualquer destino'].join(' → ');
      marketTitle.textContent = routeLabel;
      marketExamples.replaceChildren(...(matches.length ? matches.map(createRideListing) : [createRideEmpty(currentRideKind)]));
      marketNote.textContent = matches.length
        ? `${matches.length} trajeto${matches.length === 1 ? '' : 's'} ${matches.length === 1 ? 'compatível' : 'compatíveis'} com sua busca.`
        : 'Nenhum trajeto compatível por enquanto. Publique o que você oferece ou precisa.';
      marketPreview?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (_) {
      if (searchRequestId !== categoryRequest) return;
      showMarketMessage('A busca de caronas não respondeu agora. Tente novamente em alguns instantes.');
    }
  });

  if (rideSearch?.elements.date) {
    const today = new Date();
    rideSearch.elements.date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  marketSearch?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const rawQuery = String(new FormData(marketSearch).get('query') || '').trim();
    const query = normalizeSearch(rawQuery).trim();
    if (!query) {
      marketSearch.querySelector('input')?.focus();
      return;
    }
    const kilometreMatch = query.match(/\bkm\s*(\d{1,2})\b/);
    if (!kilometreMatch && ['imovel', 'imoveis', 'apartamento', 'aluguel', 'kitnet'].some((term) => query.includes(term))) {
      window.location.href = '/imoveis/';
      return;
    }
    if (['carona', 'caronas', 'covoiturage', 'covoituragem'].some((term) => query.includes(term))) {
      await renderMarketCategory('rides');
      marketPreview?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      return;
    }
    const searchRequestId = ++categoryRequest;
    try {
      const textQuery = kilometreMatch ? query.replace(kilometreMatch[0], ' ').trim() : query;
      const params = new URLSearchParams({ kind: 'offer', limit: '24' });
      if (textQuery) params.set('q', textQuery);
      let listings = kilometreMatch ? await fetchAllListings(params) : await fetchListings(params);
      if (kilometreMatch) {
        const expectedKilometre = Number(kilometreMatch[1]);
        listings = listings.filter((listing) => Number(String(listing.zone?.localReference || '').match(/km\s*(\d{1,2})/i)?.[1]) === expectedKilometre);
      }
      if (searchRequestId !== categoryRequest) return;
      marketTitle.textContent = `Resultados para “${rawQuery}”`;
      marketSubcategories.replaceChildren();
      marketCategoryButtons.forEach((button) => { button.classList.remove('is-active'); button.setAttribute('aria-pressed', 'false'); });
      if (listings.length) {
        marketExamples.replaceChildren(...listings.map(createMarketListing));
        marketNote.textContent = `${listings.length} resultado${listings.length === 1 ? '' : 's'} encontrado${listings.length === 1 ? '' : 's'}.`;
      } else {
        marketExamples.replaceChildren();
        marketNote.textContent = 'Nenhum anúncio encontrado. Publique o que você procura ou volte às categorias.';
        showMarketMessage('Nenhum anúncio encontrado para esta busca.');
      }
      marketPreview?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (_) {
      if (searchRequestId !== categoryRequest) return;
      showMarketMessage('A busca não respondeu agora. Tente novamente em alguns instantes.');
    }
  });

  if (marketTitle) renderMarketCategory('home');
})();
